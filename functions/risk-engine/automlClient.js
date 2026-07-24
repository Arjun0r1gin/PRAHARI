const fs = require("fs");
const path = require("path");
const { getCatalystApp } = require("../../shared/utils/catalystHelper");

/**
 * Helper to safely resolve and read model_version from models/prediction/model-version.json
 * @returns {string} Model version identifier string
 */
function getModelVersion() {
  try {
    const versionPath = path.resolve(__dirname, "../../models/prediction/model-version.json");
    const rawData = fs.readFileSync(versionPath, "utf8");
    const parsed = JSON.parse(rawData);
    return parsed.model_version || "v0.1-mock";
  } catch (err) {
    return "v0.1-mock";
  }
}

/**
 * Standard feature weight dictionary for mock scoring.
 * Expected features: recency, proximity, centrality, recurrence, socio_economic_correlation.
 */
const FEATURE_WEIGHTS = {
  recency: 0.25,
  proximity: 0.25,
  centrality: 0.20,
  recurrence: 0.15,
  socio_economic_correlation: 0.15
};

/**
 * Standard sigmoid activation function to squash real numbers to (0, 1).
 * @param {number} x
 * @returns {number} Value bounded strictly between 0.0 and 1.0
 */
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Deterministic fallback scoring function computing squashed weighted feature sum.
 * @param {Record<string, number>} features
 * @param {string} model_version
 * @returns {{ probability: number, model_version: string }}
 */
function scoreRecordDeterministic(features, model_version) {
  if (!features || typeof features !== "object") {
    return { probability: 0.5, model_version };
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, val] of Object.entries(features)) {
    if (typeof val === "number" && !isNaN(val)) {
      const weight = FEATURE_WEIGHTS[key] ?? 0.1;
      weightedSum += val * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return { probability: 0.5, model_version };
  }

  const rawScore = weightedSum / totalWeight;
  const probability = parseFloat(sigmoid((rawScore - 0.5) * 4).toFixed(4));

  return {
    probability,
    model_version
  };
}

/**
 * Computes model risk probability for a given feature set.
 * Uses Catalyst Zia AutoML model prediction when available; gracefully falls back to deterministic calculation.
 *
 * @param {Record<string, number>} [features={}] Feature map
 * @param {Object} [req] Optional incoming HTTP request context
 * @returns {{ probability: number, model_version: string } | Promise<{ probability: number, model_version: string }>}
 */
function scoreRecord(features = {}, req = null) {
  const model_version = getModelVersion();
  const catalystApp = getCatalystApp(req);
  const modelId = process.env.AUTOML_MODEL_ID;

  // Catalyst Zia AutoML Adapter Attempt
  if (catalystApp && modelId && typeof catalystApp.ai === "function") {
    try {
      const ai = catalystApp.ai();
      if (ai && typeof ai.predict === "function") {
        return ai.predict(modelId, features)
          .then((prediction) => ({
            probability: parseFloat((prediction.probability || prediction.score || 0.5).toFixed(4)),
            model_version: prediction.model_version || model_version
          }))
          .catch(() => scoreRecordDeterministic(features, model_version));
      }
    } catch (err) {
      // Graceful fallback to deterministic implementation
    }
  }

  return scoreRecordDeterministic(features, model_version);
}

module.exports = {
  scoreRecord,
  getModelVersion
};

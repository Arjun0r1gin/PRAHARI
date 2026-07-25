const spatioTemporalCluster = require("../rules/spatioTemporalCluster");
const repeatOffender = require("../rules/repeatOffender");
const networkCentralityFlag = require("../rules/networkCentralityFlag");
const escalationPattern = require("../rules/escalationPattern");
const { scoreRecord } = require("../automlClient");
const { deriveFeatures } = require("./featureEngineering");
const { calculateConfidence } = require("./confidenceCalculator");

const RULES = [
  spatioTemporalCluster,
  repeatOffender,
  networkCentralityFlag,
  escalationPattern
];

/**
 * Maps composite score value (0-100) to human-readable risk band.
 * @param {number} score
 * @returns {"LOW" | "MODERATE" | "HIGH" | "CRITICAL"}
 */
function getRiskBand(score) {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "LOW";
}

/**
 * Calculates composite risk score, band, confidence, and explainability factor list for a given crime record.
 *
 * @param {import('../schema/unified-record').UnifiedRecord} record
 * @param {Object} [context={}]
 * @returns {{ value: number, confidence: number, band: string, factors: Array<{ name: string, points: number, source: string, model_version?: string }> }}
 */
function calculateRiskScore(record, context = {}) {
  if (!record) {
    return {
      value: 0,
      confidence: 0,
      band: "LOW",
      factors: []
    };
  }

  // 1. Evaluate all deterministic rules
  let rule_points = 0;
  let rulesFiredCount = 0;
  const factors = [];

  for (const ruleModule of RULES) {
    if (ruleModule && typeof ruleModule.evaluate === "function") {
      const res = ruleModule.evaluate(record, context);
      if (res.fired) {
        rule_points += res.points;
        rulesFiredCount++;
        factors.push({
          name: res.name || ruleModule.RULE_NAME || "Rule",
          points: res.points,
          source: "rule"
        });
      }
    }
  }

  // 2. Derive features & call AutoML client
  const features = deriveFeatures(record, context);
  const { probability: automlProbability, model_version } = scoreRecord(features);

  // 3. Compute model points (max 40)
  const model_points = Math.round(automlProbability * 40);

  // Add model contribution factor
  factors.push({
    name: "AutoML Risk Model",
    points: model_points,
    source: "model",
    model_version
  });

  // 4. Calculate composite score (capped at 100)
  const composite_score = Math.min(100, rule_points + model_points);

  // 5. Determine risk band
  const band = getRiskBand(composite_score);

  // 6. Calculate confidence score
  const completenessScore = typeof record.completeness_score === "number" ? record.completeness_score : 1.0;
  const confidence = calculateConfidence(automlProbability, rulesFiredCount, completenessScore);

  return {
    value: composite_score,
    confidence,
    band,
    factors
  };
}

module.exports = {
  calculateRiskScore,
  getRiskBand
};

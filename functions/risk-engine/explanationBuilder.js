/**
 * Builds deterministic, audit-ready plain language explanations for risk engine flags.
 *
 * NOTE: Absolutely zero Generative AI or LLMs are used here for police audit safety and liability compliance.
 *
 * @param {Array<string | { name: string }>} [firedRules=[]] Array of fired rule names or rule factor objects
 * @param {Object | Array<Object>} [topFeature=null] Top feature metadata or feature list
 * @returns {string} Formatted explanation string
 */
function buildExplanation(firedRules = [], topFeature = null) {
  const rulesList = Array.isArray(firedRules) ? firedRules : [];

  // Normalize fired rule names
  const ruleNames = rulesList
    .map((r) => (typeof r === "string" ? r : r && r.name ? r.name : null))
    .filter(Boolean);

  // Case 1: One or more rules fired
  if (ruleNames.length > 0) {
    const formattedRules = ruleNames.map((name) => `${name} (rule)`).join("; ");

    let featureClause = "";
    if (topFeature && typeof topFeature === "object" && !Array.isArray(topFeature)) {
      const featName = topFeature.name || "recency";
      const percentile = typeof topFeature.percentile === "number" ? topFeature.percentile : 5;
      featureClause = `; ${featName} in top ${percentile}% (feature)`;
    } else if (Array.isArray(topFeature) && topFeature.length > 0) {
      const firstFeat = topFeature[0];
      const featName = typeof firstFeat === "string" ? firstFeat : firstFeat.name || "recency";
      const percentile = typeof firstFeat === "object" && typeof firstFeat.percentile === "number" ? firstFeat.percentile : 5;
      featureClause = `; ${featName} in top ${percentile}% (feature)`;
    }

    return `Flagged: ${formattedRules}${featureClause}.`;
  }

  // Case 2: Zero rules fired (model-only flag)
  let feat1 = "recency";
  let feat2 = "proximity";

  if (topFeature && typeof topFeature === "object") {
    if (Array.isArray(topFeature.topFeatures) && topFeature.topFeatures.length >= 2) {
      feat1 = topFeature.topFeatures[0];
      feat2 = topFeature.topFeatures[1];
    } else if (Array.isArray(topFeature) && topFeature.length >= 2) {
      feat1 = typeof topFeature[0] === "string" ? topFeature[0] : topFeature[0].name || feat1;
      feat2 = typeof topFeature[1] === "string" ? topFeature[1] : topFeature[1].name || feat2;
    } else {
      if (topFeature.feature1 || topFeature.name) feat1 = topFeature.feature1 || topFeature.name;
      if (topFeature.feature2 || topFeature.secondName) feat2 = topFeature.feature2 || topFeature.secondName;
    }
  }

  return `Flagged by combined signal: ${feat1}, ${feat2} elevated together (model, no single rule threshold crossed).`;
}

module.exports = {
  buildExplanation
};

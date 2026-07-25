/**
 * Calculates explanation & risk score confidence level.
 *
 * Formula:
 * confidence = (modelProbability * 0.5) + ((rulesFiredCount / 4) * 0.3) + (completenessScore * 0.2)
 *
 * @param {number} modelProbability Model output probability (0.0 to 1.0)
 * @param {number} rulesFiredCount Number of deterministic rules fired (0 to 4)
 * @param {number} completenessScore Data completeness score (0.0 to 1.0)
 * @returns {number} Confidence score as an integer from 0 to 100
 */
function calculateConfidence(modelProbability = 0, rulesFiredCount = 0, completenessScore = 1.0) {
  const normModelProb = Math.max(0, Math.min(1, typeof modelProbability === "number" ? modelProbability : 0));
  const normRulesCount = Math.max(0, Math.min(4, typeof rulesFiredCount === "number" ? rulesFiredCount : 0));
  const normCompleteness = Math.max(0, Math.min(1, typeof completenessScore === "number" ? completenessScore : 1.0));

  const rawConfidence = (normModelProb * 0.5) + ((normRulesCount / 4) * 0.3) + (normCompleteness * 0.2);

  const confidenceScore = Math.round(rawConfidence * 100);
  return Math.max(0, Math.min(100, confidenceScore));
}

module.exports = {
  calculateConfidence
};

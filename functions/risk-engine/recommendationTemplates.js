const RULE_TEMPLATE_MAP = [
  {
    ruleName: "SpatioTemporalCluster",
    points: 30,
    template_id: "cluster-patrol",
    templateText: "Recommend patrol window: {time_range} in {location_area}, based on recent cluster."
  },
  {
    ruleName: "RepeatOffender",
    points: 25,
    template_id: "review-flag-repeat",
    templateText: "Recommend review flag: subject re-entering a previously flagged zone."
  },
  {
    ruleName: "NetworkCentralityFlag",
    points: 20,
    template_id: "priority-review-centrality",
    templateText: "Recommend priority review: subject shows high network centrality — possible coordinating role."
  },
  {
    ruleName: "EscalationPattern",
    points: 15,
    template_id: "review-flag-repeat",
    templateText: "Recommend review flag: subject exhibits escalating offense frequency or severity."
  }
];

/**
 * Returns deterministic recommendation template object { template_id, text } for fired rules and risk band.
 *
 * @param {Array<string>} [firedRuleNames=[]] Array of rule name strings that fired
 * @param {string} [band="LOW"] Calculated risk band ("LOW", "MODERATE", "HIGH", "CRITICAL")
 * @param {Object} [options={}] Context placeholder values (time_range, location_area)
 * @returns {{ template_id: string, text: string }}
 */
function getRecommendation(firedRuleNames = [], band = "LOW", options = {}) {
  const firedSet = new Set(Array.isArray(firedRuleNames) ? firedRuleNames : []);
  const timeRange = options.time_range || "22:00-04:00";
  const locationArea = options.location_area || options.station_id || "Whitefield";

  // Filter matching rules in descending point order
  const matchedTemplates = RULE_TEMPLATE_MAP.filter((item) => firedSet.has(item.ruleName));

  if (matchedTemplates.length > 0) {
    // Primary template_id comes from highest point rule that fired
    const primaryTemplateId = matchedTemplates[0].template_id;

    const formattedTexts = matchedTemplates.map((item) => {
      return item.templateText
        .replace("{time_range}", timeRange)
        .replace("{location_area}", locationArea);
    });

    return {
      template_id: primaryTemplateId,
      text: formattedTexts.join(" ")
    };
  }

  // Model-only critical risk flag (no rules fired)
  if (band === "CRITICAL") {
    return {
      template_id: "model-only-review",
      text: "Recommend investigative review: elevated combined-signal risk, no single explicit trigger — human review advised."
    };
  }

  // Default / Low risk recommendation
  return {
    template_id: "no-action-low",
    text: "No action recommended — logged for pattern tracking."
  };
}

module.exports = {
  getRecommendation,
  RULE_TEMPLATE_MAP
};

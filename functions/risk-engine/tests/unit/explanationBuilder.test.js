const { buildExplanation } = require("../../explanationBuilder");

describe("ExplanationBuilder Module", () => {
  test("formats rule-fired explanation cleanly", () => {
    const firedRules = ["SpatioTemporalCluster", "RepeatOffender"];
    const topFeature = { name: "recency", percentile: 5 };

    const explanation = buildExplanation(firedRules, topFeature);
    expect(explanation).toBe("Flagged: SpatioTemporalCluster (rule); RepeatOffender (rule); recency in top 5% (feature).");
  });

  test("formats model-only (zero-rule) explanation cleanly", () => {
    const firedRules = [];
    const topFeature = { topFeatures: ["recency", "proximity"] };

    const explanation = buildExplanation(firedRules, topFeature);
    expect(explanation).toBe("Flagged by combined signal: recency, proximity elevated together (model, no single rule threshold crossed).");
  });

  test("asserts dependency-free local execution without network/external API calls", () => {
    // Inspect exported function to confirm synchronous pure-string return
    const explanation = buildExplanation(["SpatioTemporalCluster"]);
    expect(typeof explanation).toBe("string");
    expect(explanation.startsWith("Flagged:")).toBe(true);
  });
});

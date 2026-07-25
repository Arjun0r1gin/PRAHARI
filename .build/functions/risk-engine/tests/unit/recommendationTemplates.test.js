const { getRecommendation } = require("../../recommendationTemplates");

describe("RecommendationTemplates Module", () => {
  test("triggers cluster-patrol when SpatioTemporalCluster fires", () => {
    const res = getRecommendation(["SpatioTemporalCluster"], "HIGH", { time_range: "22:00-04:00", location_area: "Whitefield" });
    expect(res.template_id).toBe("cluster-patrol");
    expect(res.text).toContain("Recommend patrol window: 22:00-04:00 in Whitefield");
  });

  test("triggers review-flag-repeat when RepeatOffender fires", () => {
    const res = getRecommendation(["RepeatOffender"], "HIGH");
    expect(res.template_id).toBe("review-flag-repeat");
    expect(res.text).toContain("Recommend review flag: subject re-entering a previously flagged zone.");
  });

  test("triggers priority-review-centrality when NetworkCentralityFlag fires", () => {
    const res = getRecommendation(["NetworkCentralityFlag"], "HIGH");
    expect(res.template_id).toBe("priority-review-centrality");
    expect(res.text).toContain("Recommend priority review: subject shows high network centrality");
  });

  test("triggers model-only-review when NO rules fire and band is CRITICAL", () => {
    const res = getRecommendation([], "CRITICAL");
    expect(res.template_id).toBe("model-only-review");
    expect(res.text).toContain("Recommend investigative review: elevated combined-signal risk");
  });

  test("triggers no-action-low default when NO rules fire and band is LOW", () => {
    const res = getRecommendation([], "LOW");
    expect(res.template_id).toBe("no-action-low");
    expect(res.text).toContain("No action recommended — logged for pattern tracking.");
  });

  test("concatenates multi-rule texts in descending point-value order", () => {
    // SpatioTemporalCluster (30 pts) comes before RepeatOffender (25 pts)
    const fired = ["RepeatOffender", "SpatioTemporalCluster"];
    const res = getRecommendation(fired, "CRITICAL", { time_range: "22:00-04:00", location_area: "Whitefield" });
    expect(res.template_id).toBe("cluster-patrol");
    const clusterIndex = res.text.indexOf("Recommend patrol window");
    const repeatIndex = res.text.indexOf("Recommend review flag");
    expect(clusterIndex).toBeLessThan(repeatIndex);
  });
});

const { scoreRecord } = require("../../automlClient");

describe("AutoML Client Mock", () => {
  test("returns probability strictly bounded in [0.0, 1.0] for standard input", () => {
    const features = {
      recency: 0.8,
      proximity: 250,
      centrality: 0.9,
      recurrence: 3,
      socio_economic_correlation: 0.6
    };

    const res = scoreRecord(features);
    expect(res.probability).toBeGreaterThanOrEqual(0.0);
    expect(res.probability).toBeLessThanOrEqual(1.0);
    expect(typeof res.model_version).toBe("string");
  });

  test("handles edge case: all-zero features", () => {
    const features = { recency: 0, proximity: 0, centrality: 0, recurrence: 0, socio_economic_correlation: 0 };
    const res = scoreRecord(features);
    expect(res.probability).toBeGreaterThanOrEqual(0.0);
    expect(res.probability).toBeLessThanOrEqual(1.0);
  });

  test("handles edge case: all-max / extreme features", () => {
    const features = { recency: 1.0, proximity: 10000, centrality: 1.0, recurrence: 50, socio_economic_correlation: 1.0 };
    const res = scoreRecord(features);
    expect(res.probability).toBeGreaterThanOrEqual(0.0);
    expect(res.probability).toBeLessThanOrEqual(1.0);
  });

  test("handles empty/missing features gracefully", () => {
    const res = scoreRecord({});
    expect(res.probability).toBe(0.5);
  });
});

// NOTE: This test validates the networkCentralityFlag rule contract using the Phase 4 integration stub.
// TODO(integration-test): re-run and update this test suite after Phase 25 rewires the real centrality import from functions/network-analysis.

const { evaluate, getCentrality } = require("../../rules/networkCentralityFlag");

describe("NetworkCentralityFlag Rule", () => {
  const record = {
    incident_id: "INC-500",
    persons: [{ person_id: "P-CENTRAL", role: "suspect" }]
  };

  test("fires when centrality value is in top 5% (>= 0.95)", () => {
    // Stub returns 0.96 by default, which is >= 0.95
    const result = evaluate(record);
    expect(result.fired).toBe(true);
    expect(result.points).toBe(20);
    expect(result.name).toBe("NetworkCentralityFlag");
  });

  test("does NOT fire when centrality value is below top 5% threshold (< 0.95)", () => {
    const result = evaluate(record, {
      centralityThreshold: 0.98,
      personCentralityMap: { "P-CENTRAL": 0.90 }
    });
    expect(result.fired).toBe(false);
    expect(result.points).toBe(0);
  });

  test("stub function returns placeholder score", () => {
    expect(getCentrality("P-CENTRAL")).toBeGreaterThanOrEqual(0.95);
  });
});

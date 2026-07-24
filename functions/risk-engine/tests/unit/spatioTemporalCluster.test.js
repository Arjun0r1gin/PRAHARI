const { evaluate, POINTS, RULE_NAME } = require("../../rules/spatioTemporalCluster");

describe("SpatioTemporalCluster Rule", () => {
  const baseRecord = {
    incident_id: "INC-MAIN",
    location: { lat: 12.9698, lng: 77.7500 },
    timestamp: "2026-04-17T22:14:00+05:30"
  };

  test("fires when 3 or more incidents occur within 500m and 14 days", () => {
    const nearbyIncidents = [
      { incident_id: "INC-1", location: { lat: 12.9699, lng: 77.7501 }, timestamp: "2026-04-16T22:00:00+05:30" }, // ~110m, 1 day
      { incident_id: "INC-2", location: { lat: 12.9697, lng: 77.7499 }, timestamp: "2026-04-15T21:00:00+05:30" }  // ~110m, 2 days
    ];

    const result = evaluate(baseRecord, { nearbyIncidents });
    expect(result.fired).toBe(true);
    expect(result.points).toBe(30);
    expect(result.name).toBe("SpatioTemporalCluster");
  });

  test("does NOT fire on only 2 qualifying incidents total (1 nearby + main)", () => {
    const nearbyIncidents = [
      { incident_id: "INC-1", location: { lat: 12.9699, lng: 77.7501 }, timestamp: "2026-04-16T22:00:00+05:30" } // 1 nearby
    ];

    const result = evaluate(baseRecord, { nearbyIncidents });
    expect(result.fired).toBe(false);
    expect(result.points).toBe(0);
  });

  test("does NOT fire when incidents are 600m apart (near-miss distance test)", () => {
    // 0.0054 deg latitude difference is ~600 meters
    const nearbyIncidents = [
      { incident_id: "INC-FAR1", location: { lat: 12.9752, lng: 77.7500 }, timestamp: "2026-04-16T22:00:00+05:30" },
      { incident_id: "INC-FAR2", location: { lat: 12.9753, lng: 77.7500 }, timestamp: "2026-04-15T21:00:00+05:30" }
    ];

    const result = evaluate(baseRecord, { nearbyIncidents });
    expect(result.fired).toBe(false);
    expect(result.points).toBe(0);
  });
});

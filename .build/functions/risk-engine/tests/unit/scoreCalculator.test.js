const { calculateRiskScore, getRiskBand } = require("../../services/scoreCalculator");

describe("ScoreCalculator Service", () => {
  test("correctly maps composite score band boundaries", () => {
    expect(getRiskBand(24)).toBe("LOW");
    expect(getRiskBand(25)).toBe("MODERATE");
    expect(getRiskBand(49)).toBe("MODERATE");
    expect(getRiskBand(50)).toBe("HIGH");
    expect(getRiskBand(74)).toBe("HIGH");
    expect(getRiskBand(75)).toBe("CRITICAL");
  });

  test("Scenario B: 0 rules fired with high model probability produces realistic elevated score", () => {
    const record = {
      incident_id: "INC-SCENARIO-B",
      station_id: "whitefield",
      location: { lat: 12.9, lng: 77.7 },
      timestamp: "2026-04-17T22:14:00+05:30",
      persons: []
    };

    // Context with 0 matching rules
    const context = {
      nearbyIncidents: [],
      priorOffenses: [],
      offenseHistory: []
    };

    const res = calculateRiskScore(record, context);
    const firedRules = res.factors.filter((f) => f.source === "rule");

    expect(firedRules.length).toBe(0);
    // Model max points contribution is 40. For default/high probability features, score is capped at model_points.
    expect(res.value).toBeGreaterThan(0);
    expect(res.value).toBeLessThanOrEqual(40);
    expect(res.band).toBe("MODERATE");
  });
});

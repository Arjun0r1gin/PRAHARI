const { evaluate, POINTS } = require("../../rules/repeatOffender");

describe("RepeatOffender Rule", () => {
  const baseRecord = {
    incident_id: "INC-100",
    station_id: "whitefield",
    persons: [{ person_id: "P-1029", role: "suspect" }]
  };

  test("fires when a prior offense exists in the same station/zone", () => {
    const priorOffenses = [
      { person_id: "P-1029", station_id: "whitefield", timestamp: "2026-03-01T10:00:00+05:30" }
    ];

    const result = evaluate(baseRecord, { priorOffenses });
    expect(result.fired).toBe(true);
    expect(result.points).toBe(25);
    expect(result.name).toBe("RepeatOffender");
  });

  test("does NOT fire when prior offenses belong to a different zone or person", () => {
    const priorOffenses = [
      { person_id: "P-1029", station_id: "koramangala", timestamp: "2026-03-01T10:00:00+05:30" },
      { person_id: "P-9999", station_id: "whitefield", timestamp: "2026-03-01T10:00:00+05:30" }
    ];

    const result = evaluate(baseRecord, { priorOffenses, flaggedZoneId: "whitefield" });
    expect(result.fired).toBe(false);
    expect(result.points).toBe(0);
  });
});

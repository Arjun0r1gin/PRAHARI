const { evaluate } = require("../../rules/escalationPattern");

describe("EscalationPattern Rule", () => {
  const record = { incident_id: "INC-800" };

  test("fires when offense gaps are shrinking across 3+ offenses", () => {
    // Gap 1: 30 days, Gap 2: 10 days (shrinking)
    const offenseHistory = [
      { timestamp: "2026-01-01T00:00:00Z", severity: 2 },
      { timestamp: "2026-01-31T00:00:00Z", severity: 2 },
      { timestamp: "2026-02-10T00:00:00Z", severity: 2 }
    ];

    const result = evaluate(record, { offenseHistory });
    expect(result.fired).toBe(true);
    expect(result.points).toBe(15);
    expect(result.name).toBe("EscalationPattern");
  });

  test("fires when offense severity is strictly rising across 3+ offenses", () => {
    const offenseHistory = [
      { timestamp: "2026-01-01T00:00:00Z", severity: 1 },
      { timestamp: "2026-02-01T00:00:00Z", severity: 3 },
      { timestamp: "2026-03-01T00:00:00Z", severity: 5 }
    ];

    const result = evaluate(record, { offenseHistory });
    expect(result.fired).toBe(true);
    expect(result.points).toBe(15);
  });

  test("does NOT fire on flat / stable pattern", () => {
    const offenseHistory = [
      { timestamp: "2026-01-01T00:00:00Z", severity: 2 },
      { timestamp: "2026-02-01T00:00:00Z", severity: 2 },
      { timestamp: "2026-03-01T00:00:00Z", severity: 2 }
    ];

    const result = evaluate(record, { offenseHistory });
    expect(result.fired).toBe(false);
    expect(result.points).toBe(0);
  });
});

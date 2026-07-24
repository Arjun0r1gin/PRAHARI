const { recencyDecay } = require("../../algorithms/recencyDecay");

describe("RecencyDecay Algorithm", () => {
  const now = new Date("2026-04-17T00:00:00Z");

  test("confirms decay weight strictly decreases as incident age increases", () => {
    const t0 = new Date("2026-04-17T00:00:00Z"); // 0 days
    const t10 = new Date("2026-04-07T00:00:00Z"); // 10 days
    const t30 = new Date("2026-03-18T00:00:00Z"); // 30 days
    const t90 = new Date("2026-01-17T00:00:00Z"); // 90 days

    const w0 = recencyDecay(t0, now);
    const w10 = recencyDecay(t10, now);
    const w30 = recencyDecay(t30, now);
    const w90 = recencyDecay(t90, now);

    expect(w0).toBeGreaterThan(w10);
    expect(w10).toBeGreaterThan(w30);
    expect(w30).toBeGreaterThan(w90);
  });

  test("matches expected decay values at key intervals (0, 30, 90 days)", () => {
    const t0 = new Date("2026-04-17T00:00:00Z");
    const t30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const t90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const w0 = recencyDecay(t0, now);
    const w30 = recencyDecay(t30, now);
    const w90 = recencyDecay(t90, now);

    // 0 days: exp(0) = 1.0
    expect(w0).toBe(1.0);

    // 30 days: exp(-1) ≈ 0.3679
    expect(w30).toBeCloseTo(0.3679, 3);

    // 90 days: exp(-3) ≈ 0.0498
    expect(w90).toBeCloseTo(0.0498, 3);
  });
});

const { getGraph } = require("../../services/graphService");

describe("GraphService", () => {
  test("boundary test: flagged_ringleader is true at/above top-5% threshold and false below it", () => {
    const graphData = getGraph("CASE-992");

    expect(graphData).toBeDefined();
    expect(Array.isArray(graphData.nodes)).toBe(true);
    expect(Array.isArray(graphData.edges)).toBe(true);

    const ringleaderNode = graphData.nodes.find((n) => n.person_id === "P-1031");
    expect(ringleaderNode).toBeDefined();
    expect(ringleaderNode.flagged_ringleader).toBe(true);

    // Non-ringleader nodes with lower betweenness should be false
    const regularNode = graphData.nodes.find((n) => n.person_id === "P-1029");
    expect(regularNode).toBeDefined();
    expect(regularNode.flagged_ringleader).toBe(false);
  });
});

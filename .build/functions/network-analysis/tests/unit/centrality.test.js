const { computeCentrality, isTopPercentile, CENTRALITY_TOP_PERCENTILE } = require("../../algorithms/centrality");

describe("Centrality Algorithms", () => {
  test("computes degree and betweenness centrality accurately on a 5-node star graph", () => {
    // Hand-constructed star graph centered at P-HUB
    const starGraph = {
      nodes: [
        { id: "P-HUB" },
        { id: "P-LEAF1" },
        { id: "P-LEAF2" },
        { id: "P-LEAF3" },
        { id: "P-LEAF4" }
      ],
      edges: [
        { source: "P-HUB", target: "P-LEAF1" },
        { source: "P-HUB", target: "P-LEAF2" },
        { source: "P-HUB", target: "P-LEAF3" },
        { source: "P-HUB", target: "P-LEAF4" }
      ]
    };

    const results = computeCentrality(starGraph);
    expect(results.length).toBe(5);

    const hubNode = results.find((n) => n.person_id === "P-HUB");
    expect(hubNode).toBeDefined();

    // Hand calculation: N = 5, Hub degree = 4 => 4/4 = 1.0
    expect(hubNode.degree_centrality).toBe(1.0);

    // Hand calculation: Hub sits on all 6 shortest paths between leaf pairs => 6/6 = 1.0
    expect(hubNode.betweenness_centrality).toBe(1.0);

    // Leaf nodes hand calculation: degree = 1/4 = 0.25, betweenness = 0.0
    const leafNode = results.find((n) => n.person_id === "P-LEAF1");
    expect(leafNode.degree_centrality).toBe(0.25);
    expect(leafNode.betweenness_centrality).toBe(0.0);
  });

  test("isTopPercentile accurately identifies top percentile values", () => {
    const scores = [0.1, 0.2, 0.3, 0.4, 0.95];
    expect(isTopPercentile(0.95, scores, CENTRALITY_TOP_PERCENTILE)).toBe(true);
    expect(isTopPercentile(0.2, scores, CENTRALITY_TOP_PERCENTILE)).toBe(false);
  });
});

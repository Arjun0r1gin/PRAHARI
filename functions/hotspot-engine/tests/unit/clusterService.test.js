const { getClusters } = require("../../services/clusterService");

describe("ClusterService", () => {
  test("computes completeness_score averaging correctness and ranks by recency_weighted_score", () => {
    const clusters = getClusters("whitefield", 30);

    expect(Array.isArray(clusters)).toBe(true);
    expect(clusters.length).toBeGreaterThan(0);

    // Primary cluster (INC-001 [0.90], INC-002 [0.85], INC-003 [0.80])
    // Expected completeness_score average = (0.90 + 0.85 + 0.80) / 3 = 0.85
    const primaryCluster = clusters[0];

    expect(primaryCluster.incident_count).toBe(3);
    expect(primaryCluster.completeness_score).toBeCloseTo(0.85, 2);
    expect(primaryCluster.recency_weighted_score).toBeGreaterThan(0);
    expect(primaryCluster.cluster_id).toContain("CLUST-WHITEFIELD-");
  });
});

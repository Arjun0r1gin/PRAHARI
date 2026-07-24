const { densityCluster } = require("../../algorithms/densityCluster");

describe("DensityCluster Algorithm", () => {
  test("correctly groups nearby incidents into clusters and computes centroids", () => {
    const syntheticIncidents = [
      // Cluster A (~100m apart)
      { incident_id: "INC-A1", location: { lat: 12.9698, lng: 77.7500 } },
      { incident_id: "INC-A2", location: { lat: 12.9699, lng: 77.7501 } },
      { incident_id: "INC-A3", location: { lat: 12.9697, lng: 77.7499 } },
      // Cluster B (~2.5km away)
      { incident_id: "INC-B1", location: { lat: 12.9900, lng: 77.7700 } }
    ];

    const clusters = densityCluster(syntheticIncidents, 500);

    expect(clusters.length).toBe(2);

    // Primary cluster (sorted by count descending)
    const clusterA = clusters[0];
    expect(clusterA.incident_count).toBe(3);
    expect(clusterA.incident_ids).toEqual(["INC-A1", "INC-A2", "INC-A3"]);
    expect(clusterA.centroid.lat).toBeCloseTo(12.9698, 3);
    expect(clusterA.centroid.lng).toBeCloseTo(77.7500, 3);

    // Secondary cluster
    const clusterB = clusters[1];
    expect(clusterB.incident_count).toBe(1);
    expect(clusterB.incident_ids).toEqual(["INC-B1"]);
    expect(clusterB.centroid.lat).toBe(12.99);
    expect(clusterB.centroid.lng).toBe(77.77);
  });

  test("handles empty incident lists gracefully", () => {
    expect(densityCluster([])).toEqual([]);
    expect(densityCluster(null)).toEqual([]);
  });
});

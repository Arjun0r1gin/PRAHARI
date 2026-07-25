const { densityCluster } = require("../algorithms/densityCluster");
const { recencyDecay } = require("../algorithms/recencyDecay");

// TODO(integration): replace with real data-fusion/Data Store query
function fetchIncidentsForDistrict(district, windowDays = 30) {
  const targetDistrict = (district || "whitefield").toLowerCase();

  // Synthetic incident dataset for testing and local execution
  const synthIncidents = [
    {
      incident_id: "INC-2026-001",
      station_id: targetDistrict,
      location: { lat: 12.9698, lng: 77.7500 },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completeness_score: 0.90
    },
    {
      incident_id: "INC-2026-002",
      station_id: targetDistrict,
      location: { lat: 12.9699, lng: 77.7501 },
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completeness_score: 0.85
    },
    {
      incident_id: "INC-2026-003",
      station_id: targetDistrict,
      location: { lat: 12.9697, lng: 77.7499 },
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completeness_score: 0.80
    },
    {
      incident_id: "INC-2026-004",
      station_id: targetDistrict,
      location: { lat: 12.9800, lng: 77.7600 },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completeness_score: 0.95
    }
  ];

  return synthIncidents;
}

/**
 * Calculates ranked hotspot clusters for a district over a specified time window.
 *
 * @param {string} district Police station / district identifier
 * @param {number} [windowDays=30] Rolling window in days
 * @returns {Array<{ cluster_id: string, centroid: { lat: number, lng: number }, incident_count: number, recency_weighted_score: number, completeness_score: number }>}
 */
function getClusters(district, windowDays = 30) {
  const incidents = fetchIncidentsForDistrict(district, windowDays);

  if (!Array.isArray(incidents) || incidents.length === 0) {
    return [];
  }

  // Create lookup map for fast retrieval
  const incidentMap = new Map(incidents.map((inc) => [inc.incident_id, inc]));

  // Run spatial density clustering
  const rawClusters = densityCluster(incidents, 500);
  const now = new Date();

  const rankedClusters = rawClusters.map((cluster, index) => {
    let sumRecencyWeight = 0;
    let sumCompleteness = 0;
    let count = 0;

    for (const incId of cluster.incident_ids) {
      const inc = incidentMap.get(incId);
      if (inc) {
        count++;
        const weight = recencyDecay(inc.timestamp, now);
        sumRecencyWeight += weight;
        sumCompleteness += typeof inc.completeness_score === "number" ? inc.completeness_score : 1.0;
      }
    }

    const avgRecency = count > 0 ? sumRecencyWeight / count : 1.0;
    const avgCompleteness = count > 0 ? sumCompleteness / count : 1.0;

    const recency_weighted_score = parseFloat((cluster.incident_count * avgRecency).toFixed(2));
    const completeness_score = parseFloat(avgCompleteness.toFixed(2));
    const cluster_id = `CLUST-${(district || "WF").toUpperCase()}-${index + 1}`;

    return {
      cluster_id,
      centroid: cluster.centroid,
      incident_count: cluster.incident_count,
      recency_weighted_score,
      completeness_score
    };
  });

  // Rank by recency_weighted_score descending
  rankedClusters.sort((a, b) => b.recency_weighted_score - a.recency_weighted_score);

  return rankedClusters;
}

module.exports = {
  getClusters,
  fetchIncidentsForDistrict
};

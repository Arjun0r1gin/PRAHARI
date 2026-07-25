/**
 * Calculates Haversine distance in meters between two lat/lng pairs.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in meters
 */
function calculateHaversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Groups spatial incident records into spatio-temporal clusters based on distance radius threshold.
 *
 * @param {Array<Object>} incidents List of incident objects containing location {lat, lng} and incident_id
 * @param {number} [radiusMeters=500] Maximum radius distance in meters for cluster inclusion
 * @returns {Array<{ centroid: { lat: number, lng: number }, incident_count: number, incident_ids: string[] }>}
 */
function densityCluster(incidents = [], radiusMeters = 500) {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return [];
  }

  const validIncidents = incidents.filter(
    (item) => item && item.location && typeof item.location.lat === "number" && typeof item.location.lng === "number"
  );

  if (validIncidents.length === 0) {
    return [];
  }

  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < validIncidents.length; i++) {
    if (visited.has(i)) continue;

    const seed = validIncidents[i];
    const clusterIncidents = [seed];
    visited.add(i);

    for (let j = i + 1; j < validIncidents.length; j++) {
      if (visited.has(j)) continue;

      const candidate = validIncidents[j];
      const dist = calculateHaversineDistanceMeters(
        seed.location.lat,
        seed.location.lng,
        candidate.location.lat,
        candidate.location.lng
      );

      if (dist <= radiusMeters) {
        visited.add(j);
        clusterIncidents.push(candidate);
      }
    }

    // Compute centroid coordinates
    let sumLat = 0;
    let sumLng = 0;
    const incident_ids = [];

    for (const inc of clusterIncidents) {
      sumLat += inc.location.lat;
      sumLng += inc.location.lng;
      if (inc.incident_id) {
        incident_ids.push(inc.incident_id);
      }
    }

    const count = clusterIncidents.length;
    const centroid = {
      lat: parseFloat((sumLat / count).toFixed(6)),
      lng: parseFloat((sumLng / count).toFixed(6))
    };

    clusters.push({
      centroid,
      incident_count: count,
      incident_ids
    });
  }

  // Sort clusters by incident count descending
  clusters.sort((a, b) => b.incident_count - a.incident_count);

  return clusters;
}

module.exports = {
  densityCluster,
  calculateHaversineDistanceMeters
};

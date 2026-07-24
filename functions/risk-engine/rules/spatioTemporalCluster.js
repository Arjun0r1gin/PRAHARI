const RULE_NAME = "SpatioTemporalCluster";
const POINTS = 30;
const MAX_DISTANCE_METERS = 500;
const MAX_TIME_WINDOW_DAYS = 14;

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
 * Calculates absolute difference in days between two ISO date strings.
 * @param {string} dateStr1
 * @param {string} dateStr2
 * @returns {number} Difference in days
 */
function getAbsDiffInDays(dateStr1, dateStr2) {
  const t1 = new Date(dateStr1).getTime();
  const t2 = new Date(dateStr2).getTime();
  if (isNaN(t1) || isNaN(t2)) return Infinity;
  return Math.abs(t1 - t2) / (1000 * 60 * 60 * 24);
}

/**
 * Evaluates Spatio-Temporal Cluster rule.
 * Fires when 3 or more incidents occur within 500 meters and 14 days of each other.
 *
 * @param {import('../schema/unified-record').UnifiedRecord} record
 * @param {Object} [context={}]
 * @param {Array<import('../schema/unified-record').UnifiedRecord>} [context.nearbyIncidents=[]] Pre-fetched nearby incidents
 * @returns {{ fired: boolean, points: number, name: string }}
 */
function evaluate(record, context = {}) {
  if (!record || !record.location || typeof record.location.lat !== "number" || typeof record.location.lng !== "number") {
    return { fired: false, points: 0, name: RULE_NAME };
  }

  const nearbyIncidents = Array.isArray(context.nearbyIncidents) ? context.nearbyIncidents : [];

  let matchingCount = 1; // Count current record

  for (const incident of nearbyIncidents) {
    if (!incident || !incident.location || incident.incident_id === record.incident_id) {
      continue;
    }

    const distance = calculateHaversineDistanceMeters(
      record.location.lat,
      record.location.lng,
      incident.location.lat,
      incident.location.lng
    );

    const timeDiffDays = getAbsDiffInDays(record.timestamp, incident.timestamp);

    if (distance <= MAX_DISTANCE_METERS && timeDiffDays <= MAX_TIME_WINDOW_DAYS) {
      matchingCount++;
    }
  }

  const fired = matchingCount >= 3;

  return {
    fired,
    points: fired ? POINTS : 0,
    name: RULE_NAME
  };
}

module.exports = {
  RULE_NAME,
  POINTS,
  evaluate
};

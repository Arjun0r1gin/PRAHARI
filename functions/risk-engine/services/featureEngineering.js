const fs = require("fs");
const path = require("path");
const { getCentrality } = require("../rules/networkCentralityFlag");

/**
 * Reads socio-economic correlation factor for a station/district.
 * @param {string} stationId
 * @returns {number} Factor between 0.0 and 1.0
 */
function getSocioEconomicFactor(stationId) {
  try {
    const configPath = path.resolve(__dirname, "../../../models/prediction/socio-economic-factors.json");
    const rawData = fs.readFileSync(configPath, "utf8");
    const factors = JSON.parse(rawData);
    if (stationId && typeof factors[stationId] === "number") {
      return factors[stationId];
    }
    return typeof factors.default === "number" ? factors.default : 0.5;
  } catch (err) {
    return 0.5;
  }
}

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
 * Derives normalized ML feature set from raw record and pre-fetched context.
 *
 * @param {import('../schema/unified-record').UnifiedRecord} record
 * @param {Object} [context={}]
 * @param {Array<Object>} [context.priorOffenses=[]] Person's prior offenses
 * @param {Array<Object>} [context.clusterCentroids=[]] Existing cluster centroids
 * @returns {{ recency: number, proximity: number, centrality: number, recurrence: number, socio_economic_correlation: number }}
 */
function deriveFeatures(record, context = {}) {
  if (!record) {
    return {
      recency: 0.0,
      proximity: 10000,
      centrality: 0.0,
      recurrence: 0,
      socio_economic_correlation: 0.5
    };
  }

  const recordTime = new Date(record.timestamp).getTime();
  const priorOffenses = Array.isArray(context.priorOffenses) ? context.priorOffenses : [];

  // 1. Recency calculation (decayed via exp(-days/30))
  let minDaysDiff = Infinity;
  if (!isNaN(recordTime)) {
    for (const offense of priorOffenses) {
      if (offense && offense.timestamp) {
        const offenseTime = new Date(offense.timestamp).getTime();
        if (!isNaN(offenseTime) && offenseTime < recordTime) {
          const diffDays = (recordTime - offenseTime) / (1000 * 60 * 60 * 24);
          if (diffDays < minDaysDiff) {
            minDaysDiff = diffDays;
          }
        }
      }
    }
  }

  const daysSinceLast = minDaysDiff === Infinity ? 90 : minDaysDiff;
  const recency = parseFloat(Math.exp(-daysSinceLast / 30).toFixed(4));

  // 2. Proximity calculation (meters to nearest cluster centroid)
  let minProximityMeters = 10000;
  const centroids = Array.isArray(context.clusterCentroids) ? context.clusterCentroids : [];
  if (record.location && typeof record.location.lat === "number" && typeof record.location.lng === "number") {
    for (const centroid of centroids) {
      if (centroid && typeof centroid.lat === "number" && typeof centroid.lng === "number") {
        const dist = calculateHaversineDistanceMeters(
          record.location.lat,
          record.location.lng,
          centroid.lat,
          centroid.lng
        );
        if (dist < minProximityMeters) {
          minProximityMeters = dist;
        }
      }
    }
  }
  const proximity = parseFloat(minProximityMeters.toFixed(2));

  // 3. Centrality pass-through from networkCentralityFlag.getCentrality()
  let maxCentrality = 0.0;
  if (Array.isArray(record.persons)) {
    for (const person of record.persons) {
      if (person && person.person_id) {
        const c = getCentrality(person.person_id);
        if (c > maxCentrality) maxCentrality = c;
      }
    }
  }
  const centrality = parseFloat(maxCentrality.toFixed(4));

  // 4. Recurrence calculation (incident count in rolling 90-day window)
  let recurrence = 0;
  if (!isNaN(recordTime)) {
    for (const offense of priorOffenses) {
      if (offense && offense.timestamp) {
        const offenseTime = new Date(offense.timestamp).getTime();
        if (!isNaN(offenseTime)) {
          const diffDays = (recordTime - offenseTime) / (1000 * 60 * 60 * 24);
          if (diffDays >= 0 && diffDays <= 90) {
            recurrence++;
          }
        }
      }
    }
  }

  // 5. Socio-economic correlation factor lookup
  const socio_economic_correlation = getSocioEconomicFactor(record.station_id);

  return {
    recency,
    proximity,
    centrality,
    recurrence,
    socio_economic_correlation
  };
}

module.exports = {
  deriveFeatures,
  getSocioEconomicFactor
};

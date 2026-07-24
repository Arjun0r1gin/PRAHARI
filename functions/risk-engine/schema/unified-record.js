// TODO: sync with shared/schemas/ once the data-fusion module publishes its own canonical schema — this is a local placeholder until then.

/**
 * @typedef {Object} Location
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 */

/**
 * @typedef {Object} Person
 * @property {string} person_id - Unique identifier for the person
 * @property {string} role - Role in the incident (e.g., suspect, victim, witness)
 */

/**
 * @typedef {Object} UnifiedRecord
 * @property {string} incident_id - Unique identifier for the incident
 * @property {string} station_id - Identifier of the reporting police station
 * @property {string} type - Category/type of crime (e.g., vehicle_theft)
 * @property {Location} location - Geo-coordinates of the incident
 * @property {string} timestamp - ISO 8601 formatted timestamp string with offset
 * @property {Person[]} persons - List of associated persons and their roles
 * @property {string} source_format - Data source format version identifier
 * @property {number} completeness_score - Quality/completeness score of the ingested record (0.0 to 1.0)
 */

/**
 * Sample canonical structure for a unified crime record.
 * @type {UnifiedRecord}
 */
const SAMPLE_UNIFIED_RECORD = Object.freeze({
  incident_id: "INC-2026-0417",
  station_id: "whitefield",
  type: "vehicle_theft",
  location: Object.freeze({
    lat: 12.9698,
    lng: 77.7500
  }),
  timestamp: "2026-04-17T22:14:00+05:30",
  persons: Object.freeze([
    Object.freeze({
      person_id: "P-1029",
      role: "suspect"
    })
  ]),
  source_format: "whitefield-v1",
  completeness_score: 0.86
});

/**
 * Factory function to instantiate a UnifiedRecord placeholder object.
 * @param {Partial<UnifiedRecord>} [data={}]
 * @returns {UnifiedRecord}
 */
function createUnifiedRecord(data = {}) {
  return {
    incident_id: data.incident_id || "",
    station_id: data.station_id || "",
    type: data.type || "",
    location: {
      lat: data.location?.lat ?? 0,
      lng: data.location?.lng ?? 0
    },
    timestamp: data.timestamp || new Date().toISOString(),
    persons: Array.isArray(data.persons)
      ? data.persons.map((p) => ({ person_id: p.person_id || "", role: p.role || "" }))
      : [],
    source_format: data.source_format || "",
    completeness_score: typeof data.completeness_score === "number" ? data.completeness_score : 0
  };
}

/**
 * Dependency-free validator function for UnifiedRecord objects.
 * @param {any} record
 * @returns {boolean}
 */
function isValidUnifiedRecord(record) {
  if (!record || typeof record !== "object") return false;
  if (typeof record.incident_id !== "string" || !record.incident_id) return false;
  if (typeof record.station_id !== "string" || !record.station_id) return false;
  if (typeof record.type !== "string" || !record.type) return false;
  if (!record.location || typeof record.location.lat !== "number" || typeof record.location.lng !== "number") return false;
  if (typeof record.timestamp !== "string" || !record.timestamp) return false;
  if (!Array.isArray(record.persons)) return false;
  if (typeof record.source_format !== "string") return false;
  if (typeof record.completeness_score !== "number") return false;
  return true;
}

module.exports = {
  SAMPLE_UNIFIED_RECORD,
  createUnifiedRecord,
  isValidUnifiedRecord
};

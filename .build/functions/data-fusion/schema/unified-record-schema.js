/**
 * @fileoverview Unified Record Schema for PRAHARI Data Fusion Engine.
 *
 * This schema defines the canonical, normalised shape that every raw CSV row
 * is mapped to after adapter processing.  All downstream consumers (risk-engine,
 * hotspot-engine, network-analysis) read from this shape via Catalyst Data Store.
 *
 * Field naming is intentionally consistent here; adapters are responsible for
 * translating the station-level inconsistencies (field names, date formats) into
 * this normalised form.
 */

'use strict';

/**
 * Canonical field names for a unified police record.
 *
 * @typedef {Object} UnifiedRecord
 * @property {string}  record_id          - Globally unique ID (uuid v4)
 * @property {string}  source_station_id  - Station identifier (e.g. 'whitefield')
 * @property {string}  source_district_id - District identifier (e.g. 'bangalore-urban')
 * @property {string}  record_type        - One of: fir | criminal | wanted | officer | vehicle | evidence | case | cctv
 * @property {string}  source_record_id   - Original row ID from the source CSV
 * @property {number}  ingested_at        - Unix epoch ms of ingestion
 * @property {number}  [event_ts]         - Normalised event timestamp (Unix epoch ms); null if not applicable
 * @property {string}  [incident_type]    - Crime / event type string
 * @property {string}  [status]           - open | closed | under_investigation | active | apprehended
 * @property {number}  [lat]              - WGS-84 latitude
 * @property {number}  [lng]              - WGS-84 longitude
 * @property {string}  [person_id]        - Canonical person identifier
 * @property {string}  [person_name]      - Full name of person (alias-normalised)
 * @property {string}  [plate_number]     - Vehicle registration plate
 * @property {string}  [vehicle_type]     - motorcycle | car | auto_rickshaw | goods_vehicle
 * @property {string}  [flagged_reason]   - stolen | wanted | none
 * @property {string}  [officer_id]       - Officer identifier
 * @property {string}  [officer_name]     - Officer full name
 * @property {string}  [officer_rank]     - Rank string
 * @property {string}  [evidence_type]    - physical | digital | testimonial | photographic-description-only
 * @property {string[]} [linked_ids]      - Array of cross-referenced IDs (person, incident, case, etc.)
 * @property {number}  [confidence]       - Detection confidence 0.0–1.0 (CCTV records only)
 * @property {number}  completeness_score - 0.0–1.0; fraction of optional fields populated
 * @property {Object}  raw               - Original parsed CSV row preserved verbatim for audit
 */

/** @type {string[]} Required fields that every record must have. */
const REQUIRED_FIELDS = [
  'record_id',
  'source_station_id',
  'source_district_id',
  'record_type',
  'source_record_id',
  'ingested_at',
];

/** @type {string[]} Optional fields used when scoring completeness. */
const OPTIONAL_FIELDS = [
  'event_ts',
  'incident_type',
  'status',
  'lat',
  'lng',
  'person_id',
  'person_name',
  'plate_number',
  'vehicle_type',
  'flagged_reason',
  'officer_id',
  'officer_name',
  'officer_rank',
  'evidence_type',
  'linked_ids',
  'confidence',
];

/**
 * Compute a completeness score for a unified record.
 * Score = (number of optional fields with a non-null, non-empty value) / OPTIONAL_FIELDS.length
 *
 * @param {UnifiedRecord} record
 * @returns {number} 0.0 – 1.0
 */
function computeCompletenessScore(record) {
  let populated = 0;
  for (const field of OPTIONAL_FIELDS) {
    const val = record[field];
    if (val !== undefined && val !== null && val !== '') {
      // For arrays, count as populated only if non-empty
      if (Array.isArray(val) ? val.length > 0 : true) {
        populated += 1;
      }
    }
  }
  return parseFloat((populated / OPTIONAL_FIELDS.length).toFixed(4));
}

/**
 * Validate that a record has all required fields.
 *
 * @param {Object} record
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateRecord(record) {
  const missing = REQUIRED_FIELDS.filter(
    (f) => record[f] === undefined || record[f] === null || record[f] === ''
  );
  return { valid: missing.length === 0, missing };
}

module.exports = {
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS,
  computeCompletenessScore,
  validateRecord,
};

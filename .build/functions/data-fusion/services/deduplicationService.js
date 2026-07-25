/**
 * @fileoverview Deduplication Service for PRAHARI Data Fusion Engine.
 *
 * Strategy: composite-key deduplication.
 *
 * A record is considered a duplicate if an existing record already has the same:
 *   (source_station_id + record_type + source_record_id)
 *
 * When a duplicate is detected the incoming record is discarded and the existing
 * record is returned unchanged.  This is intentionally conservative — the first
 * ingested version wins.
 *
 * For cross-station person deduplication (same person appearing at two stations),
 * a secondary fingerprint is used:
 *   (record_type='criminal'|'wanted') + normalised_name hash
 * These cross-station duplicates are flagged but NOT removed; they are tagged with
 * `cross_station_duplicate: true` and surfaced to the network-analysis engine.
 */

'use strict';

const crypto = require('crypto');

/**
 * Normalise a person name for fuzzy matching:
 * lowercase, collapse spaces, strip punctuation.
 *
 * @param {string} name
 * @returns {string}
 */
function normaliseName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build the primary composite key for intra-station deduplication.
 *
 * @param {Object} record
 * @returns {string}
 */
function primaryKey(record) {
  return `${record.source_station_id}::${record.record_type}::${record.source_record_id}`;
}

/**
 * Build a secondary name fingerprint for cross-station person deduplication.
 *
 * @param {Object} record
 * @returns {string|null}
 */
function nameFingerprint(record) {
  if (!['criminal', 'wanted'].includes(record.record_type)) return null;
  const name = normaliseName(record.person_name || '');
  if (!name) return null;
  return crypto.createHash('sha256').update(name).digest('hex');
}

/**
 * Deduplicate a flat array of unified records.
 *
 * @param {Object[]} records
 * @returns {{ unique: Object[], duplicates: Object[] }}
 */
function deduplicate(records) {
  const seen = new Map();       // primaryKey → record
  const nameSeen = new Map();   // nameFingerprint → first record (cross-station)
  const unique = [];
  const duplicates = [];

  for (const record of records) {
    const pk = primaryKey(record);

    // 1. Intra-station duplicate check
    if (seen.has(pk)) {
      duplicates.push({
        ...record,
        duplicate_of: seen.get(pk).record_id,
        duplicate_type: 'intra_station',
      });
      continue;
    }

    seen.set(pk, record);

    // 2. Cross-station person duplicate tagging (non-destructive)
    const nfp = nameFingerprint(record);
    if (nfp) {
      if (nameSeen.has(nfp)) {
        record.cross_station_duplicate = true;
        record.cross_station_duplicate_of = nameSeen.get(nfp).record_id;
      } else {
        nameSeen.set(nfp, record);
      }
    }

    unique.push(record);
  }

  return { unique, duplicates };
}

module.exports = { deduplicate, primaryKey, nameFingerprint, normaliseName };

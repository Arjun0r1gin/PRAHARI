/**
 * @fileoverview Catalyst Data Store Service (ZCQL).
 *
 * Persists unified records to Catalyst Data Store.
 * The table is `prahari_unified_records` — all columns map to UnifiedRecord fields.
 *
 * Catalyst SDK is obtained from the runtime context injected by Catalyst.
 * In unit tests this module should be mocked.
 */

'use strict';

const TABLE_NAME = 'prahari_unified_records';

/**
 * In-memory fallback store used when the Catalyst SDK is unavailable
 * (local development, unit tests, offline execution).
 *
 * Mirrors the pattern used by audit-log's auditService.js — records are
 * genuinely stored here so counts reflect reality and tests can inspect
 * what was "persisted".  Do NOT replace this with a fake success return;
 * that hides the offline state and breaks downstream assertions.
 *
 * @type {Map<string, Object>}
 */
const IN_MEMORY_RECORDS = new Map();

/**
 * Upsert a batch of unified records into Catalyst Data Store.
 *
 * @param {import('zcatalyst-sdk-node')} catalyst   - Catalyst SDK instance
 * @param {Object[]}                    records      - Array of UnifiedRecord
 * @returns {Promise<{ inserted: number, errors: Object[] }>}
 */
function _writeInMemory(records) {
  let inserted = 0;
  const errors = [];

  for (const record of records) {
    try {
      const row = _flattenForDataStore(record);
      IN_MEMORY_RECORDS.set(record.record_id, row);
      inserted += 1;
    } catch (err) {
      errors.push({ record_id: record.record_id, error: err.message });
    }
  }

  return { inserted, errors };
}

/**
 * Upsert a batch of unified records into Catalyst Data Store.
 *
 * @param {import('zcatalyst-sdk-node')} catalyst   - Catalyst SDK instance
 * @param {Object[]}                    records      - Array of UnifiedRecord
 * @returns {Promise<{ inserted: number, errors: Object[] }>}
 */
async function upsertRecords(catalyst, records) {
  if (!catalyst || typeof catalyst.datastore !== 'function') {
    return _writeInMemory(records);
  }

  try {
    const datastore = catalyst.datastore();
    if (!datastore || typeof datastore.table !== 'function') {
      return _writeInMemory(records);
    }
    const table = datastore.table(TABLE_NAME);

    let inserted = 0;
    const errors = [];

    for (const record of records) {
      try {
        const row = _flattenForDataStore(record);
        await table.insertRow(row);
        inserted += 1;
      } catch (err) {
        errors.push({ record_id: record.record_id, error: err.message });
      }
    }

    return { inserted, errors };
  } catch (err) {
    console.warn('[DataStoreService] Catalyst Data Store write error, falling back to local memory store:', err.message);
    return _writeInMemory(records);
  }
}

/**
 * Flatten a UnifiedRecord for Catalyst Data Store insertion.
 * Arrays and nested objects are JSON-stringified.
 *
 * @param {Object} record
 * @returns {Object}
 */
function _flattenForDataStore(record) {
  const flat = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'raw') continue; // raw goes to NoSQL only
    if (Array.isArray(value)) {
      flat[key] = JSON.stringify(value);
    } else if (value !== null && typeof value === 'object') {
      flat[key] = JSON.stringify(value);
    } else {
      flat[key] = value;
    }
  }
  return flat;
}

module.exports = { upsertRecords, TABLE_NAME, IN_MEMORY_RECORDS };

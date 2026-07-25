/**
 * @fileoverview Catalyst NoSQL Service.
 *
 * Writes raw (pre-fusion) CSV rows and quarantined/failed records to
 * Catalyst NoSQL (Cloud Scale Data Store).
 *
 * Collections:
 *   - `raw_ingestion`  — every parsed CSV row before normalisation
 *   - `quarantine`     — rows that failed validation or threw a parse error
 */

'use strict';

const RAW_COLLECTION      = 'raw_ingestion';
const QUARANTINE_COLLECTION = 'quarantine';

/**
 * In-memory fallback stores used when the Catalyst SDK is unavailable
 * (local development, unit tests, offline execution).
 *
 * Same rationale as dataStoreService.js — genuine writes to an in-memory
 * collection so counts reflect reality.  Do NOT replace with fake success
 * returns; that hides the offline state.
 *
 * @type {Map<string, Object>}
 */
const IN_MEMORY_RAW        = new Map();
const IN_MEMORY_QUARANTINE = new Map();

/** @type {Record<string, Map<string, Object>>} */
const IN_MEMORY_STORES = {
  [RAW_COLLECTION]:        IN_MEMORY_RAW,
  [QUARANTINE_COLLECTION]: IN_MEMORY_QUARANTINE,
};

/**
 * Persist raw ingestion rows to NoSQL.
 *
 * @param {import('zcatalyst-sdk-node')} catalyst
 * @param {Object[]} rawItems  - Array of { station, district, fileType, row }
 * @returns {Promise<{ written: number, errors: Object[] }>}
 */
async function writeRaw(catalyst, rawItems) {
  return _bulkWrite(catalyst, RAW_COLLECTION, rawItems);
}

/**
 * Persist quarantine items to NoSQL.
 *
 * @param {import('zcatalyst-sdk-node')} catalyst
 * @param {Object[]} quarantine
 * @returns {Promise<{ written: number, errors: Object[] }>}
 */
async function writeQuarantine(catalyst, quarantine) {
  return _bulkWrite(catalyst, QUARANTINE_COLLECTION, quarantine);
}

function _writeInMemory(collectionName, items) {
  const store = IN_MEMORY_STORES[collectionName];
  let written = 0;
  const errors = [];

  for (const item of items) {
    try {
      const key = item.record_id || `${collectionName}-${Date.now()}-${written}`;
      store.set(key, { ...item, _written_at: Date.now() });
      written += 1;
    } catch (err) {
      errors.push({ item, error: err.message });
    }
  }

  return { written, errors };
}

/**
 * @param {import('zcatalyst-sdk-node')} catalyst
 * @param {string}   collectionName
 * @param {Object[]} items
 * @returns {Promise<{ written: number, errors: Object[] }>}
 */
async function _bulkWrite(catalyst, collectionName, items) {
  if (!catalyst || typeof catalyst.nosql !== 'function') {
    return _writeInMemory(collectionName, items);
  }

  try {
    const nosql = catalyst.nosql();
    if (!nosql || typeof nosql.collection !== 'function') {
      return _writeInMemory(collectionName, items);
    }

    const coll = nosql.collection(collectionName);
    let written = 0;
    const errors = [];

    for (const item of items) {
      try {
        await coll.insertDocument({ ...item, _written_at: Date.now() });
        written += 1;
      } catch (err) {
        errors.push({ item, error: err.message });
      }
    }

    return { written, errors };
  } catch (err) {
    console.warn(`[NoSQLService] Catalyst NoSQL write error for ${collectionName}, falling back to local memory store:`, err.message);
    return _writeInMemory(collectionName, items);
  }
}

module.exports = {
  writeRaw,
  writeQuarantine,
  RAW_COLLECTION,
  QUARANTINE_COLLECTION,
  IN_MEMORY_RAW,
  IN_MEMORY_QUARANTINE,
};

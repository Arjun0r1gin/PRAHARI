/**
 * @fileoverview Fusion Controller.
 *
 * Orchestrates the full data fusion pipeline:
 *   1. Run all registered station adapters → collect raw records + quarantine items
 *   2. Deduplicate the full record set
 *   3. Persist unique records to Catalyst Data Store
 *   4. Persist raw rows and quarantine items to Catalyst NoSQL
 *   5. Return a run summary
 *
 * Exposed as:
 *   POST /v1/data-fusion/run          - trigger full fusion run
 *   GET  /v1/data-fusion/status       - health/status check
 */

'use strict';

const { getAllAdapters }    = require('../services/adapterRegistry');
const { deduplicate }       = require('../services/deduplicationService');
const { upsertRecords }     = require('../services/dataStoreService');
const { writeRaw, writeQuarantine } = require('../services/noSQLService');
const { getCatalystApp }    = require('@prahari/shared/utils/catalystHelper');

/**
 * Run the complete fusion pipeline.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function runFusion(req, res) {
  const startTs = Date.now();
  const catalyst = getCatalystApp(req);

  try {
    const adapters = getAllAdapters();

    // Phase 1 — Ingest all stations
    let allRecords   = [];
    let allQuarantine = [];

    for (const adapter of adapters) {
      const { records, quarantine } = adapter.ingest();
      allRecords    = allRecords.concat(records);
      allQuarantine = allQuarantine.concat(quarantine);
    }

    // Phase 2 — Deduplicate
    const { unique, duplicates } = deduplicate(allRecords);

    // Phase 3 — Persist unique records to Catalyst Data Store
    const { inserted, errors: dsErrors } = await upsertRecords(catalyst, unique);

    // Phase 4a — Persist raw rows to NoSQL (build raw items list)
    const rawItems = allRecords.map((r) => ({
      station:   r.source_station_id,
      district:  r.source_district_id,
      fileType:  r.record_type,
      row:       r.raw,
      record_id: r.record_id,
    }));
    await writeRaw(catalyst, rawItems);

    // Phase 4b — Persist quarantine to NoSQL
    await writeQuarantine(catalyst, allQuarantine);

    const summary = {
      run_ts:          startTs,
      duration_ms:     Date.now() - startTs,
      total_ingested:  allRecords.length,
      unique:          unique.length,
      duplicates:      duplicates.length,
      quarantine:      allQuarantine.length,
      ds_inserted:     inserted,
      ds_errors:       dsErrors.length,
    };

    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error('[FusionController] runFusion error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Health/status check.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function getFusionStatus(req, res) {
  return res.status(200).json({
    service: 'data-fusion',
    status:  'healthy',
    version: '1.0.0',
  });
}

module.exports = { runFusion, getFusionStatus };

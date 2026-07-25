/**
 * @fileoverview BaseAdapter — abstract base class for all station CSV adapters.
 *
 * Each concrete adapter extends BaseAdapter and implements:
 *   - `parseRow(row, fileType)` → UnifiedRecord partial (fields excluding record_id, ingested_at, completeness_score)
 *
 * BaseAdapter handles:
 *   - CSV file reading via csv-parse
 *   - UUID assignment
 *   - Completeness scoring
 *   - Validation
 *   - Error quarantining
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const {
  computeCompletenessScore,
  validateRecord,
} = require('../schema/unified-record-schema');

/** File types that each station folder contains. */
const FILE_TYPES = [
  'fir',
  'criminals',
  'wanted',
  'officers',
  'vehicles',
  'evidence',
  'cases',
  'cctv',
];

const REPO_ROOT = path.resolve(__dirname, '../../..');

/**
 * Resolve station directory relative to PRAHARI repository root.
 * Handles paths passed from tests or registry that may contain extra parent directory segments.
 *
 * @param {string} stationDir
 * @returns {string}
 */
function resolveStationDir(stationDir) {
  if (!stationDir) return stationDir;
  const normalized = path.normalize(stationDir);
  const dataDistrictsIdx = normalized.indexOf(path.join('data', 'districts'));
  if (dataDistrictsIdx !== -1) {
    return path.resolve(REPO_ROOT, normalized.substring(dataDistrictsIdx));
  }
  const dataIdx = normalized.indexOf('data');
  if (dataIdx !== -1) {
    return path.resolve(REPO_ROOT, normalized.substring(dataIdx));
  }
  return path.resolve(REPO_ROOT, stationDir);
}

/**
 * @abstract
 */
class BaseAdapter {
  /**
   * @param {string} stationId   - e.g. 'whitefield'
   * @param {string} districtId  - e.g. 'bangalore-urban'
   * @param {string} stationDir  - Absolute path to the station CSV directory
   */
  constructor(stationId, districtId, stationDir) {
    if (new.target === BaseAdapter) {
      throw new Error('BaseAdapter is abstract and cannot be instantiated directly.');
    }
    this.stationId = stationId;
    this.districtId = districtId;
    this.stationDir = resolveStationDir(stationDir);
  }

  /**
   * Read and parse a single CSV file from the station directory.
   *
   * @param {string} fileType  - One of FILE_TYPES
   * @returns {{ rows: Object[], error: Error|null }}
   */
  _readCsv(fileType) {
    const filePath = path.join(this.stationDir, `${fileType}.csv`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const rows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      });
      return { rows, error: null };
    } catch (err) {
      return { rows: [], error: err };
    }
  }

  /**
   * Abstract — implemented by each station adapter.
   *
   * @param {Object} row       - Raw CSV row (columns as-is from the file)
   * @param {string} fileType  - One of FILE_TYPES
   * @returns {Object}         - Partial UnifiedRecord (no record_id / ingested_at / completeness_score)
   */
  // eslint-disable-next-line no-unused-vars
  parseRow(row, fileType) {
    throw new Error(`${this.constructor.name} must implement parseRow(row, fileType)`);
  }

  /**
   * Run the full ingest cycle for this station.
   *
   * @returns {{ records: UnifiedRecord[], quarantine: Object[] }}
   */
  ingest() {
    const records = [];
    const quarantine = [];
    const now = Date.now();

    for (const fileType of FILE_TYPES) {
      const { rows, error } = this._readCsv(fileType);
      if (error) {
        quarantine.push({
          station: this.stationId,
          district: this.districtId,
          fileType,
          error: error.message,
          ts: now,
        });
        continue;
      }

      for (const row of rows) {
        try {
          const partial = this.parseRow(row, fileType);
          const record = {
            record_id: uuidv4(),
            source_station_id: this.stationId,
            source_district_id: this.districtId,
            ingested_at: now,
            ...partial,
            raw: row,
          };
          record.completeness_score = computeCompletenessScore(record);

          const { valid, missing } = validateRecord(record);
          if (!valid) {
            quarantine.push({
              station: this.stationId,
              district: this.districtId,
              fileType,
              reason: `Missing required fields: ${missing.join(', ')}`,
              row,
              ts: now,
            });
            continue;
          }

          records.push(record);
        } catch (parseErr) {
          quarantine.push({
            station: this.stationId,
            district: this.districtId,
            fileType,
            reason: parseErr.message,
            row,
            ts: now,
          });
        }
      }
    }

    return { records, quarantine };
  }
}

module.exports = { BaseAdapter, FILE_TYPES };

/**
 * @fileoverview Unit tests for Completeness Scoring & Record Validation.
 */

'use strict';

const { computeCompletenessScore, validateRecord } = require('../../schema/unified-record-schema');

describe('Completeness & Validation Unit Tests', () => {
  test('validateRecord identifies missing required fields', () => {
    const validRec = {
      record_id: 'uuid-1',
      source_station_id: 'whitefield',
      source_district_id: 'bangalore-urban',
      record_type: 'fir',
      source_record_id: 'WFD-FIR-001',
      ingested_at: Date.now(),
    };
    expect(validateRecord(validRec).valid).toBe(true);

    const invalidRec = { record_id: 'uuid-2', record_type: 'fir' };
    const res = validateRecord(invalidRec);
    expect(res.valid).toBe(false);
    expect(res.missing.length).toBeGreaterThan(0);
  });

  test('computeCompletenessScore calculates fractional score correctly', () => {
    const emptyRec = {
      record_id: 'uuid-1',
      source_station_id: 'whitefield',
      source_district_id: 'bangalore-urban',
      record_type: 'fir',
      source_record_id: 'WFD-FIR-001',
      ingested_at: Date.now(),
    };
    expect(computeCompletenessScore(emptyRec)).toBe(0);

    const partialRec = {
      ...emptyRec,
      event_ts: Date.now(),
      incident_type: 'theft',
      status: 'open',
      lat: 12.9698,
      lng: 77.7499,
    };
    const score = computeCompletenessScore(partialRec);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});

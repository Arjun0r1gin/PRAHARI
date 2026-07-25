/**
 * @fileoverview Unit tests for Deduplication Service.
 */

'use strict';

const { deduplicate, primaryKey, normaliseName } = require('../../services/deduplicationService');

describe('Deduplication Service Unit Tests', () => {
  test('normaliseName strips special characters and normalises spacing', () => {
    expect(normaliseName('  Ramesh   Kumar-Shetty! ')).toBe('ramesh kumar shetty');
    expect(normaliseName('')).toBe('');
  });

  test('primaryKey builds correct composite key', () => {
    const rec = { source_station_id: 'hal', record_type: 'fir', source_record_id: 'HAL-FIR-001' };
    expect(primaryKey(rec)).toBe('hal::fir::HAL-FIR-001');
  });

  test('deduplicate eliminates intra-station duplicate records', () => {
    const rec1 = { record_id: '1', source_station_id: 'hal', record_type: 'fir', source_record_id: 'HAL-FIR-001' };
    const rec2 = { record_id: '2', source_station_id: 'hal', record_type: 'fir', source_record_id: 'HAL-FIR-001' };
    const rec3 = { record_id: '3', source_station_id: 'hal', record_type: 'fir', source_record_id: 'HAL-FIR-002' };

    const { unique, duplicates } = deduplicate([rec1, rec2, rec3]);
    expect(unique).toHaveLength(2);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].duplicate_of).toBe('1');
  });

  test('deduplicate flags cross-station person duplicates without removing them', () => {
    const p1 = { record_id: '101', source_station_id: 'whitefield', record_type: 'criminal', source_record_id: 'P-WFD-001', person_name: 'Anand Kumar' };
    const p2 = { record_id: '102', source_station_id: 'hal', record_type: 'criminal', source_record_id: 'P-HAL-099', person_name: 'anand  kumar' };

    const { unique, duplicates } = deduplicate([p1, p2]);
    expect(unique).toHaveLength(2);
    expect(duplicates).toHaveLength(0);
    expect(p2.cross_station_duplicate).toBe(true);
    expect(p2.cross_station_duplicate_of).toBe('101');
  });
});

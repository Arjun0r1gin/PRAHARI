/**
 * @fileoverview Unit tests for PRAHARI CSV station adapters.
 */

'use strict';

const path = require('path');
const WhitefieldAdapter  = require('../../adapters/whitefield-adapter');
const HalAdapter         = require('../../adapters/hal-adapter');
const BellandurAdapter   = require('../../adapters/bellandur-adapter');
const IndiranagarAdapter = require('../../adapters/indiranagar-adapter');

const DATA_ROOT = path.resolve(__dirname, '../../../../../data/districts/bangalore-urban/stations');

describe('Station Adapters Unit Tests', () => {
  test('WhitefieldAdapter ingests all 8 CSV files with ISO 8601 timestamps', () => {
    const adapter = new WhitefieldAdapter('whitefield', 'bangalore-urban', path.join(DATA_ROOT, 'whitefield'));
    const { records, quarantine } = adapter.ingest();

    expect(quarantine).toHaveLength(0);
    expect(records.length).toBeGreaterThan(50);

    const firs = records.filter(r => r.record_type === 'fir');
    expect(firs.length).toBe(15);
    expect(typeof firs[0].event_ts).toBe('number');
    expect(firs[0].event_ts).toBeGreaterThan(1700000000000);

    const criminals = records.filter(r => r.record_type === 'criminal');
    expect(criminals.length).toBe(8);
    expect(criminals[0].person_name).toBeDefined();
    expect(criminals[0].person_name).not.toBeNull();
  });

  test('HalAdapter parses "Offender Name" field correctly', () => {
    const adapter = new HalAdapter('hal', 'bangalore-urban', path.join(DATA_ROOT, 'hal'));
    const { records, quarantine } = adapter.ingest();

    expect(quarantine).toHaveLength(0);
    const criminals = records.filter(r => r.record_type === 'criminal');
    expect(criminals.length).toBe(8);
    expect(criminals[0].person_name).toBe('Sundar Krishnamurthy');
  });

  test('BellandurAdapter parses Unix epoch timestamps correctly', () => {
    const adapter = new BellandurAdapter('bellandur', 'bangalore-urban', path.join(DATA_ROOT, 'bellandur'));
    const { records } = adapter.ingest();

    const firs = records.filter(r => r.record_type === 'fir');
    expect(firs.length).toBe(12);
    expect(firs[0].event_ts).toBe(1738395600000);

    const criminals = records.filter(r => r.record_type === 'criminal');
    expect(criminals[0].person_name).toBe('Gopal Nayak');
  });

  test('IndiranagarAdapter parses MM/DD/YYYY dates and "Person of Interest"', () => {
    const adapter = new IndiranagarAdapter('indiranagar', 'bangalore-urban', path.join(DATA_ROOT, 'indiranagar'));
    const { records } = adapter.ingest();

    const firs = records.filter(r => r.record_type === 'fir');
    expect(firs.length).toBe(13);
    expect(typeof firs[0].event_ts).toBe('number');

    const criminals = records.filter(r => r.record_type === 'criminal');
    expect(criminals[0].person_name).toBe('Raghavendra Swamy');
  });
});

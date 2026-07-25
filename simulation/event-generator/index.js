/**
 * @fileoverview Event Generator MVP-lite for PRAHARI Simulation.
 *
 * Emits ONE new synthetic incident record (matching unified schema shape)
 * either on-demand (manual trigger) or on a timer via Catalyst Cron / Job Scheduling.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a single synthetic unified incident record.
 *
 * @param {Object} [overrides]
 * @returns {Object} Unified incident record
 */
function generateSingleIncident(overrides = {}) {
  return {
    record_id: uuidv4(),
    source_station_id: overrides.stationId || 'whitefield',
    source_district_id: overrides.districtId || 'bangalore-urban',
    record_type: 'fir',
    source_record_id: `LIVE-FIR-2025-${Math.floor(100 + Math.random() * 900)}`,
    ingested_at: Date.now(),
    event_ts: Date.now(),
    incident_type: overrides.type || 'burglary',
    status: 'open',
    lat: overrides.lat || 12.9698,
    lng: overrides.lng || 77.7499,
    linked_ids: overrides.linkedPersonId ? [overrides.linkedPersonId] : ['P-WFD-001'],
    completeness_score: 0.95,
    raw: {
      synthetic_live_event: true,
      emitted_by: 'simulation/event-generator',
    },
  };
}

/**
 * Manual trigger function to emit a new incident event mid-demo.
 *
 * @param {Object} [overrides]
 * @returns {Promise<{ event: Object, result: Object }>}
 */
async function triggerEventEmission(overrides = {}) {
  const eventRecord = generateSingleIncident(overrides);
  const incidentStream = require('../incident-stream');

  // Push record to incident stream feed
  const streamResult = await incidentStream.pushToStream(eventRecord);

  return {
    event: eventRecord,
    stream: streamResult,
  };
}

module.exports = {
  generateSingleIncident,
  triggerEventEmission,
};

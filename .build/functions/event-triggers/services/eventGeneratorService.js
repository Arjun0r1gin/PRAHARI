/**
 * @fileoverview Event Generator Helper for PRAHARI Event Triggers.
 *
 * Self-contained module for emitting synthetic incident records.
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
      emitted_by: 'event-triggers/services/eventGeneratorService',
    },
  };
}

/**
 * Manual trigger function to emit a new incident event mid-demo.
 *
 * @param {Object} [overrides]
 * @returns {Promise<{ event: Object }>}
 */
async function triggerEventEmission(overrides = {}) {
  const eventRecord = generateSingleIncident(overrides);
  return {
    event: eventRecord,
  };
}

module.exports = {
  generateSingleIncident,
  triggerEventEmission,
};

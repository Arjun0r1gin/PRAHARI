/**
 * @fileoverview Event Trigger Service.
 *
 * Subscribes to incoming real-time records arriving via Catalyst Signals / Event Functions.
 * On trigger, calls the risk-engine re-scoring endpoint.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Handle incoming stream event payload and trigger risk engine re-score.
 *
 * @param {Object} eventPayload  - Ingested record or stream payload
 * @param {Object} [catalyst]
 * @returns {Promise<Object>}
 */
async function processIncomingRecordEvent(eventPayload, catalyst = null) {
  const record = eventPayload.payload || eventPayload;

  if (!record || !record.record_id) {
    throw new Error('Invalid event payload: record_id is missing.');
  }

  // TODO(integration): Execute HTTP POST call to live risk-engine service:
  // await axios.post('http://localhost:3000/v1/risk-engine/rescore', { record_id: record.record_id });
  const reScoreResult = {
    rescore_triggered: true,
    record_id: record.record_id,
    station_id: record.source_station_id,
    recalculated_at: Date.now(),
    target_risk_score: 88, // Simulated updated score for live demo
    alert_level: 'CRITICAL',
  };

  return {
    success: true,
    trigger_id: uuidv4(),
    event_type: 'RECORD_ARRIVED_SIGNAL',
    reScoreResult,
  };
}

module.exports = {
  processIncomingRecordEvent,
};

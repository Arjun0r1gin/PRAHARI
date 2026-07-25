/**
 * @fileoverview Incident Stream Buffer MVP-lite for PRAHARI Simulation.
 *
 * Serves as the real-time event queue / feed that `event-triggers` subscribes to.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/** In-memory stream buffer */
const STREAM_BUFFER = [];

/** Subscribers array */
const LISTENERS = [];

/**
 * Push an incident record into the live stream buffer.
 *
 * @param {Object} incidentRecord
 * @returns {Promise<{ pushed: boolean, stream_id: string }>}
 */
async function pushToStream(incidentRecord) {
  const streamItem = {
    stream_id: uuidv4(),
    payload: incidentRecord,
    pushed_at: Date.now(),
  };

  STREAM_BUFFER.push(streamItem);

  // Notify active listeners
  for (const listener of LISTENERS) {
    try {
      await listener(streamItem);
    } catch (err) {
      console.warn('[IncidentStream] Listener notification error:', err.message);
    }
  }

  return {
    pushed: true,
    stream_id: streamItem.stream_id,
  };
}

/**
 * Subscribe a handler function to stream events.
 *
 * @param {Function} handlerFn
 */
function subscribe(handlerFn) {
  if (typeof handlerFn === 'function') {
    LISTENERS.push(handlerFn);
  }
}

/**
 * Clear buffer and listeners (testing utility).
 */
function clearStream() {
  STREAM_BUFFER.length = 0;
  LISTENERS.length = 0;
}

module.exports = {
  pushToStream,
  subscribe,
  clearStream,
  STREAM_BUFFER,
};

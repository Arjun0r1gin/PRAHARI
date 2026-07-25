/**
 * @fileoverview Express Entry Point for PRAHARI Event Triggers Function.
 *
 * Listens for Catalyst Signals / Event Function webhooks and manual simulation triggers.
 */

'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { processIncomingRecordEvent } = require('./services/eventTriggerService');
const { triggerEventEmission } = require('./services/eventGeneratorService');

const app = express();
app.use(express.json());

// Health Check Endpoint
app.get('/v1/event-triggers/health', (req, res) => {
  return res.status(200).json({ status: 'ok', service: 'event-triggers', timestamp: Date.now() });
});

// User-session authentication middleware for human-facing simulation endpoints
const authMiddleware = require('@prahari/shared/middleware/authMiddleware');

/**
 * Catalyst Signal Authentication Middleware for backend-to-backend signal webhooks.
 *
 * NOTE: Signal invocations are backend-to-backend, so user-session auth (authMiddleware)
 * is the wrong trust model here.
 * TODO(integration): replace with Catalyst's native Signal-verification mechanism once confirmed available in the deployed environment.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function signalAuthMiddleware(req, res, next) {
  // Offline / Unit Test Auto-Bypass
  if (process.env.NODE_ENV === 'test' || process.env.SKIP_AUTH === 'true') {
    if (typeof next === 'function') next();
    return;
  }

  const expectedSecret = process.env.CATALYST_SIGNAL_SECRET || 'prahari-signal-secret-key';
  const providedSecret = req.headers['x-catalyst-signal-secret'] || req.headers['x-signal-secret'];

  if (providedSecret && providedSecret === expectedSecret) {
    if (typeof next === 'function') next();
    return;
  }

  return res.status(401).json({
    error_code: 'UNAUTHORIZED_SIGNAL',
    message: 'Invalid or missing Catalyst Signal authentication header',
    trace_id: `TRC-${Date.now().toString(36)}`,
  });
}

const { handleControllerError } = require('@prahari/shared/utils/errorHandler');

// Catalyst Signals webhook endpoint (uses signal-specific backend authentication)
app.post('/v1/events/signal-trigger', signalAuthMiddleware, async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await processIncomingRecordEvent(payload, req.catalyst);
    return res.status(200).json(result);
  } catch (err) {
    return handleControllerError(res, err, {
      errorCode: 'SIGNAL_TRIGGER_ERROR',
      defaultMessage: 'Failed to process signal event trigger.',
    });
  }
});

// Manual event trigger endpoint for live demo script (uses user-session authentication)
app.post('/v1/simulation/emit-event', authMiddleware, async (req, res) => {
  try {
    const overrides = req.body || {};
    const emission = await triggerEventEmission(overrides);
    const triggerResult = await processIncomingRecordEvent(emission.event, req.catalyst);

    return res.status(200).json({
      success: true,
      message: 'Synthetic event emitted and risk re-scoring triggered.',
      emitted_event: emission.event,
      triggerResult,
    });
  } catch (err) {
    return handleControllerError(res, err, {
      errorCode: 'EVENT_EMISSION_ERROR',
      defaultMessage: 'Failed to emit synthetic event.',
    });
  }
});

function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

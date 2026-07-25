/**
 * @fileoverview Data Fusion Engine — Catalyst Function Entry Point.
 *
 * Exposes routes for data ingestion and status checking.
 */

'use strict';

const express = require('express');
const { runFusion, getFusionStatus } = require('./controllers/fusionController');

const app = express();
app.use(express.json());

// Public Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'data-fusion' }));
app.get('/v1/data-fusion/health', (req, res) => res.status(200).json({ status: 'ok', service: 'data-fusion' }));
app.get('/v1/data-fusion/status', getFusionStatus);

// Attach Authentication Middleware
const authMiddleware = require('@prahari/shared/middleware/authMiddleware');
app.use(authMiddleware);

// Secured Operational Routes
app.post('/v1/data-fusion/run', runFusion);

/**
 * Catalyst Function Main Entry Point Handler.
 *
 * @param {Object} req - Incoming HTTP Request
 * @param {Object} res - Outgoing HTTP Response
 */
function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

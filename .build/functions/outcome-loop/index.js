/**
 * @fileoverview Express Entry Point for PRAHARI Outcome Loop Function.
 */

'use strict';

const express = require('express');
const { handleAction, handleOutcome } = require('./controllers/outcomeController');

const app = express();
app.use(express.json());

// Public Health Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'outcome-loop' }));
app.get('/v1/outcome-loop/health', (req, res) => res.status(200).json({ status: 'ok', service: 'outcome-loop' }));

// Attach Authentication Middleware
const authMiddleware = require('@prahari/shared/middleware/authMiddleware');
app.use(authMiddleware);

// Secured Operational Routes
app.post('/v1/outcome-loop/action', handleAction);
app.post('/v1/outcome-loop/outcome', handleOutcome);

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

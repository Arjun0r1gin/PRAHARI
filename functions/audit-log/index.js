/**
 * @fileoverview Express Entry Point for PRAHARI Audit Log Function.
 */

'use strict';

const express = require('express');
const { fetchAuditLogs } = require('./controllers/auditController');

const app = express();
app.use(express.json());

// Public Health Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'audit-log' }));
app.get('/v1/audit-log/health', (req, res) => res.status(200).json({ status: 'ok', service: 'audit-log' }));

// Attach Authentication Middleware
const authMiddleware = require('@prahari/shared/middleware/authMiddleware');
app.use(authMiddleware);

// Secured Operational Routes
app.get('/v1/audit-log', fetchAuditLogs);

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

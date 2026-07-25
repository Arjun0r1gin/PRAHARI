/**
 * @fileoverview Express Entry Point for PRAHARI Report Export Function.
 */

'use strict';

const express = require('express');
const { exportCaseReport } = require('./controllers/reportController');

const app = express();
app.use(express.json());

// Public Health Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'report-export' }));
app.get('/v1/report-export/health', (req, res) => res.status(200).json({ status: 'ok', service: 'report-export' }));

// Attach Authentication Middleware
const authMiddleware = require('@prahari/shared/middleware/authMiddleware');
app.use(authMiddleware);

// Secured Operational Routes
app.get('/v1/report-export/:caseId', exportCaseReport);

function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

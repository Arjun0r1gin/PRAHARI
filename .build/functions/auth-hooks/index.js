/**
 * @fileoverview Express Entry Point for PRAHARI Auth Hooks Function.
 */

'use strict';

const express = require('express');
const { createSession, getCurrentUser } = require('./controllers/authController');
const { requireRole } = require('./middleware/rbacMiddleware');

const app = express();
app.use(express.json());

// Health Check Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'auth-hooks' }));
app.get('/v1/auth/health', (req, res) => res.status(200).json({ status: 'ok', service: 'auth-hooks' }));

// Public Auth Endpoints
app.post('/v1/auth/session', createSession);

// Protected Auth Endpoint
app.get('/v1/auth/me', getCurrentUser);

// Admin-only health test endpoint to verify RBAC middleware
app.get('/v1/auth/admin-test', requireRole('admin'), (req, res) => {
  res.status(200).json({ status: 'admin_access_granted' });
});

function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

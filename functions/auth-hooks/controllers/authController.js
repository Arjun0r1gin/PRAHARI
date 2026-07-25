/**
 * @fileoverview Auth Controller for PRAHARI Auth Hooks.
 *
 * Handlers:
 *   POST /v1/auth/session — login and retrieve session scope
 *   GET  /v1/auth/me      — fetch current session profile
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { authenticateUser, getUserProfile } = require('../services/authService');

/**
 * Handle POST /v1/auth/session
 */
async function createSession(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error_code: 'INVALID_CREDENTIALS_PAYLOAD',
        message: 'Both email and password must be provided.',
        trace_id: uuidv4(),
      });
    }

    const catalyst = req.catalyst;
    const { user, token } = await authenticateUser(catalyst, email, password);

    return res.status(200).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        station_id: user.station_id,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error_code: 'AUTH_SESSION_ERROR',
      message: err.message || 'Failed to authenticate user session.',
      trace_id: uuidv4(),
    });
  }
}

/**
 * Handle GET /v1/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error_code: 'UNAUTHENTICATED',
        message: 'No active session detected.',
        trace_id: uuidv4(),
      });
    }

    const catalyst = req.catalyst;
    const profile = await getUserProfile(catalyst, user.user_id);

    return res.status(200).json({
      success: true,
      user: profile,
    });
  } catch (err) {
    return res.status(500).json({
      error_code: 'PROFILE_FETCH_ERROR',
      message: err.message || 'Failed to retrieve user profile.',
      trace_id: uuidv4(),
    });
  }
}

module.exports = {
  createSession,
  getCurrentUser,
};

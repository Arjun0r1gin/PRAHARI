/**
 * @fileoverview Auth Service for PRAHARI Auth Hooks.
 *
 * Thin wrapper around Catalyst Authentication (capability #17).
 * Binds role, station scope, and permission array to the user session.
 *
 * Stored in Catalyst Data Store `users` table:
 *   { user_id, email, role, station_id, permissions }
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { ROLE_PERMISSIONS } = require('../middleware/rbacMiddleware');

/** Mock in-memory user registry for standalone execution / unit testing fallback */
const MOCK_USERS_TABLE = new Map([
  [
    'usr-investigator-01',
    {
      user_id: 'usr-investigator-01',
      email: 'investigator.whitefield@ksp.gov.in',
      role: 'investigator',
      station_id: 'whitefield',
      permissions: ROLE_PERMISSIONS.investigator,
    },
  ],
  [
    'usr-oversight-01',
    {
      user_id: 'usr-oversight-01',
      email: 'hq.oversight@ksp.gov.in',
      role: 'oversight',
      station_id: 'all',
      permissions: ROLE_PERMISSIONS.oversight,
    },
  ],
  [
    'usr-admin-01',
    {
      user_id: 'usr-admin-01',
      email: 'admin.prahari@ksp.gov.in',
      role: 'admin',
      station_id: 'all',
      permissions: ROLE_PERMISSIONS.admin,
    },
  ],
]);

/**
 * Authenticate session via Catalyst Authentication.
 *
 * @param {import('zcatalyst-sdk-node')} catalyst - Catalyst SDK instance (optional)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
async function authenticateUser(catalyst, email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // TODO(integration): Connect to live Catalyst Authentication service
  // e.g. await catalyst.authentication().signIn(email, password);
  // For sandbox / unit test environment, we match against mock user records:
  const userRecord = Array.from(MOCK_USERS_TABLE.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!userRecord) {
    // If not found in mock table, generate a default investigator session for testing
    const defaultUser = {
      user_id: `usr-${uuidv4().substring(0, 8)}`,
      email,
      role: 'investigator',
      station_id: 'whitefield',
      permissions: ROLE_PERMISSIONS.investigator,
    };
    return {
      user: defaultUser,
      token: `cat-sess-${uuidv4()}`,
    };
  }

  return {
    user: userRecord,
    token: `cat-sess-${uuidv4()}`,
  };
}

/**
 * Fetch profile details for an existing user ID.
 *
 * @param {import('zcatalyst-sdk-node')} catalyst
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function getUserProfile(catalyst, userId) {
  const user = MOCK_USERS_TABLE.get(userId);
  if (user) return user;

  return {
    user_id: userId,
    role: 'investigator',
    station_id: 'whitefield',
    permissions: ROLE_PERMISSIONS.investigator,
  };
}

module.exports = {
  authenticateUser,
  getUserProfile,
  MOCK_USERS_TABLE,
};

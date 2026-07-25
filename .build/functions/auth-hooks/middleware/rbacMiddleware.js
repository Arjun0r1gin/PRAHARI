/**
 * @fileoverview Role-Based Access Control (RBAC) Middleware for PRAHARI.
 *
 * Exported reusable middleware that enforcing role authorization rules
 * across backend services.
 *
 * Roles:
 *   - investigator: sees case detail, records outcome actions
 *   - oversight: sees aggregate / comparative analytics
 *   - admin: manages user roles, station assignments, data feed health
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Standard permissions map by role.
 */
const ROLE_PERMISSIONS = {
  investigator: ['case:read', 'case:write', 'alert:read', 'action:write'],
  oversight: ['aggregate:read', 'alert:read', 'audit:read'],
  admin: ['feed:manage', 'user:manage', 'audit:read', 'case:read', 'action:write', 'aggregate:read'],
};

/**
 * Reusable RBAC middleware builder.
 *
 * Usage:
 *   const { requireRole } = require('@prahari/auth-hooks/middleware/rbacMiddleware');
 *   app.get('/v1/cases', requireRole('investigator', 'admin'), handler);
 *
 * @param {...string} allowedRoles - Roles permitted to access the route
 */
function requireRole(...allowedRoles) {
  return function rbacMiddleware(req, res, next) {
    const user = req.user || req.session?.user;

    if (!user) {
      return res.status(401).json({
        error_code: 'UNAUTHORIZED',
        message: 'Authentication required. No active session or user context found.',
        trace_id: uuidv4(),
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error_code: 'FORBIDDEN',
        message: `Access denied. Role '${user.role}' lacks permission for this endpoint. Required roles: ${allowedRoles.join(', ')}`,
        trace_id: uuidv4(),
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  ROLE_PERMISSIONS,
};

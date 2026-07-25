/**
 * @fileoverview Audit Log Controller.
 *
 * Handlers:
 *   GET /v1/audit-log — query audit logs with filtering
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { getAuditLogs } = require('../services/auditService');

/**
 * Handle GET /v1/audit-log
 */
async function fetchAuditLogs(req, res) {
  try {
    const { actor, action_type, startDate, endDate } = req.query || {};
    const catalyst = req.catalyst;

    const logs = await getAuditLogs(
      { actor, action_type, startDate, endDate },
      catalyst
    );

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    return res.status(500).json({
      error_code: 'AUDIT_LOG_FETCH_ERROR',
      message: err.message || 'Failed to retrieve audit log records.',
      trace_id: uuidv4(),
    });
  }
}

module.exports = {
  fetchAuditLogs,
};

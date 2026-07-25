/**
 * @fileoverview Audit Log Controller.
 *
 * Handlers:
 *   GET /v1/audit-log — query audit logs with filtering
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { getAuditLogs } = require('../services/auditService');
const { validateRequest } = require('@prahari/shared/utils/validator');
const { handleControllerError } = require('@prahari/shared/utils/errorHandler');

/**
 * Handle GET /v1/audit-log
 */
async function fetchAuditLogs(req, res) {
  const { valid, error } = validateRequest(req, {
    query: {
      actor: { type: 'string', required: false },
      action_type: { type: 'string', required: false },
      startDate: { type: 'string', required: false },
      endDate: { type: 'string', required: false },
    },
    custom: (r) => {
      const { startDate, endDate } = (r && r.query) || {};
      if (startDate && isNaN(new Date(startDate).getTime())) {
        return "Field 'startDate' in query must be a valid date string.";
      }
      if (endDate && isNaN(new Date(endDate).getTime())) {
        return "Field 'endDate' in query must be a valid date string.";
      }
      return null;
    },
  });

  if (!valid) {
    return res.status(400).json(error);
  }

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
    return handleControllerError(res, err, {
      errorCode: 'AUDIT_LOG_FETCH_ERROR',
      defaultMessage: 'Failed to retrieve audit log records.',
    });
  }
}

module.exports = {
  fetchAuditLogs,
};

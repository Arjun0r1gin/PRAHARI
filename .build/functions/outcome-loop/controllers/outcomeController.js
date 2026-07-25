/**
 * @fileoverview Outcome Loop Controller.
 *
 * Handlers:
 *   POST /v1/outcome-loop/action  — record officer decision
 *   POST /v1/outcome-loop/outcome — record feedback outcome
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { recordAction, recordOutcome } = require('../services/outcomeService');
const { validateRequest } = require('@prahari/shared/utils/validator');
const { handleControllerError } = require('@prahari/shared/utils/errorHandler');

/**
 * Handle POST /v1/outcome-loop/action
 */
async function handleAction(req, res) {
  const { valid, error } = validateRequest(req, {
    custom: (r) => {
      const { alert_id, case_id, decision } = (r && r.body) || {};
      if (!alert_id && !case_id) {
        return {
          error_code: 'MISSING_TARGET_ID',
          message: 'Must provide either alert_id or case_id in body.',
        };
      }
      if (!decision) {
        return {
          error_code: 'MISSING_DECISION',
          message: 'Field "decision" (e.g. actioned, escalated, dismissed) is required.',
        };
      }
      return null;
    },
  });

  if (!valid) {
    return res.status(400).json(error);
  }

  try {
    const { alert_id, case_id, decision, note, officer_id } = req.body || {};

    const catalyst = req.catalyst;
    const actionRecord = await recordAction(
      { alert_id, case_id, decision, note, officer_id },
      catalyst
    );

    return res.status(200).json({
      success: true,
      message: 'Officer action successfully recorded and logged.',
      action: actionRecord,
    });
  } catch (err) {
    return handleControllerError(res, err, {
      errorCode: 'ACTION_RECORD_ERROR',
      defaultMessage: 'Failed to record officer action.',
    });
  }
}

/**
 * Handle POST /v1/outcome-loop/outcome
 */
async function handleOutcome(req, res) {
  const { valid, error } = validateRequest(req, {
    body: {
      action_id: { type: 'string', required: true },
      result: { required: true },
    },
  });

  if (!valid) {
    return res.status(400).json(error);
  }

  try {
    const { action_id, result } = req.body || {};

    const catalyst = req.catalyst;
    const outcomeRecord = await recordOutcome(action_id, result, catalyst);

    return res.status(200).json({
      success: true,
      message: 'Outcome feedback recorded.',
      outcome: outcomeRecord,
    });
  } catch (err) {
    return handleControllerError(res, err, {
      errorCode: 'OUTCOME_RECORD_ERROR',
      defaultMessage: 'Failed to record outcome feedback.',
    });
  }
}

module.exports = {
  handleAction,
  handleOutcome,
};

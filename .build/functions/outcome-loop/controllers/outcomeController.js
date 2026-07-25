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

/**
 * Handle POST /v1/outcome-loop/action
 */
async function handleAction(req, res) {
  try {
    const { alert_id, case_id, decision, note, officer_id } = req.body || {};

    if (!alert_id && !case_id) {
      return res.status(400).json({
        error_code: 'MISSING_TARGET_ID',
        message: 'Must provide either alert_id or case_id in body.',
        trace_id: uuidv4(),
      });
    }

    if (!decision) {
      return res.status(400).json({
        error_code: 'MISSING_DECISION',
        message: 'Field "decision" (e.g. actioned, escalated, dismissed) is required.',
        trace_id: uuidv4(),
      });
    }

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
    return res.status(500).json({
      error_code: 'ACTION_RECORD_ERROR',
      message: err.message || 'Failed to record officer action.',
      trace_id: uuidv4(),
    });
  }
}

/**
 * Handle POST /v1/outcome-loop/outcome
 */
async function handleOutcome(req, res) {
  try {
    const { action_id, result } = req.body || {};

    if (!action_id || !result) {
      return res.status(400).json({
        error_code: 'INVALID_OUTCOME_PAYLOAD',
        message: 'Both action_id and result are required.',
        trace_id: uuidv4(),
      });
    }

    const catalyst = req.catalyst;
    const outcomeRecord = await recordOutcome(action_id, result, catalyst);

    return res.status(200).json({
      success: true,
      message: 'Outcome feedback recorded.',
      outcome: outcomeRecord,
    });
  } catch (err) {
    return res.status(500).json({
      error_code: 'OUTCOME_RECORD_ERROR',
      message: err.message || 'Failed to record outcome.',
      trace_id: uuidv4(),
    });
  }
}

module.exports = {
  handleAction,
  handleOutcome,
};

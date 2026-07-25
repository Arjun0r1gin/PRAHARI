/**
 * @fileoverview Outcome Loop Service.
 *
 * Persists officer actions and feedback outcomes to Catalyst Data Store:
 *   - `actions`: { action_id, rec_id, officer_id, decision, timestamp, note }
 *   - `outcomes`: { outcome_id, action_id, result, recorded_at }
 *
 * Every action written cross-invokes logAction() from audit-log service.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

let logAction;
try {
  logAction = require('../../audit-log/services/auditService').logAction;
} catch (e) {
  // Safe fallback if audit-log module is out of relative scope in isolated deployment
  logAction = async (actorId, actionType, targetEntity, targetId) => {
    console.log(`[AuditLog Fallback] ${actorId} - ${actionType} - ${targetEntity}:${targetId}`);
  };
}

const ACTIONS_TABLE = 'actions';
const OUTCOMES_TABLE = 'outcomes';

/** In-memory stores for local / unit testing fallback */
const IN_MEMORY_ACTIONS = new Map();
const IN_MEMORY_OUTCOMES = new Map();

/**
 * Record an officer decision action.
 *
 * @param {Object} payload
 * @param {string} [payload.alert_id]
 * @param {string} [payload.case_id]
 * @param {string} payload.decision - E.g. 'actioned', 'escalated', 'dismissed'
 * @param {string} [payload.note]
 * @param {string} [payload.officer_id]
 * @param {Object} [catalyst]
 * @returns {Promise<Object>} Created action record
 */
async function recordAction(payload, catalyst = null) {
  const { alert_id, case_id, decision, note = '', officer_id = 'O-UNASSIGNED' } = payload;

  const rec_id = alert_id || case_id;
  if (!rec_id) {
    throw new Error('Either alert_id or case_id must be provided.');
  }

  if (!decision) {
    throw new Error('Decision status is required.');
  }

  const actionRecord = {
    action_id: uuidv4(),
    rec_id,
    officer_id,
    decision,
    timestamp: Date.now(),
    note,
  };

  if (catalyst) {
    try {
      const datastore = catalyst.datastore();
      const table = datastore.table(ACTIONS_TABLE);
      await table.insertRow(actionRecord);
    } catch (err) {
      console.warn('[OutcomeService] Catalyst Data Store write warning, falling back to memory:', err.message);
      IN_MEMORY_ACTIONS.set(actionRecord.action_id, actionRecord);
    }
  } else {
    IN_MEMORY_ACTIONS.set(actionRecord.action_id, actionRecord);
  }

  // Cross-invoke Part B Audit Log service
  await logAction(
    officer_id,
    `OFFICER_DECISION_${decision.toUpperCase()}`,
    alert_id ? 'alert' : 'case',
    rec_id,
    catalyst
  );

  return actionRecord;
}

/**
 * Record a feedback outcome for an existing action.
 *
 * @param {string} actionId
 * @param {string} result - E.g. 'PREVENTED_CRIME', 'FALSE_POSITIVE', 'ARREST_MADE'
 * @param {Object} [catalyst]
 * @returns {Promise<Object>}
 */
async function recordOutcome(actionId, result, catalyst = null) {
  if (!actionId || !result) {
    throw new Error('Both action_id and result are required for outcome tracking.');
  }

  const outcomeRecord = {
    outcome_id: uuidv4(),
    action_id: actionId,
    result,
    recorded_at: Date.now(),
  };

  if (catalyst) {
    try {
      const datastore = catalyst.datastore();
      const table = datastore.table(OUTCOMES_TABLE);
      await table.insertRow(outcomeRecord);
    } catch (err) {
      console.warn('[OutcomeService] Catalyst Data Store write warning, falling back to memory:', err.message);
      IN_MEMORY_OUTCOMES.set(outcomeRecord.outcome_id, outcomeRecord);
    }
  } else {
    IN_MEMORY_OUTCOMES.set(outcomeRecord.outcome_id, outcomeRecord);
  }

  // Cross-invoke Part B Audit Log service
  await logAction(
    'system-outcome-loop',
    'OUTCOME_RECORDED',
    'action',
    actionId,
    catalyst
  );

  return outcomeRecord;
}

module.exports = {
  recordAction,
  recordOutcome,
  IN_MEMORY_ACTIONS,
  IN_MEMORY_OUTCOMES,
};

/**
 * @fileoverview Audit Log Service.
 *
 * Interacts with Catalyst Data Store table `audit_log`.
 * Strictly INSERT-ONLY: No update or delete methods are defined.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'audit_log';

/**
 * In-memory fallback store for audit logs during local development / unit tests.
 * @type {Map<string, Object>}
 */
const IN_MEMORY_AUDIT_LOGS = new Map();

/**
 * Internal write function exported for cross-module usage.
 *
 * @param {string} actorId      - ID of the actor (officer, user, or system component)
 * @param {string} actionType   - E.g. 'ACTION_DISPATCHED', 'CASE_REVIEWED'
 * @param {string} targetEntity - E.g. 'alert', 'case', 'record'
 * @param {string} targetId     - Unique ID of target
 * @param {Object} [catalyst]   - Optional Catalyst SDK instance
 * @returns {Promise<Object>}   - Created audit log record
 */
async function logAction(actorId, actionType, targetEntity, targetId, catalyst = null) {
  if (!actorId || !actionType || !targetEntity || !targetId) {
    throw new Error('All audit fields (actorId, actionType, targetEntity, targetId) are required.');
  }

  const logEntry = {
    log_id: uuidv4(),
    actor_id: actorId,
    action_type: actionType,
    target_entity: targetEntity,
    target_id: targetId,
    timestamp: Date.now(),
  };

  if (catalyst) {
    try {
      const datastore = catalyst.datastore();
      const table = datastore.table(TABLE_NAME);
      await table.insertRow(logEntry);
    } catch (err) {
      console.warn('[AuditService] Catalyst Data Store write warning, falling back to local memory:', err.message);
      IN_MEMORY_AUDIT_LOGS.set(logEntry.log_id, logEntry);
    }
  } else {
    IN_MEMORY_AUDIT_LOGS.set(logEntry.log_id, logEntry);
  }

  return logEntry;
}

/**
 * Query audit logs with filter support.
 *
 * @param {Object} filters
 * @param {string} [filters.actor]
 * @param {string} [filters.action_type]
 * @param {number|string} [filters.startDate]
 * @param {number|string} [filters.endDate]
 * @param {Object} [catalyst]
 * @returns {Promise<Object[]>}
 */
async function getAuditLogs(filters = {}, catalyst = null) {
  let logs = Array.from(IN_MEMORY_AUDIT_LOGS.values());

  if (catalyst) {
    try {
      const datastore = catalyst.datastore();
      const zcql = catalyst.zcql();
      const query = `SELECT * FROM ${TABLE_NAME} ORDER BY timestamp DESC`;
      const queryResult = await zcql.executeZCQLQuery(query);
      if (queryResult && queryResult.length > 0) {
        logs = queryResult.map((row) => row[TABLE_NAME]);
      }
    } catch (err) {
      console.warn('[AuditService] ZCQL query fallback to memory:', err.message);
    }
  }

  // Apply filters
  if (filters.actor) {
    logs = logs.filter((l) => l.actor_id === filters.actor);
  }

  if (filters.action_type) {
    logs = logs.filter((l) => l.action_type === filters.action_type);
  }

  if (filters.startDate) {
    const startMs = new Date(filters.startDate).getTime();
    if (!isNaN(startMs)) {
      logs = logs.filter((l) => l.timestamp >= startMs);
    }
  }

  if (filters.endDate) {
    const endMs = new Date(filters.endDate).getTime();
    if (!isNaN(endMs)) {
      logs = logs.filter((l) => l.timestamp <= endMs);
    }
  }

  // Sort descending by timestamp
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

module.exports = {
  logAction,
  getAuditLogs,
  IN_MEMORY_AUDIT_LOGS,
  TABLE_NAME,
};

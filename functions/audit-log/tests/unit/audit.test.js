/**
 * @fileoverview Unit tests for Audit Log Service & REST API.
 */

'use strict';

const express = require('express');
const request = require('supertest');
const { fetchAuditLogs } = require('../../controllers/auditController');
const { logAction, getAuditLogs, IN_MEMORY_AUDIT_LOGS } = require('../../services/auditService');

describe('Audit Log Unit Tests', () => {
  let app;

  beforeEach(() => {
    IN_MEMORY_AUDIT_LOGS.clear();

    app = express();
    app.use(express.json());
    app.get('/v1/audit-log', fetchAuditLogs);
  });

  test('logAction inserts an audit entry and returns log object', async () => {
    const entry = await logAction('O-HAL-01', 'ACTION_DISPATCHED', 'alert', 'ALT-2025-001');
    expect(entry.log_id).toBeDefined();
    expect(entry.actor_id).toBe('O-HAL-01');
    expect(entry.action_type).toBe('ACTION_DISPATCHED');
    expect(entry.target_entity).toBe('alert');
    expect(entry.target_id).toBe('ALT-2025-001');
    expect(entry.timestamp).toBeGreaterThan(0);
  });

  test('logAction throws error if required parameters are missing', async () => {
    await expect(logAction()).rejects.toThrow('All audit fields');
  });

  test('getAuditLogs filters by actor and action_type correctly', async () => {
    await logAction('officer-1', 'LOGIN', 'system', 'sys-01');
    await logAction('officer-2', 'ACTION_TAKEN', 'alert', 'alt-02');
    await logAction('officer-1', 'ACTION_TAKEN', 'alert', 'alt-03');

    const officer1Logs = await getAuditLogs({ actor: 'officer-1' });
    expect(officer1Logs).toHaveLength(2);

    const actionTakenLogs = await getAuditLogs({ action_type: 'ACTION_TAKEN' });
    expect(actionTakenLogs).toHaveLength(2);
  });

  test('GET /v1/audit-log returns filtered logs and count', async () => {
    await logAction('O-IND-04', 'CASE_REVIEW', 'case', 'C-INR-2025-01');

    const res = await request(app).get('/v1/audit-log?actor=O-IND-04');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.logs[0].actor_id).toBe('O-IND-04');
  });

  test('Audit log service lacks UPDATE and DELETE operations by design', () => {
    const auditService = require('../../services/auditService');
    expect(auditService.updateAuditLog).toBeUndefined();
    expect(auditService.deleteAuditLog).toBeUndefined();
    expect(auditService.removeAuditLog).toBeUndefined();
  });
});

/**
 * @fileoverview Unit tests for Outcome Loop & Audit Cross-Call.
 */

'use strict';

const express = require('express');
const request = require('supertest');
const { handleAction, handleOutcome } = require('../../controllers/outcomeController');
const { recordAction, recordOutcome, IN_MEMORY_ACTIONS } = require('../../services/outcomeService');
const { IN_MEMORY_AUDIT_LOGS } = require('../../../audit-log/services/auditService');

describe('Outcome Loop Unit Tests', () => {
  let app;

  beforeEach(() => {
    IN_MEMORY_ACTIONS.clear();
    IN_MEMORY_AUDIT_LOGS.clear();

    app = express();
    app.use(express.json());
    app.post('/v1/outcome-loop/action', handleAction);
    app.post('/v1/outcome-loop/outcome', handleOutcome);
  });

  test('POST /v1/outcome-loop/action records action and calls audit log', async () => {
    const res = await request(app).post('/v1/outcome-loop/action').send({
      alert_id: 'ALT-2025-778',
      decision: 'actioned',
      note: 'Dispatched patrol unit to site',
      officer_id: 'O-HAL-01',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action.rec_id).toBe('ALT-2025-778');
    expect(res.body.action.decision).toBe('actioned');

    // Verify automatic cross-call to Audit Log
    expect(IN_MEMORY_AUDIT_LOGS.size).toBe(1);
    const auditRecord = Array.from(IN_MEMORY_AUDIT_LOGS.values())[0];
    expect(auditRecord.actor_id).toBe('O-HAL-01');
    expect(auditRecord.target_id).toBe('ALT-2025-778');
    expect(auditRecord.action_type).toBe('OFFICER_DECISION_ACTIONED');
  });

  test('POST /v1/outcome-loop/action returns 400 when missing target ID or decision', async () => {
    const resNoTarget = await request(app).post('/v1/outcome-loop/action').send({
      decision: 'actioned',
    });
    expect(resNoTarget.status).toBe(400);
    expect(resNoTarget.body.error_code).toBe('MISSING_TARGET_ID');

    const resNoDecision = await request(app).post('/v1/outcome-loop/action').send({
      alert_id: 'ALT-100',
    });
    expect(resNoDecision.status).toBe(400);
    expect(resNoDecision.body.error_code).toBe('MISSING_DECISION');
  });

  test('POST /v1/outcome-loop/outcome records outcome feedback', async () => {
    const action = await recordAction({
      alert_id: 'ALT-2025-888',
      decision: 'actioned',
    });

    const res = await request(app).post('/v1/outcome-loop/outcome').send({
      action_id: action.action_id,
      result: 'ARREST_MADE',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.outcome.action_id).toBe(action.action_id);
    expect(res.body.outcome.result).toBe('ARREST_MADE');
  });
});

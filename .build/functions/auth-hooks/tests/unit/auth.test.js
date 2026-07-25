/**
 * @fileoverview Unit tests for Auth Hooks & RBAC Middleware.
 */

'use strict';

const express = require('express');
const request = require('supertest');
const { createSession } = require('../../controllers/authController');
const { requireRole } = require('../../middleware/rbacMiddleware');

describe('Auth Hooks & RBAC Unit Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/v1/auth/session', createSession);

    // Dummy user injection middleware for route testing
    app.use((req, res, next) => {
      if (req.headers['x-test-role']) {
        req.user = {
          user_id: 'test-user-01',
          role: req.headers['x-test-role'],
        };
      }
      next();
    });

    app.get('/v1/test/investigator', requireRole('investigator'), (req, res) => {
      res.status(200).json({ ok: true });
    });

    app.get('/v1/test/admin', requireRole('admin'), (req, res) => {
      res.status(200).json({ ok: true });
    });
  });

  test('POST /v1/auth/session returns 400 when missing credentials', async () => {
    const res = await request(app).post('/v1/auth/session').send({});
    expect(res.status).toBe(400);
    expect(res.body.error_code).toBe('INVALID_CREDENTIALS_PAYLOAD');
    expect(res.body.trace_id).toBeDefined();
  });

  test('POST /v1/auth/session creates session with role and station scope', async () => {
    const res = await request(app).post('/v1/auth/session').send({
      email: 'investigator.whitefield@ksp.gov.in',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('investigator');
    expect(res.body.user.station_id).toBe('whitefield');
  });

  test('RBAC Middleware permits access to matching roles', async () => {
    const res = await request(app)
      .get('/v1/test/investigator')
      .set('x-test-role', 'investigator');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('RBAC Middleware blocks unauthorized roles with 403 FORBIDDEN and trace_id', async () => {
    const res = await request(app)
      .get('/v1/test/admin')
      .set('x-test-role', 'investigator');

    expect(res.status).toBe(403);
    expect(res.body.error_code).toBe('FORBIDDEN');
    expect(res.body.trace_id).toBeDefined();
  });

  test('RBAC Middleware blocks unauthenticated requests with 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/v1/test/investigator');
    expect(res.status).toBe(401);
    expect(res.body.error_code).toBe('UNAUTHORIZED');
  });
});

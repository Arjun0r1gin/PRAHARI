/**
 * @fileoverview Unit tests for Real-Time Event Trigger & Simulation.
 */

'use strict';

const express = require('express');
const request = require('supertest');
const eventTriggersApp = require('../../index');
const { generateSingleIncident, triggerEventEmission } = require('../../../../simulation/event-generator');
const { pushToStream, subscribe, clearStream, STREAM_BUFFER } = require('../../../../simulation/incident-stream');

describe('Real-Time Event Pipeline Unit Tests', () => {
  beforeEach(() => {
    clearStream();
  });

  test('generateSingleIncident outputs valid unified record structure', () => {
    const incident = generateSingleIncident({ stationId: 'hal' });
    expect(incident.record_id).toBeDefined();
    expect(incident.source_station_id).toBe('hal');
    expect(incident.record_type).toBe('fir');
    expect(incident.event_ts).toBeGreaterThan(0);
  });

  test('incident-stream receives pushed events and notifies subscribers', async () => {
    const mockListener = jest.fn();
    subscribe(mockListener);

    const incident = generateSingleIncident();
    await pushToStream(incident);

    expect(STREAM_BUFFER).toHaveLength(1);
    expect(mockListener).toHaveBeenCalledTimes(1);
  });

  test('POST /v1/simulation/emit-event emits incident and triggers re-score', async () => {
    const res = await request(eventTriggersApp).post('/v1/simulation/emit-event').send({
      stationId: 'indiranagar',
      type: 'vehicle_theft',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.emitted_event.source_station_id).toBe('indiranagar');
    expect(res.body.triggerResult.reScoreResult.rescore_triggered).toBe(true);
    expect(res.body.triggerResult.reScoreResult.alert_level).toBe('CRITICAL');
  });

  test('POST /v1/events/signal-trigger handles signal payload when authorized', async () => {
    const incident = generateSingleIncident();
    const res = await request(eventTriggersApp)
      .post('/v1/events/signal-trigger')
      .set('x-catalyst-signal-secret', 'prahari-signal-secret-key')
      .send({ payload: incident });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reScoreResult.record_id).toBe(incident.record_id);
  });

  test('POST /v1/events/signal-trigger rejects unauthorized requests when SKIP_AUTH is false', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      process.env.SKIP_AUTH = 'false';

      const incident = generateSingleIncident();
      const res = await request(eventTriggersApp)
        .post('/v1/events/signal-trigger')
        .send({ payload: incident });

      expect(res.status).toBe(401);
      expect(res.body.error_code).toBe('UNAUTHORIZED_SIGNAL');
    } finally {
      process.env.NODE_ENV = originalEnv;
      delete process.env.SKIP_AUTH;
    }
  });
});

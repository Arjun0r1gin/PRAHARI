/**
 * @fileoverview Reusable HTTP Request Validation Helper.
 *
 * Validates Express req object against a schema map.
 * Checks body, query, and params fields for existence and plausible types.
 */

'use strict';

/**
 * Generate a trace ID for error payloads.
 * @returns {string}
 */
function generateTraceId() {
  return `TRC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Validate an HTTP request object against field constraints.
 *
 * @param {import('express').Request} req
 * @param {Object} schema
 * @param {Object} [schema.body]   - Required/typed fields in req.body
 * @param {Object} [schema.query]  - Required/typed fields in req.query
 * @param {Object} [schema.params] - Required/typed fields in req.params
 * @param {Function} [schema.custom] - Optional custom validation function (req) => string|null
 * @returns {{ valid: boolean, error?: { error_code: string, message: string, trace_id: string } }}
 */
function validateRequest(req, schema = {}) {
  const reqObj = req || {};

  function checkFields(sourceName, rules) {
    if (!rules) return null;
    let target = reqObj[sourceName] || {};

    if (sourceName === 'body') {
      if (Buffer.isBuffer(target)) {
        try { target = JSON.parse(target.toString('utf8')); } catch (e) { target = {}; }
      } else if (typeof target === 'string' && target.trim().startsWith('{')) {
        try { target = JSON.parse(target); } catch (e) { target = {}; }
      }
    }

    for (const [fieldName, rule] of Object.entries(rules)) {
      const value = target[fieldName];

      if (rule.required) {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
          return `Field '${fieldName}' in ${sourceName} is required.`;
        }
      }

      if (value !== undefined && value !== null && rule.type) {
        if (rule.type === 'string' && typeof value !== 'string') {
          return `Field '${fieldName}' in ${sourceName} must be a string.`;
        }
        if (rule.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            return `Field '${fieldName}' in ${sourceName} must be a valid number.`;
          }
        }
        if (rule.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          return `Field '${fieldName}' in ${sourceName} must be an object.`;
        }
        if (rule.type === 'array' && !Array.isArray(value)) {
          return `Field '${fieldName}' in ${sourceName} must be an array.`;
        }
        if (rule.type === 'boolean' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          return `Field '${fieldName}' in ${sourceName} must be a boolean.`;
        }
      }

      if (value !== undefined && value !== null && rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum.includes(value)) {
          return `Field '${fieldName}' in ${sourceName} must be one of: ${rule.enum.join(', ')}.`;
        }
      }
    }

    return null;
  }

  const bodyErr = checkFields('body', schema.body);
  if (bodyErr) {
    return {
      valid: false,
      error: {
        error_code: 'INVALID_INPUT',
        message: bodyErr,
        trace_id: generateTraceId(),
      },
    };
  }

  const queryErr = checkFields('query', schema.query);
  if (queryErr) {
    return {
      valid: false,
      error: {
        error_code: 'INVALID_INPUT',
        message: queryErr,
        trace_id: generateTraceId(),
      },
    };
  }

  const paramsErr = checkFields('params', schema.params);
  if (paramsErr) {
    return {
      valid: false,
      error: {
        error_code: 'INVALID_INPUT',
        message: paramsErr,
        trace_id: generateTraceId(),
      },
    };
  }

  if (typeof schema.custom === 'function') {
    const customRes = schema.custom(reqObj);
    if (customRes) {
      const errObj = typeof customRes === 'string'
        ? { error_code: 'INVALID_INPUT', message: customRes }
        : customRes;
      return {
        valid: false,
        error: {
          error_code: errObj.error_code || 'INVALID_INPUT',
          message: errObj.message || 'Invalid request parameters.',
          trace_id: generateTraceId(),
        },
      };
    }
  }

  return { valid: true };
}

module.exports = { validateRequest, generateTraceId };

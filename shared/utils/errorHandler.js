/**
 * @fileoverview Reusable Controller Error Handler.
 *
 * Logs the full error stack trace server-side (console.error) and returns
 * a clean, sanitized, domain-differentiated error payload to the client
 * using the standard { error_code, message, trace_id } envelope shape.
 */

'use strict';

const { generateTraceId } = require('./validator');
const { sendResponse } = require('./responseHelper');

/**
 * Handle and sanitize controller exceptions.
 *
 * @param {import('express').Response} res - Express response object
 * @param {Error|any} err - Caught error object
 * @param {Object} [options]
 * @param {number} [options.status=500] - Default HTTP status code
 * @param {string} [options.errorCode='INTERNAL_SERVER_ERROR'] - Domain-specific error code
 * @param {string} [options.defaultMessage] - Domain-differentiated sanitized client message
 * @param {boolean} [options.useSendResponse=false] - Whether to wrap in responseHelper sendResponse format
 * @returns {Object} Express response or JSON object payload
 */
function handleControllerError(res, err, options = {}) {
  const errorCode = options.errorCode || 'INTERNAL_SERVER_ERROR';
  console.error(`[PRAHARI Exception] [${errorCode}]:`, err);

  const status = err.status || err.statusCode || options.status || 500;
  const traceId = generateTraceId();

  let message = options.defaultMessage || 'An unexpected internal server error occurred.';
  let finalErrorCode = errorCode;

  if (status === 404 || err.code === 'NOT_FOUND') {
    finalErrorCode = 'RESOURCE_NOT_FOUND';
    message = options.defaultMessage || 'The requested resource could not be found.';
  } else if (status === 400 || err.code === 'BAD_REQUEST') {
    finalErrorCode = options.errorCode || 'INVALID_INPUT';
    message = options.defaultMessage || 'The request payload or parameters are invalid.';
  }

  const errorPayload = {
    error_code: finalErrorCode,
    message,
    trace_id: traceId,
  };

  if (res && typeof res.status === 'function') {
    if (options.useSendResponse) {
      return sendResponse(res, status, false, null, errorPayload);
    }
    return res.status(status).json(errorPayload);
  }

  return { status, ...errorPayload };
}

module.exports = { handleControllerError };

/**
 * Standardizes API HTTP responses across all PRAHARI Catalyst Functions.
 *
 * @param {boolean} success - Operation success status
 * @param {any} [data=null] - Payload data on success
 * @param {Object|string|null} [error=null] - Error metadata object or message on failure
 * @returns {{ success: boolean, data: any, error: Object|null, timestamp: string }}
 */
function formatResponse(success, data = null, error = null) {
  let formattedError = null;

  if (error) {
    if (typeof error === "string") {
      formattedError = {
        code: "ERROR",
        message: error,
        trace_id: `TRC-${Date.now().toString(36)}`
      };
    } else if (typeof error === "object") {
      formattedError = {
        code: error.error_code || error.code || "INTERNAL_ERROR",
        message: error.message || "An unexpected error occurred",
        trace_id: error.trace_id || `TRC-${Date.now().toString(36)}`
      };
    }
  }

  return {
    success: Boolean(success),
    data: success ? data : null,
    error: success ? null : formattedError,
    timestamp: new Date().toISOString()
  };
}

/**
 * Express middleware helper to send standardized HTTP responses.
 */
function sendResponse(res, statusCode, success, data = null, error = null) {
  const payload = formatResponse(success, data, error);
  if (res && typeof res.status === "function") {
    return res.status(statusCode).json(payload);
  }
  return payload;
}

module.exports = {
  formatResponse,
  sendResponse
};

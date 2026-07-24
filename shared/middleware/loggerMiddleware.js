const { getCatalystApp } = require("../utils/catalystHelper");

/**
 * Structured Logging Middleware.
 * Logs request execution metrics, timing, status code, and errors without exposing sensitive credentials.
 */
function loggerMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestId = (req && req.headers && req.headers["x-request-id"]) || `REQ-${Date.now().toString(36)}`;
  req.requestId = requestId;

  if (res && typeof res.on === "function") {
    res.on("finish", () => {
      const executionTimeMs = Date.now() - startTime;
      const statusCode = res.statusCode || 200;
      const logPayload = {
        request_id: requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        status_code: statusCode,
        execution_time_ms: executionTimeMs,
        timestamp: new Date().toISOString()
      };

      const catalystApp = getCatalystApp(req);
      if (catalystApp && catalystApp.logger) {
        try {
          catalystApp.logger().info(JSON.stringify(logPayload));
          return;
        } catch (err) {
          // Fallback to console logging
        }
      }

      if (process.env.NODE_ENV !== "test") {
        console.log(`[PRAHARI-LOG] ${logPayload.method} ${logPayload.url} - ${logPayload.status_code} (${logPayload.execution_time_ms}ms)`);
      }
    });
  }

  if (typeof next === "function") {
    next();
  }
}

module.exports = loggerMiddleware;

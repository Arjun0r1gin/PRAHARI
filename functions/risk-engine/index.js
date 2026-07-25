const express = require("express");
const loggerMiddleware = require("@prahari/shared/middleware/loggerMiddleware");
const authMiddleware = require("@prahari/shared/middleware/authMiddleware");
const { getScore, getAlerts } = require("./controllers/riskController");

const app = express();
app.use(express.json());

// Health Check Endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "risk-engine",
    build: "debug-001",
    timestamp: Date.now()
  });
});
app.get("/v1/risk-engine/health", (req, res) => res.status(200).json({ status: "ok", service: "risk-engine" }));

// Attach Catalyst Logging and Authentication Middlewares
app.use(loggerMiddleware);
app.use(authMiddleware);

// Risk Engine & Decision Engine Routes
app.get("/v1/risk-engine/score/:alertId", getScore);
app.get("/score/:alertId", getScore);
app.get("/v1/risk-engine/score", getScore);
app.get("/score", getScore);
app.post("/v1/risk-engine/score", getScore);
app.post("/score", getScore);
app.get("/v1/decision-engine/alerts", getAlerts);
app.get("/decision-engine/alerts", getAlerts);

/**
 * Catalyst Function Main Entry Point Handler
 * @param {Object} req - Incoming HTTP Request
 * @param {Object} res - Outgoing HTTP Response
 */
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

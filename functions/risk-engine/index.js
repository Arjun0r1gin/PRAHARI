const express = require("express");
const loggerMiddleware = require("../../shared/middleware/loggerMiddleware");
const authMiddleware = require("../../shared/middleware/authMiddleware");
const { getScore, getAlerts } = require("./controllers/riskController");

const app = express();
app.use(express.json());

// Attach Catalyst Logging and Authentication Middlewares
app.use(loggerMiddleware);
app.use(authMiddleware);

// Risk Engine & Decision Engine Routes
app.get("/v1/risk-engine/score/:alertId", getScore);
app.get("/v1/decision-engine/alerts", getAlerts);

/**
 * Catalyst Function Main Entry Point Handler
 * @param {Object} req - Incoming HTTP Request
 * @param {Object} res - Outgoing HTTP Response
 */
function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

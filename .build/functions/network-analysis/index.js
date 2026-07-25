const express = require("express");
const loggerMiddleware = require("@prahari/shared/middleware/loggerMiddleware");
const authMiddleware = require("@prahari/shared/middleware/authMiddleware");
const { getGraph } = require("./controllers/networkController");

const app = express();
app.use(express.json());

// Health Check Endpoints
app.get("/health", (req, res) => res.status(200).json({ status: "ok", service: "network-analysis" }));
app.get("/v1/network-analysis/health", (req, res) => res.status(200).json({ status: "ok", service: "network-analysis" }));

// Attach Catalyst Logging and Authentication Middlewares
app.use(loggerMiddleware);
app.use(authMiddleware);

// Network Analysis Endpoints
app.get("/v1/network-analysis/graph", getGraph);

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

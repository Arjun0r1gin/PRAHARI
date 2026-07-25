const express = require("express");
const loggerMiddleware = require("@prahari/shared/middleware/loggerMiddleware");
const authMiddleware = require("@prahari/shared/middleware/authMiddleware");
const { getClusters } = require("./controllers/hotspotController");

const app = express();
app.use(express.json());

// Health Check Endpoints
app.get("/health", (req, res) => res.status(200).json({ status: "ok", service: "hotspot-engine" }));
app.get("/v1/hotspot-engine/health", (req, res) => res.status(200).json({ status: "ok", service: "hotspot-engine" }));

// Attach Catalyst Logging and Authentication Middlewares
app.use(loggerMiddleware);
app.use(authMiddleware);

// Hotspot Engine Endpoints
app.get("/v1/hotspot-engine/clusters", getClusters);

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

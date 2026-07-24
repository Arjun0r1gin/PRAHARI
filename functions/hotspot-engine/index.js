const express = require("express");
const loggerMiddleware = require("../../shared/middleware/loggerMiddleware");
const authMiddleware = require("../../shared/middleware/authMiddleware");
const { getClusters } = require("./controllers/hotspotController");

const app = express();
app.use(express.json());

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
function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

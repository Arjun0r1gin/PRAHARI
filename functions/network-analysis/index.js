const express = require("express");
const loggerMiddleware = require("../../shared/middleware/loggerMiddleware");
const authMiddleware = require("../../shared/middleware/authMiddleware");
const { getGraph } = require("./controllers/networkController");

const app = express();
app.use(express.json());

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
function handler(req, res) {
  return app(req, res);
}

module.exports = app;
module.exports.handler = handler;

const { getGraph: fetchGraphService } = require("../services/graphService");
const { sendResponse } = require("../../../shared/utils/responseHelper");

/**
 * Generates a unique trace ID for error tracking.
 * @returns {string}
 */
function generateTraceId() {
  return `TRC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * GET /v1/network-analysis/graph?caseId=<id>
 * Controller handler returning suspect network graph with centrality metrics and ringleader flags.
 *
 * @param {Object} req - Express/HTTP request object
 * @param {Object} res - Express/HTTP response object
 */
function getGraph(req, res) {
  try {
    const caseId = (req && req.query && req.query.caseId) || (req && req.params && req.params.caseId) || "CASE-992";

    const graphPayload = fetchGraphService(caseId);

    if (res && typeof res.status === "function") {
      return sendResponse(res, 200, true, graphPayload);
    }
    return graphPayload;
  } catch (err) {
    const errorPayload = {
      error_code: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred while retrieving network graph",
      trace_id: generateTraceId()
    };

    if (res && typeof res.status === "function") {
      return sendResponse(res, 500, false, null, errorPayload);
    }
    return errorPayload;
  }
}

module.exports = {
  getGraph
};

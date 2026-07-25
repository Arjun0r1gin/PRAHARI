const { getGraph: fetchGraphService } = require("../services/graphService");
const { sendResponse } = require("@prahari/shared/utils/responseHelper");
const { validateRequest } = require("@prahari/shared/utils/validator");
const { handleControllerError } = require("@prahari/shared/utils/errorHandler");

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
  const validation = validateRequest(req, {
    query: { caseId: { type: 'string', required: false } },
    params: { caseId: { type: 'string', required: false } },
  });

  if (!validation.valid) {
    if (res && typeof res.status === "function") {
      return sendResponse(res, 400, false, null, validation.error);
    }
    return validation.error;
  }

  try {
    const caseId = (req && req.query && req.query.caseId) || (req && req.params && req.params.caseId) || "CASE-992";

    const graphPayload = fetchGraphService(caseId);

    if (res && typeof res.status === "function") {
      return sendResponse(res, 200, true, graphPayload);
    }
    return graphPayload;
  } catch (err) {
    return handleControllerError(res, err, {
      errorCode: "NETWORK_GRAPH_ERROR",
      defaultMessage: "An unexpected error occurred while retrieving the suspect network graph.",
      useSendResponse: true,
    });
  }
}

module.exports = {
  getGraph
};

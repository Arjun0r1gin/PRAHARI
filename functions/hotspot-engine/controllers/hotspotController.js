const { getClusters } = require("../services/clusterService");
const dataRepository = require("../../../shared/repositories/dataRepository");
const { sendResponse } = require("../../../shared/utils/responseHelper");

/**
 * Controller handler for GET /v1/hotspot-engine/clusters?district=<district>&windowDays=<days>
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
async function getClustersController(req, res) {
  try {
    const district = (req && req.query && req.query.district) || "whitefield";
    const windowDays = parseInt((req && req.query && req.query.windowDays) || 30, 10);

    // Load incidents from repository (Catalyst Data Store or mock fallback)
    const incidents = await dataRepository.getIncidentsByDistrict(district, windowDays, req);

    // Compute density clusters using domain cluster service
    const clusters = getClusters(district, windowDays, incidents);

    return sendResponse(res, 200, true, clusters);
  } catch (err) {
    return sendResponse(res, 500, false, null, {
      error_code: "INTERNAL_ERROR",
      message: err.message || "An error occurred while computing hotspot clusters",
      trace_id: (req && req.requestId) || `TRC-${Date.now().toString(36)}`
    });
  }
}

module.exports = {
  getClusters: getClustersController
};

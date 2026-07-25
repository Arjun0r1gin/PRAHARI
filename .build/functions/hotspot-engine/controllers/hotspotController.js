const { getClusters } = require("../services/clusterService");
const dataRepository = require("@prahari/shared/repositories/dataRepository");
const { sendResponse } = require("@prahari/shared/utils/responseHelper");
const { validateRequest } = require("@prahari/shared/utils/validator");
const { handleControllerError } = require("@prahari/shared/utils/errorHandler");

/**
 * Controller handler for GET /v1/hotspot-engine/clusters?district=<district>&windowDays=<days>
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
async function getClustersController(req, res) {
  const { valid, error } = validateRequest(req, {
    query: {
      district: { type: 'string', required: false },
      windowDays: { type: 'number', required: false },
    },
  });

  if (!valid) {
    return sendResponse(res, 400, false, null, error);
  }

  try {
    const district = (req && req.query && req.query.district) || "whitefield";
    const windowDays = parseInt((req && req.query && req.query.windowDays) || 30, 10);

    // Load incidents from repository (Catalyst Data Store or mock fallback)
    const incidents = await dataRepository.getIncidentsByDistrict(district, windowDays, req);

    // Compute density clusters using domain cluster service
    const clusters = getClusters(district, windowDays, incidents);

    return sendResponse(res, 200, true, clusters);
  } catch (err) {
    return handleControllerError(res, err, {
      errorCode: "HOTSPOT_CLUSTER_ERROR",
      defaultMessage: "An error occurred while computing hotspot clusters.",
      useSendResponse: true,
    });
  }
}

module.exports = {
  getClusters: getClustersController
};

let catalystSDK = null;

try {
  catalystSDK = require("zcatalyst-sdk-node");
} catch (err) {
  catalystSDK = null;
}

/**
 * Safely initializes and retrieves the Zoho Catalyst app instance for an incoming HTTP request.
 *
 * @param {Object} [req] - Incoming Express/HTTP Request object
 * @returns {Object|null} Catalyst App instance or null if uninitialized / running offline
 */
function getCatalystApp(req) {
  // If running in local test environment or SDK missing, return null to trigger offline fallback
  if (process.env.NODE_ENV === "test" || !catalystSDK) {
    return null;
  }

  try {
    if (req) {
      return catalystSDK.initialize(req);
    }
    return catalystSDK.initialize();
  } catch (err) {
    // Return null on initialization failure to ensure graceful fallback
    return null;
  }
}

/**
 * Checks if the current environment is running inside an active Catalyst container.
 * @param {Object} [req]
 * @returns {boolean}
 */
function isCatalystEnvironment(req) {
  return Boolean(getCatalystApp(req));
}

module.exports = {
  getCatalystApp,
  isCatalystEnvironment
};

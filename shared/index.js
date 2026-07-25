/**
 * @prahari/shared — barrel re-export for all shared PRAHARI modules.
 * Individual sub-paths (e.g. "@prahari/shared/middleware/loggerMiddleware")
 * remain the canonical import style used by all function source files.
 */

const validator = require("./utils/validator");

module.exports = {
  // Middleware
  loggerMiddleware: require("./middleware/loggerMiddleware"),
  authMiddleware: require("./middleware/authMiddleware"),

  // Repositories
  dataRepository: require("./repositories/dataRepository"),

  // Utils
  responseHelper: require("./utils/responseHelper"),
  catalystHelper: require("./utils/catalystHelper"),
  validator,
  validateRequest: validator.validateRequest,
  generateTraceId: validator.generateTraceId,
  errorHandler: require("./utils/errorHandler"),
  handleControllerError: require("./utils/errorHandler").handleControllerError,
};

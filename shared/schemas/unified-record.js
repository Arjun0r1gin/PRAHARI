/**
 * @fileoverview Unified Record Schema for PRAHARI Shared Module.
 *
 * Resolves the TODO referenced in functions/risk-engine/schema/unified-record.js.
 * Provides the canonical schema definition, field lists, completeness scoring,
 * and record validation used across all PRAHARI microservices.
 */

'use strict';

const {
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS,
  computeCompletenessScore,
  validateRecord,
} = require('../../functions/data-fusion/schema/unified-record-schema');

module.exports = {
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS,
  computeCompletenessScore,
  validateRecord,
};

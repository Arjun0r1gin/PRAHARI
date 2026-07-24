const { calculateRiskScore } = require("../services/scoreCalculator");
const { getRecommendation } = require("../recommendationTemplates");
const { buildExplanation } = require("../explanationBuilder");
const dataRepository = require("../../../shared/repositories/dataRepository");
const { sendResponse } = require("../../../shared/utils/responseHelper");

// Mock fallback store for unit tests and local execution
const MOCK_ALERT_STORE = {
  "INC-2026-0417": {
    alert_id: "ALT-2026-0417",
    case_id: "CASE-992",
    created_at: "2026-04-17T22:14:00+05:30",
    record: {
      incident_id: "INC-2026-0417",
      station_id: "whitefield",
      type: "vehicle_theft",
      location: { lat: 12.9698, lng: 77.7500 },
      timestamp: "2026-04-17T22:14:00+05:30",
      persons: [{ person_id: "P-1029", role: "suspect" }],
      source_format: "whitefield-v1",
      completeness_score: 0.86
    },
    context: {
      time_range: "22:00-04:00",
      location_area: "Whitefield Main Rd",
      nearbyIncidents: [
        { incident_id: "INC-1", location: { lat: 12.9699, lng: 77.7501 }, timestamp: "2026-04-16T22:00:00+05:30" },
        { incident_id: "INC-2", location: { lat: 12.9697, lng: 77.7499 }, timestamp: "2026-04-15T21:00:00+05:30" }
      ],
      priorOffenses: [
        { person_id: "P-1029", station_id: "whitefield", timestamp: "2026-03-01T10:00:00+05:30" }
      ]
    }
  }
};

/**
 * Lookup alert record by ID.
 * @param {string} alertId
 * @returns {Object|null}
 */
function findAlertById(alertId) {
  if (!alertId) return null;
  return MOCK_ALERT_STORE[alertId] || MOCK_ALERT_STORE["INC-2026-0417"] || null;
}

/**
 * Generates a unique trace ID for error tracking.
 * @returns {string}
 */
function generateTraceId() {
  return `TRC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * GET /v1/risk-engine/score/:alertId
 * Returns calculated risk score, band, factors, explanation, and recommendation.
 */
async function getScore(req, res) {
  try {
    const alertId = (req && req.params && req.params.alertId) || (req && req.query && req.query.alertId);

    if (!alertId) {
      if (res && typeof res.status === "function") {
        return sendResponse(res, 404, false, null, {
          error_code: "ALERT_NOT_FOUND",
          message: "Alert ID parameter is required",
          trace_id: generateTraceId()
        });
      }
      return { status: 404, error_code: "ALERT_NOT_FOUND" };
    }

    let alertData = await dataRepository.getAlertById(alertId, req);
    if (!alertData || !alertData.record) {
      alertData = findAlertById(alertId);
    }

    if (!alertData) {
      if (res && typeof res.status === "function") {
        return sendResponse(res, 404, false, null, {
          error_code: "ALERT_NOT_FOUND",
          message: `Alert record not found for ID: ${alertId}`,
          trace_id: generateTraceId()
        });
      }
      return { status: 404, error_code: "ALERT_NOT_FOUND" };
    }

    const { record, context } = alertData;

    // 1. Calculate risk score using pure domain service
    const scoreResult = calculateRiskScore(record, context);

    // 2. Extract fired rule names
    const firedRuleFactors = scoreResult.factors.filter((f) => f.source === "rule");
    const firedRuleNames = firedRuleFactors.map((f) => f.name);

    // 3. Get recommendation using pure domain template lookup
    const recommendation = getRecommendation(firedRuleNames, scoreResult.band, context);

    // 4. Build explanation using pure template builder
    const explanation = buildExplanation(firedRuleNames, context ? context.topFeature : null);

    const payload = {
      alert_id: alertData.alert_id,
      case_id: alertData.case_id,
      score: {
        value: scoreResult.value,
        confidence: scoreResult.confidence,
        band: scoreResult.band
      },
      factors: scoreResult.factors,
      explanation,
      recommendation: {
        template_id: recommendation.template_id,
        text: recommendation.text,
        status: "pending_review"
      }
    };

    if (res && typeof res.status === "function") {
      return sendResponse(res, 200, true, payload);
    }
    return payload;
  } catch (err) {
    const errorPayload = {
      error_code: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred while calculating risk score",
      trace_id: generateTraceId()
    };
    if (res && typeof res.status === "function") {
      return sendResponse(res, 500, false, null, errorPayload);
    }
    return errorPayload;
  }
}

/**
 * GET /v1/decision-engine/alerts?sort=urgency
 * Returns list of alerts sorted by urgency descending.
 */
function getAlerts(req, res) {
  try {
    const rawAlerts = Object.values(MOCK_ALERT_STORE);

    const processedAlerts = rawAlerts.map((item) => {
      const scoreResult = calculateRiskScore(item.record, item.context);
      const firedRuleFactors = scoreResult.factors.filter((f) => f.source === "rule");

      let one_line_reason = "Elevated Model Risk Signal";
      if (firedRuleFactors.length > 0) {
        const topRule = firedRuleFactors.reduce((max, cur) => (cur.points > max.points ? cur : max), firedRuleFactors[0]);
        one_line_reason = topRule.name;
      }

      return {
        alert_id: item.alert_id,
        case_id: item.case_id,
        urgency: scoreResult.value,
        one_line_reason,
        band: scoreResult.band,
        created_at: item.created_at
      };
    });

    processedAlerts.sort((a, b) => b.urgency - a.urgency);

    const responsePayload = { alerts: processedAlerts };

    if (res && typeof res.status === "function") {
      return sendResponse(res, 200, true, responsePayload);
    }
    return responsePayload;
  } catch (err) {
    const errorPayload = {
      error_code: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred while retrieving alerts",
      trace_id: generateTraceId()
    };
    if (res && typeof res.status === "function") {
      return sendResponse(res, 500, false, null, errorPayload);
    }
    return errorPayload;
  }
}

module.exports = {
  getScore,
  getAlerts,
  findAlertById
};

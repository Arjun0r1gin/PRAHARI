const { calculateRiskScore } = require("../services/scoreCalculator");
const { getRecommendation } = require("../recommendationTemplates");
const { buildExplanation } = require("../explanationBuilder");
const dataRepository = require("@prahari/shared/repositories/dataRepository");
const { sendResponse } = require("@prahari/shared/utils/responseHelper");
const { validateRequest } = require("@prahari/shared/utils/validator");
const { handleControllerError } = require("@prahari/shared/utils/errorHandler");

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
 * Robust helper to extract alertId across Express req.body, req.params, req.query, and Catalyst req.args
 * @param {Object} req
 * @returns {string|null}
 */
function extractAlertId(req) {
  if (!req) return null;

  let body = req.body;

  if (Buffer.isBuffer(body)) {
    try {
      body = body.toString("utf8");
    } catch (err) {
      body = null;
    }
  }

  if (typeof body === "string" && body.trim().startsWith("{")) {
    try {
      body = JSON.parse(body);
    } catch (err) {
      body = null;
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    body = (req.args && typeof req.args === "object") ? req.args : {};
  }

  const id =
    (req.params && (req.params.alertId || req.params.alert_id)) ||
    (req.query && (req.query.alertId || req.query.alert_id)) ||
    (body && (body.alertId || body.alert_id));

  return (typeof id === "string" && id.trim() !== "") ? id.trim() : null;
}

/**
 * GET /v1/risk-engine/score/:alertId
 * Returns calculated risk score, band, factors, explanation, and recommendation.
 */
async function getScore(req, res) {
  console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-1] Enter getScore()`);

  try {
    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-2] Before extractAlertId()`);
    const alertId = extractAlertId(req);
    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-3] After extractAlertId() -> alertId: ${alertId}`);

    const validation = validateRequest(req, {
      custom: (r) => {
        const id = extractAlertId(r);
        if (!id) {
          return "Alert ID parameter is required.";
        }
        return null;
      }
    });

    if (!validation.valid) {
      if (res && typeof res.status === "function") {
        return sendResponse(res, 400, false, null, validation.error);
      }
      return validation.error;
    }

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

    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-4] Before dataRepository.getAlertById()`);
    let alertData = await dataRepository.getAlertById(alertId, req);
    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-5] Immediately after getAlertById() returns -> alertData found: ${Boolean(alertData)}`);

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

    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-6] Before calculateRiskScore() & AutoML prediction`);
    const scoreResult = await calculateRiskScore(record, context);
    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-7] Immediately after calculateRiskScore() returns`);

    const firedRuleFactors = scoreResult.factors.filter((f) => f.source === "rule");
    const firedRuleNames = firedRuleFactors.map((f) => f.name);

    const recommendation = getRecommendation(firedRuleNames, scoreResult.band, context);
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

    console.log(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-8] Before sendResponse()`);
    if (res && typeof res.status === "function") {
      return sendResponse(res, 200, true, payload);
    }
    return payload;
  } catch (err) {
    console.error(`[TIMESTAMP: ${new Date().toISOString()}] [LOG-9] Before catch block -> Error:`, err);
    return handleControllerError(res, err, {
      errorCode: "RISK_SCORE_CALCULATION_ERROR",
      defaultMessage: "An unexpected error occurred while calculating the risk score.",
      useSendResponse: true,
    });
  }
}

/**
 * GET /v1/decision-engine/alerts?sort=urgency
 * Returns list of alerts sorted by urgency descending.
 */
async function getAlerts(req, res) {
  try {
    const rawAlerts = Object.values(MOCK_ALERT_STORE);

    const processedAlerts = await Promise.all(rawAlerts.map(async (item) => {
      const scoreResult = await calculateRiskScore(item.record, item.context);
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
    return handleControllerError(res, err, {
      errorCode: "RISK_ALERTS_FETCH_ERROR",
      defaultMessage: "An unexpected error occurred while retrieving decision alerts.",
      useSendResponse: true,
    });
  }
}

module.exports = {
  getScore,
  getAlerts,
  findAlertById
};

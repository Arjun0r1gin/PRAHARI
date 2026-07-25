const RULE_NAME = "EscalationPattern";
const POINTS = 15;

/**
 * Checks if gaps between successive offenses are shrinking across 3+ offenses.
 * @param {Array<Object>} history Sorted chronological offense list
 * @returns {boolean}
 */
function isTimeGapShrinking(history) {
  if (history.length < 3) return false;

  const gaps = [];
  for (let i = 1; i < history.length; i++) {
    const prevTime = new Date(history[i - 1].timestamp).getTime();
    const currTime = new Date(history[i].timestamp).getTime();
    if (isNaN(prevTime) || isNaN(currTime)) return false;
    gaps.push(Math.abs(currTime - prevTime));
  }

  for (let i = 1; i < gaps.length; i++) {
    const prevGap = gaps[i - 1];
    const currGap = gaps[i];
    // Require a significant gap reduction (>= 15%) between consecutive intervals
    // to prevent natural calendar month variations (e.g. 31 days vs 28 days) from falsely triggering
    if (currGap >= prevGap * 0.85) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if severity scores are rising across 3+ offenses.
 * @param {Array<Object>} history Sorted chronological offense list
 * @returns {boolean}
 */
function isSeverityRising(history) {
  if (history.length < 3) return false;

  for (let i = 1; i < history.length; i++) {
    const prevSev = history[i - 1].severity ?? 0;
    const currSev = history[i].severity ?? 0;
    if (currSev <= prevSev) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates Escalation Pattern rule.
 * Fires when the gap between a person's successive offenses is shrinking, OR severity is rising,
 * across their last 3 or more recorded offenses.
 *
 * @param {import('../schema/unified-record').UnifiedRecord} record
 * @param {Object} [context={}]
 * @param {Array<Object>} [context.offenseHistory=[]] Pre-fetched chronological offense history for linked person(s)
 * @param {Record<string, Array<Object>>} [context.personHistories] Mapping of person_id to chronological offense history
 * @returns {{ fired: boolean, points: number, name: string }}
 */
function evaluate(record, context = {}) {
  if (!record) {
    return { fired: false, points: 0, name: RULE_NAME };
  }

  let historiesToEvaluate = [];

  if (Array.isArray(context.offenseHistory) && context.offenseHistory.length >= 3) {
    historiesToEvaluate.push(context.offenseHistory);
  }

  if (context.personHistories && typeof context.personHistories === "object") {
    for (const personHistory of Object.values(context.personHistories)) {
      if (Array.isArray(personHistory) && personHistory.length >= 3) {
        historiesToEvaluate.push(personHistory);
      }
    }
  }

  let fired = false;

  for (const history of historiesToEvaluate) {
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (isTimeGapShrinking(sortedHistory) || isSeverityRising(sortedHistory)) {
      fired = true;
      break;
    }
  }

  return {
    fired,
    points: fired ? POINTS : 0,
    name: RULE_NAME
  };
}

module.exports = {
  RULE_NAME,
  POINTS,
  evaluate
};

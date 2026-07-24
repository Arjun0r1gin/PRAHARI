const RULE_NAME = "RepeatOffender";
const POINTS = 25;

/**
 * Evaluates Repeat Offender rule.
 * Fires when a person linked to this incident has a prior offense recorded in the same flagged zone/station.
 *
 * @param {import('../schema/unified-record').UnifiedRecord} record
 * @param {Object} [context={}]
 * @param {Array<Object>} [context.priorOffenses=[]] Pre-fetched prior offenses history
 * @param {string} [context.flaggedZoneId] Flagged zone identifier
 * @returns {{ fired: boolean, points: number, name: string }}
 */
function evaluate(record, context = {}) {
  if (!record || !Array.isArray(record.persons) || record.persons.length === 0) {
    return { fired: false, points: 0, name: RULE_NAME };
  }

  const priorOffenses = Array.isArray(context.priorOffenses) ? context.priorOffenses : [];
  const targetZoneOrStation = context.flaggedZoneId || record.station_id;

  const recordPersonIds = new Set(
    record.persons
      .map((p) => p && p.person_id)
      .filter((id) => Boolean(id))
  );

  if (recordPersonIds.size === 0) {
    return { fired: false, points: 0, name: RULE_NAME };
  }

  let fired = false;

  for (const offense of priorOffenses) {
    if (!offense || !offense.person_id) continue;

    if (recordPersonIds.has(offense.person_id)) {
      const offenseLocationMatch =
        (offense.zone_id && offense.zone_id === targetZoneOrStation) ||
        (offense.station_id && offense.station_id === targetZoneOrStation);

      if (offenseLocationMatch) {
        fired = true;
        break;
      }
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

/**
 * Calculates exponential recency decay weight for a given timestamp.
 * Formula: weight = exp(-daysSince / 30)
 *
 * @param {string | number | Date} timestamp Incident timestamp string, timestamp, or Date object
 * @param {string | number | Date} [now=new Date()] Reference baseline timestamp
 * @returns {number} Decayed weight bounded between 0.0 and 1.0
 */
function recencyDecay(timestamp, now = new Date()) {
  if (!timestamp) return 0.0;

  const tEvent = new Date(timestamp).getTime();
  const tNow = new Date(now).getTime();

  if (isNaN(tEvent) || isNaN(tNow)) {
    return 0.0;
  }

  const diffMs = tNow - tEvent;
  // If event is in the future, weight is 1.0
  if (diffMs <= 0) {
    return 1.0;
  }

  const daysSince = diffMs / (1000 * 60 * 60 * 24);
  const weight = Math.exp(-daysSince / 30);

  return parseFloat(Math.min(1.0, Math.max(0.0, weight)).toFixed(4));
}

module.exports = {
  recencyDecay
};

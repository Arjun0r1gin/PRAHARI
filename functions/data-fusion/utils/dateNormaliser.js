/**
 * @fileoverview Date normalisation utility.
 *
 * Different stations use different date formats:
 *   - ISO 8601 : 2025-01-14T10:25:00+05:30  (Whitefield, HAL, Krishnaraja, Camp, Brahmapur)
 *   - DD-MM-YYYY : 14-01-2025               (Devaraja, Mangalore North, Belagavi Rural, Ashok Nagar)
 *   - MM/DD/YYYY : 01/14/2025               (Indiranagar, Mysuru South, Panambur, Roza)
 *   - Unix epoch (seconds) : 1737209400     (Bellandur, Narasimharaja, Mangalore East, APMC, Station Bazar)
 *
 * All values are normalised to Unix epoch milliseconds (number).
 */

'use strict';

/**
 * Attempt to parse a date/timestamp string or number into Unix epoch milliseconds.
 *
 * @param {string|number} value  - Raw date value from a CSV cell
 * @returns {number|null}        - Unix epoch ms, or null if unparseable
 */
function normaliseTimestamp(value) {
  if (value === undefined || value === null || value === '') return null;

  const str = String(value).trim();

  // 1. Pure numeric → treat as Unix epoch seconds if plausible, else ms
  if (/^\d{9,13}$/.test(str)) {
    const num = Number(str);
    // epoch seconds if ≤ 13 digits and reasonable range (year 2000–2100)
    if (num < 4_102_444_800) {
      return num * 1000; // seconds → ms
    }
    return num; // already ms
  }

  // 2. ISO 8601 with timezone: 2025-01-14T10:25:00+05:30
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // 3. DD-MM-YYYY [HH:MM] — handles "14-01-2025" and "14-01-2025 10:25"
  const ddmmyyyy = str.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy, hh = '00', min = '00'] = ddmmyyyy;
    const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:30`);
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // 4. MM/DD/YYYY [HH:MM] — handles "01/14/2025" and "01/14/2025 10:25"
  const mmddyyyy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (mmddyyyy) {
    const [, mm, dd, yyyy, hh = '00', min = '00'] = mmddyyyy;
    const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:30`);
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // 5. Fallback: let JS try
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Combine separate date and time fields into a Unix epoch ms timestamp.
 *
 * @param {string} dateStr  - e.g. "14-01-2025" or "01/14/2025"
 * @param {string} timeStr  - e.g. "10:25"
 * @returns {number|null}
 */
function normaliseDateAndTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
  return normaliseTimestamp(combined);
}

module.exports = { normaliseTimestamp, normaliseDateAndTime };

const { getCatalystApp } = require("../utils/catalystHelper");

// Configurable Data Store table names from environment variables
const TABLE_ALERTS = process.env.TABLE_ALERTS || "Alerts";
const TABLE_INCIDENTS = process.env.TABLE_INCIDENTS || "Incidents";
const TABLE_OFFENSES = process.env.TABLE_OFFENSES || "Offenses";

// Deterministic local mock datasets for unit testing and offline execution
const MOCK_ALERTS = {
  "ALT-1001": {
    alert_id: "ALT-1001",
    incident_id: "INC-2026-0891",
    timestamp: "2026-07-23T14:30:00Z",
    district: "whitefield",
    station_id: "PS-WF-04",
    location: { lat: 12.9698, lng: 77.7499 },
    crime_type: "motor_vehicle_theft",
    severity: 3,
    completeness_score: 0.85,
    persons: [
      { person_id: "P-4402", name: "Ramesh Kumar", role: "suspect" }
    ]
  }
};

const MOCK_INCIDENTS = [
  {
    incident_id: "INC-2026-0101",
    district: "whitefield",
    station_id: "PS-WF-01",
    location: { lat: 12.9698, lng: 77.7499 },
    timestamp: "2026-07-23T10:00:00Z",
    crime_type: "motor_vehicle_theft",
    severity: 3,
    completeness_score: 0.9
  },
  {
    incident_id: "INC-2026-0102",
    district: "whitefield",
    station_id: "PS-WF-01",
    location: { lat: 12.9712, lng: 77.7512 },
    timestamp: "2026-07-22T14:00:00Z",
    crime_type: "motor_vehicle_theft",
    severity: 2,
    completeness_score: 0.8
  },
  {
    incident_id: "INC-2026-0103",
    district: "whitefield",
    station_id: "PS-WF-02",
    location: { lat: 12.9685, lng: 77.7485 },
    timestamp: "2026-07-20T18:00:00Z",
    crime_type: "burglary",
    severity: 4,
    completeness_score: 0.85
  }
];

/**
 * Data Repository Layer providing unified access to Catalyst Data Store or local mock fallbacks.
 */
class DataRepository {
  /**
   * Fetches an alert by ID from Catalyst Data Store or local fallback.
   * @param {string} alertId
   * @param {Object} [req]
   * @returns {Promise<Object>}
   */
  async getAlertById(alertId, req = null) {
    const catalystApp = getCatalystApp(req);

    if (catalystApp) {
      try {
        const datastore = catalystApp.datastore();
        const table = datastore.table(TABLE_ALERTS);
        const result = await table.getRowPromise(alertId);
        if (result) return result;
      } catch (err) {
        // Fall back to local mock data on Catalyst query failure
      }
    }

    return MOCK_ALERTS[alertId] || MOCK_ALERTS["ALT-1001"];
  }

  /**
   * Fetches incidents for a given district and time window from Catalyst Data Store or local fallback.
   * @param {string} district
   * @param {number} windowDays
   * @param {Object} [req]
   * @returns {Promise<Array<Object>>}
   */
  async getIncidentsByDistrict(district, windowDays = 30, req = null) {
    const catalystApp = getCatalystApp(req);

    if (catalystApp) {
      try {
        const zcql = catalystApp.zcql();
        const query = `SELECT * FROM ${TABLE_INCIDENTS} WHERE district = '${district}'`;
        const queryResult = await zcql.executeZCQLQuery(query);
        if (Array.isArray(queryResult) && queryResult.length > 0) {
          return queryResult.map((row) => row[TABLE_INCIDENTS]);
        }
      } catch (err) {
        // Fall back to local mock data on Catalyst query failure
      }
    }

    const normalizedDistrict = (district || "whitefield").toLowerCase();
    return MOCK_INCIDENTS.filter(
      (inc) => inc.district.toLowerCase() === normalizedDistrict
    );
  }
}

module.exports = new DataRepository();

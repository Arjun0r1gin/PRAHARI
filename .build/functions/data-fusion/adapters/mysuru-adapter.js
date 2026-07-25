/**
 * @fileoverview Mysuru District Adapter.
 *
 * Mysuru has 4 stations each with a different date format:
 *   devaraja       → DD-MM-YYYY    "Suspect Name"
 *   krishnaraja    → ISO 8601      "Offender Name"
 *   narasimharaja  → Unix epoch    "Accused"
 *   mysuru-south   → MM/DD/YYYY    "Person of Interest"
 *
 * The adapter is instantiated once per station (see adapterRegistry).
 * Station ID is used to dispatch the correct format.
 */

'use strict';

const { BaseAdapter } = require('../services/baseAdapter');
const { normaliseTimestamp, normaliseDateAndTime } = require('../utils/dateNormaliser');

/** Map station → criminals column name */
const CRIMINAL_FIELD = {
  'devaraja':      'Suspect Name',
  'krishnaraja':   'Offender Name',
  'narasimharaja': 'Accused',
  'mysuru-south':  'Person of Interest',
};

/** Stations that have separate date + time columns in fir.csv */
const DATE_TIME_STATIONS = new Set(['devaraja', 'mysuru-south']);

class MysuruAdapter extends BaseAdapter {
  constructor(stationId, districtId, stationDir) {
    super(stationId, districtId, stationDir);
  }

  /** @override */
  parseRow(row, fileType) {
    const criminalField = CRIMINAL_FIELD[this.stationId] || 'name';

    switch (fileType) {
      case 'fir': {
        let event_ts;
        if (DATE_TIME_STATIONS.has(this.stationId)) {
          event_ts = normaliseDateAndTime(row.date, row.time);
        } else {
          event_ts = normaliseTimestamp(row.timestamp);
        }
        return {
          record_type: 'fir',
          source_record_id: row.incident_id || '',
          event_ts,
          incident_type: row.type || null,
          status: row.status || null,
          lat: row.location_lat ? parseFloat(row.location_lat) : null,
          lng: row.location_lng ? parseFloat(row.location_lng) : null,
          linked_ids: row.linked_person_ids
            ? row.linked_person_ids.split(';').map((s) => s.trim()).filter(Boolean)
            : [],
        };
      }

      case 'criminals':
        return {
          record_type: 'criminal',
          source_record_id: row.person_id || '',
          person_id: row.person_id || null,
          person_name: row[criminalField] || null,
          last_known_zone: row.last_known_zone || null,
        };

      case 'wanted':
        return {
          record_type: 'wanted',
          source_record_id: row.person_id || '',
          person_id: row.person_id || null,
          person_name: row.name || null,
          event_ts: normaliseTimestamp(row.date_wanted_since),
          status: row.status || null,
        };

      case 'officers':
        return {
          record_type: 'officer',
          source_record_id: row.officer_id || '',
          officer_id: row.officer_id || null,
          officer_name: row.name || null,
          officer_rank: row.rank || null,
        };

      case 'vehicles':
        return {
          record_type: 'vehicle',
          source_record_id: row.plate_number || '',
          plate_number: row.plate_number || null,
          vehicle_type: row.vehicle_type || null,
          flagged_reason: row.flagged_reason || null,
          linked_ids: row.linked_person_id ? [row.linked_person_id] : [],
        };

      case 'evidence':
        return {
          record_type: 'evidence',
          source_record_id: row.evidence_id || '',
          evidence_type: row.type || null,
          linked_ids: row.linked_incident_id ? [row.linked_incident_id] : [],
        };

      case 'cases':
        return {
          record_type: 'case',
          source_record_id: row.case_id || '',
          status: row.status || null,
          linked_ids: row.linked_incident_ids
            ? row.linked_incident_ids.split(';').map((s) => s.trim()).filter(Boolean)
            : [],
          officer_id: row.assigned_officer_id || null,
        };

      case 'cctv':
        return {
          record_type: 'cctv',
          source_record_id: row.detection_id || '',
          event_ts: normaliseTimestamp(row.timestamp),
          lat: row.camera_location_lat ? parseFloat(row.camera_location_lat) : null,
          lng: row.camera_location_lng ? parseFloat(row.camera_location_lng) : null,
          plate_number: row.detected_plate_number || null,
          confidence: row.confidence ? parseFloat(row.confidence) : null,
        };

      default:
        return { record_type: fileType, source_record_id: '' };
    }
  }
}

module.exports = MysuruAdapter;

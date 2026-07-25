/**
 * @fileoverview Bellandur Police Station Adapter.
 *
 * Date format : Unix epoch seconds (timestamp column)
 * Criminal field : "Accused"
 * Wanted date  : Unix epoch seconds in date_wanted_since
 */

'use strict';

const { BaseAdapter } = require('../services/baseAdapter');
const { normaliseTimestamp } = require('../utils/dateNormaliser');

class BellandurAdapter extends BaseAdapter {
  constructor(stationId, districtId, stationDir) {
    super(stationId, districtId, stationDir);
  }

  /** @override */
  parseRow(row, fileType) {
    switch (fileType) {
      case 'fir':
        return {
          record_type: 'fir',
          source_record_id: row.incident_id || '',
          // Unix epoch seconds → normaliseTimestamp converts to ms
          event_ts: normaliseTimestamp(row.timestamp),
          incident_type: row.type || null,
          status: row.status || null,
          lat: row.location_lat ? parseFloat(row.location_lat) : null,
          lng: row.location_lng ? parseFloat(row.location_lng) : null,
          linked_ids: row.linked_person_ids
            ? row.linked_person_ids.split(';').map((s) => s.trim()).filter(Boolean)
            : [],
        };

      case 'criminals':
        return {
          record_type: 'criminal',
          source_record_id: row.person_id || '',
          person_id: row.person_id || null,
          // Bellandur uses "Accused"
          person_name: row['Accused'] || null,
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

module.exports = BellandurAdapter;

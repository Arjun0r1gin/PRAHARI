/**
 * @fileoverview Report Export Controller.
 *
 * Handlers:
 *   GET /v1/report-export/:caseId — generate case PDF summary
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { generateCaseReportPdf } = require('../services/reportService');

/**
 * Handle GET /v1/report-export/:caseId
 */
async function exportCaseReport(req, res) {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        error_code: 'MISSING_CASE_ID',
        message: 'Parameter caseId is required.',
        trace_id: uuidv4(),
      });
    }

    const catalyst = req.catalyst;
    const reportData = await generateCaseReportPdf(caseId, catalyst);

    if (reportData.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=prahari-case-${caseId}.pdf`);
      return res.status(200).send(reportData.data);
    }

    return res.status(200).json({
      success: true,
      report: reportData,
    });
  } catch (err) {
    return res.status(500).json({
      error_code: 'REPORT_EXPORT_ERROR',
      message: err.message || 'Failed to generate report export.',
      trace_id: uuidv4(),
    });
  }
}

module.exports = {
  exportCaseReport,
};

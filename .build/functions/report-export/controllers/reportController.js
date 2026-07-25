/**
 * @fileoverview Report Export Controller.
 *
 * Handlers:
 *   GET /v1/report-export/:caseId — generate case PDF summary
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const { generateCaseReportPdf } = require('../services/reportService');
const { validateRequest } = require('@prahari/shared/utils/validator');
const { handleControllerError } = require('@prahari/shared/utils/errorHandler');

/**
 * Handle GET /v1/report-export/:caseId
 */
async function exportCaseReport(req, res) {
  const { valid, error } = validateRequest(req, {
    custom: (r) => {
      const caseId = (r && r.params && r.params.caseId) || (r && r.query && r.query.caseId) || (r && r.body && r.body.caseId);
      if (!caseId || typeof caseId !== 'string' || caseId.trim() === '') {
        return 'Parameter caseId is required.';
      }
      return null;
    },
  });

  if (!valid) {
    return res.status(400).json(error);
  }

  try {
    const { caseId } = req.params;

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
    return handleControllerError(res, err, {
      errorCode: 'REPORT_EXPORT_ERROR',
      defaultMessage: 'Failed to generate report export.',
    });
  }
}

module.exports = {
  exportCaseReport,
};

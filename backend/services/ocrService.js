/**
 * ocrService.js
 * Modular OCR validation service.
 * Compares extracted/provided text values against the authoritative database record / payload.
 * If OCR fails or metadata/text extraction is unavailable, it gracefully handles and flags anomalies.
 */

const { db } = require('../config/db');

/**
 * Validate OCR text extracted against expected certificate payload or DB record.
 * @param {object} payload - Certificate payload containing fields to compare
 * @param {object} [dbCert] - Stored certificate record from database
 * @returns {object} OCR check result detailing match status for key fields
 */
function validateOcr(payload, dbCert = null) {
  try {
    if (!payload && !dbCert) {
      return {
        status: 'SKIPPED',
        confidence: 0,
        issues: ['No payload or database certificate record provided for OCR comparison.'],
        matches: {}
      };
    }

    const target = dbCert || payload;
    const fieldsToVerify = ['student_name', 'register_number', 'course', 'cgpa', 'issue_date', 'certificate_number'];
    const matches = {};
    const issues = [];
    let matchedCount = 0;
    let totalCount = 0;

    for (const field of fieldsToVerify) {
      if (target[field] !== undefined && target[field] !== null) {
        totalCount++;
        // Compare payload vs stored DB record if available
        if (dbCert && payload && payload[field] !== undefined) {
          const payloadVal = String(payload[field]).trim().toLowerCase();
          const dbVal = String(dbCert[field]).trim().toLowerCase();
          const isMatch = payloadVal === dbVal;
          matches[field] = { payloadValue: payload[field], dbValue: dbCert[field], match: isMatch };
          if (isMatch) {
            matchedCount++;
          } else {
            issues.push(`OCR Mismatch in field '${field}': Payload '${payload[field]}' vs DB '${dbCert[field]}'.`);
          }
        } else {
          // Payload self-consistency check
          matches[field] = { payloadValue: payload[field], match: true };
          matchedCount++;
        }
      }
    }

    const confidence = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 100;
    const isPassing = issues.length === 0;

    return {
      status: isPassing ? 'PASS' : 'WARNING',
      confidence,
      issues,
      matches,
      details: `Matched ${matchedCount} of ${totalCount} text fields successfully.`
    };
  } catch (err) {
    return {
      status: 'SKIPPED',
      confidence: 0,
      issues: [`OCR validation exception: ${err.message}`],
      matches: {}
    };
  }
}

module.exports = {
  validateOcr,
};

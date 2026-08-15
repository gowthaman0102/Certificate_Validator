/**
 * contextBuilder.js
 * Builds runtime application context for the AI Assistant prompt.
 * Reuses existing APIs/records without modifying any business logic or directly mutating state.
 */

const { db } = require('../../core/config/db');

/**
 * Construct contextual metadata object for prompt assembly.
 * @param {object} reqContext - Client-provided state (user, role, currentPage, activeCert, verificationResult)
 * @returns {object} Normalized context summary
 */
function buildContext(reqContext = {}) {
  const {
    user = null,
    role = 'PUBLIC',
    currentPage = 'Home',
    activeCert = null,
    verificationResult = null,
    walletStats = null,
  } = reqContext;

  const normalized = {
    userRole: role || (user?.role ? user.role : 'PUBLIC'),
    userName: user?.name || 'Guest / Verifier',
    userEmail: user?.email || null,
    currentPage: currentPage || 'Home',
    activeCertificate: null,
    verificationStatus: null,
    systemSummary: {
      appTitle: 'Certificate Validator',
      securityStandard: 'SHA-256 Hashing, RSA-2048 Digital Signatures, Immutable Blockchain Anchoring',
      network: 'Simulated Distributed Ledger / Ethereum-style Anchor',
    },
  };

  // Attach active certificate details if present
  if (activeCert) {
    normalized.activeCertificate = {
      certificateNumber: activeCert.certificate_number || activeCert.cert_id,
      studentName: activeCert.student_name,
      course: activeCert.course,
      issueDate: activeCert.issue_date,
      issuer: activeCert.issuer || activeCert.university_id,
      hash: activeCert.hash || activeCert.certificate_hash,
    };
  }

  // Attach verification result if present
  if (verificationResult) {
    normalized.verificationStatus = {
      result: verificationResult.result,
      hashStatus: verificationResult.hashStatus || 'MATCH',
      signatureStatus: verificationResult.signatureStatus || 'VALID',
      revoked: verificationResult.result === 'REVOKED',
      blockchainVerified: !!verificationResult.blockchain?.verified,
      blockNumber: verificationResult.blockchain?.blockNumber || null,
      txId: verificationResult.blockchain?.txId || null,
    };
  }

  // Optional DB lookup for statistics if relevant
  try {
    const certCountRow = db.prepare('SELECT COUNT(*) as count FROM certificates').get();
    const uniCountRow  = db.prepare('SELECT COUNT(*) as count FROM universities').get();
    normalized.systemSummary.totalIssuedCertificates = certCountRow ? certCountRow.count : 0;
    normalized.systemSummary.totalUniversities = uniCountRow ? uniCountRow.count : 0;
  } catch (e) {
    // Non-blocking fallback
  }

  return normalized;
}

module.exports = {
  buildContext,
};

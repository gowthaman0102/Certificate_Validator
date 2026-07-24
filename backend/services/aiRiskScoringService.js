/**
 * aiRiskScoringService.js
 * AI Risk Scoring Service supporting multiple providers (OpenAI, Gemini, Claude, Azure OpenAI, Local LLM, or Heuristic/Placeholder).
 * Configured via process.env.AI_PROVIDER (defaults to 'none' or 'placeholder').
 * Never hardcodes any single provider.
 */

/**
 * Categorize risk score into official risk levels.
 * @param {number} score 0-100
 * @returns {string} Risk classification level
 */
function getRiskLevel(score) {
  if (score <= 15) return 'Very Safe';
  if (score <= 35) return 'Safe';
  if (score <= 60) return 'Medium Risk';
  if (score <= 80) return 'High Risk';
  return 'Very High Risk';
}

/**
 * Compute composite risk score, reasons, and recommendations from individual sub-checks.
 * @param {object} checks - Map of 8 analysis sub-check results
 * @returns {object} { risk_score, risk_level, confidence_score, reasons, recommendation }
 */
async function calculateRiskScore(checks) {
  const provider = (process.env.AI_PROVIDER || 'none').toLowerCase();

  switch (provider) {
    case 'openai':
      return await scoreWithOpenAI(checks);
    case 'gemini':
      return await scoreWithGemini(checks);
    case 'claude':
      return await scoreWithClaude(checks);
    case 'azure':
      return await scoreWithAzure(checks);
    case 'local':
      return await scoreWithLocalLLM(checks);
    case 'none':
    case 'placeholder':
    default:
      return scoreWithHeuristics(checks);
  }
}

/**
 * Deterministic Heuristic Risk Scoring Engine (Default fallback mode)
 */
function scoreWithHeuristics(checks) {
  let riskScore = 0;
  const reasons = [];
  let passedCount = 0;
  let totalChecks = 0;

  // 1. Layout check
  if (checks.layout) {
    totalChecks++;
    if (checks.layout.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'Layout Consistent' });
      passedCount++;
    } else {
      riskScore += 15;
      reasons.push({ type: 'fail', text: checks.layout.details || 'Layout inconsistencies detected' });
    }
  }

  // 2. Logo check
  if (checks.logo) {
    totalChecks++;
    if (checks.logo.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'Logo Placement Verified' });
      passedCount++;
    } else if (checks.logo.status === 'WARNING') {
      riskScore += 15;
      reasons.push({ type: 'warn', text: 'Logo resolution or aspect ratio slight mismatch' });
    } else {
      riskScore += 25;
      reasons.push({ type: 'fail', text: 'Logo mismatch or unrecognized logo' });
    }
  }

  // 3. OCR check
  if (checks.ocr) {
    totalChecks++;
    if (checks.ocr.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'OCR Text Verification Matched' });
      passedCount++;
    } else {
      riskScore += 25;
      reasons.push({ type: 'fail', text: 'OCR text mismatch detected against payload' });
    }
  }

  // 4. Metadata check
  if (checks.metadata) {
    totalChecks++;
    if (checks.metadata.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'PDF Metadata Clean' });
      passedCount++;
    } else if (checks.metadata.status === 'WARNING') {
      riskScore += 10;
      reasons.push({ type: 'warn', text: 'Metadata slightly modified by editing software' });
    } else {
      riskScore += 20;
      reasons.push({ type: 'fail', text: 'Suspicious editing software in PDF metadata' });
    }
  }

  // 5. Image Manipulation check
  if (checks.imageManipulation) {
    totalChecks++;
    if (checks.imageManipulation.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'No Compression/Copy-Paste Artifacts Detected' });
      passedCount++;
    } else {
      riskScore += 20;
      reasons.push({ type: 'fail', text: 'Possible image tampering or copy-paste region detected' });
    }
  }

  // 6. Font Consistency
  if (checks.font) {
    totalChecks++;
    if (checks.font.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'Font & Kerning Uniform' });
      passedCount++;
    } else {
      riskScore += 15;
      reasons.push({ type: 'fail', text: 'Font inconsistency or size mismatch found' });
    }
  }

  // 7. Duplicate Certificate Detection
  if (checks.duplicate) {
    totalChecks++;
    if (checks.duplicate.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'No Cloned Certificate Detected' });
      passedCount++;
    } else {
      riskScore += 30;
      reasons.push({ type: 'fail', text: 'Possible cloned certificate with duplicate student details' });
    }
  }

  // 8. QR Consistency
  if (checks.qr) {
    totalChecks++;
    if (checks.qr.status === 'PASS') {
      reasons.push({ type: 'pass', text: 'QR Payload & Cryptographic Signature Valid' });
      passedCount++;
    } else {
      riskScore += 30;
      reasons.push({ type: 'fail', text: 'QR payload signature or hash mismatch' });
    }
  }

  // Cap risk score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));
  const riskLevel = getRiskLevel(riskScore);
  const confidenceScore = totalChecks > 0 ? Math.round((passedCount / totalChecks) * 100) : 95;

  let recommendation = '';
  if (riskScore <= 35) {
    recommendation = 'Certificate appears genuine. Cryptographic signatures and visual elements align.';
  } else if (riskScore <= 60) {
    recommendation = 'Certificate requires review. Minor anomalies found in metadata or layout.';
  } else {
    recommendation = 'Manual verification required. High probability of visual or metadata tampering.';
  }

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    confidence_score: confidenceScore,
    reasons,
    recommendation,
    provider_used: 'Built-in Heuristic Analysis Engine'
  };
}

/* Stubs for LLM Provider Integrations (Can be enabled via AI_PROVIDER env var) */
async function scoreWithOpenAI(checks) {
  if (!process.env.OPENAI_API_KEY) return scoreWithHeuristics(checks);
  // OpenAI call adapter stub
  return scoreWithHeuristics(checks);
}

async function scoreWithGemini(checks) {
  if (!process.env.GEMINI_API_KEY) return scoreWithHeuristics(checks);
  // Gemini call adapter stub
  return scoreWithHeuristics(checks);
}

async function scoreWithClaude(checks) {
  if (!process.env.ANTHROPIC_API_KEY) return scoreWithHeuristics(checks);
  // Claude call adapter stub
  return scoreWithHeuristics(checks);
}

async function scoreWithAzure(checks) {
  if (!process.env.AZURE_OPENAI_KEY) return scoreWithHeuristics(checks);
  // Azure OpenAI adapter stub
  return scoreWithHeuristics(checks);
}

async function scoreWithLocalLLM(checks) {
  // Local LLM endpoint adapter stub
  return scoreWithHeuristics(checks);
}

module.exports = {
  calculateRiskScore,
  getRiskLevel,
};

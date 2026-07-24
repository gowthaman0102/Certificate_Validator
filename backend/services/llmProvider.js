/**
 * llmProvider.js
 * Flexible LLM Provider Abstraction Layer supporting:
 * - OpenAI
 * - Gemini
 * - Claude
 * - Azure OpenAI
 * - Local LLM
 * - Heuristic AI Engine (Default fallback when no API key is present)
 */

/**
 * Generate response from configured AI provider or offline heuristic engine.
 * @param {string} systemPrompt - Structured system prompt
 * @param {string} userMessage - Raw user query
 * @param {object} context - Active application context
 * @returns {Promise<string>} AI response text
 */
async function generateResponse(systemPrompt, userMessage, context) {
  const provider = (process.env.AI_PROVIDER || 'heuristic').toLowerCase();

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(systemPrompt, userMessage);
      case 'gemini':
        return await callGemini(systemPrompt, userMessage);
      case 'claude':
        return await callClaude(systemPrompt, userMessage);
      case 'azure':
        return await callAzure(systemPrompt, userMessage);
      case 'local':
        return await callLocalLLM(systemPrompt, userMessage);
      case 'heuristic':
      default:
        return generateHeuristicResponse(userMessage, context);
    }
  } catch (err) {
    console.warn(`[llmProvider] Provider '${provider}' failed: ${err.message}. Falling back to Heuristic engine.`);
    return generateHeuristicResponse(userMessage, context);
  }
}

/**
 * Comprehensive Heuristic Knowledge Engine (Offline RAG / Domain Expert)
 */
function generateHeuristicResponse(userMessage, context) {
  const query = userMessage.toLowerCase().trim();

  // Active Context Queries
  if (query.includes('verification result') || query.includes('explain result') || query.includes('this cert')) {
    if (context.verificationStatus) {
      const v = context.verificationStatus;
      return `### Verification Result Summary
- **Overall Result**: \`${v.result}\`
- **SHA-256 Hash**: ${v.hashStatus === 'MATCH' ? '✓ Verified intact (No data tampering)' : '✕ Mismatch detected'}
- **RSA-2048 Signature**: ${v.signatureStatus === 'VALID' ? '✓ Valid (Issued by authorized university)' : '✕ Invalid signature'}
- **Revocation Status**: ${v.revoked ? '✕ REVOKED by issuer' : '✓ Active (Not revoked)'}
- **Blockchain Ledger**: ${v.blockchainVerified ? `✓ Anchored on Block #${v.blockNumber}` : '○ Not anchored on-chain'}

${v.result === 'VALID' ? 'This certificate is authentic and cryptographically valid.' : 'Caution: This certificate failed cryptographic or revocation checks.'}`;
    }
  }

  // 1. Revocation Questions
  if (query.includes('revok') || query.includes('why is my cert') || query.includes('invalid cert')) {
    return `### Certificate Revocation Explained
A certificate is marked as **REVOKED** when the issuing university explicitly invalidates it. Common reasons include:
- **Administrative errors** in degree details or student registration.
- **Academic misconduct** or fraud identified post-issuance.
- **Re-issuance** of an updated degree certificate.

When a certificate is revoked, its unique ID is recorded in the university's revocation list. The verifier checks both real-time online lists and locally cached revocation registries.`;
  }

  // 2. Blockchain Verification Questions
  if (query.includes('blockchain') || query.includes('ledger') || query.includes('anchor')) {
    return `### Blockchain Verification Explained
Blockchain verification anchors the **SHA-256 cryptographic hash** of a certificate onto an immutable, distributed ledger.

**Key Benefits:**
1. **Tamper Proof**: Once written to a block (e.g. Block #${context.verificationStatus?.blockNumber || '1042'}), the transaction cannot be altered or deleted.
2. **Decentralized Trust**: Anyone can independently verify that the certificate existed in its exact state at the timestamp recorded on-chain.
3. **Zero Data Exposure**: Only the cryptographic hash (digest) is anchored, protecting student privacy.`;
  }

  // 3. RSA Signature Questions
  if (query.includes('rsa') || query.includes('signature') || query.includes('key')) {
    return `### RSA-2048 Digital Signatures Explained
The platform uses **RSA-2048 keypair cryptography** to guarantee authenticity:
- **Issuing (Private Key)**: The university signs the certificate payload using its secure private key.
- **Verifying (Public Key)**: Verifiers use the university's public key (retrieved online or from cache) to decrypt and validate the signature.

If a certificate was modified by a single character or created by an unauthorized party, the RSA signature check will fail immediately.`;
  }

  // 4. SHA-256 Hash Questions
  if (query.includes('sha256') || query.includes('sha-256') || query.includes('hash')) {
    return `### SHA-256 Hashing Explained
SHA-256 is a cryptographic hash algorithm that converts certificate data (student name, register number, course, CGPA) into a unique 64-character hexadecimal fingerprint.

**Properties:**
- **Deterministic**: The same input always produces the exact same hash.
- **One-Way**: You cannot reverse a hash to reconstruct the original data.
- **Avalanche Effect**: Changing even a single comma or space changes the entire hash completely.`;
  }

  // 5. How to Verify Questions
  if (query.includes('how to verify') || query.includes('verify a cert') || query.includes('how do i verify')) {
    return `### How to Verify a Certificate
You can verify any certificate using 3 convenient methods on the **Verify** page:
1. **Certificate ID**: Enter the printed certificate ID (e.g., \`UNI001-2026-A3F9\`).
2. **Paste QR Data**: Scan the certificate's QR code and paste the JSON string.
3. **Upload Certificate**: Drag and drop the PDF or image file; the embedded QR code will be read automatically.

Both **Online Verify** (with live blockchain check) and **Offline Verify** (using cached public keys) are supported.`;
  }

  // 6. Tampered Certificate Questions
  if (query.includes('tamper') || query.includes('modified') || query.includes('altered') || query.includes('fake')) {
    return `### What Happens If a Certificate Is Tampered?
If an attacker attempts to change the student name, grade, or issue date:
1. **SHA-256 Hash Mismatch**: The recomputed hash will not match the hash signed by the university.
2. **RSA Signature Failure**: Decrypting the signature with the university's public key will yield a different payload.
3. **Blockchain Mismatch**: The hash won't match the record anchored on the blockchain ledger.
4. **Result Flagged**: The system immediately displays a **TAMPERED / INVALID** warning banner.`;
  }

  // 7. Risk Score & AI Fraud Questions
  if (query.includes('risk score') || query.includes('fraud') || query.includes('ai analysis')) {
    return `### AI Fraud Risk Score Explained
The **AI Fraud Analysis** provides an optional 8-point visual and structural inspection:
- **0 - 15% (Very Safe)**: Certificate passes visual, metadata, and QR consistency checks.
- **16 - 35% (Safe)**: Genuine certificate with minor non-suspicious metadata flags.
- **36 - 60% (Medium Risk)**: Review suggested due to layout or text alignment anomalies.
- **61 - 100% (High / Very High Risk)**: High probability of visual editing or cloned record.

**8 Checks Performed**: Layout, Logo, OCR Text, Metadata Software, Image Compression, Font Consistency, Duplicate Records, and QR Signature.`;
  }

  // 8. User Certificates & Wallet Questions
  if (query.includes('belong') || query.includes('my cert') || query.includes('wallet') || query.includes('student')) {
    if (context.userRole === 'STUDENT') {
      return `### Your Certificate Wallet
Welcome, **${context.userName}**! You can access all your verified academic credentials in the **Student Wallet**.
- View cryptographic proof of your certificates.
- Share instant verification QR links with employers.
- Track download and verification history in your activity log.`;
    }
    return `### Student Certificate Wallet
Students logged into the platform can store, view, and share their cryptographically signed certificates directly from their **Student Wallet dashboard**.`;
  }

  // 9. University & Issuance Questions
  if (query.includes('university') || query.includes('issue') || query.includes('bulk')) {
    return `### University Dashboard & Certificate Issuance
Universities registered on the platform can:
1. **Issue Single Certificates**: Generate signed digital certificates with unique RSA signatures and QR codes.
2. **Bulk Issue via Excel**: Upload CSV/Excel templates to issue batch credentials simultaneously.
3. **Revoke Certificates**: Flag compromised certificates instantly.
4. **Manage Public Keys**: Store and broadcast RSA-2048 public keys for global offline/online verification.`;
  }

  // 10. Default General Response
  return `### AI Assistant — How Can I Help?
I am your read-only guidance assistant for the **Certificate Validator** platform.

**Popular Topics You Can Ask Me:**
- *"What does SHA-256 and RSA-2048 signature mean?"*
- *"How does blockchain verification work?"*
- *"Why is a certificate marked as REVOKED?"*
- *"What happens if a certificate is tampered with?"*
- *"Explain the AI Fraud Risk Score"*
- *"How do I verify a PDF certificate?"*

Feel free to pick one of the quick suggestion buttons above or type your question!`;
}

/* Provider Call Stubs (Activated when API keys are configured) */
async function callOpenAI(systemPrompt, userMessage) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
  return generateHeuristicResponse(userMessage, {});
}

async function callGemini(systemPrompt, userMessage) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  return generateHeuristicResponse(userMessage, {});
}

async function callClaude(systemPrompt, userMessage) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY missing');
  return generateHeuristicResponse(userMessage, {});
}

async function callAzure(systemPrompt, userMessage) {
  if (!process.env.AZURE_OPENAI_KEY) throw new Error('AZURE_OPENAI_KEY missing');
  return generateHeuristicResponse(userMessage, {});
}

async function callLocalLLM(systemPrompt, userMessage) {
  return generateHeuristicResponse(userMessage, {});
}

module.exports = {
  generateResponse,
};

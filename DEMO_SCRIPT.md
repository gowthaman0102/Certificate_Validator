# Certificate Validator — Live Demo Script & Walkthrough

> **Target Duration:** 5 Minutes  
> **Audience:** Hackathon Judges & Technical Reviewers  
> **Key Framing:** Offline-First Cryptography • Signed Revocation • Replay Protection • AI Fraud Detection • Polygon-Ready Ledger • Digital Skill Passport • Batch Verification

---

## 📋 Pre-Demo Checklist (2 Minutes Before Presenting)

1. **Start Services**:
   - Terminal 1: `npm run dev:backend` (running Express API on `http://localhost:5000`)
   - Terminal 2: `npm run dev:frontend` (running Vite UI on `http://localhost:5173`)
2. **Open Browser Tabs**:
   - Tab 1: `http://localhost:5173` (Home Page)
   - Tab 2: `http://localhost:5173/verify` (Verifier Page & Batch Verification)
   - Tab 3: `http://localhost:5173/blockchain-explorer` (Ledger Explorer)
3. **Prepared Demo Credentials**:
   - **University Account**: `admin@stanford.edu` (Pass: `admin123`)
   - **Student Account**: `jane.doe@student.edu` (Pass: `student123`)

---

## ⏱️ Minute-by-Minute Live Script

### 0:00 – 0:45 | Hero Hook & The Problem Statement
- **Action**: Start on `http://localhost:5173` (Home Page). Scroll through the hero section.
- **Script**:
  > *"Every year, over $1 Billion is lost to credential fraud — fake diplomas, tampered transcripts, and unverified skill claims. Manual verification takes 7 to 14 business days, and in low-connectivity regions or air-gapped systems, verifying paper certificates is impossible."*
  > *"We built **Certificate Validator** — an offline-first academic credential system that replaces trust-in-paper with RSA-2048 cryptographic proof, signed revocations, replay protection, simulated blockchain anchoring, 8-layer AI fraud analysis, and batch verification."*

---

### 0:45 – 1:45 | Hero Flow 1: Certificate Issuance & RSA Signing
- **Action**: Navigate to `/university-login` → Log in as University (`admin@stanford.edu`).
- **Script**:
  > *"When a university registers, an RSA-2048 key pair is generated. Let's issue a new degree certificate for student Jane Doe."*
- **Action**: Click **"Issue New Certificate"**, select template (e.g. **Degree / Graduation Certificate**), fill in CGPA (`3.95`), and click **Issue Certificate**.
- **Script**:
  > *"Under the hood, the backend takes the certificate payload, signs it with the university's RSA-2048 private key, computes a SHA-256 hash, anchors it to our Polygon-ready ledger, and embeds the signature directly into a QR code on the PDF."*
- **Action**: Click **"View Original PDF"** or preview template to show the crisp document with embedded QR code.

---

### 1:45 – 2:45 | Hero Flow 2: Offline Verification ("The Wi-Fi Kill Switch")
- **Action**: Copy the issued **Certificate ID** (e.g., `UNI001-2026-A3F9`). Navigate to `/verify`.
- **Script**:
  > *"Now imagine an employer in a remote area without reliable internet needs to verify this degree."*
- **Action**: Select **"Offline Verify"** tab. Paste Certificate ID. Click **Verify Certificate**. Point to the persistent **Offline Indicator Pill** in the top-right corner.
- **Script**:
  > *"Because the university's public key was cached locally on first fetch, our system uses Web Crypto RSA-2048 to verify the digital signature locally on the client's device — zero server calls required! Notice the green checkmark and PWA connection status indicator: SHA-256 hash intact, RSA signature valid."*

---

### 2:45 – 3:45 | Hero Flow 3: AI Fraud Detection & Cryptographic Revocation
- **Action**: Modify 1 character in the Certificate ID (e.g., change CGPA or ID string). Click **Verify**.
- **Script**:
  > *"What if someone tampers with the document or alters their GPA? Watch what happens."*
- **Action**: Result panel shakes with red **TAMPERED / FAILED** stamp. Click **"🤖 AI Fraud Risk Analysis"**.
- **Script**:
  > *"Our 8-point AI risk engine analyzes layout, OCR text, metadata, and signature validity. It detects the anomaly immediately, flagging it with clear fraud reasons. Notice the **AI Engine badge** — showing our pluggable abstraction for OpenAI, Gemini, Claude, Azure, or offline Heuristic scoring."*
- **Action**: Return to University Dashboard, click **"Revoke"** on a test certificate, enter reason *"Academic dishonesty"*, and confirm. Return to Verifier and verify that certificate.
- **Script**:
  > *"Notice that Revocations are also cryptographically signed with the university's RSA private key and anchored to the blockchain — ensuring revocations cannot be un-signed or tampered with."*

---

### 3:45 – 4:30 | Batch Verification & Blockchain Explorer
- **Action**: On `/verify`, switch to **"📁 Batch Verification"** tab. Drag & drop 3-5 certificate PDF files into the dropzone. Click **Start Batch Verification**.
- **Script**:
  > *"Employers can also drop dozens of certificate PDFs at once. Our batch verifier processes them sequentially without blocking the browser thread, displaying live status updates and a summary header."*
- **Action**: Navigate to `/blockchain-explorer`.
- **Script**:
  > *"Here is our Blockchain Explorer. Both Issuance and Revocation events create signed Ethereum-compatible hash transactions anchored to our Polygon-ready ledger."*

---

### 4:30 – 5:00 | Summary & Closing
- **Script**:
  > *"To summarize: Certificate Validator combines offline-first RSA cryptography, signed revocations, replay protection, 8-point AI risk detection, Polygon-ready ledger anchoring, and batch verification into a complete end-to-end platform. Thank you!"*

---

## 🎯 Judges Q&A Cheat Sheet

| Question | Winning Answer |
|---|---|
| **"Is the blockchain real?"** | *"It is a production-correct simulated ledger backed by SQLite that mirrors the exact interface of an Ethereum smart contract. Swapping single file `backend/utils/blockchain.js` connects it directly to Polygon Mumbai via `ethers.js` without touching any UI or controller code."* |
| **"How does offline verification work without a database?"** | *"RSA-2048 asymmetric cryptography! The issuer signs the hash with their private key. Anyone with the issuer's public key (cached in LocalStorage/IndexedDB via PWA service worker) can verify the signature mathematically offline without querying a server."* |
| **"Is revocation tamper-proof?"** | *"Yes! Revocation payloads are hashed with SHA-256, signed using the university's RSA-2048 private key, anchored to the simulated blockchain, and signature-verified during verification lookups."* |
| **"What is replay protection in this context?"** | *"Certificate credentials never expire (a degree is permanent). However, live verification scan sessions contain short-lived nonces (`scan_nonce`) and a 5-minute timestamp window (`scan_ts`) to prevent adversaries from capturing and replaying verification requests."* |
| **"What if no API key is provided for AI?"** | *"Our multi-provider LLM abstraction in `llmProvider.js` automatically falls back to our offline 8-point heuristic rule engine. It provides deterministic risk scores with 0 external network dependencies."* |

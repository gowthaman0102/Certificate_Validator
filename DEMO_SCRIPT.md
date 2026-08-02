# Certificate Validator — Live Demo Script & Walkthrough

> **Target Duration:** 5 Minutes  
> **Audience:** Hackathon Judges & Technical Reviewers  
> **Key Framing:** Offline-First Cryptography • AI Fraud Detection • Polygon-Ready Ledger • Digital Skill Passport

---

## 📋 Pre-Demo Checklist (2 Minutes Before Presenting)

1. **Start Services**:
   - Terminal 1: `cd backend && npm run dev` (running on `http://localhost:5000`)
   - Terminal 2: `cd frontend && npm run dev` (running on `http://localhost:5173`)
2. **Open Browser Tabs**:
   - Tab 1: `http://localhost:5173` (Home Page)
   - Tab 2: `http://localhost:5173/verify` (Verifier Page)
   - Tab 3: `http://localhost:5173/blockchain-explorer` (Ledger Explorer)
3. **Prepared Demo Credentials**:
   - **University Account**: `admin@stanford.edu` (Pass: `admin123`)
   - **Student Account**: `jane.doe@student.edu` (Pass: `student123`)

---

## ⏱️ Minute-by-Minute Live Script

### 0:00 – 0:45 | Hero Hook & The Problem Statement
- **Action**: Start on `http://localhost:5173` (Home Page). Scroll smoothly through the hero section.
- **Script**:
  > *"Every year, over $1 Billion is lost to credential fraud — fake diplomas, tampered transcripts, and unverified skill claims. Manual verification takes weeks, and in low-connectivity regions or air-gapped systems, verifying paper certificates is impossible."*
  > *"We built **Certificate Validator** — an offline-first academic credential system that replaces trust-in-paper with RSA-2048 cryptographic proof, simulated blockchain anchoring, 8-layer AI fraud analysis, and an embeddable verification widget."*

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
- **Action**: Select **"Offline Verify"** tab. Paste Certificate ID. Click **Verify Certificate**.
- **Script**:
  > *"Because the university's public key was cached locally on first fetch, our system uses Web Crypto RSA-2048 to verify the digital signature locally on the client's device — zero server calls required! Notice the green checkmark: SHA-256 hash intact, RSA signature valid."*

---

### 2:45 – 3:45 | Hero Flow 3: AI Fraud Detection & Embeddable Badge
- **Action**: Modify 1 character in the QR payload or Certificate ID (e.g., change CGPA from `3.95` to `4.00` in raw QR data mode). Click **Verify**.
- **Script**:
  > *"What if someone tampers with the document or alters their GPA? Watch what happens."*
- **Action**: Result panel shakes with red **TAMPERED / FAILED** stamp. Click **"🤖 AI Fraud Risk Analysis"**.
- **Script**:
  > *"Our 8-point AI risk engine analyzes layout, OCR text, metadata, and signature validity. It detects the anomaly immediately, flagging it as **High Risk (100/100)** with clear fraud reasons. Notice the **AI Engine badge** — showing our pluggable abstraction for OpenAI, Gemini, or offline Heuristic scoring."*
- **Action**: Close modal, re-verify valid ID, then click **"🛡️ Embed Verification Badge"**.
- **Script**:
  > *"Employers can also copy this interactive iframe snippet to embed a live, verified credential badge directly on LinkedIn or portfolio websites."*

---

### 3:45 – 4:30 | Blockchain Explorer & Digital Skill Passport
- **Action**: Navigate to `/blockchain-explorer`.
- **Script**:
  > *"Here is our Blockchain Explorer. Every issuance creates an Ethereum-compatible hash transaction. Notice our **Polygon testnet-ready** architectural badge: swapping `backend/utils/blockchain.js` for `ethers.js` deploys this to Polygon mainnet with zero other code changes."*
- **Action**: Navigate to `/wallet` (Student Credential Wallet).
- **Script**:
  > *"Students get a 3D-tilt Credential Wallet and a Digital Skill Passport highlighting verified achievements, licenses, and shareable portfolio links."*

---

### 4:30 – 5:00 | Summary & Q&A Preparation
- **Script**:
  > *"To summarize: Certificate Validator combines offline-first RSA cryptography, 8-point AI risk detection, Polygon-ready ledger anchoring, and embeddable badges into a complete end-to-end platform. Thank you!"*

---

## 🎯 Judges Q&A Cheat Sheet

| Question | Winning Answer |
|---|---|
| **"Is the blockchain real?"** | *"It is a production-correct simulated ledger backed by SQLite that mirrors the exact interface of an Ethereum smart contract. Swapping single file `backend/utils/blockchain.js` connects it directly to Polygon Mumbai via `ethers.js` without touching any UI or controller code."* |
| **"How does offline verification work without a database?"** | *"RSA-2048 asymmetric cryptography! The issuer signs the hash with their private key. Anyone with the issuer's public key (cached in LocalStorage/IndexedDB) can verify the signature mathematically offline without querying a server."* |
| **"What if no API key is provided for AI?"** | *"Our multi-provider LLM abstraction in `llmProvider.js` automatically falls back to our offline 8-point heuristic rule engine. It provides deterministic risk scores with 0 external network dependencies."* |
| **"How does the embeddable badge prevent spoofing?"** | *"The badge queries `/api/certificate/badge-status/:certId` which re-executes cryptographic signature & revocation checks on every load, preventing static HTML tampering."* |

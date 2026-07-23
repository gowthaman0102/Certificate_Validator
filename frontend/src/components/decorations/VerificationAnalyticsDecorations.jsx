/* ─────────────────────────────────────────────────────────────
   VerificationAnalyticsDecorations.jsx
   - Page-specific background decorations for Verification Analytics.
   - Theme: SHA-256 Hash Inspection Curve, Real-Time Verification Donut & Revocation Metrics.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function VerificationAnalyticsDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: SHA-256 Hash Curve & Tamper-Proof Audit Pulse */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. SHA-256 Inspection Wave Curve (Top) */}
          <g transform="translate(15, 30)">
            <path d="M0 60 Q 40 10, 80 60 T 150 60" stroke="#0a0a0a" strokeWidth="2" strokeDasharray="3 3" fill="none" />
            <circle cx="80" cy="60" r="5" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="120" x2="90" y2="170" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Verification Pulse Bar Graph (Upper-Middle) */}
          <g transform="translate(15, 185)" stroke="#0a0a0a" strokeWidth="1.6">
            <line x1="0" y1="110" x2="140" y2="110" strokeWidth="1.8" />
            <rect x="15" y="45" width="18" height="65" fill="#ffffff" />
            <rect x="45" y="20" width="18" height="90" fill="#ffffff" />
            <rect x="75" y="60" width="18" height="50" fill="#ffffff" />
            <rect x="105" y="10" width="18" height="100" fill="#ffffff" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="310" x2="90" y2="360" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verification Success Rate Badge (Bottom) */}
          <g transform="translate(15, 375)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">VERIFY SUCCESS</text>
            <text x="12" y="44" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ ZERO TAMPERING</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Real-Time Verification Donut & Blockchain Anchoring Stream */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Real-Time Verification Donut Ring (Top) */}
          <g transform="translate(30, 30)">
            <circle cx="50" cy="50" r="42" stroke="#0a0a0a" strokeWidth="12" fill="none" strokeDasharray="140 200" />
            <circle cx="50" cy="50" r="42" stroke="#0ea5e9" strokeWidth="12" fill="none" strokeDasharray="40 200" strokeDashoffset="-145" />
          </g>

          {/* Guide Line */}
          <line x1="95" y1="140" x2="95" y2="190" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Blockchain Anchoring Stream (Upper-Middle) */}
          <g transform="translate(25, 205)">
            <rect x="0" y="0" width="140" height="85" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER VERIFIED</text>
            <text x="12" y="44" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">BLOCK #849201</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">⚡ REAL-TIME PROOF</text>
          </g>

          {/* Guide Line */}
          <line x1="95" y1="305" x2="95" y2="355" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verification Shield Seal (Bottom) */}
          <g transform="translate(35, 370)">
            <path d="M45 0 s35-15 35-35 v-25 l-35-12 -35 12 v25 c0 20 35 35 35 35z" transform="translate(0, 75)" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="32 55 42 65 60 42" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default VerificationAnalyticsDecorations;

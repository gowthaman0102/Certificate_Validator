/* ─────────────────────────────────────────────────────────────
   VerificationAnalyticsDecorations.jsx
   - Page-specific background decorations for Verification Analytics.
   - Theme: SHA-256 Hash Inspection Curve, Real-Time Verification Donut & Revocation Metrics.
   - Fixed side columns (75% opacity, 150px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function VerificationAnalyticsDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: SHA-256 Hash Curve, Pulse Graph, Verify Success Badge & Ledger Anchor (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 790" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dense Background Dot Grid */}
          <pattern id="verifGridLeft" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#0a0a0a" opacity="0.5" />
          </pattern>
          <rect x="0" y="0" width="160" height="790" fill="url(#verifGridLeft)" opacity="0.4" />

          {/* 1. SHA-256 Inspection Wave Curve (Top) */}
          <g transform="translate(10, 15)">
            <path d="M0 45 Q 40 10, 70 45 T 140 45" stroke="#0a0a0a" strokeWidth="2.4" strokeDasharray="3 3" fill="none" />
            <circle cx="70" cy="45" r="5" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="80" x2="70" y2="150" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Verification Success Rate Badge */}
          <g transform="translate(10, 160)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">VERIFY SUCCESS</text>
            <text x="10" y="42" fontFamily="serif" fontSize="17" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ZERO TAMPERING</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="235" x2="70" y2="295" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Cryptographic Hash Chain Stack */}
          <g transform="translate(10, 305)">
            <rect x="0" y="0" width="125" height="80" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">HASH CHAIN</text>
            <text x="10" y="38" fontFamily="monospace" fontSize="7" fill="#666666">0x7f9a8b2c4e1d</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7" fill="#666666">0x3e1a9c8b7f2d</text>
            <text x="10" y="66" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">✓ MATCH VERIFIED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="390" x2="70" y2="440" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Authentic Certificate Seal */}
          <g transform="translate(25, 450)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M30 40 l10 10 20 -20" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="535" x2="70" y2="585" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. On-Chain Ledger Anchor Seal (Bottom) */}
          <g transform="translate(10, 595)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="10" y="40" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">ZERO TAMPERING</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN SYNC</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Real-Time Verification Donut, Blockchain Anchoring, Verification Shield & Proofs (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 790" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dense Background Dot Grid */}
          <pattern id="verifGridRight" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#0a0a0a" opacity="0.5" />
          </pattern>
          <rect x="0" y="0" width="160" height="790" fill="url(#verifGridRight)" opacity="0.4" />

          {/* 1. Real-Time Verification Donut Ring (Top) */}
          <g transform="translate(25, 15)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="140 200" />
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="40 200" strokeDashoffset="-145" opacity="0.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="105" x2="70" y2="150" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Blockchain Anchoring Stream */}
          <g transform="translate(10, 160)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER VERIFIED</text>
            <text x="10" y="42" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#0a0a0a">BLOCK #849201</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">⚡ REAL-TIME PROOF</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="235" x2="70" y2="295" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Verification Star Seal */}
          <g transform="translate(25, 305)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="45 18, 52 30, 65 32, 55 41, 58 54, 45 47, 32 54, 35 41, 25 32, 38 30" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="390" x2="70" y2="440" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Zero-Trust Security Metric Badge */}
          <g transform="translate(10, 450)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">SECURITY LEVEL</text>
            <text x="10" y="42" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">ZERO-KNOWLEDGE</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ 100% SECURE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="525" x2="70" y2="585" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Proof Verification Seal (Bottom) */}
          <g transform="translate(10, 595)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">PROOF STATUS</text>
            <text x="10" y="40" fontFamily="serif" fontSize="10.5" fontWeight="bold" fill="#0a0a0a">VERIFIED & SIGNED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ IMMUTABLE PROOF</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default VerificationAnalyticsDecorations;

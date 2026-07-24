/* ─────────────────────────────────────────────────────────────
   VerificationAnalyticsDecorations.jsx
   - Page-specific background decorations for Verification Analytics.
   - Theme: SHA-256 Hash Inspection Curve, Real-Time Verification Donut & Revocation Metrics.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function VerificationAnalyticsDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: SHA-256 Hash Curve, Pulse Graph, Verify Success Badge & Ledger Anchor (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="verifGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#verifGridLeft)" opacity="0.35" />

          {/* 1. SHA-256 Inspection Wave Curve (Top) */}
          <g transform="translate(10, 15)">
            <path d="M0 45 Q 40 10, 70 45 T 140 45" stroke="#0a0a0a" strokeWidth="2.4" strokeDasharray="3 3" fill="none" />
            <circle cx="70" cy="45" r="5" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="90" x2="70" y2="125" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Verification Pulse Bar Graph */}
          <g transform="translate(10, 130)" stroke="#0a0a0a" strokeWidth="2">
            <line x1="0" y1="100" x2="135" y2="100" strokeWidth="2.2" />
            <rect x="12" y="45" width="20" height="55" fill="#ffffff" />
            <rect x="42" y="20" width="20" height="80" fill="#ffffff" />
            <rect x="72" y="55" width="20" height="45" fill="#ffffff" />
            <rect x="102" y="10" width="20" height="90" fill="#ffffff" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="235" x2="70" y2="270" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Verification Success Rate Badge */}
          <g transform="translate(12, 275)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">VERIFY SUCCESS</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ZERO TAMPERING</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="350" x2="70" y2="385" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Cryptographic Hash Chain Stack */}
          <g transform="translate(12, 390)">
            <rect x="0" y="0" width="125" height="80" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">HASH CHAIN</text>
            <text x="10" y="38" fontFamily="monospace" fontSize="7" fill="#666666">0x7f9a8b2c4e1d</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7" fill="#666666">0x3e1a9c8b7f2d</text>
            <text x="10" y="66" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">✓ MATCH VERIFIED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="475" x2="70" y2="510" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Authentic Certificate Seal */}
          <g transform="translate(25, 515)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M30 40 l10 10 20 -20" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="595" x2="70" y2="630" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. On-Chain Ledger Anchor Seal (Bottom) */}
          <g transform="translate(10, 635)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">ZERO TAMPERING</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN SYNC</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Real-Time Verification Donut, Blockchain Anchoring, Verification Shield & Proofs (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="verifGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#verifGridRight)" opacity="0.35" />

          {/* 1. Real-Time Verification Donut Ring (Top) */}
          <g transform="translate(25, 15)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="140 200" />
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="40 200" strokeDashoffset="-145" opacity="0.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="110" x2="70" y2="145" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Blockchain Anchoring Stream */}
          <g transform="translate(12, 150)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER VERIFIED</text>
            <text x="10" y="42" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">BLOCK #849201</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">⚡ REAL-TIME PROOF</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="225" x2="70" y2="260" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Verification Shield Seal */}
          <g transform="translate(20, 265)">
            <path d="M45 0 s35-15 35-35 v-25 l-35-12 -35 12 v25 c0 20 35 35 35 35z" transform="translate(0, 75)" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="32 55 42 65 60 42" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="375" x2="70" y2="410" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Zero-Trust Security Metric Badge */}
          <g transform="translate(12, 415)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">SECURITY LEVEL</text>
            <text x="10" y="42" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">ZERO-KNOWLEDGE</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ 100% SECURE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="490" x2="70" y2="525" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. QR Code Verification Target */}
          <g transform="translate(25, 530)">
            <rect x="0" y="0" width="90" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h20v20H10zM15 15v10h10V15zM60 10h20v20H60zM65 15v10h10V15zM10 60h20v20H10zM15 65v10h10V65zM38 10h8v10H38zM38 28h8v8H38zM46 40h10v6H46zM58 40h15v6H58zM38 52h8v8H38zM52 52h8v8H52zM65 52h8v15H65z" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="625" x2="70" y2="660" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Proof Verification Seal (Bottom) */}
          <g transform="translate(10, 665)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">PROOF STATUS</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">VERIFIED & SIGNED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ IMMUTABLE PROOF</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default VerificationAnalyticsDecorations;

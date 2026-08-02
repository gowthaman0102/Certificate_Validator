/* ─────────────────────────────────────────────────────────────
   UniversityDashboardDecorations.jsx
   - Page-specific background decorations for University Dashboard.
   - Theme: University Registrar Seal, Campus Pediment, Certificate Issuance Workflow.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function UniversityDashboardDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Registrar Seal, Campus Pediment, Issuance Workflow & Vault Folder (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="univGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#univGridLeft)" opacity="0.35" />

          {/* 1. Official University Registrar Seal (Top) */}
          <g transform="translate(25, 15)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="45" cy="40" r="28" stroke="#0a0a0a" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <polygon points="45 18, 52 30, 65 32, 55 41, 58 54, 45 47, 32 54, 35 41, 25 32, 38 30" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="95" x2="70" y2="130" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Classic University Campus Pediment */}
          <g transform="translate(15, 135)">
            <polygon points="60 0, 115 28, 5 28" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="5" y1="28" x2="115" y2="28" stroke="#0a0a0a" strokeWidth="2.2" />
            <rect x="15" y="28" width="10" height="50" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="40" y="28" width="10" height="50" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="70" y="28" width="10" height="50" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="95" y="28" width="10" height="50" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="0" y="78" width="120" height="8" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="225" x2="70" y2="260" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Certificate Issuance Workflow Node */}
          <g transform="translate(10, 265)">
            <rect x="0" y="0" width="125" height="75" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="38" r="8" fill="#0a0a0a" />
            <line x1="36" y1="28" x2="105" y2="28" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="36" y1="40" x2="95" y2="40" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="36" y1="52" x2="80" y2="52" stroke="#0a0a0a" strokeWidth="1.2" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="345" x2="70" y2="380" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Parchment Diploma Document */}
          <g transform="translate(15, 385)">
            <rect x="0" y="0" width="115" height="120" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="15" y1="20" x2="100" y2="20" stroke="#0a0a0a" strokeWidth="2.2" />
            <line x1="15" y1="35" x2="85" y2="35" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="50" x2="100" y2="50" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="65" x2="100" y2="65" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="80" x2="75" y2="80" stroke="#0a0a0a" strokeWidth="1.4" />
            <circle cx="85" cy="95" r="10" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="510" x2="70" y2="545" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Institutional Vault Folder */}
          <g transform="translate(10, 550)">
            <path d="M0 10 h40 l15 15 h70 v70 h-125 z" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="15" y1="40" x2="95" y2="40" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="15" y1="55" x2="75" y2="55" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="650" x2="70" y2="685" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Authorized Issuer Badge (Bottom) */}
          <g transform="translate(10, 690)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">OFFICIAL ISSUER</text>
            <text x="10" y="40" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">ACCREDITED UNIV</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ RSA SIGNED</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Bulk Cloud, RSA Key, Metric Badge & QR Scanner (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="univGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#univGridRight)" opacity="0.35" />

          {/* 1. Bulk Issue Cloud Storage (Top) */}
          <g transform="translate(15, 15)">
            <path d="M15 45 a22 22 0 0 1 36 -14 a28 28 0 0 1 48 7 a22 22 0 0 1 0 35 h-84 a18 18 0 0 1 0 -28 z" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="45 42, 60 28, 75 42" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="60" y1="28" x2="60" y2="58" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="100" x2="70" y2="135" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. RSA Cryptographic Key */}
          <g transform="translate(20, 140)">
            <circle cx="35" cy="35" r="28" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="35" cy="35" r="14" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <path d="M35 63 v35 h14 v-8 h-14 v-8 h9 v-8 h-9" stroke="#0a0a0a" strokeWidth="2" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="270" x2="70" y2="305" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Metric KPI Badge */}
          <g transform="translate(10, 310)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTITUTION STATS</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN SYNC</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="385" x2="70" y2="420" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. 3D Isometric Block Stack */}
          <g transform="translate(30, 425)" stroke="#0a0a0a" strokeWidth="2">
            <path d="M38 8 l22 -11 22 11 -22 11 z M38 8 v16 l22 11 v-16 z M82 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            <line x1="60" y1="35" x2="60" y2="60" strokeDasharray="3 3" strokeWidth="1.6" />
            <g transform="translate(0, 44)">
              <path d="M38 8 l22 -11 22 11 -22 11 z M38 8 v16 l22 11 v-16 z M82 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            </g>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="540" x2="70" y2="575" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. QR Code Verification Target */}
          <g transform="translate(25, 580)">
            <rect x="0" y="0" width="90" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h20v20H10zM15 15v10h10V15zM60 10h20v20H60zM65 15v10h10V15zM10 60h20v20H10zM15 65v10h10V65zM38 10h8v10H38zM38 28h8v8H38zM46 40h10v6H46zM58 40h15v6H58zM38 52h8v8H38zM52 52h8v8H52zM65 52h8v15H65z" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="675" x2="70" y2="710" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Ledger Anchoring Seal (Bottom) */}
          <g transform="translate(10, 715)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="10" y="40" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">ZERO TAMPERING</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ FULL COMPLIANCE</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default UniversityDashboardDecorations;

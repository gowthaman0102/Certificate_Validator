/* ─────────────────────────────────────────────────────────────
   UniversityAnalyticsDecorations.jsx
   - Page-specific background decorations for University Analytics.
   - Theme: Institutional Issuance Bar Charts, Growth Metrics & Departmental Performance.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function UniversityAnalyticsDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Bar Chart Vector, Institutional Growth Curve & Monthly Distribution (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="anaGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#anaGridLeft)" opacity="0.35" />

          {/* 1. Bar Chart Vector Outline (Top) */}
          <g transform="translate(12, 15)" stroke="#0a0a0a" strokeWidth="2">
            <line x1="0" y1="115" x2="135" y2="115" strokeWidth="2.2" />
            <line x1="0" y1="0" x2="0" y2="115" strokeWidth="2.2" />
            <rect x="12" y="65" width="20" height="50" fill="#ffffff" />
            <rect x="42" y="30" width="20" height="85" fill="#ffffff" />
            <rect x="72" y="45" width="20" height="70" fill="#ffffff" />
            <rect x="102" y="10" width="20" height="105" fill="#ffffff" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="140" x2="70" y2="175" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Institutional Growth Metric Curve */}
          <g transform="translate(12, 180)">
            <path d="M0 85 Q 45 25, 80 50 T 135 15" stroke="#0a0a0a" strokeWidth="2.4" strokeDasharray="4 4" fill="none" />
            <circle cx="135" cy="15" r="5" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="275" x2="70" y2="310" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Monthly Issuance KPI Badge */}
          <g transform="translate(12, 315)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">ISSUANCE RATE</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">+34.2%</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ MONTHLY INCREASE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="390" x2="70" y2="425" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Departmental Performance Stack */}
          <g transform="translate(12, 430)">
            <rect x="0" y="0" width="125" height="85" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="25" r="5" fill="#0a0a0a" />
            <line x1="30" y1="25" x2="110" y2="25" stroke="#0a0a0a" strokeWidth="1.6" />
            <circle cx="20" cy="45" r="5" fill="#0a0a0a" />
            <line x1="30" y1="45" x2="95" y2="45" stroke="#0a0a0a" strokeWidth="1.6" />
            <circle cx="20" cy="65" r="5" fill="#0a0a0a" />
            <line x1="30" y1="65" x2="105" y2="65" stroke="#0a0a0a" strokeWidth="1.6" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="520" x2="70" y2="555" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Institutional Seal Badge */}
          <g transform="translate(25, 560)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="45 18, 52 30, 65 32, 55 41, 58 54, 45 47, 32 54, 35 41, 25 32, 38 30" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="640" x2="70" y2="675" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Institutional Compliance Badge (Bottom) */}
          <g transform="translate(10, 680)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTITUTION CODE</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">UNIV ACCREDITED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ FULL AUDIT PASS</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Donut Chart Vector, Departmental Metrics & Real-Time Insight (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="anaGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#anaGridRight)" opacity="0.35" />

          {/* 1. Donut Chart Vector Outline (Top) */}
          <g transform="translate(25, 15)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="60 180" />
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="90 180" strokeDashoffset="-65" opacity="0.6" />
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="40 180" strokeDashoffset="-160" opacity="0.3" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="110" x2="70" y2="145" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Real-Time Analytics Insight Card */}
          <g transform="translate(12, 150)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTITUTION STATS</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">99.9%</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">⚡ REAL-TIME SYNC</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="225" x2="70" y2="260" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Departmental Distribution Network */}
          <g transform="translate(15, 265)">
            <rect x="0" y="0" width="115" height="90" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="25" r="5" fill="#0a0a0a" />
            <line x1="20" y1="25" x2="95" y2="25" stroke="#0a0a0a" strokeWidth="1.6" strokeDasharray="2 2" />
            <circle cx="95" cy="25" r="5" fill="#0a0a0a" />
            <circle cx="57.5" cy="65" r="7" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            <line x1="20" y1="25" x2="57.5" y2="65" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="95" y1="25" x2="57.5" y2="65" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="360" x2="70" y2="395" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Active Certificate Analytics Badge */}
          <g transform="translate(12, 400)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">ACTIVE CERTS</text>
            <text x="10" y="40" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">1,482</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ 100% VALIDATED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="473" x2="70" y2="508" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Security & Verification Target */}
          <g transform="translate(25, 513)">
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
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ FULL COMPLIANCE</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default UniversityAnalyticsDecorations;

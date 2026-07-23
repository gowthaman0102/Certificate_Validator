/* ─────────────────────────────────────────────────────────────
   UniversityAnalyticsDecorations.jsx
   - Page-specific background decorations for University Analytics.
   - Theme: Institutional Issuance Bar Charts, Growth Metrics & Departmental Performance.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function UniversityAnalyticsDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: Bar Chart Vector, Institutional Growth Curve & Monthly Distribution */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Bar Chart Vector Outline (Top) */}
          <g transform="translate(15, 30)" stroke="#0a0a0a" strokeWidth="1.6">
            <line x1="0" y1="130" x2="150" y2="130" strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="130" strokeWidth="2" />
            <rect x="15" y="75" width="20" height="55" fill="#ffffff" />
            <rect x="48" y="40" width="20" height="90" fill="#ffffff" />
            <rect x="81" y="55" width="20" height="75" fill="#ffffff" />
            <rect x="114" y="15" width="20" height="115" fill="#ffffff" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="175" x2="90" y2="225" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Institutional Growth Metric Curve (Upper-Middle) */}
          <g transform="translate(15, 240)">
            <path d="M0 90 Q 50 35, 90 60 T 150 15" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <circle cx="150" cy="15" r="5" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="345" x2="90" y2="395" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Monthly Issuance KPI Badge (Bottom) */}
          <g transform="translate(15, 410)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">ISSUANCE RATE</text>
            <text x="12" y="44" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">+34.2%</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ MONTHLY GROWTH</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Donut Chart Vector, Departmental Metrics & Real-Time Insight */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Donut Chart Vector Outline (Top) */}
          <g transform="translate(30, 30)">
            <circle cx="50" cy="50" r="42" stroke="#0a0a0a" strokeWidth="12" fill="none" strokeDasharray="70 200" />
            <circle cx="50" cy="50" r="42" stroke="#4f46e5" strokeWidth="12" fill="none" strokeDasharray="100 200" strokeDashoffset="-75" />
            <circle cx="50" cy="50" r="42" stroke="#0ea5e9" strokeWidth="12" fill="none" strokeDasharray="45 200" strokeDashoffset="-180" />
          </g>

          {/* Guide Line */}
          <line x1="95" y1="140" x2="95" y2="190" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" opacity="0.6" />

          {/* 2. Real-Time Analytics Insight Card (Upper-Middle) */}
          <g transform="translate(25, 205)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTITUTION STATS</text>
            <text x="12" y="44" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">99.9%</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">⚡ REAL-TIME SYNC</text>
          </g>

          {/* Guide Line */}
          <line x1="95" y1="295" x2="95" y2="345" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Departmental Distribution Graph (Bottom) */}
          <g transform="translate(25, 360)">
            <rect x="0" y="0" width="140" height="90" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="25" cy="30" r="6" fill="#0a0a0a" />
            <line x1="25" y1="30" x2="115" y2="30" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="2 2" />
            <circle cx="115" cy="30" r="6" fill="#0a0a0a" />
            <circle cx="70" cy="70" r="7" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <line x1="25" y1="30" x2="70" y2="70" stroke="#666666" strokeWidth="1.2" />
            <line x1="115" y1="30" x2="70" y2="70" stroke="#666666" strokeWidth="1.2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default UniversityAnalyticsDecorations;

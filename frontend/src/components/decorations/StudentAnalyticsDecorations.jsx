/* ─────────────────────────────────────────────────────────────
   StudentAnalyticsDecorations.jsx
   - Page-specific background decorations for Student Analytics.
   - Theme: Academic Achievement Curves, Credential Verification Activity & Learning Radar.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function StudentAnalyticsDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: Academic Progress Curve & Learning Milestone Badge */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Academic Progress Curve (Top) */}
          <g transform="translate(15, 30)">
            <path d="M0 100 Q 50 20, 100 60 T 150 10" stroke="#0a0a0a" strokeWidth="2" strokeDasharray="3 3" fill="none" />
            <circle cx="150" cy="10" r="5" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="145" x2="90" y2="195" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Grade Milestone Bar Chart (Upper-Middle) */}
          <g transform="translate(15, 210)" stroke="#0a0a0a" strokeWidth="1.6">
            <line x1="0" y1="110" x2="140" y2="110" strokeWidth="1.8" />
            <rect x="15" y="60" width="18" height="50" fill="#ffffff" />
            <rect x="45" y="30" width="18" height="80" fill="#ffffff" />
            <rect x="75" y="45" width="18" height="65" fill="#ffffff" />
            <rect x="105" y="10" width="18" height="100" fill="#ffffff" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="335" x2="90" y2="385" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verified Portfolio Metric Box (Bottom) */}
          <g transform="translate(15, 400)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">PORTFOLIO SCORE</text>
            <text x="12" y="44" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">98 / 100</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ TOP PERCENTILE</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Achievement Radar Chart & Verification Activity Gauge */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Achievement Radar Chart Polygon (Top) */}
          <g transform="translate(30, 30)">
            <polygon points="50 10, 90 35, 75 80, 25 80, 10 35" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="50 25, 75 40, 65 65, 35 65, 25 40" stroke="#4f46e5" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
            <line x1="50" y1="10" x2="50" y2="45" stroke="#666666" strokeWidth="1" />
            <line x1="90" y1="35" x2="50" y2="45" stroke="#666666" strokeWidth="1" />
            <line x1="75" y1="80" x2="50" y2="45" stroke="#666666" strokeWidth="1" />
            <line x1="25" y1="80" x2="50" y2="45" stroke="#666666" strokeWidth="1" />
            <line x1="10" y1="35" x2="50" y2="45" stroke="#666666" strokeWidth="1" />
          </g>

          {/* Guide Line */}
          <line x1="95" y1="135" x2="95" y2="185" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Verification Activity Metric Card (Upper-Middle) */}
          <g transform="translate(25, 200)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">SHARE VIEWS</text>
            <text x="12" y="44" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">245 VIEWS</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">⚡ HIGH ENGAGEMENT</text>
          </g>

          {/* Guide Line */}
          <line x1="95" y1="290" x2="95" y2="340" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verified Student Star Seal (Bottom) */}
          <g transform="translate(35, 355)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="45 18, 52 30, 65 32, 55 41, 58 54, 45 47, 32 54, 35 41, 25 32, 38 30" stroke="#0a0a0a" strokeWidth="1.2" fill="none" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default StudentAnalyticsDecorations;

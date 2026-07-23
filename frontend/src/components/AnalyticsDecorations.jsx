/* ─────────────────────────────────────────────────────────────
   AnalyticsDecorations.jsx
   - Page-specific background decorations for Analytics pages.
   - Theme: Data Visualization, Growth Curves, Bar Charts & KPI Streams.
   - Un-clipped vector illustrations spanning top to bottom (100% inside 160px viewBox).
   ───────────────────────────────────────────────────────────── */

export function AnalyticsDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Bar Chart, Growth Curves & Data Stream (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dot Grid */}
          <pattern id="anaGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="0" y="0" width="160" height="1000" fill="url(#anaGridLeft)" opacity="0.25" />

          {/* 1. Bar Chart Vector Outline (Top) */}
          <g transform="translate(15, 20)" stroke="#0a0a0a" strokeWidth="1.5">
            <line x1="0" y1="120" x2="130" y2="120" strokeWidth="1.8" />
            <line x1="0" y1="0" x2="0" y2="120" strokeWidth="1.8" />
            <rect x="12" y="70" width="18" height="50" fill="#ffffff" />
            <rect x="42" y="35" width="18" height="85" fill="#ffffff" />
            <rect x="72" y="50" width="18" height="70" fill="#ffffff" />
            <rect x="102" y="10" width="18" height="110" fill="#ffffff" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="155" x2="70" y2="195" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. Metric Growth Curve */}
          <g transform="translate(15, 200)">
            <path d="M0 80 Q 40 30, 80 50 T 130 10" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" fill="none" />
            <circle cx="130" cy="10" r="4" fill="#0a0a0a" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="300" x2="70" y2="340" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Analytics KPI Summary Box */}
          <g transform="translate(15, 345)">
            <rect x="0" y="0" width="125" height="65" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="18" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">GROWTH RATE</text>
            <text x="10" y="38" fontFamily="serif" fontSize="16" fontWeight="bold" fill="#0a0a0a">+24.8%</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7" fill="#666666">✓ MONTHLY INCREASE</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Donut Chart, Real-Time Insight & Verification Stream (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dot Grid */}
          <pattern id="anaGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="0" y="0" width="160" height="1000" fill="url(#anaGridRight)" opacity="0.25" />

          {/* 1. Donut Chart Vector Outline (Top) */}
          <g transform="translate(25, 20)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="10" fill="none" strokeDasharray="60 180" />
            <circle cx="45" cy="45" r="38" stroke="#666666" strokeWidth="10" fill="none" strokeDasharray="90 180" strokeDashoffset="-65" />
            <circle cx="45" cy="45" r="38" stroke="#8c8c8c" strokeWidth="10" fill="none" strokeDasharray="40 180" strokeDashoffset="-160" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="120" x2="70" y2="160" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. Real-Time Analytics Insight Card */}
          <g transform="translate(15, 165)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">VERIFICATION RATE</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">99.8%</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7" fill="#666666">⚡ REAL-TIME ANALYTICS</text>
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="250" x2="70" y2="290" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Data Distribution Nodes */}
          <g transform="translate(25, 295)">
            <rect x="0" y="0" width="90" height="90" rx="4" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="25" r="5" fill="#0a0a0a" />
            <line x1="20" y1="25" x2="70" y2="25" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="2 2" />
            <circle cx="70" cy="25" r="5" fill="#0a0a0a" />
            <circle cx="45" cy="65" r="6" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <line x1="20" y1="25" x2="45" y2="65" stroke="#666666" strokeWidth="1" />
            <line x1="70" y1="25" x2="45" y2="65" stroke="#666666" strokeWidth="1" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default AnalyticsDecorations;

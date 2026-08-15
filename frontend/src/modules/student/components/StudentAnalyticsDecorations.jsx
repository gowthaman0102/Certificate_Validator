/* ─────────────────────────────────────────────────────────────
   StudentAnalyticsDecorations.jsx
   - Page-specific background decorations for Student Analytics.
   - Theme: Academic Achievement Curves, Credential Verification Activity & Learning Radar.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function StudentAnalyticsDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Academic Progress Curve, Milestone Bar Chart, Portfolio Metric & Seal (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="studAnaGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#studAnaGridLeft)" opacity="0.35" />

          {/* 1. Academic Progress Curve (Top) */}
          <g transform="translate(10, 15)">
            <path d="M0 80 Q 40 10, 70 45 T 140 10" stroke="#0a0a0a" strokeWidth="2.4" strokeDasharray="3 3" fill="none" />
            <circle cx="140" cy="10" r="5" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="100" x2="70" y2="135" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Grade Milestone Bar Chart */}
          <g transform="translate(10, 140)" stroke="#0a0a0a" strokeWidth="2">
            <line x1="0" y1="105" x2="135" y2="105" strokeWidth="2.2" />
            <rect x="12" y="55" width="20" height="50" fill="#ffffff" />
            <rect x="42" y="25" width="20" height="80" fill="#ffffff" />
            <rect x="72" y="40" width="20" height="65" fill="#ffffff" />
            <rect x="102" y="10" width="20" height="95" fill="#ffffff" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="250" x2="70" y2="285" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Verified Portfolio Metric Box */}
          <g transform="translate(10, 290)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">PORTFOLIO SCORE</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">98 / 100</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ TOP PERCENTILE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="365" x2="70" y2="400" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Academic Certificate Counter */}
          <g transform="translate(10, 405)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">EARNED CERTS</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">12 TOTAL</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ALL VERIFIED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="478" x2="70" y2="513" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Student Honor Star Seal */}
          <g transform="translate(25, 518)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="45 15, 52 27, 65 29, 55 38, 58 51, 45 44, 32 51, 35 38, 25 29, 38 27" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="600" x2="70" y2="635" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Academic Milestone Badge (Bottom) */}
          <g transform="translate(10, 640)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">GRADUATION STATUS</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">DEGREE COMPLETED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ FULL ACCREDITATION</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Achievement Radar Chart, Verification Activity & QR Matrix (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="studAnaGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#studAnaGridRight)" opacity="0.35" />

          {/* 1. Achievement Radar Chart Polygon (Top) */}
          <g transform="translate(20, 15)">
            <polygon points="50 10, 90 35, 75 80, 25 80, 10 35" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="50 25, 75 40, 65 65, 35 65, 25 40" stroke="#0a0a0a" strokeWidth="1.4" fill="none" strokeDasharray="3 3" />
            <line x1="50" y1="10" x2="50" y2="45" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="90" y1="35" x2="50" y2="45" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="75" y1="80" x2="50" y2="45" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="25" y1="80" x2="50" y2="45" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="10" y1="35" x2="50" y2="45" stroke="#0a0a0a" strokeWidth="1.2" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="100" x2="70" y2="135" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Verification Activity Metric Card */}
          <g transform="translate(10, 140)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">SHARE VIEWS</text>
            <text x="10" y="42" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#0a0a0a">245 VIEWS</text>
            <text x="10" y="56" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">⚡ HIGH ENGAGEMENT</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="215" x2="70" y2="250" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Academic Achievement Gauge Ring */}
          <g transform="translate(25, 255)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="160 200" />
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="11" fill="none" strokeDasharray="30 200" strokeDashoffset="-165" opacity="0.3" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="350" x2="70" y2="385" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Verification QR Matrix */}
          <g transform="translate(25, 390)">
            <rect x="0" y="0" width="90" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h20v20H10zM15 15v10h10V15zM60 10h20v20H60zM65 15v10h10V15zM10 60h20v20H10zM15 65v10h10V65zM38 10h8v10H38zM38 28h8v8H38zM46 40h10v6H46zM58 40h15v6H58zM38 52h8v8H38zM52 52h8v8H52zM65 52h8v15H65z" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="485" x2="70" y2="520" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. RSA Certificate Lock Badge */}
          <g transform="translate(20, 525)">
            <rect x="0" y="24" width="105" height="65" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M26 24 V15 a26 26 0 0 1 52 0 V24" stroke="#0a0a0a" strokeWidth="2" fill="none" />
            <circle cx="52.5" cy="48" r="5" fill="#0a0a0a" />
            <line x1="52.5" y1="53" x2="52.5" y2="70" stroke="#0a0a0a" strokeWidth="2.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="620" x2="70" y2="655" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Instant Proof Anchor Seal (Bottom) */}
          <g transform="translate(10, 660)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTANT VERIFY</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">ZERO TAMPERING</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ Cryptographic Proof</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default StudentAnalyticsDecorations;

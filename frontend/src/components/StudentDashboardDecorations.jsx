/* ─────────────────────────────────────────────────────────────
   StudentDashboardDecorations.jsx
   - Page-specific background decorations for Student Wallet & Certificates.
   - Theme: Student Credentials, Graduation Cap, Academic Transcripts & Verified Badges.
   - Fits 100% inside outer empty space (160px width, top to bottom flow).
   ───────────────────────────────────────────────────────────── */

export function StudentDashboardDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Graduation Cap, Transcript & Verified Badge (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="studGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.4" />
          </pattern>
          <rect x="0" y="0" width="160" height="1000" fill="url(#studGridLeft)" opacity="0.25" />

          {/* 1. Graduation Cap (Top) */}
          <g transform="translate(10, 20)">
            <polygon points="70 10, 130 30, 70 50, 10 30" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            <path d="M30 40v22c0 5 40 9 40 9s40-4 40-9V40" stroke="#0a0a0a" strokeWidth="1.5" fill="none" />
            <line x1="115" y1="35" x2="115" y2="65" stroke="#0a0a0a" strokeWidth="1.5" />
            <circle cx="115" cy="68" r="3" fill="#0a0a0a" />
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="105" x2="70" y2="150" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 2. Academic Transcript Document Preview */}
          <g transform="translate(10, 160)">
            <rect x="0" y="0" width="120" height="160" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="8" y="8" width="104" height="144" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <line x1="18" y1="24" x2="102" y2="24" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="18" y1="36" x2="85" y2="36" stroke="#666666" strokeWidth="1.2" />
            <line x1="12" y1="54" x2="108" y2="54" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="12" y1="72" x2="108" y2="72" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="12" y1="90" x2="108" y2="90" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="12" y1="108" x2="108" y2="108" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="12" y1="126" x2="108" y2="126" stroke="#8c8c8c" strokeWidth="1" />
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="335" x2="70" y2="380" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 3. Verified Student Identity Badge */}
          <g transform="translate(10, 390)">
            <rect x="0" y="0" width="120" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <circle cx="24" cy="38" r="12" stroke="#0a0a0a" strokeWidth="1.4" fill="#f5f5f5" />
            <line x1="45" y1="30" x2="108" y2="30" stroke="#0a0a0a" strokeWidth="1.6" />
            <line x1="45" y1="42" x2="95" y2="42" stroke="#666666" strokeWidth="1.2" />
            <line x1="45" y1="54" x2="80" y2="54" stroke="#8c8c8c" strokeWidth="1" />
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="480" x2="70" y2="525" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 4. Verified Academic Star Badge */}
          <g transform="translate(20, 535)">
            <circle cx="40" cy="40" r="35" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <polygon points="40 15, 47 27, 60 29, 50 38, 53 50, 40 43, 27 50, 30 38, 20 29, 33 27" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />
            <path d="M32 68l-6 20 14-5 14 5-6-20" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="640" x2="70" y2="685" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 5. Verified Identity Seal (Bottom) */}
          <g transform="translate(10, 695)">
            <rect x="0" y="0" width="120" height="65" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">STUDENT CREDENTIAL</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">VERIFIED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7" fill="#666666">✓ AUTHENTICATED</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Digital Wallet, QR Scanner & Blockchain Anchor (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="studGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.4" />
          </pattern>
          <rect x="0" y="0" width="160" height="1000" fill="url(#studGridRight)" opacity="0.25" />

          {/* 1. Digital Wallet Stack (Top) */}
          <g transform="translate(15, 20)">
            <rect x="10" y="0" width="115" height="70" rx="5" stroke="#8c8c8c" strokeWidth="1.4" fill="#ffffff" />
            <rect x="5" y="7" width="115" height="70" rx="5" stroke="#666666" strokeWidth="1.4" fill="#ffffff" />
            <rect x="0" y="14" width="115" height="70" rx="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <circle cx="20" cy="38" r="8" stroke="#0a0a0a" strokeWidth="1.2" fill="#f5f5f5" />
            <line x1="36" y1="32" x2="98" y2="32" stroke="#0a0a0a" strokeWidth="1.6" />
            <line x1="36" y1="44" x2="82" y2="44" stroke="#666666" strokeWidth="1.2" />
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="110" x2="70" y2="155" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 2. QR Scanner Matrix */}
          <g transform="translate(25, 165)">
            <rect x="0" y="0" width="85" height="85" rx="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <path d="M10 10h18v18H10zM14 14v10h10V14zM57 10h18v18H57zM61 14v10h10V14zM10 57h18v18H10zM14 61v10h10V61zM34 10h8v10H34zM34 26h8v8H34zM42 36h10v6H42zM54 36h13v6H54zM34 48h8v8H34zM48 48h8v8H48zM60 48h8v13H60z" fill="#0a0a0a" />
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="265" x2="70" y2="310" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 3. 3D Isometric Ledger Block Stack */}
          <g transform="translate(30, 320)" stroke="#0a0a0a" strokeWidth="1.6">
            <path d="M35 7 l20 -10 20 10 -20 10 z M35 7 v15 l20 10 v-15 z M75 7 v15 l-20 10 v-15 z" fill="#ffffff" />
            <line x1="55" y1="32" x2="55" y2="55" strokeDasharray="3 3" strokeWidth="1.4" />
            <g transform="translate(0, 40)">
              <path d="M35 7 l20 -10 20 10 -20 10 z M35 7 v15 l20 10 v-15 z M75 7 v15 l-20 10 v-15 z" fill="#ffffff" />
            </g>
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="430" x2="70" y2="475" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 4. Credentials Verified Metric Badge */}
          <g transform="translate(15, 485)">
            <rect x="0" y="0" width="115" height="58" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <text x="10" y="18" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">CREDENTIALS</text>
            <text x="10" y="36" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="10" y="48" fontFamily="monospace" fontSize="7" fill="#666666">✓ AUTHENTICATED</text>
          </g>

          {/* Vertical Connecting Line */}
          <line x1="70" y1="555" x2="70" y2="600" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" />

          {/* 5. RSA Security Lock (Bottom) */}
          <g transform="translate(20, 610)">
            <rect x="0" y="26" width="100" height="65" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <path d="M25 26 V16 a25 25 0 0 1 50 0 V26" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <circle cx="50" cy="50" r="5" fill="#0a0a0a" />
            <line x1="50" y1="55" x2="50" y2="72" stroke="#0a0a0a" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default StudentDashboardDecorations;

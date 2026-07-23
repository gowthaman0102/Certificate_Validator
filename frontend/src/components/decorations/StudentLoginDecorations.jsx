/* ─────────────────────────────────────────────────────────────
   StudentLoginDecorations.jsx
   - Page-specific background decorations for Student Login & Register.
   - Theme: Student Identity, Academic Journey Pathway & Learning Badges.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function StudentLoginDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: Student Profile, Academic Journey & Learning Badge */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Student Identity Profile Card (Top) */}
          <g transform="translate(15, 30)">
            <rect x="0" y="0" width="140" height="95" rx="6" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="32" cy="45" r="16" stroke="#0a0a0a" strokeWidth="1.4" fill="#f5f5f5" />
            <line x1="58" y1="36" x2="125" y2="36" stroke="#0a0a0a" strokeWidth="1.6" />
            <line x1="58" y1="48" x2="110" y2="48" stroke="#666666" strokeWidth="1.2" />
            <line x1="58" y1="60" x2="95" y2="60" stroke="#8c8c8c" strokeWidth="1" />
          </g>

          {/* Guide Line */}
          <line x1="85" y1="140" x2="85" y2="190" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Academic Journey Pathway (Upper-Middle) */}
          <g transform="translate(20, 205)">
            <path d="M20 0 Q 70 40, 20 80 T 70 140" stroke="#0ea5e9" strokeWidth="1.8" strokeDasharray="3 3" fill="none" />
            <circle cx="20" cy="0" r="5" fill="#0a0a0a" />
            <circle cx="45" cy="40" r="6" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" />
            <circle cx="20" cy="80" r="5" fill="#0a0a0a" />
            <circle cx="70" cy="140" r="6" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" />
          </g>

          {/* Guide Line */}
          <line x1="85" y1="360" x2="85" y2="410" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verified Student Credentials Badge (Bottom) */}
          <g transform="translate(15, 425)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">STUDENT ACCESS</text>
            <text x="12" y="44" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">VERIFIED WALLET</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ 100% OWNERSHIP</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Digital Wallet, Graduation Cap & Star Ribbon */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Digital Credential Wallet Stack (Top) */}
          <g transform="translate(30, 30)">
            <rect x="12" y="0" width="130" height="80" rx="5" stroke="#8c8c8c" strokeWidth="1.2" fill="#ffffff" />
            <rect x="6" y="8" width="130" height="80" rx="5" stroke="#666666" strokeWidth="1.2" fill="#ffffff" />
            <rect x="0" y="16" width="130" height="80" rx="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="22" cy="44" r="9" stroke="#0a0a0a" strokeWidth="1" fill="#f5f5f5" />
            <line x1="40" y1="38" x2="110" y2="38" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="40" y1="50" x2="95" y2="50" stroke="#666666" strokeWidth="1" />
          </g>

          {/* Guide Line */}
          <line x1="95" y1="140" x2="95" y2="190" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Graduation Cap Motif (Upper-Middle) */}
          <g transform="translate(25, 205)">
            <polygon points="75 12, 135 32, 75 52, 15 32" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <path d="M35 42v24c0 5 40 10 40 10s40-5 40-10V42" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />
            <line x1="120" y1="36" x2="120" y2="68" stroke="#d97706" strokeWidth="1.4" />
            <circle cx="120" cy="71" r="3" fill="#d97706" />
          </g>

          {/* Guide Line */}
          <line x1="95" y1="300" x2="95" y2="350" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Academic Star Ribbon Badge (Bottom) */}
          <g transform="translate(35, 365)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="45 18, 52 30, 65 32, 55 41, 58 54, 45 47, 32 54, 35 41, 25 32, 38 30" stroke="#0a0a0a" strokeWidth="1.2" fill="none" />
            <path d="M37 76l-7 22 15-5 15 5-7-22" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default StudentLoginDecorations;

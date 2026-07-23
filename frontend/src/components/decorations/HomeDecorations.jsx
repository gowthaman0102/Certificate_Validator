/* ─────────────────────────────────────────────────────────────
   HomeDecorations.jsx
   - Page-specific background decorations for Home / Landing Page.
   - Theme: Blockchain Network, Digital Certificates, University Pillars, QR Codes & Trust.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function HomeDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: Blockchain Nodes, University Crest & Certificate Scroll */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="homeGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>

          {/* 1. Global Academic Blockchain Network (Top) */}
          <g transform="translate(15, 30)" stroke="url(#homeGradLeft)" strokeWidth="1.6">
            <circle cx="85" cy="40" r="16" fill="#ffffff" />
            <circle cx="35" cy="100" r="12" fill="#ffffff" />
            <circle cx="135" cy="100" r="12" fill="#ffffff" />
            <line x1="85" y1="56" x2="35" y2="88" strokeDasharray="3 3" />
            <line x1="85" y1="56" x2="135" y2="88" strokeDasharray="3 3" />
            <path d="M35 112 L85 160 L135 112" fill="none" />
            <circle cx="85" cy="160" r="10" fill="#ffffff" />
          </g>

          {/* Guide Line */}
          <line x1="100" y1="210" x2="100" y2="260" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. University Crest & Pillars (Upper-Middle) */}
          <g transform="translate(20, 275)" stroke="#0a0a0a" strokeWidth="1.6">
            <polygon points="80 10, 10 40, 150 40" fill="#ffffff" />
            <line x1="10" y1="40" x2="150" y2="40" strokeWidth="2" />
            <line x1="25" y1="40" x2="25" y2="85" strokeWidth="1.6" />
            <line x1="60" y1="40" x2="60" y2="85" strokeWidth="1.6" />
            <line x1="100" y1="40" x2="100" y2="85" strokeWidth="1.6" />
            <line x1="135" y1="40" x2="135" y2="85" strokeWidth="1.6" />
            <rect x="10" y="85" width="140" height="6" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="100" y1="380" x2="100" y2="430" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verified Digital Scroll Certificate (Lower-Middle) */}
          <g transform="translate(20, 445)">
            <rect x="0" y="0" width="150" height="110" rx="4" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <rect x="10" y="10" width="130" height="90" stroke="#4f46e5" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <line x1="25" y1="30" x2="125" y2="30" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="25" y1="45" x2="105" y2="45" stroke="#666666" strokeWidth="1.2" />
            <line x1="25" y1="60" x2="115" y2="60" stroke="#8c8c8c" strokeWidth="1" />
            <circle cx="115" cy="78" r="12" stroke="#d97706" strokeWidth="1.5" fill="#ffffff" />
            <path d="M110 88l-4 14 9-4 9 4-4-14" stroke="#d97706" strokeWidth="1.2" fill="#ffffff" />
          </g>

          {/* Guide Line */}
          <line x1="100" y1="570" x2="100" y2="620" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 4. Digital Trust Seal (Bottom) */}
          <g transform="translate(25, 635)">
            <circle cx="75" cy="55" r="48" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="75" cy="55" r="40" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <path d="M60 55l10 10 20-20" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <text x="35" y="118" fontFamily="sans-serif" fontSize="7.5" fontWeight="bold" fill="#0a0a0a" letterSpacing="0.05em">TRUST FOREVER</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Ledger Chain, Graduation Cap & QR Target */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="homeGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>

          {/* 1. 3D Isometric Ledger Stack (Top) */}
          <g transform="translate(45, 30)" stroke="url(#homeGradRight)" strokeWidth="1.8">
            <path d="M55 10 l30 -15 30 15 -30 15 z M55 10 v26 l30 15 v-26 z M115 10 v26 l-30 15 v-26 z" fill="#ffffff" />
            <line x1="85" y1="52" x2="85" y2="85" strokeDasharray="3 3" strokeWidth="1.6" />
            <g transform="translate(0, 55)">
              <path d="M55 10 l30 -15 30 15 -30 15 z M55 10 v26 l30 15 v-26 z M115 10 v26 l-30 15 v-26 z" fill="#ffffff" />
            </g>
          </g>

          {/* Guide Line */}
          <line x1="130" y1="170" x2="130" y2="220" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Graduation Cap & Tassel (Upper-Middle) */}
          <g transform="translate(25, 235)">
            <polygon points="90 15, 160 40, 90 65, 20 40" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <path d="M45 52v28c0 6 45 12 45 12s45-6 45-12V52" stroke="#0a0a0a" strokeWidth="1.5" fill="none" />
            <line x1="148" y1="44" x2="148" y2="84" stroke="#d97706" strokeWidth="1.6" />
            <circle cx="148" cy="87" r="3.5" fill="#d97706" />
          </g>

          {/* Guide Line */}
          <line x1="130" y1="345" x2="130" y2="395" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. QR Target Scanner Matrix (Lower-Middle) */}
          <g transform="translate(35, 410)">
            <rect x="0" y="0" width="115" height="115" rx="6" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <path d="M15 15h24v24H15zM21 21v12h12V21zM76 15h24v24H76zM82 21v12h12V21zM15 76h24v24H15zM21 82v12h12V82zM46 15h12v14H46zM46 36h12v12H46zM58 52h14v10H58zM72 52h16v10H72zM46 68h12v12H46zM68 68h10v12H68zM84 68h10v22H84z" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="130" y1="540" x2="130" y2="590" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 4. Verification Shield & Checkmark (Bottom) */}
          <g transform="translate(35, 605)">
            <path d="M60 0 s45-18 45-45 v-35 l-45-15 -45 15 v35 c0 27 45 45 45 45z" transform="translate(0, 95)" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="42 70 54 82 78 55" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default HomeDecorations;

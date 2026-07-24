/* ─────────────────────────────────────────────────────────────
   StudentDashboardDecorations.jsx
   - Page-specific background decorations for Student Wallet & Certificates.
   - Theme: Student Credentials, Graduation Cap, Academic Transcripts & Verified Badges.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function StudentDashboardDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Graduation Cap, Transcript, Identity Badge, Star Seal & Portfolio Badge (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="studGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#studGridLeft)" opacity="0.35" />

          {/* 1. Graduation Cap (Top) */}
          <g transform="translate(10, 15)">
            <polygon points="70 8, 130 28, 70 48, 10 28" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" />
            <path d="M30 38v20c0 5 40 9 40 9s40-4 40-9V38" stroke="#0a0a0a" strokeWidth="1.8" fill="none" />
            <line x1="115" y1="32" x2="115" y2="60" stroke="#0a0a0a" strokeWidth="1.8" />
            <circle cx="115" cy="63" r="4" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="85" x2="70" y2="120" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Academic Transcript Document Preview */}
          <g transform="translate(10, 125)">
            <rect x="0" y="0" width="125" height="125" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="15" y1="20" x2="110" y2="20" stroke="#0a0a0a" strokeWidth="2.2" />
            <line x1="15" y1="34" x2="90" y2="34" stroke="#0a0a0a" strokeWidth="1.6" />
            <line x1="15" y1="50" x2="110" y2="50" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="66" x2="110" y2="66" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="82" x2="110" y2="82" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="98" x2="80" y2="98" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="255" x2="70" y2="290" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Student Identity Badge */}
          <g transform="translate(10, 295)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="25" cy="35" r="13" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            <line x1="48" y1="26" x2="112" y2="26" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="48" y1="38" x2="98" y2="38" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="48" y1="50" x2="82" y2="50" stroke="#0a0a0a" strokeWidth="1.2" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="370" x2="70" y2="405" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Verified Academic Star Ribbon Badge */}
          <g transform="translate(20, 410)">
            <circle cx="40" cy="38" r="34" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <polygon points="40 14, 47 26, 60 28, 50 37, 53 49, 40 42, 27 49, 30 37, 20 28, 33 26" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <path d="M32 64l-6 18 14-5 14 5-6-18" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="500" x2="70" y2="535" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Student Verified Portfolio Badge */}
          <g transform="translate(10, 540)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">STUDENT CREDENTIAL</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">VERIFIED PORTFOLIO</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ AUTHENTICATED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="613" x2="70" y2="648" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Academic Honor Seal (Bottom) */}
          <g transform="translate(25, 653)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M30 40 l10 10 20 -20" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="15" y="90" fontFamily="sans-serif" fontSize="7.5" fontWeight="bold" fill="#0a0a0a" letterSpacing="0.05em">ACADEMIC HONORS</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Digital Wallet, QR Scanner, Block Stack & Security Lock (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="studGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#studGridRight)" opacity="0.35" />

          {/* 1. Digital Wallet Stack (Top) */}
          <g transform="translate(15, 15)">
            <rect x="10" y="0" width="120" height="70" rx="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="5" y="6" width="120" height="70" rx="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="0" y="12" width="120" height="70" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="40" r="8" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <line x1="38" y1="34" x2="102" y2="34" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="38" y1="46" x2="88" y2="46" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="98" x2="70" y2="133" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. QR Scanner Matrix */}
          <g transform="translate(25, 138)">
            <rect x="0" y="0" width="90" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h20v20H10zM15 15v10h10V15zM60 10h20v20H60zM65 15v10h10V15zM10 60h20v20H10zM15 65v10h10V65zM38 10h8v10H38zM38 28h8v8H38zM46 40h10v6H46zM58 40h15v6H58zM38 52h8v8H38zM52 52h8v8H52zM65 52h8v15H65z" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="233" x2="70" y2="268" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. 3D Isometric Ledger Block Stack */}
          <g transform="translate(30, 273)" stroke="#0a0a0a" strokeWidth="2">
            <path d="M38 8 l22 -11 22 11 -22 11 z M38 8 v16 l22 11 v-16 z M82 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            <line x1="60" y1="35" x2="60" y2="60" strokeDasharray="3 3" strokeWidth="1.6" />
            <g transform="translate(0, 44)">
              <path d="M38 8 l22 -11 22 11 -22 11 z M38 8 v16 l22 11 v-16 z M82 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            </g>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="390" x2="70" y2="425" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Credentials Verified Metric Badge */}
          <g transform="translate(15, 430)">
            <rect x="0" y="0" width="125" height="65" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">CREDENTIALS</text>
            <text x="10" y="38" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ AUTHENTICATED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="500" x2="70" y2="535" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. RSA Security Lock Badge */}
          <g transform="translate(20, 540)">
            <rect x="0" y="24" width="105" height="65" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M26 24 V15 a26 26 0 0 1 52 0 V24" stroke="#0a0a0a" strokeWidth="2" fill="none" />
            <circle cx="52.5" cy="48" r="5" fill="#0a0a0a" />
            <line x1="52.5" y1="53" x2="52.5" y2="70" stroke="#0a0a0a" strokeWidth="2.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="635" x2="70" y2="670" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Blockchain Immutable Ledger Badge (Bottom) */}
          <g transform="translate(10, 675)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">BLOCKCHAIN LEDGER</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">BLOCK #984201</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN ANCHOR</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default StudentDashboardDecorations;

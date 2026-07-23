/* ─────────────────────────────────────────────────────────────
   UniversityDashboardDecorations.jsx
   - Page-specific background decorations for University Dashboard.
   - Theme: Institutional Registrar, University Buildings, RSA Keys, Vault Archives.
   - Un-clipped vector illustrations spanning top to bottom (15% opacity).
   ───────────────────────────────────────────────────────────── */

export function UniversityDashboardDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Registrar Seal, Campus, Workflow & Vault (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 180 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="univGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="5" y="5" width="170" height="990" fill="url(#univGridLeft)" opacity="0.3" />

          {/* 1. Institutional Registrar Seal (Top) */}
          <g transform="translate(15, 20)">
            <circle cx="50" cy="50" r="44" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="50" cy="50" r="36" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
            <path d="M30 68h40 M34 68V48 M44 68V48 M56 68V48 M66 68V48 M30 48h40 M50 32L30 48h40z" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />
            <text x="20" y="82" fontFamily="serif" fontSize="6" fontWeight="bold" fill="#0a0a0a">INSTITUTIONAL REGISTRAR</text>
          </g>

          {/* Connecting Line */}
          <line x1="65" y1="120" x2="65" y2="160" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. University Campus Pediment Outline */}
          <g transform="translate(10, 165)">
            <polygon points="55 5, 0 30, 110 30" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <line x1="0" y1="30" x2="110" y2="30" stroke="#0a0a0a" strokeWidth="1.6" />
            <line x1="10" y1="30" x2="10" y2="60" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="35" y1="30" x2="35" y2="60" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="55" y1="30" x2="55" y2="60" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="75" y1="30" x2="75" y2="60" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="100" y1="30" x2="100" y2="60" stroke="#0a0a0a" strokeWidth="1.4" />
            <rect x="0" y="60" width="110" height="5" fill="#0a0a0a" />
          </g>

          {/* Connecting Line */}
          <line x1="65" y1="240" x2="65" y2="280" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Certificate Issuance Workflow Nodes */}
          <g transform="translate(15, 285)">
            <path d="M50 0 V140" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="50" cy="20" r="5" fill="#0a0a0a" />
            <circle cx="50" cy="70" r="6" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="50" cy="120" r="5" fill="#0a0a0a" />
            <text x="65" y="24" fontFamily="monospace" fontSize="8" fill="#666666">ISSUE</text>
            <text x="65" y="74" fontFamily="monospace" fontSize="8" fill="#666666">SIGN</text>
            <text x="65" y="124" fontFamily="monospace" fontSize="8" fill="#666666">ANCHOR</text>
          </g>

          {/* Connecting Line */}
          <line x1="65" y1="440" x2="65" y2="480" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 4. Academic Parchment Degree */}
          <g transform="translate(10, 485)">
            <rect x="0" y="0" width="130" height="95" rx="3" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <rect x="8" y="8" width="114" height="79" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <line x1="20" y1="24" x2="110" y2="24" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="20" y1="36" x2="90" y2="36" stroke="#666666" strokeWidth="1" />
            <line x1="20" y1="48" x2="100" y2="48" stroke="#8c8c8c" strokeWidth="0.8" />
            <circle cx="98" cy="65" r="10" stroke="#0a0a0a" strokeWidth="1" fill="#ffffff" />
          </g>

          {/* Connecting Line */}
          <line x1="65" y1="590" x2="65" y2="630" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 5. Document Vault Folder (Bottom) */}
          <g transform="translate(10, 635)">
            <path d="M0 10 h32 l12 12 h88 a3 3 0 0 1 3 3 v65 a3 3 0 0 1 -3 3 h-132 a3 3 0 0 1 -3 -3 v-77 a3 3 0 0 1 3 -3 z" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <rect x="14" y="30" width="104" height="40" rx="2" stroke="#0a0a0a" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <line x1="24" y1="44" x2="106" y2="44" stroke="#0a0a0a" strokeWidth="1.2" />
          </g>
        </svg>
      </div>

      {/* Right Column: Cloud Bulk, RSA Key, Issued Metric & 3D Blocks (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 180 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="univGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="5" y="5" width="170" height="990" fill="url(#univGridRight)" opacity="0.3" />

          {/* 1. Bulk Document Cloud Processing (Top) */}
          <g transform="translate(30, 20)">
            <path d="M12 32 a20 20 0 0 1 32 -13 a26 26 0 0 1 44 6 a20 20 0 0 1 0 32 h-76 a16 16 0 0 1 0 -25 z" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="48 50 48 30 42 36 M48 30 54 36" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="95" x2="75" y2="135" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. RSA-2048 Digital Signature & Key */}
          <g transform="translate(15, 140)">
            <rect x="0" y="0" width="125" height="75" rx="3" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <path d="M15 42 Q30 15, 42 35 T70 28 T95 45" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />
            <circle cx="102" cy="18" r="7" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
            <path d="M102 24 v10 h6 v-4 h-6" stroke="#0a0a0a" strokeWidth="1" fill="none" />
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="225" x2="75" y2="265" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Total Issued Metric Badge */}
          <g transform="translate(15, 270)">
            <rect x="0" y="0" width="125" height="60" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="18" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">TOTAL ISSUED</text>
            <text x="10" y="38" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">1,482</text>
            <text x="10" y="50" fontFamily="monospace" fontSize="7" fill="#666666">✓ SIGNED & ANCHORED</text>
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="340" x2="75" y2="380" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 4. 3D Isometric Ledger Block Stack */}
          <g transform="translate(35, 390)" stroke="#0a0a0a" strokeWidth="1.4">
            <path d="M40 8 l22 -11 22 11 -22 11 z M40 8 v16 l22 11 v-16 z M84 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            <line x1="62" y1="35" x2="62" y2="60" strokeDasharray="3 3" strokeWidth="1.4" />
            <g transform="translate(0, 44)">
              <path d="M40 8 l22 -11 22 11 -22 11 z M40 8 v16 l22 11 v-16 z M84 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            </g>
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="505" x2="75" y2="545" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 5. QR Code Scanner Matrix */}
          <g transform="translate(30, 555)">
            <rect x="0" y="0" width="85" height="85" rx="5" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h20v20H10zM15 15v10h10V15zM55 10h20v20H55zM60 15v10h10V15zM10 55h20v20H10zM15 60v10h10V60zM38 10h8v10H38zM38 30h8v8H38zM46 42h10v6H46zM58 42h15v6H58zM38 55h8v8H38zM55 55h8v8H55zM68 55h7v14H68z" fill="#0a0a0a" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default UniversityDashboardDecorations;

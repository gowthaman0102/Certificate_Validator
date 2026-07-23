/* ─────────────────────────────────────────────────────────────
   UniversityLoginDecorations.jsx
   - Page-specific background decorations for University Login & Register.
   - Theme: University Campus Building, Registrar Vault Door & Institutional Security.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function UniversityLoginDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: Campus Building, Registrar Vault & Faculty Auth Shield */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. University Campus Building & Columns (Top) */}
          <g transform="translate(15, 30)" stroke="#0a0a0a" strokeWidth="1.6">
            <polygon points="85 10, 10 40, 160 40" fill="#ffffff" />
            <line x1="10" y1="40" x2="160" y2="40" strokeWidth="2" />
            <line x1="25" y1="40" x2="25" y2="85" strokeWidth="1.6" />
            <line x1="60" y1="40" x2="60" y2="85" strokeWidth="1.6" />
            <line x1="110" y1="40" x2="110" y2="85" strokeWidth="1.6" />
            <line x1="145" y1="40" x2="145" y2="85" strokeWidth="1.6" />
            <rect x="10" y="85" width="150" height="6" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="140" x2="90" y2="190" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Registrar Institutional Vault Door (Upper-Middle) */}
          <g transform="translate(20, 205)">
            <rect x="0" y="0" width="140" height="120" rx="6" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="70" cy="60" r="32" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <circle cx="70" cy="60" r="22" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
            <circle cx="70" cy="60" r="8" fill="#0a0a0a" />
            <line x1="70" y1="28" x2="70" y2="18" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="70" y1="92" x2="70" y2="102" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="38" y1="60" x2="28" y2="60" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="102" y1="60" x2="112" y2="60" stroke="#0a0a0a" strokeWidth="2" />
          </g>

          {/* Guide Line */}
          <line x1="90" y1="340" x2="90" y2="390" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Faculty Auth Shield & Key Badge (Bottom) */}
          <g transform="translate(20, 405)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTITUTION AUTH</text>
            <text x="12" y="44" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">FACULTY PORTAL</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ RSA-2048 ENCRYPTED</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Admin Keycard, RSA Keyring & Security Protocol */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Admin Institutional Keycard (Top) */}
          <g transform="translate(30, 30)">
            <rect x="0" y="0" width="140" height="90" rx="6" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <rect x="15" y="18" width="30" height="24" rx="2" fill="#0a0a0a" />
            <line x1="55" y1="24" x2="125" y2="24" stroke="#0a0a0a" strokeWidth="1.6" />
            <line x1="55" y1="36" x2="105" y2="36" stroke="#666666" strokeWidth="1.2" />
            <line x1="15" y1="58" x2="125" y2="58" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x="15" y="74" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#0a0a0a">ISSUER CODE: ABC001</text>
          </g>

          {/* Guide Line */}
          <line x1="100" y1="135" x2="100" y2="185" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. RSA Cryptographic Keyring Symbol (Upper-Middle) */}
          <g transform="translate(35, 200)">
            <circle cx="45" cy="45" r="35" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="45" cy="45" r="18" stroke="#4f46e5" strokeWidth="1.2" fill="none" />
            <path d="M45 80 v30 h15 v-10 h-15 v-10 h10 v-10 h-10" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Guide Line */}
          <line x1="100" y1="330" x2="100" y2="380" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Secure Protocol Seal (Bottom) */}
          <g transform="translate(30, 395)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">SECURITY PROTOCOL</text>
            <text x="12" y="44" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">2FA PROTECTED</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ ZERO-TRUST GATEWAY</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default UniversityLoginDecorations;

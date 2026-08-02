/* ─────────────────────────────────────────────────────────────
   AuditLogDecorations.jsx
   - Page-specific background decorations for Audit Log & Compliance.
   - Theme: Security Logs, Timestamp Clock, Compliance Stack & Audit Trail.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function AuditLogDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Security Log Stack, Event Stream, System Shield & Audit Badges (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="auditGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#auditGridLeft)" opacity="0.35" />

          {/* 1. Security Log File Stack (Top) */}
          <g transform="translate(15, 15)">
            <rect x="10" y="0" width="110" height="110" rx="3" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="5" y="6" width="110" height="110" rx="3" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="0" y="12" width="110" height="110" rx="3" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="15" y1="28" x2="95" y2="28" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="15" y1="44" x2="85" y2="44" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="58" x2="90" y2="58" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="72" x2="75" y2="72" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="15" y1="86" x2="88" y2="86" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="140" x2="70" y2="175" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Audit Event Node Chain */}
          <g transform="translate(15, 180)">
            <rect x="0" y="0" width="115" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="35" r="8" fill="#0a0a0a" />
            <line x1="36" y1="26" x2="100" y2="26" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="36" y1="38" x2="90" y2="38" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="36" y1="50" x2="80" y2="50" stroke="#0a0a0a" strokeWidth="1.2" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="255" x2="70" y2="290" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. System Access Shield */}
          <g transform="translate(20, 295)">
            <path d="M45 0 s35-15 35-35 v-25 l-35-12 -35 12 v25 c0 20 35 35 35 35z" transform="translate(0, 75)" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="32 55 42 65 60 42" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="405" x2="70" y2="440" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Immutable Log Badge */}
          <g transform="translate(10, 445)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">SECURITY AUDIT</text>
            <text x="10" y="40" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">IMMUTABLE LOG</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ 100% VERIFIED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="518" x2="70" y2="553" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. SHA-256 Lock Node */}
          <g transform="translate(15, 558)">
            <rect x="0" y="0" width="115" height="75" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="57.5" cy="32" r="14" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            <path d="M52 32 h11 v12 h-11 z M55 32 v-5 a3 3 0 0 1 6 0 v5" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <text x="14" y="62" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">SHA-256 VERIFIED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="638" x2="70" y2="673" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Cryptographic Footprint Badge (Bottom) */}
          <g transform="translate(10, 678)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">AUDIT FOOTPRINT</text>
            <text x="10" y="40" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">TAMPER-PROOF</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN SYNC</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Timestamp Clock, Compliance Trail, Activity Log & Metrics (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="auditGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#auditGridRight)" opacity="0.35" />

          {/* 1. Timestamp Clock Motif (Top) */}
          <g transform="translate(25, 15)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="45 18, 45 40, 60 50" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="95" x2="70" y2="130" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Immutable Compliance Trail Shield */}
          <g transform="translate(10, 135)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">COMPLIANCE TRAIL</text>
            <text x="10" y="38" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">AUDIT ID: #AUD-9201</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">STATUS: IMMUTABLE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="210" x2="70" y2="245" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Real-Time Activity Log Box */}
          <g transform="translate(15, 250)">
            <rect x="0" y="0" width="115" height="80" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="16" cy="22" r="4" fill="#0a0a0a" />
            <line x1="28" y1="22" x2="100" y2="22" stroke="#0a0a0a" strokeWidth="1.8" />
            <circle cx="16" cy="40" r="4" fill="#0a0a0a" />
            <line x1="28" y1="40" x2="90" y2="40" stroke="#0a0a0a" strokeWidth="1.4" />
            <circle cx="16" cy="58" r="4" fill="#0a0a0a" />
            <line x1="28" y1="58" x2="95" y2="58" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="335" x2="70" y2="370" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Audit Log Summary Metric Badge */}
          <g transform="translate(10, 375)">
            <rect x="0" y="0" width="125" height="65" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LOG EVENTS</text>
            <text x="10" y="40" fontFamily="serif" fontSize="10.5" fontWeight="bold" fill="#0a0a0a">CRYPTOGRAPHIC</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ZERO TAMPERING</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="445" x2="70" y2="480" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. Access Protocol Token Monitor */}
          <g transform="translate(10, 485)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">ACCESS PROTOCOL</text>
            <text x="10" y="40" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#0a0a0a">2FA VALIDATED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ FULL COMPLIANCE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="560" x2="70" y2="595" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Zero-Knowledge Storage Seal (Bottom) */}
          <g transform="translate(25, 600)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M30 40 l10 10 20 -20" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="15" y="90" fontFamily="sans-serif" fontSize="7.5" fontWeight="bold" fill="#0a0a0a" letterSpacing="0.05em">ZERO-KNOWLEDGE</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default AuditLogDecorations;

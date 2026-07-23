/* ─────────────────────────────────────────────────────────────
   AuditLogDecorations.jsx
   - Page-specific background decorations for Audit Log & Compliance.
   - Theme: Security Logs, Timestamp Clock, Compliance Stack & Audit Trail.
   - Un-clipped vector illustrations spanning top to bottom (100% inside 160px viewBox).
   ───────────────────────────────────────────────────────────── */

export function AuditLogDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Security Log Stack, Event Stream & Audit Trail (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dot Grid */}
          <pattern id="auditGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="0" y="0" width="160" height="1000" fill="url(#auditGridLeft)" opacity="0.25" />

          {/* 1. Security Log File Stack (Top) */}
          <g transform="translate(15, 20)">
            <rect x="12" y="0" width="115" height="135" rx="3" stroke="#8c8c8c" strokeWidth="1.2" fill="#ffffff" />
            <rect x="6" y="8" width="115" height="135" rx="3" stroke="#666666" strokeWidth="1.4" fill="#ffffff" />
            <rect x="0" y="16" width="115" height="135" rx="3" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            
            <line x1="15" y1="35" x2="100" y2="35" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="15" y1="50" x2="90" y2="50" stroke="#666666" strokeWidth="1.2" />
            <line x1="15" y1="65" x2="95" y2="65" stroke="#666666" strokeWidth="1.2" />
            <line x1="15" y1="80" x2="80" y2="80" stroke="#666666" strokeWidth="1.2" />
            <line x1="15" y1="95" x2="92" y2="95" stroke="#666666" strokeWidth="1.2" />
            <line x1="15" y1="110" x2="75" y2="110" stroke="#666666" strokeWidth="1.2" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="72" y1="175" x2="72" y2="215" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. Audit Event Node Chain */}
          <g transform="translate(15, 220)">
            <rect x="0" y="0" width="115" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="20" cy="38" r="8" fill="#0a0a0a" />
            <line x1="38" y1="28" x2="100" y2="28" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="38" y1="40" x2="90" y2="40" stroke="#666666" strokeWidth="1" />
            <line x1="38" y1="52" x2="80" y2="52" stroke="#8c8c8c" strokeWidth="0.8" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="72" y1="300" x2="72" y2="340" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. System Access Shield */}
          <g transform="translate(15, 345)">
            <path d="M55 0 s40-15 40-40 v-30 l-40-15 -40 15 v30 c0 25 40 40 40 40z" transform="translate(0, 85)" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="42 65 52 75 72 52" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="72" y1="440" x2="72" y2="480" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 4. Immutable Log Badge (Bottom) */}
          <g transform="translate(10, 485)">
            <rect x="0" y="0" width="125" height="65" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">SECURITY AUDIT</text>
            <text x="10" y="38" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">IMMUTABLE</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7" fill="#666666">✓ 100% VERIFIED LOG</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Timestamp Clock, Compliance Trail & Integrity Shield (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dot Grid */}
          <pattern id="auditGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="0" y="0" width="160" height="1000" fill="url(#auditGridRight)" opacity="0.25" />

          {/* 1. Timestamp Clock Motif (Top) */}
          <g transform="translate(25, 20)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="45 20, 45 45, 62 55" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="110" x2="70" y2="150" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. Immutable Compliance Trail Shield */}
          <g transform="translate(15, 155)">
            <rect x="0" y="0" width="125" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">COMPLIANCE TRAIL</text>
            <text x="10" y="38" fontFamily="monospace" fontSize="7.5" fill="#666666">AUDIT ID: #AUD-9201</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7.5" fill="#666666">STATUS: IMMUTABLE</text>
            <path d="M100 56 l4 4 l8 -8" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="245" x2="70" y2="285" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Real-Time Activity Log Box */}
          <g transform="translate(15, 290)">
            <rect x="0" y="0" width="125" height="85" rx="4" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="16" cy="22" r="4" fill="#0a0a0a" />
            <line x1="28" y1="22" x2="110" y2="22" stroke="#0a0a0a" strokeWidth="1.4" />
            <circle cx="16" cy="42" r="4" fill="#0a0a0a" />
            <line x1="28" y1="42" x2="100" y2="42" stroke="#666666" strokeWidth="1.2" />
            <circle cx="16" cy="62" r="4" fill="#0a0a0a" />
            <line x1="28" y1="62" x2="105" y2="62" stroke="#8c8c8c" strokeWidth="1" />
          </g>

          {/* Vertical Guide Line */}
          <line x1="70" y1="390" x2="70" y2="430" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 4. Audit Log Summary Metric Badge (Bottom) */}
          <g transform="translate(15, 435)">
            <rect x="0" y="0" width="125" height="60" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="18" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">LOG EVENTS</text>
            <text x="10" y="38" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">CRYPTOGRAPHIC</text>
            <text x="10" y="50" fontFamily="monospace" fontSize="7" fill="#666666">✓ ZERO TAMPERING</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default AuditLogDecorations;

/* ─────────────────────────────────────────────────────────────
   WalletDashboardDecorations.jsx
   - Page-specific background decorations for Student Wallet Dashboard.
   - Theme: Mobile Digital Wallet, Encrypted Cloud Storage & Shareable Credential Links.
   - Fixed side columns (8-12% opacity), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function WalletDashboardDecorations() {
  return (
    <div className="page-decor-wrapper" aria-hidden="true">
      {/* Left Column: Mobile Digital Wallet Device & Pass Key */}
      <div className="page-decor-column-left">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Mobile Digital Wallet Smartphone Outline (Top) */}
          <g transform="translate(25, 30)">
            <rect x="0" y="0" width="120" height="190" rx="14" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="45" y1="12" x2="75" y2="12" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
            <rect x="12" y="28" width="96" height="134" rx="4" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <circle cx="60" cy="176" r="5" stroke="#0a0a0a" strokeWidth="1.2" fill="none" />
            <rect x="22" y="50" width="76" height="45" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <circle cx="34" cy="72.5" r="5" fill="#0a0a0a" />
          </g>

          {/* Guide Line */}
          <line x1="85" y1="235" x2="85" y2="285" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Verified Pass Key Symbol (Upper-Middle) */}
          <g transform="translate(25, 300)">
            <circle cx="35" cy="35" r="28" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="35" cy="35" r="14" stroke="#4f46e5" strokeWidth="1.2" fill="none" />
            <path d="M35 63 v35 h12 v-8 h-12 v-8 h8 v-8 h-8" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Guide Line */}
          <line x1="85" y1="440" x2="85" y2="490" stroke="#4f46e5" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Encrypted Vault Badge (Bottom) */}
          <g transform="translate(15, 505)">
            <rect x="0" y="0" width="140" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <text x="12" y="22" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">CREDENTIAL VAULT</text>
            <text x="12" y="44" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0a0a0a">OFFLINE READY</text>
            <text x="12" y="58" fontFamily="monospace" fontSize="7.5" fill="#666666">✓ AES-256 ENCRYPTED</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Encrypted Cloud Vault, Shareable Link & Security Seal */}
      <div className="page-decor-column-right">
        <svg width="100%" height="100%" viewBox="0 0 200 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 1. Encrypted Cloud Storage Vault (Top) */}
          <g transform="translate(25, 30)">
            <path d="M15 45 a22 22 0 0 1 36 -14 a28 28 0 0 1 48 7 a22 22 0 0 1 0 35 h-84 a18 18 0 0 1 0 -28 z" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" fillOpacity="0.95" />
            <rect x="52" y="40" width="26" height="20" rx="2" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
            <path d="M59 40 V34 a6 6 0 0 1 12 0 V40" stroke="#0a0a0a" strokeWidth="1.2" fill="none" />
          </g>

          {/* Guide Line */}
          <line x1="95" y1="130" x2="95" y2="180" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 2. Shareable Credential Link Node (Upper-Middle) */}
          <g transform="translate(25, 195)">
            <rect x="0" y="0" width="140" height="85" rx="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="35" cy="42" r="12" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <circle cx="105" cy="42" r="12" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <line x1="47" y1="42" x2="93" y2="42" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="3 3" />
            <text x="35" y="74" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">SHAREABLE QR LINK</text>
          </g>

          {/* Guide Line */}
          <line x1="95" y1="295" x2="95" y2="345" stroke="#0ea5e9" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.6" />

          {/* 3. Verified Security Seal (Bottom) */}
          <g transform="translate(25, 360)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.95" />
            <path d="M30 45l10 10 20-20" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default WalletDashboardDecorations;

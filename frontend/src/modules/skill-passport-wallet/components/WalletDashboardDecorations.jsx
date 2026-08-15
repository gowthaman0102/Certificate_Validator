/* ─────────────────────────────────────────────────────────────
   WalletDashboardDecorations.jsx
   - Page-specific background decorations for Student Wallet Dashboard.
   - Theme: Mobile Digital Wallet, Encrypted Cloud Storage & Shareable Credential Links.
   - Fixed side columns (42% opacity, 170px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function WalletDashboardDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Smartphone Digital Wallet, Pass Key, Encrypted Vault & Card Stack (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="wallGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#wallGridLeft)" opacity="0.35" />

          {/* 1. Mobile Digital Wallet Smartphone Outline (Top) */}
          <g transform="translate(15, 15)">
            <rect x="0" y="0" width="125" height="185" rx="14" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="45" y1="12" x2="80" y2="12" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="10" y="26" width="105" height="132" rx="4" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
            <circle cx="62.5" cy="172" r="5" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <rect x="20" y="48" width="85" height="48" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <circle cx="32" cy="72" r="5" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="215" x2="70" y2="250" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Verified Pass Key Symbol */}
          <g transform="translate(20, 255)">
            <circle cx="35" cy="35" r="28" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="35" cy="35" r="14" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
            <path d="M35 63 v35 h14 v-8 h-14 v-8 h9 v-8 h-9" stroke="#0a0a0a" strokeWidth="2" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="385" x2="70" y2="420" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Encrypted Vault Badge */}
          <g transform="translate(10, 425)">
            <rect x="0" y="0" width="125" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">CREDENTIAL VAULT</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">OFFLINE READY</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ AES-256 ENCRYPTED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="500" x2="70" y2="535" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Digital Credential Card Stack */}
          <g transform="translate(15, 540)">
            <rect x="10" y="0" width="110" height="70" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="5" y="6" width="110" height="70" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="0" y="12" width="110" height="70" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <line x1="15" y1="30" x2="95" y2="30" stroke="#0a0a0a" strokeWidth="2" />
            <line x1="15" y1="45" x2="75" y2="45" stroke="#0a0a0a" strokeWidth="1.4" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="625" x2="70" y2="660" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. RSA Encrypted Storage Seal (Bottom) */}
          <g transform="translate(25, 665)">
            <circle cx="45" cy="40" r="36" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M30 40 l10 10 20 -20" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="15" y="90" fontFamily="sans-serif" fontSize="7.5" fontWeight="bold" fill="#0a0a0a" letterSpacing="0.05em">ENCRYPTED VAULT</text>
          </g>
        </svg>
      </div>

      {/* Right Column: Encrypted Cloud Storage, Shareable Link & Security Seal (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 160 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="wallGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#0a0a0a" opacity="0.45" />
          </pattern>
          <rect x="0" y="0" width="160" height="850" fill="url(#wallGridRight)" opacity="0.35" />

          {/* 1. Encrypted Cloud Storage Vault (Top) */}
          <g transform="translate(15, 15)">
            <path d="M15 45 a22 22 0 0 1 36 -14 a28 28 0 0 1 48 7 a22 22 0 0 1 0 35 h-84 a18 18 0 0 1 0 -28 z" stroke="#0a0a0a" strokeWidth="2.2" fill="#ffffff" fillOpacity="0.95" />
            <rect x="52" y="40" width="26" height="20" rx="2" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <path d="M59 40 V34 a6 6 0 0 1 12 0 V40" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="100" x2="70" y2="135" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Shareable Credential Link Node */}
          <g transform="translate(10, 140)">
            <rect x="0" y="0" width="125" height="80" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="30" cy="40" r="12" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <circle cx="95" cy="40" r="12" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <line x1="42" y1="40" x2="83" y2="40" stroke="#0a0a0a" strokeWidth="2.2" strokeDasharray="3 3" />
            <text x="18" y="70" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">SHAREABLE QR LINK</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="230" x2="70" y2="265" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Verified Security Shield Seal */}
          <g transform="translate(20, 270)">
            <path d="M45 0 s35-15 35-35 v-25 l-35-12 -35 12 v25 c0 20 35 35 35 35z" transform="translate(0, 75)" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <polyline points="32 55 42 65 60 42" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="380" x2="70" y2="415" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Instant Share Matrix Badge */}
          <g transform="translate(10, 420)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">INSTANT SHARE</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">1-CLICK PROOF</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ZERO KNOWLEDGE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="495" x2="70" y2="530" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. QR Code Share Target */}
          <g transform="translate(25, 535)">
            <rect x="0" y="0" width="90" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h20v20H10zM15 15v10h10V15zM60 10h20v20H60zM65 15v10h10V15zM10 60h20v20H10zM15 65v10h10V65zM38 10h8v10H38zM38 28h8v8H38zM46 40h10v6H46zM58 40h15v6H58zM38 52h8v8H38zM52 52h8v8H52zM65 52h8v15H65z" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="70" y1="630" x2="70" y2="665" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. On-Chain Ledger Anchor Seal (Bottom) */}
          <g transform="translate(10, 670)">
            <rect x="0" y="0" width="125" height="68" rx="4" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="10" y="40" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">PROOF VALIDATED</text>
            <text x="10" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN SYNC</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default WalletDashboardDecorations;

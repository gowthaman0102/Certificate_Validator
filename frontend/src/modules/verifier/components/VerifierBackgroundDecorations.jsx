/* ─────────────────────────────────────────────────────────────
   VerifierBackgroundDecorations.jsx
   - Enterprise SaaS background vector graphics for the Verifier page.
   - Low opacity (12%), non-interactive (pointer-events: none),
     incorporating certificate verification, blockchain nodes,
     large shield check, magnifying glass, digital signature, QR scan motifs,
     and bottom hexagonal ledger waves & cryptographic badges.
   ───────────────────────────────────────────────────────────── */

export function VerifierBackgroundDecorations() {
  return (
    <>
      {/* Left Side Verification Composition */}
      <div className="verifier-side-decoration verifier-side-left" aria-hidden="true">
        <svg width="440" height="600" viewBox="0 0 440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Matrix Pattern */}
          <pattern id="verifyDotGridLeft" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.3" />
          </pattern>
          <rect x="20" y="30" width="160" height="160" fill="url(#verifyDotGridLeft)" opacity="0.4" />
          <rect x="240" y="380" width="150" height="150" fill="url(#verifyDotGridLeft)" opacity="0.35" />

          {/* Cryptographic Network Connections */}
          <path d="M50 120 L160 220 L110 380 L320 280 L360 440" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="50" cy="120" r="4" fill="#0a0a0a" />
          <circle cx="160" cy="220" r="5" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" />
          <circle cx="110" cy="380" r="4" fill="#0a0a0a" />
          <circle cx="320" cy="280" r="5" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" />
          <circle cx="360" cy="440" r="4" fill="#0a0a0a" />

          {/* Secure Digital Certificate Illustration */}
          <g transform="translate(160, 60)">
            <rect x="0" y="0" width="200" height="250" rx="4" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            <rect x="14" y="14" width="172" height="222" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            
            {/* Header / Title lines */}
            <line x1="40" y1="42" x2="160" y2="42" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="60" y1="56" x2="140" y2="56" stroke="#666666" strokeWidth="1.4" strokeLinecap="round" />
            
            {/* Body content lines */}
            <line x1="30" y1="88" x2="170" y2="88" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="30" y1="104" x2="155" y2="104" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="30" y1="120" x2="160" y2="120" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="30" y1="136" x2="130" y2="136" stroke="#8c8c8c" strokeWidth="1" />
            
            {/* Verified Stamp Motif */}
            <g transform="translate(135, 175)">
              <circle cx="20" cy="20" r="22" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
              <circle cx="20" cy="20" r="17" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
              <path d="M12 20 l6 6 l12 -12" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* Scanned QR Code Motif */}
          <g transform="translate(30, 240)">
            <rect x="0" y="0" width="120" height="120" rx="8" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            {/* Corner Bracket Scanners */}
            <path d="M-8 15 V-8 H15" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M128 15 V-8 H105" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M-8 105 V128 H15" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M128 105 V128 H105" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Embedded QR Code Blocks */}
            <path d="M15 15h30v30H15zM22 22v16h16V22zM75 15h30v30H75zM82 22v16h16V22zM15 75h30v30H15zM22 82v16h16V82zM55 15h10v16H55zM55 40h10v10H55zM65 55h15v10H65zM80 55h15v10H80zM55 70h12v12H55zM75 70h12v12H75zM90 70h8v24H90zM65 85h12v15H65z" fill="#0a0a0a" />
          </g>

          {/* Tamper Detection Pipeline Wave */}
          <path d="M10 480 Q100 440, 200 480 T390 480" stroke="#0a0a0a" strokeWidth="1.4" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Right Side Verification Composition */}
      <div className="verifier-side-decoration verifier-side-right" aria-hidden="true">
        <svg width="440" height="600" viewBox="0 0 440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Matrix Pattern */}
          <pattern id="verifyDotGridRight" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.3" />
          </pattern>
          <rect x="230" y="20" width="170" height="170" fill="url(#verifyDotGridRight)" opacity="0.4" />
          <rect x="30" y="380" width="140" height="140" fill="url(#verifyDotGridRight)" opacity="0.35" />

          {/* Concentric Verification Target Rings */}
          <circle cx="280" cy="180" r="120" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="280" cy="180" r="85" stroke="#0a0a0a" strokeWidth="1" opacity="0.7" />

          {/* Magnifying Glass Inspecting Certificate */}
          <g transform="translate(50, 160)">
            <circle cx="70" cy="70" r="50" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.9" />
            <line x1="108" y1="108" x2="160" y2="160" stroke="#0a0a0a" strokeWidth="6" strokeLinecap="round" />
            {/* Mini Document inside Magnifier */}
            <rect x="42" y="42" width="56" height="56" rx="2" stroke="#0a0a0a" strokeWidth="1" fill="none" />
            <line x1="50" y1="54" x2="88" y2="54" stroke="#0a0a0a" strokeWidth="1.4" />
            <line x1="50" y1="64" x2="80" y2="64" stroke="#666666" strokeWidth="1" />
            <line x1="50" y1="74" x2="84" y2="74" stroke="#666666" strokeWidth="1" />
            <path d="M74 80 l4 4 l8 -8" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Secure Lock & Digital Signature Outline */}
          <g transform="translate(220, 320)">
            <rect x="0" y="40" width="140" height="90" rx="6" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            <path d="M35 40 V24 a35 35 0 0 1 70 0 V40" stroke="#0a0a0a" strokeWidth="1.8" fill="none" />
            <circle cx="70" cy="75" r="8" fill="#0a0a0a" />
            <line x1="70" y1="83" x2="70" y2="105" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* Blockchain Ledger Block & Anchored Hash */}
          <g transform="translate(40, 420)">
            <rect x="0" y="0" width="160" height="75" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <text x="14" y="24" fontFamily="monospace" fontSize="10" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="14" y="42" fontFamily="monospace" fontSize="8.5" fill="#666666">HASH: 0xa4f8...e291</text>
            <text x="14" y="56" fontFamily="monospace" fontSize="8.5" fill="#666666">STATUS: VERIFIED</text>
          </g>
        </svg>
      </div>

      {/* Bottom Background Verification Mesh & Badges Composition */}
      <div className="verifier-bottom-decoration" aria-hidden="true">
        <svg width="100%" height="160" viewBox="0 0 1200 160" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagonal Blockchain Network Nodes */}
          <g stroke="#0a0a0a" strokeWidth="1" strokeDasharray="3 3">
            <polygon points="100,40 130,20 160,40 160,70 130,90 100,70" />
            <polygon points="160,40 190,20 220,40 220,70 190,90 160,70" />
            <polygon points="1000,40 1030,20 1060,40 1060,70 1030,90 1000,70" />
            <polygon points="1060,40 1090,20 1120,40 1120,70 1090,90 1060,70" />
          </g>

          {/* Cryptographic Sine Wave Stream */}
          <path d="M0 100 Q 150 40, 300 100 T 600 100 T 900 100 T 1200 100" stroke="#0a0a0a" strokeWidth="1.2" fill="none" />
          <path d="M0 120 Q 200 60, 400 120 T 800 120 T 1200 120" stroke="#666666" strokeWidth="0.8" strokeDasharray="2 4" fill="none" />

          {/* 4 Bottom Security Verification Badges */}
          <g transform="translate(180, 95)" stroke="#0a0a0a" strokeWidth="1.2">
            <circle cx="16" cy="16" r="14" fill="#ffffff" />
            <path d="M10 16 l4 4 l8 -8" strokeWidth="1.8" strokeLinecap="round" />
            <text x="36" y="20" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#0a0a0a" stroke="none">SHA-256 HASH INTEGRITY</text>
          </g>

          <g transform="translate(460, 95)" stroke="#0a0a0a" strokeWidth="1.2">
            <circle cx="16" cy="16" r="14" fill="#ffffff" />
            <rect x="10" y="10" width="12" height="12" fill="none" />
            <text x="36" y="20" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#0a0a0a" stroke="none">RSA-2048 SIGNATURE</text>
          </g>

          <g transform="translate(740, 95)" stroke="#0a0a0a" strokeWidth="1.2">
            <circle cx="16" cy="16" r="14" fill="#ffffff" />
            <path d="M16 8 v16 M8 16 h16" strokeWidth="1.4" />
            <text x="36" y="20" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#0a0a0a" stroke="none">OFFLINE REVOCATION SYNC</text>
          </g>
        </svg>
      </div>
    </>
  );
}

export default VerifierBackgroundDecorations;

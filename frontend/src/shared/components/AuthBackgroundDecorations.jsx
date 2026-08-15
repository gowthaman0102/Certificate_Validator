/* ─────────────────────────────────────────────────────────────
   AuthBackgroundDecorations.jsx
   - Non-interactive, subtle (10-18% opacity) enterprise SaaS background
     decorations for CredentialVault authentication pages.
   - Left composition: University Pillars, Academic Certificate, Blockchain Nodes, Shield Check.
   - Right composition: Digital Identity Card, Isometric QR Code, Graduation Cap, Verified Hash Network.
   ───────────────────────────────────────────────────────────── */

import useHeaderHeight from "../hooks/useHeaderHeight";

export function AuthBackgroundDecorations() {
  useHeaderHeight(".auth-header, .card-header, header");
  return (
    <>
      {/* Left Decorative Vector Composition */}
      <div className="auth-side-decoration auth-side-left" aria-hidden="true">
        <svg width="420" height="540" viewBox="0 0 420 540" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Hexagonal & Dot Matrix Grid Background */}
          <pattern id="dotGridLeft" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.3" />
          </pattern>
          <rect x="20" y="40" width="140" height="140" fill="url(#dotGridLeft)" opacity="0.5" />
          <rect x="240" y="340" width="140" height="140" fill="url(#dotGridLeft)" opacity="0.4" />

          {/* Connected Network Nodes & Cryptographic Lines */}
          <line x1="60" y1="120" x2="160" y2="200" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="160" y1="200" x2="110" y2="340" stroke="#0a0a0a" strokeWidth="1.2" />
          <line x1="160" y1="200" x2="300" y2="180" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="4 4" />
          <line x1="300" y1="180" x2="340" y2="300" stroke="#0a0a0a" strokeWidth="1.2" />

          <circle cx="60" cy="120" r="4" fill="#0a0a0a" />
          <circle cx="160" cy="200" r="5" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" />
          <circle cx="110" cy="340" r="4" fill="#0a0a0a" />
          <circle cx="300" cy="180" r="4" fill="#0a0a0a" />
          <circle cx="340" cy="300" r="5" stroke="#0a0a0a" strokeWidth="1.5" fill="#ffffff" />

          {/* Academic Certificate Vector Outline */}
          <g transform="translate(180, 80)">
            <rect x="0" y="0" width="190" height="240" rx="2" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" fillOpacity="0.8" />
            <rect x="12" y="12" width="166" height="216" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            {/* Header Lines */}
            <line x1="35" y1="40" x2="155" y2="40" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="52" x2="135" y2="52" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
            {/* Body Copy Lines */}
            <line x1="30" y1="80" x2="160" y2="80" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="30" y1="96" x2="145" y2="96" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="30" y1="112" x2="150" y2="112" stroke="#8c8c8c" strokeWidth="1" />
            <line x1="30" y1="128" x2="120" y2="128" stroke="#8c8c8c" strokeWidth="1" />
            {/* Seal & Ribbon */}
            <circle cx="140" cy="180" r="18" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <circle cx="140" cy="180" r="13" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <path d="M134 195l-6 25 12-6 12 6-6-25" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
          </g>

          {/* University Temple Building Outline */}
          <g transform="translate(40, 240)">
            <rect x="0" y="110" width="130" height="6" fill="#0a0a0a" />
            <line x1="10" y1="110" x2="10" y2="60" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="40" y1="110" x2="40" y2="60" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="65" y1="110" x2="65" y2="60" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="90" y1="110" x2="90" y2="60" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="120" y1="110" x2="120" y2="60" stroke="#0a0a0a" strokeWidth="1.8" />
            <line x1="0" y1="60" x2="130" y2="60" stroke="#0a0a0a" strokeWidth="2" />
            <polygon points="65 15, 0 60, 130 60" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
          </g>

          {/* Shield Checkmark Badge */}
          <g transform="translate(240, 360)">
            <path d="M40 0s30-15 30-40v-30l-30-10-30 10v30c0 25 30 40 30 40z" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <polyline points="28 -38 36 -30 52 -46" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>

      {/* Right Decorative Vector Composition */}
      <div className="auth-side-decoration auth-side-right" aria-hidden="true">
        <svg width="420" height="540" viewBox="0 0 420 540" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Dot Grid */}
          <pattern id="dotGridRight" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.3" />
          </pattern>
          <rect x="220" y="30" width="150" height="150" fill="url(#dotGridRight)" opacity="0.45" />
          <rect x="30" y="350" width="130" height="130" fill="url(#dotGridRight)" opacity="0.4" />

          {/* Concentric Cryptographic Rings */}
          <circle cx="160" cy="180" r="110" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="160" cy="180" r="80" stroke="#0a0a0a" strokeWidth="1" opacity="0.7" />

          {/* Digital Identity Student Card Vector Outline */}
          <g transform="translate(40, 60)">
            <rect x="0" y="0" width="185" height="120" rx="4" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <rect x="15" y="20" width="45" height="50" rx="2" stroke="#0a0a0a" strokeWidth="1.2" fill="#f5f5f5" />
            <circle cx="37" cy="40" r="12" stroke="#0a0a0a" strokeWidth="1" fill="none" />
            <path d="M22 62c0-8 6-12 15-12s15 4 15 12" stroke="#0a0a0a" strokeWidth="1" fill="none" />
            <line x1="72" y1="28" x2="165" y2="28" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="72" y1="42" x2="145" y2="42" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="72" y1="56" x2="155" y2="56" stroke="#8c8c8c" strokeWidth="1" />
            <rect x="15" y="82" width="155" height="24" rx="2" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <text x="25" y="98" fontFamily="monospace" fontSize="9" fill="#0a0a0a">VERIFIED STUDENT CREDENTIAL</text>
          </g>

          {/* 3D Isometric Stacked QR Code Block */}
          <g transform="translate(190, 240)">
            <rect x="0" y="0" width="115" height="115" rx="12" stroke="#0a0a0a" strokeWidth="1.8" fill="#ffffff" />
            {/* Embedded QR Code Pattern */}
            <path d="M16 16h28v28H16zM22 22v16h16V22zM28 28h4v4h-4zM71 16h28v28H71zM77 22v16h16V22zM83 28h4v4h-4zM16 71h28v28H16zM22 77v16h16V77zM28 83h4v4h-4zM52 16h8v16h-8zM52 40h8v8h-8zM60 56h12v8H60zM76 56h15v8H76zM52 68h12v12H52zM72 68h12v12H72zM88 68h7v23h-7zM60 84h12v15H60zM76 92h15v7H76z" fill="#0a0a0a" />
          </g>

          {/* Graduation Cap Vector Outline */}
          <g transform="translate(70, 360)">
            <polygon points="65 15, 125 35, 65 55, 5 35" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <path d="M30 44v24c0 6 35 12 35 12s35-6 35-12V44" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />
            <line x1="115" y1="38" x2="115" y2="70" stroke="#0a0a0a" strokeWidth="1.4" />
            <circle cx="115" cy="72" r="3" fill="#0a0a0a" />
          </g>

          {/* Cryptographic Hash Ledger Block */}
          <g transform="translate(240, 410)">
            <rect x="0" y="0" width="130" height="60" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <text x="12" y="22" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#0a0a0a">BLOCK #849201</text>
            <text x="12" y="38" fontFamily="monospace" fontSize="8" fill="#666666">HASH: 0x7f9a...3b21</text>
            <text x="12" y="48" fontFamily="monospace" fontSize="8" fill="#666666">STATUS: ANCHORED</text>
          </g>
        </svg>
      </div>
    </>
  );
}

export default AuthBackgroundDecorations;

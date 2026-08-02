import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   CredentialVault — Homepage (Polyline Connector Fix)
   - Updated connector polylines to meet node anchor points cleanly
     without crossing or overlapping any text.
   - Preserves all 4 portal cards (Universities, Students, Verifiers, Blockchain)
     with white backgrounds and solid black buttons (.btn) inside the box.
   ───────────────────────────────────────────────────────────── */

/* ── Inline SVG Icons ───────────────────────────────────────── */
function ShieldIcon({ size = 22, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function QrScanIcon({ size = 22, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  );
}

function LockIcon({ size = 22, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BoltIcon({ size = 22, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function TemplePillarsIcon({ size = 26, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M4 20v-7" />
      <path d="M9 20v-7" />
      <path d="M15 20v-7" />
      <path d="M20 20v-7" />
      <path d="M12 4L2 10h20L12 4z" />
    </svg>
  );
}

function GradCapIcon({ size = 28, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 5L2 10l10 5l10-5z" />
      <path d="M6 12.5v5c0 2 6 3.5 6 3.5s6-1.5 6-3.5v-5" />
      <line x1="22" y1="10" x2="22" y2="16" />
    </svg>
  );
}

function ShieldCheckNodeIcon({ size = 26, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function PersonUserIcon({ size = 26, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MagnifierGlassIcon({ size = 26, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
    </svg>
  );
}

function IsometricCubesIcon({ size = 30, color = "#0a0a0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 80" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M20 50l20-10 20 10-20 10zM20 50v15l20 10V60zM60 50v15l-20 10V60z" />
      <path d="M40 30l20-10 20 10-20 10zM40 30v15l20 10V45zM80 30v15l-20 10V45z" />
      <path d="M60 10l20-10 20 10-20 10zM60 10v15l20 10V25zM100 10v15l-20 10V25z" />
    </svg>
  );
}

/* ── Main Home Component ────────────────────────────────────── */
function Home() {
  return (
    <div className="home-root">
      <div className="home-content">

        {/* ── 1. Top Hero Section ────────────────────────────── */}
        <section className="hero-grid diagram-layout">
          {/* Left Column: Branding & Headline */}
          <div className="hero-left-col" style={{ position: 'relative' }}>
            {/* Background Cryptographic & Blockchain Graphic Visuals (Behind Content) */}
            <svg className="hero-bg-visual" viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.32 }}>
              {/* Dot matrix grid */}
              <pattern id="heroBgGrid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.5" fill="#0a0a0a" opacity="0.35" />
              </pattern>
              <rect x="0" y="0" width="600" height="350" fill="url(#heroBgGrid)" opacity="0.45" />

              {/* Large Concentric Cryptographic Inspection Seals */}
              <circle cx="280" cy="175" r="145" stroke="#0a0a0a" strokeWidth="1" strokeDasharray="6 6" opacity="0.25" />
              <circle cx="280" cy="175" r="110" stroke="#0a0a0a" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.2" />

              {/* SHA-256 Hash Inspection Wave Curves */}
              <path d="M 10 35 Q 160 5, 290 35 T 560 35" stroke="#0a0a0a" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.4" />
              <circle cx="290" cy="35" r="4.5" fill="#0a0a0a" opacity="0.55" />
              <path d="M 20 310 Q 180 340, 310 310 T 580 310" stroke="#0a0a0a" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.3" />

              {/* Connected Blockchain Ledger Blocks */}
              <g opacity="0.35">
                {/* Block 1 */}
                <rect x="25" y="70" width="42" height="28" rx="5" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />
                <path d="M 32 84 L 60 84" stroke="#0a0a0a" strokeWidth="1.2" />
                <circle cx="46" cy="84" r="2.5" fill="#0a0a0a" />

                {/* Block 2 (Connected) */}
                <line x1="67" y1="84" x2="115" y2="84" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="2 2" />
                <rect x="115" y="70" width="42" height="28" rx="5" stroke="#0a0a0a" strokeWidth="1.4" fill="none" />

                {/* Hexagonal Cryptographic Security Shield Outline */}
                <polygon points="510,105 545,125 545,165 510,185 475,165 475,125" stroke="#0a0a0a" strokeWidth="1.6" fill="none" />
                <path d="M 500 145 L 508 153 L 522 137" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Crosshair Tickers */}
                <path d="M 530 40 L 542 40 M 536 34 L 536 46" stroke="#0a0a0a" strokeWidth="1.2" />
                <path d="M 40 240 L 52 240 M 46 234 L 46 246" stroke="#0a0a0a" strokeWidth="1.2" />

                {/* Binary & Hash Watermark Streams */}
                <text x="15" y="272" fontFamily="monospace" fontSize="8.5" fill="#0a0a0a" letterSpacing="0.1em">SHA256 :: 0x8f9a2b4e7c1d3e5f6a8b9c0d1e2f3a4b</text>
                <text x="15" y="289" fontFamily="monospace" fontSize="7.8" fill="#666666" letterSpacing="0.08em">IMMUTABLE LEDGER VERIFIED · ZERO TAMPERING</text>
                <text x="320" y="272" fontFamily="monospace" fontSize="8" fill="#8c8c8c" letterSpacing="0.06em">BLOCK #849201 [CONFIRMED]</text>
              </g>

              {/* Decorative Horizontal Guidelines with Diamond Endpoints */}
              <line x1="10" y1="325" x2="570" y2="325" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.3" />
              <polygon points="10,325 15,321 20,325 15,329" fill="#0a0a0a" opacity="0.4" />
              <polygon points="565,325 570,321 575,325 570,329" fill="#0a0a0a" opacity="0.4" />
            </svg>

            <div className="brand-header-block" style={{ position: 'relative', zIndex: 1 }}>
              <h1 className="main-brand-title">CredentialVault</h1>
              <p className="main-brand-subtitle">Offline-Verifiable Digital Academic Credentials</p>
            </div>

            <div className="headline-block" style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="headline-text">
                Verify. Anywhere. Trust. Forever.
              </h2>
              <p className="headline-description">
                CredentialVault helps institutions issue tamper-proof academic
                certificates and empowers anyone to verify them instantly — even offline.
              </p>
            </div>
          </div>

          {/* Right Column: Orbit Diagram Canvas */}
          <div className="hero-right-col diagram-canvas-wrapper">
            <div className="orbit-diagram-container">
              {/* Dot matrix background grid */}
              <div className="dot-matrix-pattern top-right" />

              {/* Central SVG Canvas */}
              <svg className="orbit-svg" viewBox="0 0 540 400" fill="none">
                {/* Concentric Circles */}
                <circle cx="270" cy="190" r="150" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="270" cy="190" r="120" stroke="#d5d5d5" strokeWidth="1" />
                <circle cx="270" cy="190" r="90" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2 3" />

                {/* Particles & Dots */}
                <circle cx="270" cy="40" r="2.5" fill="#0a0a0a" />
                <circle cx="150" cy="100" r="2" fill="#0a0a0a" />
                <circle cx="200" cy="70" r="2" fill="#0a0a0a" />
                <circle cx="340" cy="70" r="2" fill="#0a0a0a" />
                <circle cx="390" cy="100" r="2" fill="#0a0a0a" />
                <circle cx="150" cy="280" r="2" fill="#0a0a0a" />
                <circle cx="390" cy="280" r="2" fill="#0a0a0a" />
                <circle cx="360" cy="310" r="2" fill="#0a0a0a" />
                <circle cx="180" cy="310" r="2" fill="#0a0a0a" />

                {/* Open circles */}
                <circle cx="190" cy="90" r="2.5" stroke="#0a0a0a" strokeWidth="1" fill="none" />
                <circle cx="360" cy="125" r="2.5" stroke="#0a0a0a" strokeWidth="1" fill="none" />
                <circle cx="330" cy="300" r="2.5" stroke="#0a0a0a" strokeWidth="1" fill="none" />

                {/* Outline squares */}
                <rect x="345" y="75" width="5" height="5" stroke="#8c8c8c" strokeWidth="1" fill="none" />
                <rect x="135" y="255" width="5" height="5" stroke="#8c8c8c" strokeWidth="1" fill="none" />
                <rect x="380" y="210" width="5" height="5" stroke="#8c8c8c" strokeWidth="1" fill="none" />

                {/* Anchor Points on Concentric Orbit Rings */}
                <circle cx="190" cy="145" r="3" fill="#0a0a0a" />
                <circle cx="350" cy="145" r="3" fill="#0a0a0a" />
                <circle cx="190" cy="235" r="3" fill="#0a0a0a" />
                <circle cx="350" cy="235" r="3" fill="#0a0a0a" />
                <circle cx="270" cy="260" r="2.5" fill="#0a0a0a" />

                {/* Clean Polylines (Ending at node boundary without text overlap) */}
                <polyline points="122 72, 145 72, 168 145, 190 145" stroke="#0a0a0a" strokeWidth="1" />
                <polyline points="122 308, 145 308, 168 235, 190 235" stroke="#0a0a0a" strokeWidth="1" />
                <polyline points="418 72, 395 72, 372 145, 350 145" stroke="#0a0a0a" strokeWidth="1" />
                <polyline points="418 308, 395 308, 372 235, 350 235" stroke="#0a0a0a" strokeWidth="1" />

                {/* Vertical Dotted Line */}
                <line x1="270" y1="230" x2="270" y2="295" stroke="#0a0a0a" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>

              {/* 3D Isometric Stacked QR Block */}
              <div className="isometric-qr-wrapper">
                <div className="shadow-floor" />
                <div className="iso-block-top">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="#0a0a0a">
                    <path d="M10 10h30v30H10zM16 16v18h18V16zM22 22h6v6h-6zM60 10h30v30H60zM66 16v18h18V16zM72 22h6v6h-6zM10 60h30v30H10zM16 66v18h18V66zM22 72h6v6h-6zM50 10h6v16h-6zM50 34h6v6h-6zM60 50h10v6H60zM76 50h14v6H76zM50 60h10v10H50zM70 60h10v10H70zM86 60h4v20h-4zM60 76h10v14H60zM76 84h14v6H76z" />
                  </svg>
                </div>
              </div>

              {/* Bottom Solid Black Circle Checkmark Badge */}
              <div className="trusted-blockchain-group">
                <div className="center-verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="trusted-blockchain-text">
                  <span className="tb-title">Trusted by Blockchain</span>
                  <span className="tb-desc">Anchored hashes ensure integrity<br />and immutability.</span>
                </div>
              </div>

              {/* 4 Corner Nodes */}
              <div className="diagram-node node-top-left">
                <div className="node-icon-circle">
                  <TemplePillarsIcon size={20} />
                </div>
                <div className="node-text-group">
                  <h4 className="node-label">ISSUE</h4>
                  <p className="node-desc">Universities issue digitally signed credentials.</p>
                </div>
              </div>

              <div className="diagram-node node-bottom-left">
                <div className="node-icon-circle">
                  <ShieldCheckNodeIcon size={20} />
                </div>
                <div className="node-text-group">
                  <h4 className="node-label">SECURE</h4>
                  <p className="node-desc">Encrypted, signed and stored with integrity.</p>
                </div>
              </div>

              <div className="diagram-node node-top-right">
                <div className="node-icon-circle">
                  <PersonUserIcon size={20} />
                </div>
                <div className="node-text-group">
                  <h4 className="node-label">SHARE</h4>
                  <p className="node-desc">Students share via QR code anytime.</p>
                </div>
              </div>

              <div className="diagram-node node-bottom-right">
                <div className="node-icon-circle">
                  <MagnifierGlassIcon size={20} />
                </div>
                <div className="node-text-group">
                  <h4 className="node-label">VERIFY</h4>
                  <p className="node-desc">Verifiers check instantly, even offline.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Features Banner Row ──────────────────────────── */}
        <section className="features-banner-row">
          <div className="feature-banner-col">
            <div className="feature-banner-icon">
              <ShieldIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Tamper-Proof</h4>
              <p className="feature-banner-desc">Digitally signed and immutable certificates.</p>
            </div>
          </div>

          <div className="feature-banner-col">
            <div className="feature-banner-icon">
              <QrScanIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Offline Verifiable</h4>
              <p className="feature-banner-desc">Verify credentials anytime, anywhere — no internet required.</p>
            </div>
          </div>

          <div className="feature-banner-col">
            <div className="feature-banner-icon">
              <LockIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Privacy First</h4>
              <p className="feature-banner-desc">Minimal data exposure with zero-knowledge verification.</p>
            </div>
          </div>

          <div className="feature-banner-col">
            <div className="feature-banner-icon">
              <BoltIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Instant Verification</h4>
              <p className="feature-banner-desc">Get verification results in seconds using QR or ID.</p>
            </div>
          </div>
        </section>

        {/* ── 3. Bottom 4 Action Portal Cards (Buttons Strictly Inside Box) ── */}
        <section className="portals-four-grid">
          {/* Card 1: Universities */}
          <div className="portal-block">
            <div className="portal-top-meta">
              <TemplePillarsIcon size={26} />
              <div className="card-dot-matrix" />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Universities</h3>
              <p className="portal-text">
                Issue tamper-proof, signed certificates with QR codes.
              </p>
              <Link to="/university-login" className="btn portal-action-btn">
                Sign in
              </Link>
            </div>
            <div className="portal-vector-art">
              <svg width="125" height="90" viewBox="0 0 100 70" fill="none" stroke="#d5d5d5" strokeWidth="1">
                <path d="M10 65h80M15 65V35M35 65V35M50 65V35M65 65V35M85 65V35M10 35h80M50 10L10 35h80L50 10z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Students */}
          <div className="portal-block">
            <div className="portal-top-meta">
              <GradCapIcon size={28} />
              <div className="card-dot-matrix" />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Students</h3>
              <p className="portal-text">
                View and share your certificates by QR code.
              </p>
              <Link to="/student-login" className="btn portal-action-btn">
                Sign in
              </Link>
            </div>
            <div className="portal-vector-art">
              <svg width="115" height="90" viewBox="0 0 100 80" fill="none" stroke="#d5d5d5" strokeWidth="1">
                <polygon points="50 15 90 35 50 55 10 35 50 15" />
                <path d="M25 43v20c0 5 25 10 25 10s25-5 25-10V43" />
                <path d="M85 38v25" />
                <circle cx="85" cy="65" r="3" fill="#d5d5d5" />
              </svg>
            </div>
          </div>

          {/* Card 3: Verifiers */}
          <div className="portal-block">
            <div className="portal-top-meta">
              <MagnifierGlassIcon size={26} />
              <div className="card-dot-matrix" />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Verifiers</h3>
              <p className="portal-text">
                Verify instantly, even completely offline.
              </p>
              <Link to="/verify" className="btn portal-action-btn">
                Verify
              </Link>
            </div>
            <div className="portal-vector-art">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#d5d5d5" strokeWidth="1.2">
                <circle cx="45" cy="45" r="28" />
                <line x1="65" y1="65" x2="90" y2="90" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Card 4: Blockchain */}
          <div className="portal-block">
            <div className="portal-top-meta">
              <IsometricCubesIcon size={30} color="#0a0a0a" />
              <div className="card-dot-matrix" />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Blockchain</h3>
              <p className="portal-text">
                Anchored hashes and block records on the ledger.
              </p>
              <Link to="/blockchain-explorer" className="btn portal-action-btn">
                Explore
              </Link>
            </div>
            <div className="portal-vector-art">
              <svg width="120" height="95" viewBox="0 0 100 80" fill="none" stroke="#d5d5d5" strokeWidth="1">
                <path d="M20 50l20-10 20 10-20 10zM20 50v15l20 10V60zM60 50v15l-20 10V60z" />
                <path d="M40 30l20-10 20 10-20 10zM40 30v15l20 10V45zM80 30v15l-20 10V45z" />
                <path d="M60 10l20-10 20 10-20 10zM60 10v15l20 10V25zM100 10v15l-20 10V25z" />
              </svg>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Home;

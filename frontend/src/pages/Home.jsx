import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CountUp } from "../components/motion";

/* ─────────────────────────────────────────────────────────────
   CredentialVault — Homepage
   Motion system: Top-level HomeEntranceSequence orchestrator
   (Hero → Diagram → Feature Strip → Portal Cards), 60fps-safe.
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

/* ── Animation Variants ─────────────────────────────────────── */

// Master Top-Level Entrance Sequence Orchestrator
const homeEntranceVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

// Zone 1: Hero Left Column Container
const heroLeftColVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

// Hero wordmark: clip-path seal unveil (mask sliding left→right, ~500ms)
const heroTitleVariants = {
  hidden:  { clipPath: "inset(0 100% 0 0)", opacity: 1 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// Tagline & Sub-headline: fade + 12px upward drift
const heroTaglineVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
};

// Description paragraph: fade + 12px upward drift
const heroDescVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
};

// Zone 2: Right Hero Diagram Canvas Container
const heroRightColVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
    },
  },
};

// Diagram Corner Icon Nodes: scale 0.8→1 with spring overshoot
const nodeSpringVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Diagram Connector Lines: strokeDashoffset draw-in outward/inward
const POLYLINE_LENGTH = 165;

const polylineVariants = {
  hidden:  { strokeDashoffset: POLYLINE_LENGTH },
  visible: {
    strokeDashoffset: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// Central QR Hub: scale 0.85→1 with larger spring overshoot (anchor)
const qrHubVariants = {
  hidden: { opacity: 0, scale: 0.82 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 16,
      delay: 0.35,
    },
  },
};

// Trusted by Blockchain Badge Container
const trustedBadgeVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.55,
    },
  },
};

// Badge Checkmark Draw-In SVG Path
const badgeCheckmarkVariants = {
  hidden: { strokeDasharray: 24, strokeDashoffset: 24 },
  visible: {
    strokeDashoffset: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.7,
    },
  },
};

// Zone 3: Features Banner Row Stagger Container (60ms stagger)
const featuresRowVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const featureBannerColVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

// Icon Hover variant for Feature Strip
const featureIconHoverVariants = {
  hover: {
    scale: 1.1,
    rotate: 6,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
};

// Zone 4: Portal Cards Grid Container (80ms stagger)
const cardsContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Individual portal card: rise 16px + fade
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.56, ease: [0.16, 1, 0.3, 1] },
  },
};

// Portal card icon hover: scale 1.08 + slight rotation
const cardIconHoverVariants = {
  hover: {
    scale: 1.08,
    rotate: 5,
    transition: { type: "spring", stiffness: 350, damping: 15 },
  },
};

/* ── Animated Card Dot Matrix Decoration (Phase 4) ───────────── */
function CardDotMatrix() {
  const shouldReduceMotion = useReducedMotion();

  const dots = [
    { cx: 4, cy: 4, delay: 0 },
    { cx: 14, cy: 4, delay: 0.4 },
    { cx: 24, cy: 4, delay: 0.8 },
    { cx: 4, cy: 14, delay: 0.5 },
    { cx: 14, cy: 14, delay: 0.9 },
    { cx: 24, cy: 14, delay: 1.3 },
    { cx: 4, cy: 24, delay: 1.0 },
    { cx: 14, cy: 24, delay: 1.4 },
    { cx: 24, cy: 24, delay: 1.8 },
  ];

  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ position: "absolute", top: "12px", right: "12px", opacity: 0.45 }}>
      {dots.map((dot, idx) => (
        shouldReduceMotion ? (
          <circle key={idx} cx={dot.cx} cy={dot.cy} r="1.5" fill="#0a0a0a" opacity="0.35" />
        ) : (
          <motion.circle
            key={idx}
            cx={dot.cx}
            cy={dot.cy}
            r="1.5"
            fill="#0a0a0a"
            animate={{
              opacity: [0.2, 0.65, 0.2],
              y: [0, -1.5, 0],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay,
            }}
          />
        )
      ))}
    </svg>
  );
}

/* ── Interactive Hero Verification Simulator Widget ───────────── */
function HeroVerificationSimulator() {
  const [status, setStatus] = useState("VERIFIED");
  const [verifying, setVerifying] = useState(false);

  const handleTestScan = () => {
    if (verifying) return;
    setVerifying(true);

    // Step 1: Start initial scan with VERIFIED
    setStatus("VERIFIED");

    // Step 2 (1000ms): Automatically transition to TAMPERED
    const timer1 = setTimeout(() => {
      setStatus("TAMPERED");
    }, 1000);

    // Step 3 (2000ms): Automatically transition to REVOKED
    const timer2 = setTimeout(() => {
      setStatus("REVOKED");
    }, 2000);

    // Step 4 (3000ms): Automatically complete sequence back to VERIFIED
    const timer3 = setTimeout(() => {
      setStatus("VERIFIED");
      setVerifying(false);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <motion.div className="hero-verification-sim-card" variants={heroDescVariants}>
      <div className="sim-header">
        <div className="sim-badge">
          <span className="sim-dot" />
          <span className="sim-badge-text">LIVE DEMO · RSA-2048 PROTOCOL</span>
        </div>
        <button
          type="button"
          onClick={handleTestScan}
          disabled={verifying}
          className="sim-test-btn"
        >
          {verifying ? "Scanning Hash..." : "Test Instant Scan"}
        </button>
      </div>

      <div className="sim-cert-preview">
        {verifying && <div className="sim-scan-line" />}
        <div className="sim-cert-info">
          <span className="sim-cert-title">Cryptographic Signature Validation</span>
          <span className="sim-cert-meta">Immutable Ledger Record · RSA-2048 Signature Validated</span>
        </div>
        <div className="sim-cert-status">
          <AnimatePresence mode="wait">
            {status === "VERIFIED" && (
              <motion.span
                key="verified"
                initial={{ opacity: 0, scale: 0.88, y: -3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 3 }}
                transition={{ duration: 0.2 }}
                className="sim-status-badge sim-status-verified"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                VERIFIED
              </motion.span>
            )}
            {status === "TAMPERED" && (
              <motion.span
                key="tampered"
                initial={{ opacity: 0, scale: 0.88, y: -3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 3 }}
                transition={{ duration: 0.2 }}
                className="sim-status-badge sim-status-tampered"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                TAMPERED
              </motion.span>
            )}
            {status === "REVOKED" && (
              <motion.span
                key="revoked"
                initial={{ opacity: 0, scale: 0.88, y: -3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 3 }}
                transition={{ duration: 0.2 }}
                className="sim-status-badge sim-status-revoked"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                REVOKED
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Home Component ────────────────────────────────────── */
function Home() {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();

  return (
    <motion.div
      className="home-root"
      variants={homeEntranceVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="home-content">

        {/* ── 1. Top Hero Section ────────────────────────────── */}
        <section className="hero-grid diagram-layout">
          {/* Left Column: Branding, Headline & Live Verification Simulator */}
          <motion.div className="hero-left-col" variants={heroLeftColVariants} style={{ position: "relative" }}>
            {/* Background Cryptographic & Blockchain Graphic Visuals — Phase 2: Gentle Ambient Dot Grid Drift */}
            <svg
              className="hero-bg-visual"
              viewBox="0 0 600 350"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                pointerEvents: "none", zIndex: 0, opacity: 0.35,
              }}
            >
              <pattern id="heroBgGrid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.5" fill="#0a0a0a" opacity="0.35" />
              </pattern>
              <motion.rect
                x="0" y="0" width="600" height="350"
                fill="url(#heroBgGrid)"
                opacity="0.45"
                animate={shouldReduceMotion ? {} : { x: [0, 4, 0, -4, 0], y: [0, -3, 0, 3, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            {/* Hero Brand Title — STEP 0 & 1: Keyed on location.key for route revisit, typewriter effect */}
            <div className="brand-header-block" key={location.key} style={{ position: "relative", zIndex: 1 }}>
              <h1 className="main-brand-title hero-typewriter">
                CredentialVault
              </h1>
              <p className="main-brand-subtitle hero-tagline">
                Offline-Verifiable Digital Academic Credentials
              </p>
            </div>

            {/* STEP 3 & 4: Word-by-word sub-headline and description entrance */}
            <div className="headline-block" style={{ position: "relative", zIndex: 1 }}>
              <h2 className="headline-text">
                <span className="hero-word">Verify.</span>{" "}
                <span className="hero-word">Anywhere.</span>{" "}
                <span className="hero-word">Trust.</span>{" "}
                <span className="hero-word">Forever.</span>
              </h2>
              <p className="headline-description hero-description">
                CredentialVault helps institutions issue tamper-proof academic
                certificates and empowers anyone to verify them instantly — even offline.
              </p>
            </div>

            {/* Interactive Live Verification Demo Widget */}
            <HeroVerificationSimulator />
          </motion.div>

          {/* Right Column: Orbit Diagram Canvas (Phase 1 Ambient Motion Loops) */}
          <motion.div className="hero-right-col diagram-canvas-wrapper" variants={heroRightColVariants}>
            <div className="orbit-diagram-container">
              <div className="dot-matrix-pattern top-right" />

              <svg className="orbit-svg" viewBox="0 0 540 400" fill="none">
                {/* Outer & Inner Dotted Rings with Synchronized Line Junction Nodes */}
                <g className="diagram-ring-spin-outer">
                  <circle cx="270" cy="190" r="150" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="270" cy="190" r="120" stroke="#d5d5d5" strokeWidth="1" />
                  
                  {/* Outer Ring Satellite Accents */}
                  <circle cx="270" cy="40" r="3.5" fill="#0a0a0a" />
                  <circle cx="420" cy="190" r="3" fill="#0a0a0a" />
                  <circle cx="270" cy="340" r="3.5" fill="#0a0a0a" />
                  <circle cx="120" cy="190" r="3" fill="#0a0a0a" />
                </g>
                <g className="diagram-ring-spin-inner">
                  {/* Connector Line Intersection Ring (r=96.2) - Perfectly matching the 4 elbow junction points */}
                  <circle cx="270" cy="190" r="96.2" stroke="#d0d0d0" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* 4 Junction Nodes placed EXACTLY at the connector line elbows (185,145), (355,145), (185,235), (355,235) */}
                  <circle cx="185" cy="145" r="4" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
                  <circle cx="355" cy="145" r="4" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
                  <circle cx="185" cy="235" r="4" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
                  <circle cx="355" cy="235" r="4" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />
                </g>

                {/* 4 Connecting Elbow Polyline Paths with Animated Line Flow Layer */}
                <polyline
                  points="140 72, 160 72, 185 145, 205 145"
                  stroke="#0a0a0a" strokeWidth="1.2" fill="none"
                  className="diagram-line-flow"
                />
                <polyline
                  points="140 308, 160 308, 185 235, 205 235"
                  stroke="#0a0a0a" strokeWidth="1.2" fill="none"
                  className="diagram-line-flow"
                />
                <polyline
                  points="400 72, 380 72, 355 145, 335 145"
                  stroke="#0a0a0a" strokeWidth="1.2" fill="none"
                  className="diagram-line-flow"
                />
                <polyline
                  points="400 308, 380 308, 355 235, 335 235"
                  stroke="#0a0a0a" strokeWidth="1.2" fill="none"
                  className="diagram-line-flow"
                />

                {/* Dashed vertical center guide line */}
                <line x1="270" y1="230" x2="270" y2="295" stroke="#0a0a0a" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Native SVG animateMotion Traveling Data Dots along Connector Lines */}
                {!shouldReduceMotion && (
                  <>
                    <circle r="3" fill="#0a0a0a">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 140 72 L 160 72 L 185 145 L 205 145 L 270 190" begin="0s" />
                    </circle>
                    <circle r="3" fill="#0a0a0a">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 400 72 L 380 72 L 355 145 L 335 145 L 270 190" begin="1s" />
                    </circle>
                    <circle r="3" fill="#0a0a0a">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 140 308 L 160 308 L 185 235 L 205 235 L 270 190" begin="2s" />
                    </circle>
                    <circle r="3" fill="#0a0a0a">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 400 308 L 380 308 L 355 235 L 335 235 L 270 190" begin="3s" />
                    </circle>
                  </>
                )}

                {/* Phase 1: Central QR Hub with Pure CSS hubBreathe (3s loop) */}
                <foreignObject x="220" y="140" width="100" height="100" style={{ overflow: "visible" }}>
                  <motion.div
                    className="isometric-qr-wrapper-inner"
                    variants={qrHubVariants}
                    style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
                  >
                    <div className="shadow-floor" style={{ position: "absolute", width: "88px", height: "42px", background: "rgba(0,0,0,0.12)", filter: "blur(8px)", borderRadius: "50%", bottom: "-10px" }} />
                    <div className="iso-block-top diagram-hub-breathe" style={{ width: "88px", height: "88px", background: "#ffffff", border: "2px solid #0a0a0a", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 0 #0a0a0a, 0 12px 0 #e0e0e0", zIndex: 3, padding: "6px" }}>
                      <svg width="56" height="56" viewBox="0 0 100 100" fill="#0a0a0a">
                        <path d="M10 10h30v30H10zM16 16v18h18V16zM22 22h6v6h-6zM60 10h30v30H60zM66 16v18h18V16zM72 22h6v6h-6zM10 60h30v30H10zM16 66v18h18V66zM22 72h6v6h-6zM50 10h6v16h-6zM50 34h6v6h-6zM60 50h10v6H60zM76 50h14v6H76zM50 60h10v10H50zM70 60h10v10H70zM86 60h4v20h-4zM60 76h10v14H60zM76 84h14v6H76z" />
                      </svg>
                    </div>
                  </motion.div>
                </foreignObject>

                {/* Phase 1: Trusted by Blockchain Badge with Pure CSS badgePulse (3s loop) */}
                <foreignObject x="180" y="305" width="180" height="65" style={{ overflow: "visible" }}>
                  <motion.div className="trusted-blockchain-group-inner" variants={trustedBadgeVariants} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <div
                      className="center-verified-badge diagram-badge-pulse"
                      style={{ width: "22px", height: "22px", background: "#0a0a0a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2px", boxShadow: "0 3px 8px rgba(0,0,0,0.18)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <motion.path d="M 4 12 L 9 17 L 20 6" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" variants={badgeCheckmarkVariants} />
                      </svg>
                    </div>
                    <div className="trusted-blockchain-text" style={{ textAlign: "center" }}>
                      <span className="tb-title" style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", fontWeight: 700, color: "#0a0a0a", whiteSpace: "nowrap", display: "block" }}>Trusted by Blockchain</span>
                      <span className="tb-desc" style={{ fontFamily: "var(--font-body)", fontSize: "0.63rem", color: "var(--color-muted)", lineHeight: 1.2, whiteSpace: "nowrap", display: "block" }}>Anchored hashes & immutability.</span>
                    </div>
                  </motion.div>
                </foreignObject>

                {/* Phase 1: 4 Corner Icon Nodes with Continuous Float Drift & Icon Pulse Rings */}
                <foreignObject x="0" y="14" width="130" height="120" style={{ overflow: "visible" }}>
                  <motion.div className="diagram-node diagram-node-tl" variants={nodeSpringVariants} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
                    <div className="node-icon-circle diagram-icon-pulse-1"><TemplePillarsIcon size={20} /></div>
                    <div className="node-text-group">
                      <h4 className="node-label">ISSUE</h4>
                      <p className="node-desc">Universities issue digitally signed credentials.</p>
                    </div>
                  </motion.div>
                </foreignObject>

                <foreignObject x="0" y="260" width="130" height="120" style={{ overflow: "visible" }}>
                  <motion.div className="diagram-node diagram-node-bl" variants={nodeSpringVariants} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
                    <div className="node-icon-circle diagram-icon-pulse-3"><ShieldCheckNodeIcon size={20} /></div>
                    <div className="node-text-group">
                      <h4 className="node-label">SECURE</h4>
                      <p className="node-desc">Encrypted, signed and stored with integrity.</p>
                    </div>
                  </motion.div>
                </foreignObject>

                <foreignObject x="410" y="14" width="130" height="120" style={{ overflow: "visible" }}>
                  <motion.div className="diagram-node diagram-node-tr" variants={nodeSpringVariants} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
                    <div className="node-icon-circle diagram-icon-pulse-2"><PersonUserIcon size={20} /></div>
                    <div className="node-text-group">
                      <h4 className="node-label">SHARE</h4>
                      <p className="node-desc">Students share via QR code anytime.</p>
                    </div>
                  </motion.div>
                </foreignObject>

                <foreignObject x="410" y="260" width="130" height="120" style={{ overflow: "visible" }}>
                  <motion.div className="diagram-node diagram-node-br" variants={nodeSpringVariants} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
                    <div className="node-icon-circle diagram-icon-pulse-4"><MagnifierGlassIcon size={20} /></div>
                    <div className="node-text-group">
                      <h4 className="node-label">VERIFY</h4>
                      <p className="node-desc">Verifiers check instantly, even offline.</p>
                    </div>
                  </motion.div>
                </foreignObject>
              </svg>
            </div>
          </motion.div>
        </section>

        {/* ── 2. Features Banner Row (4 Directional Line Animations) ────────────────── */}
        <section className="features-banner-row">
          {/* Feature 1: Tamper-Proof (Direction 1: Left to Right) */}
          <div className="feature-banner-col feature-box-1">
            <div className="feature-banner-icon">
              <ShieldIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Tamper-Proof</h4>
              <p className="feature-banner-desc">Digitally signed and immutable certificates.</p>
            </div>
            <div className="feature-line-direction feature-line-1" />
          </div>

          {/* Feature 2: Offline Verifiable (Direction 2: Right to Left) */}
          <div className="feature-banner-col feature-box-2">
            <div className="feature-banner-icon">
              <QrScanIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Offline Verifiable</h4>
              <p className="feature-banner-desc">Verify credentials anytime, anywhere — no internet required.</p>
            </div>
            <div className="feature-line-direction feature-line-2" />
          </div>

          {/* Feature 3: Privacy First (Direction 3: Center Outward) */}
          <div className="feature-banner-col feature-box-3">
            <div className="feature-banner-icon">
              <LockIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Privacy First</h4>
              <p className="feature-banner-desc">Minimal data exposure with zero-knowledge verification.</p>
            </div>
            <div className="feature-line-direction feature-line-3" />
          </div>

          {/* Feature 4: Instant Verification (Direction 4: Continuous Bounce) */}
          <div className="feature-banner-col feature-box-4">
            <div className="feature-banner-icon">
              <BoltIcon size={22} />
            </div>
            <div className="feature-banner-text">
              <h4 className="feature-banner-title">Instant Verification</h4>
              <p className="feature-banner-desc">Get verification results in seconds using QR or ID.</p>
            </div>
            <div className="feature-line-direction feature-line-4" />
          </div>
        </section>

        {/* ── 3. Bottom 4 Action Portal Cards ───────── */}
        <motion.section
          className="portals-four-grid"
          variants={cardsContainerVariants}
        >
          {/* Card 1: Universities */}
          <motion.div
            className="portal-block portal-card-1"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="portal-top-meta">
              <div className="portal-icon-breath-1">
                <TemplePillarsIcon size={26} />
              </div>
              <CardDotMatrix />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Universities</h3>
              <p className="portal-text">Issue tamper-proof, signed certificates with QR codes.</p>
              <Link to="/university-login" className="btn portal-action-btn">Sign in →</Link>
            </div>
            <div className="portal-vector-art portal-vector-art-float-1">
              <svg width="125" height="90" viewBox="0 0 100 70" fill="none" stroke="#d5d5d5" strokeWidth="1">
                <path d="M10 65h80M15 65V35M35 65V35M50 65V35M65 65V35M85 65V35M10 35h80M50 10L10 35h80L50 10z" />
              </svg>
            </div>
          </motion.div>

          {/* Card 2: Students */}
          <motion.div
            className="portal-block portal-card-2"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="portal-top-meta">
              <div className="portal-icon-breath-2">
                <GradCapIcon size={28} />
              </div>
              <CardDotMatrix />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Students</h3>
              <p className="portal-text">View and share your certificates by QR code.</p>
              <Link to="/student-login" className="btn portal-action-btn">Sign in →</Link>
            </div>
            <div className="portal-vector-art portal-vector-art-float-2">
              <svg width="115" height="90" viewBox="0 0 100 80" fill="none" stroke="#d5d5d5" strokeWidth="1">
                <polygon points="50 15 90 35 50 55 10 35 50 15" />
                <path d="M25 43v20c0 5 25 10 25 10s25-5 25-10V43" />
                <path d="M85 38v25" />
                <circle cx="85" cy="65" r="3" fill="#d5d5d5" />
              </svg>
            </div>
          </motion.div>

          {/* Card 3: Verifiers */}
          <motion.div
            className="portal-block portal-card-3"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="portal-top-meta">
              <div className="portal-icon-breath-3">
                <MagnifierGlassIcon size={26} />
              </div>
              <CardDotMatrix />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Verifiers</h3>
              <p className="portal-text">Verify instantly, even completely offline.</p>
              <Link to="/verify" className="btn portal-action-btn">Verify →</Link>
            </div>
            <div className="portal-vector-art portal-vector-art-float-3">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="#d5d5d5" strokeWidth="1.2">
                <circle cx="45" cy="45" r="28" />
                <line x1="65" y1="65" x2="90" y2="90" strokeWidth="2" />
              </svg>
            </div>
          </motion.div>

          {/* Card 4: Blockchain */}
          <motion.div
            className="portal-block portal-card-4"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="portal-top-meta">
              <div className="portal-icon-breath-4">
                <IsometricCubesIcon size={30} color="#0a0a0a" />
              </div>
              <CardDotMatrix />
            </div>
            <div className="portal-inner-content">
              <h3 className="portal-head">Blockchain</h3>
              <p className="portal-text">Anchored hashes and block records on the ledger.</p>
              <Link to="/blockchain-explorer" className="btn portal-action-btn">Explore →</Link>
            </div>
            <div className="portal-vector-art portal-vector-art-float-4">
              <svg width="120" height="95" viewBox="0 0 100 80" fill="none" stroke="#d5d5d5" strokeWidth="1">
                <path d="M20 50l20-10 20 10-20 10zM20 50v15l20 10V60zM60 50v15l-20 10V60z" />
                <path d="M40 30l20-10 20 10-20 10zM40 30v15l20 10V45zM80 30v15l-20 10V45z" />
                <path d="M60 10l20-10 20 10-20 10zM60 10v15l20 10V25zM100 10v15l-20 10V25z" />
              </svg>
            </div>
          </motion.div>
        </motion.section>

      </div>
    </motion.div>
  );
}

export default Home;

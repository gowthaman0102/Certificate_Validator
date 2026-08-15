/**
 * GuidedTourModal.jsx
 * 
 * Phase 9 UI/UX Pass — Guided Walkthrough Tour.
 * 4-Step interactive modal triggered on first visit (stored in localStorage "tour_seen").
 * Framer Motion entrance animations matching RevealOnScroll timing.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PREMIUM = [0.16, 1, 0.3, 1];

const TOUR_STEPS = [
  {
    title: '🏛️ 1. Institutional Issuance',
    desc: 'Universities register and issue tamper-proof digital certificates signed with RSA-2048 private keys and anchored to a simulated blockchain ledger.',
  },
  {
    title: '🛡️ 2. Offline & Online Verification',
    desc: 'Verifiers and employers instantly validate certificates online or offline from cold-start using PWA service worker cached public keys and revocation lists.',
  },
  {
    title: '🤖 3. 8-Point AI Fraud Detection',
    desc: 'Multi-provider LLM abstraction (OpenAI, Gemini, Claude, Local, Heuristic) analyzes certificate metadata for layout anomalies, grade forgery, and risk metrics.',
  },
  {
    title: '🎒 4. Digital Skill Passport',
    desc: 'Students collect verified credentials into a digital wallet, showcasing skills, projects, and achievements with cryptographically verifiable public links.',
  },
];

export default function GuidedTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const tourSeen = localStorage.getItem('tour_seen');
    if (!tourSeen) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  }

  function handleClose() {
    localStorage.setItem('tour_seen', 'true');
    setIsOpen(false);
  }

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: PREMIUM }}
          style={{
            background: 'var(--color-surface, #ffffff)',
            border: '2px solid var(--color-border, #0a0a0a)',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            color: 'var(--color-ink, #0a0a0a)',
            fontFamily: "'Inter', sans-serif",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-muted, #666666)', textTransform: 'uppercase' }}>
              Platform Guided Tour ({currentStep + 1} / {TOUR_STEPS.length})
            </span>
            <button
              onClick={handleClose}
              aria-label="Close guided tour"
              style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700, color: 'var(--color-ink, #0a0a0a)' }}
            >
              ✕
            </button>
          </div>

          <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
            {step.title}
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted, #555555)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {step.desc}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentStep ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === currentStep ? 'var(--color-ink, #0a0a0a)' : 'var(--color-subtle, #cccccc)',
                    transition: 'all 200ms ease',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-secondary"
                onClick={handleClose}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                Skip
              </button>
              <button
                className="btn"
                onClick={handleNext}
                style={{ fontSize: '0.8rem', padding: '0.35rem 1rem' }}
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next →'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

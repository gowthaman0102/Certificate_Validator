/**
 * OfflineIndicator.jsx
 *
 * Phase 4 PWA — Persistent online/offline status indicator.
 *
 * Renders a small pill in the top-right corner:
 *   • Online  — subtle dark border, white bg, "● Online" in muted ink
 *   • Offline — solid black fill, white text, "⚡ Offline — using cached verification data"
 *
 * Uses the browser navigator.onLine API + online/offline events.
 * Animation: 200ms cross-fade matching the design system's existing motion timing.
 * Stays inside the monochrome CSS variable system (--color-ink, white, black only).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PREMIUM = [0.16, 1, 0.3, 1];

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleOnline()  { setIsOnline(true);  setDismissed(false); setVisible(true); }
    function handleOffline() { setIsOnline(false); setDismissed(false); setVisible(true); }

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide the "Online" pill after 4 seconds (it's non-critical info)
  useEffect(() => {
    if (isOnline && visible && !dismissed) {
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isOnline, visible, dismissed]);

  // Offline pill is always visible and cannot be dismissed
  const show = visible && (!isOnline || !dismissed);

  return (
    <div
      style={{
        position: 'fixed',
        top: '14px',
        right: '16px',
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            key={isOnline ? 'online' : 'offline'}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: PREMIUM }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              userSelect: 'none',
              pointerEvents: 'auto',
              cursor: isOnline ? 'default' : 'default',
              // Online: subtle white pill with dark border
              // Offline: solid black pill with white text — visually prominent
              background:   isOnline ? 'rgba(255,255,255,0.92)' : '#0a0a0a',
              color:        isOnline ? '#666666' : '#ffffff',
              border:       isOnline ? '1px solid rgba(10,10,10,0.2)' : '1px solid #0a0a0a',
              boxShadow:    isOnline
                ? '0 1px 8px rgba(0,0,0,0.08)'
                : '0 2px 16px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {isOnline ? (
              <>
                <span style={{ color: '#22c55e', fontSize: '0.65rem' }}>●</span>
                Online
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.75rem' }}>⚡</span>
                Offline — using cached verification data
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

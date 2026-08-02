import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';

const GS = { ink: '#0a0a0a' };
const PREMIUM = [0.16, 1, 0.3, 1];

export function GradRobotIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* ── MORTARBOARD / GRADUATION CAP ON TOP ── */}
      <polygon points="50 10, 92 26, 50 40, 8 26" fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" />
      <line x1="82" y1="30" x2="82" y2="43" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="82" cy="46" r="4.5" fill={color} />

      {/* ── ROUNDED ROBOT FACE / HEAD ── */}
      <rect x="24" y="38" width="52" height="42" rx="11" fill="none" stroke={color} strokeWidth="5" />
      <circle cx="38" cy="56" r="4.5" fill={color} />
      <circle cx="62" cy="56" r="4.5" fill={color} />
      <path d="M 37 67 Q 50 75 63 67" fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" />

      {/* ── RIBBON TIE AT BOTTOM ── */}
      <path d="M 41 80 L 33 94 L 50 87 L 67 94 L 59 80" fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  function handleToggle() {
    setIsOpen((prev) => !prev);
    if (!isOpen) setUnreadCount(0);
  }

  return (
    <>
      {/* Floating Button with ambient pulse & 90deg morph rotation */}
      <motion.div
        onClick={handleToggle}
        title="Open AI Assistant"
        animate={{
          scale: isOpen ? [1] : [1, 1.04, 1],
        }}
        transition={{
          scale: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: '#ffffff',
          color: GS.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
          border: `2px solid ${GS.ink}`,
          zIndex: 9998,
          userSelect: 'none',
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25, ease: PREMIUM }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isOpen ? (
            <span style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1, color: GS.ink }}>✕</span>
          ) : (
            <GradRobotIcon size={34} color="#0a0a0a" />
          )}
        </motion.div>

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: GS.ink,
              color: '#ffffff',
              border: `1.5px solid ${GS.ink}`,
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            !
          </span>
        )}
      </motion.div>

      {/* Chat Drawer Window with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: PREMIUM }}
            style={{ position: 'fixed', bottom: '90px', right: '24px', zIndex: 9999 }}
          >
            <ChatWindow onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

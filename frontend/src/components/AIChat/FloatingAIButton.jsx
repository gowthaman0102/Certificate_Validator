import { useState } from 'react';
import ChatWindow from './ChatWindow';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

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
      {/* Floating Button */}
      <div
        onClick={handleToggle}
        title="Open AI Assistant"
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
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          userSelect: 'none',
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <GradRobotIcon size={34} color="#0a0a0a" />

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
      </div>

      {/* Chat Drawer Window */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}

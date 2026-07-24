import { useState } from 'react';
import ChatWindow from './ChatWindow';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

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
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: GS.ink,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          border: `2px solid ${GS.ink}`,
          zIndex: 9998,
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          userSelect: 'none',
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
        </svg>

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ffffff',
              color: GS.ink,
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

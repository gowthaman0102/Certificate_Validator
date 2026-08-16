import { useState } from 'react';
import { motion } from 'framer-motion';
import { GradRobotIcon } from './FloatingAIButton';

const GS = { ink: '#0a0a0a', muted: '#666666', border: '#0a0a0a', mid: '#8c8c8c' };
const PREMIUM = [0.16, 1, 0.3, 1];

export default function ChatBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  }

  // Simple markdown renderer for bold, inline code, headings, lists
  function renderContent(text) {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0', color: isUser ? '#ffffff' : GS.ink }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0.5rem 0 0.3rem 0', color: isUser ? '#ffffff' : GS.ink }}>{line.replace('## ', '')}</h3>;
      }

      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.4rem', marginBottom: '0.2rem', fontSize: '0.82rem', lineHeight: 1.4 }}>
            <span>•</span>
            <span>{parseFormattedText(content)}</span>
          </div>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} style={{ height: '0.35rem' }} />;
      }

      return (
        <p key={idx} style={{ margin: '0 0 0.3rem 0', fontSize: '0.83rem', lineHeight: 1.45 }}>
          {parseFormattedText(line)}
        </p>
      );
    });
  }

  function parseFormattedText(str) {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} style={{ background: isUser ? 'rgba(255,255,255,0.2)' : '#e0e0e0', padding: '1px 5px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: PREMIUM }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '0.85rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', fontSize: '0.72rem', color: GS.muted, fontWeight: 600 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          {isUser ? (
            'YOU'
          ) : (
            <>
              <GradRobotIcon size={13} color="#0a0a0a" />
              <span style={{ fontWeight: 700, letterSpacing: '0.04em', color: GS.ink }}>CredBot</span>
            </>
          )}
        </span>
        <span>•</span>
        <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
      </div>

      <div
        style={{
          maxWidth: '88%',
          padding: '0.7rem 0.9rem',
          background: isUser ? GS.ink : '#f8f9fa',
          color: isUser ? '#ffffff' : GS.ink,
          border: `1px solid ${GS.border}`,
          borderRadius: '16px',
          fontSize: '0.85rem',
          position: 'relative',
          wordBreak: 'break-word',
          boxShadow: isUser ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {renderContent(message.text)}

        {!isUser && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem', borderTop: `1px solid ${GS.mid}`, paddingTop: '0.3rem' }}>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: GS.muted,
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

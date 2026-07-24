const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.85rem', background: '#f5f5f5', border: `1px solid ${GS.border}`, width: 'fit-content', borderRadius: '0' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Thinking</span>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        <span style={{ width: '4px', height: '4px', background: GS.ink, borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 1.2s infinite ease-in-out 0s' }}></span>
        <span style={{ width: '4px', height: '4px', background: GS.ink, borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 1.2s infinite ease-in-out 0.2s' }}></span>
        <span style={{ width: '4px', height: '4px', background: GS.ink, borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 1.2s infinite ease-in-out 0.4s' }}></span>
      </div>
      <style>{`
        @keyframes pulseDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

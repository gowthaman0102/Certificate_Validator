import { motion } from 'framer-motion';

const GS = { ink: '#0a0a0a', muted: '#666666', border: '#0a0a0a' };

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: (i) => ({
    y: [-2, 0, -2],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.12, // 120ms offset each
    },
  }),
};

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.85rem', background: '#f5f5f5', border: `1px solid ${GS.border}`, width: 'fit-content', borderRadius: '16px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Thinking</span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            custom={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            style={{
              width: '5px',
              height: '5px',
              background: GS.ink,
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff", mid: "#8c8c8c" };

export default function SuggestedQuestions({ onSelectQuestion }) {
  const suggestions = [
    "How do I verify a certificate?",
    "What does blockchain verification mean?",
    "What is RSA-2048 & SHA-256?",
    "Why is a certificate revoked?",
    "What does Risk Score mean?",
    "What happens if a cert is tampered?",
  ];

  return (
    <div style={{ padding: "0.4rem 0.75rem", background: "#f5f5f5", borderTop: `1px solid ${GS.border}`, borderBottom: `1px solid ${GS.border}` }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", marginBottom: "0.35rem", letterSpacing: "0.04em" }}>
        Quick Suggestions
      </div>
      <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", paddingBottom: "0.2rem", scrollbarWidth: "none" }}>
        {suggestions.map((q, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelectQuestion(q)}
            style={{
              whiteSpace: "nowrap",
              background: "#ffffff",
              border: `1px solid ${GS.border}`,
              borderRadius: "0",
              padding: "0.25rem 0.55rem",
              fontSize: "0.73rem",
              color: GS.ink,
              fontWeight: 500,
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e9e9e9")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            {q}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

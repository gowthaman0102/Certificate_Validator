import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const GS = { ink: "#0a0a0a", muted: "#64748b", subtle: "#94a3b8", border: "#e2e8f0", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: PREMIUM } },
};

export default function AchievementTimeline({ timelineItems = [], certificates = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL | VALID | REVOKED
  const [search, setSearch] = useState("");

  // Close modal on Escape key & manage scroll lock
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // Combine passport timeline items and certificate events
  const rawItems = (timelineItems.length > 0 ? timelineItems : certificates.map(c => ({
    id: `cert-${c.id}`,
    type: 'CERTIFICATE',
    title: `${c.certificate_category || 'Certificate'}: ${c.course}`,
    subtitle: c.university_name || 'Issuing Institution',
    date: c.issue_date || c.created_at,
    verified: c.status === 'VALID',
    status: c.status || 'VALID',
    data: c
  }))).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filteredItems = rawItems.filter(item => {
    const isRevoked = item.status === 'REVOKED' || item.data?.status === 'REVOKED';
    if (filter === "VALID" && isRevoked) return false;
    if (filter === "REVOKED" && !isRevoked) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = (item.title || "").toLowerCase().includes(q);
      const subMatch = (item.subtitle || "").toLowerCase().includes(q);
      return titleMatch || subMatch;
    }
    return true;
  });

  const recentItems = rawItems.slice(0, 3);

  if (rawItems.length === 0) {
    return (
      <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "1.25rem", borderRadius: "12px", textAlign: "center", color: GS.muted, fontSize: "0.88rem" }}>
        No achievement timeline events recorded yet. Issued certificates will appear chronologically here.
      </div>
    );
  }

  return (
    <div>
      {/* ── CARD INLINE PREVIEW (Shows top 3 items cleanly) ── */}
      <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
        {/* Continuous Vertical Line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "8px",
            bottom: "8px",
            left: "9px",
            width: "2px",
            background: "linear-gradient(180deg, #0a0a0a 0%, #cbd5e1 100%)",
            borderRadius: "1px"
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {recentItems.map((item) => {
            const isRevoked = item.status === 'REVOKED' || item.data?.status === 'REVOKED';

            return (
              <div key={item.id} style={{ position: "relative" }}>
                {/* Node Dot */}
                <div
                  style={{
                    position: "absolute",
                    left: "-1.5rem",
                    top: "6px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: isRevoked ? "#ef4444" : "#0a0a0a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    boxShadow: "0 0 0 3px #ffffff, 0 1px 3px rgba(0,0,0,0.1)",
                    zIndex: 2
                  }}
                >
                  {isRevoked ? "✕" : "✓"}
                </div>

                {/* Compact Item Card */}
                <div
                  style={{
                    background: isRevoked ? "#fef2f2" : "#ffffff",
                    border: isRevoked ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                    padding: "0.55rem 0.85rem",
                    borderRadius: "10px",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.4rem"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0a0a0a" }}>
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "0.08rem 0.4rem",
                          borderRadius: "10px",
                          background: isRevoked ? "#fee2e2" : "#f1f5f9",
                          color: isRevoked ? "#991b1b" : "#475569",
                          border: `1px solid ${isRevoked ? "#fca5a5" : "#cbd5e1"}`
                        }}
                      >
                        {isRevoked ? "REVOKED" : (item.data?.certificate_category || "CERTIFICATE")}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: GS.muted, marginTop: "1px" }}>
                      {item.subtitle}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {item.date && (
                      <span style={{ fontSize: "0.72rem", color: GS.muted, whiteSpace: "nowrap" }}>
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {!isRevoked && (
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "0.1rem 0.45rem", borderRadius: "10px" }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Button to Trigger Pop-Up Modal */}
      <div style={{ marginTop: "0.85rem", textAlign: "center" }}>
        <button
          className="btn"
          onClick={() => setShowModal(true)}
          style={{
            fontSize: "0.78rem",
            padding: "0.35rem 0.95rem",
            borderRadius: "18px",
            background: "#0a0a0a",
            color: "#ffffff"
          }}
        >
          Show All Milestones ({rawItems.length}) →
        </button>
      </div>

      {/* ── POP-UP MODAL DIALOG (PORTAL TO ROOT DOCUMENT BODY) ────────── */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(10, 10, 10, 0.72)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                zIndex: 999999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                boxSizing: "border-box"
              }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 16 }}
                transition={{ duration: 0.22, ease: PREMIUM }}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #0a0a0a",
                  borderRadius: "18px",
                  width: "100%",
                  maxWidth: "680px",
                  maxHeight: "85vh",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                  overflow: "hidden",
                  position: "relative"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#0a0a0a" }}>
                      Achievement Timeline
                    </h3>
                    <span style={{ fontSize: "0.82rem", color: GS.muted }}>
                      Chronological milestone history ({rawItems.length} Total Events)
                    </span>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "50%",
                      width: "34px",
                      height: "34px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#0a0a0a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Close (Esc)"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Controls: Search & Filter Pills */}
                <div style={{ padding: "0.85rem 1.5rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {[
                      { id: "ALL", label: `All (${rawItems.length})` },
                      { id: "VALID", label: `Valid (${rawItems.filter(i => (i.status || i.data?.status) !== 'REVOKED').length})` },
                      { id: "REVOKED", label: `Revoked (${rawItems.filter(i => (i.status || i.data?.status) === 'REVOKED').length})` },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        style={{
                          background: filter === tab.id ? "#0a0a0a" : "#ffffff",
                          color: filter === tab.id ? "#ffffff" : "#475569",
                          border: filter === tab.id ? "none" : "1px solid #cbd5e1",
                          borderRadius: "14px",
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search milestones..."
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      width: "190px"
                    }}
                  />
                </div>

                {/* Modal Body: Full Vertical Timeline List */}
                <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, position: "relative" }}>
                  {filteredItems.length === 0 ? (
                    <div style={{ textAlign: "center", color: GS.muted, padding: "2rem 0", fontSize: "0.9rem" }}>
                      No milestones found matching filter criteria.
                    </div>
                  ) : (
                    <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: "8px",
                          bottom: "8px",
                          left: "9px",
                          width: "2px",
                          background: "linear-gradient(180deg, #0a0a0a 0%, #cbd5e1 100%)",
                          borderRadius: "1px"
                        }}
                      />

                      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {filteredItems.map((item) => {
                          const isRevoked = item.status === 'REVOKED' || item.data?.status === 'REVOKED';

                          return (
                            <motion.div key={item.id} variants={itemVariants} style={{ position: "relative" }}>
                              <div
                                style={{
                                  position: "absolute",
                                  left: "-1.5rem",
                                  top: "8px",
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "50%",
                                  background: isRevoked ? "#ef4444" : "#0a0a0a",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.58rem",
                                  fontWeight: 700,
                                  boxShadow: "0 0 0 3px #ffffff, 0 1px 3px rgba(0,0,0,0.1)",
                                  zIndex: 2
                                }}
                              >
                                {isRevoked ? "✕" : "✓"}
                              </div>

                              <div
                                style={{
                                  background: isRevoked ? "#fef2f2" : "#ffffff",
                                  border: isRevoked ? "1px solid #fca5a5" : "1px solid #cbd5e1",
                                  padding: "0.75rem 1rem",
                                  borderRadius: "12px",
                                  display: "flex",
                                  justify: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "0.5rem"
                                }}
                              >
                                <div style={{ flex: 1, minWidth: "220px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0a0a0a" }}>
                                      {item.title}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        padding: "0.1rem 0.45rem",
                                        borderRadius: "10px",
                                        background: isRevoked ? "#fee2e2" : "#f1f5f9",
                                        color: isRevoked ? "#991b1b" : "#475569",
                                        border: `1px solid ${isRevoked ? "#fca5a5" : "#cbd5e1"}`
                                      }}
                                    >
                                      {isRevoked ? "REVOKED" : (item.data?.certificate_category || "CERTIFICATE")}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: GS.muted, marginTop: "2px" }}>
                                    {item.subtitle}
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                                  {item.date && (
                                    <span style={{ fontSize: "0.75rem", color: GS.muted, whiteSpace: "nowrap" }}>
                                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                  )}
                                  {!isRevoked && (
                                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "0.12rem 0.5rem", borderRadius: "10px" }}>
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div style={{ padding: "0.85rem 1.5rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc", textAlign: "right" }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    style={{ fontSize: "0.8rem", padding: "0.35rem 0.9rem" }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

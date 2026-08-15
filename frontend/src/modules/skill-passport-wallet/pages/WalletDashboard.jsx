import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentCertificates }            from "../../../shared/api/client";
import { recordWalletEvent, fetchWalletStats } from "../api/wallet";
import { recordEvent, getStats }             from "../utils/walletStore";
import { getMyPassport, updatePassportProfile } from "../api/passport";
import AchievementTimeline from "../components/AchievementTimeline";
import LearningGoalTracker from "../components/LearningGoalTracker";
import PortfolioLinksCard from "../components/PortfolioLinksCard";
import WalletDashboardDecorations from "../components/WalletDashboardDecorations";
import { CountUp, SkeletonCard } from "../../../shared/motion/index";
import useHeaderHeight from "../../../shared/hooks/useHeaderHeight";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: PREMIUM } },
};

export default function WalletDashboard() {
  useHeaderHeight(".dashboard-header");
  const navigate = useNavigate();
  const [user, setUser]             = useState(null);
  const [certificates, setCerts]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [localStats, setLocalStats] = useState({ downloads: 0, shares: 0, verifications: 0, views: 0 });
  const [passportData, setPassportData] = useState(null);

  // Phase 1 Tagline State
  const [tagline, setTagline]               = useState("");
  const [editingTagline, setEditingTagline] = useState(false);
  const [taglineInput, setTaglineInput]     = useState("");
  const [savingTagline, setSavingTagline]   = useState(false);

  // Index list filter state (belongs to the left pane only — does not affect WalletStats)
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected certificate ID — default to most recently issued on load
  const [selectedCertId, setSelectedCertId] = useState(null);

  // Mobile view state: "list" | "detail"
  const [mobileView, setMobileView] = useState("list");

  // Detect mobile via window width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const token      = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || storedUser.role !== "STUDENT") { navigate("/student-login"); return; }
    setUser(storedUser);
    loadCerts(storedUser);
    loadPassport();
    setLocalStats(getStats());
    fetchWalletStats()
      .then((res) => {
        if (res.data) {
          setLocalStats((prev) => ({
            downloads: Math.max(prev.downloads || 0, res.data.downloads || 0, 1),
            shares: Math.max(prev.shares || 0, res.data.shares || 0, 1),
            verifications: Math.max(prev.verifications || 0, res.data.verifications || 0, 1),
            views: Math.max(prev.views || 0, res.data.views || 0, 1),
          }));
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCerts(u) {
    setError(""); setLoading(true);
    try {
      const res = await getStudentCertificates({ email: u.email, registerNumber: u.register_number || "" });
      const certs = Array.isArray(res.data) ? res.data : [];
      setCerts(certs);
      // Auto-select most recently issued certificate
      if (certs.length > 0) {
        const sorted = [...certs].sort((a, b) => {
          const d1 = a.issue_date || a.created_at || 0;
          const d2 = b.issue_date || b.created_at || 0;
          return new Date(d2) - new Date(d1);
        });
        setSelectedCertId(sorted[0].id);
      }
    } catch {
      setError("Failed to load certificates. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPassport() {
    try {
      const res = await getMyPassport();
      const p = res.data?.data;
      setPassportData(p);
      if (p?.profile?.headline) {
        setTagline(p.profile.headline);
        setTaglineInput(p.profile.headline);
      }
    } catch { /* Fallback profile values if backend not connected */ }
  }

  async function handleSaveTagline() {
    if (!taglineInput.trim()) return;
    setSavingTagline(true);
    try {
      await updatePassportProfile({ headline: taglineInput.trim() });
      setTagline(taglineInput.trim());
      setEditingTagline(false);
    } catch {
      alert("Failed to save tagline");
    } finally {
      setSavingTagline(false);
    }
  }

  const logEvent = useCallback((type, cert) => {
    recordEvent(type, cert.id, { certNumber: cert.certificate_number, course: cert.course });
    setLocalStats(getStats());
    recordWalletEvent(type, cert.id, { certNumber: cert.certificate_number }).catch(() => {});
  }, []);

  function handleDownload(cert) { logEvent("DOWNLOAD", cert); }
  function handleLogout() { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }
  function handleClearFilters() { setSearch(""); setStatusFilter("ALL"); }

  // Filtered list (client-side — does NOT affect WalletStats count which always uses certificates.length)
  const filtered = useMemo(() => {
    let result = [...certificates];

    // Status filter
    if (statusFilter === "VALID")   result = result.filter((c) => c.status === "VALID");
    if (statusFilter === "REVOKED") result = result.filter((c) => c.status === "REVOKED");

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((c) =>
        (c.course || "").toLowerCase().includes(q) ||
        (c.certificate_number || "").toLowerCase().includes(q) ||
        (c.student_name || "").toLowerCase().includes(q)
      );
    }

    // Always sort newest first in the index list
    result.sort((a, b) => {
      const d1 = a.issue_date || a.created_at || 0;
      const d2 = b.issue_date || b.created_at || 0;
      return new Date(d2) - new Date(d1);
    });

    return result;
  }, [certificates, search, statusFilter]);

  // Ensure selected cert is valid within filtered results; if not, auto-select first
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((c) => c.id === selectedCertId)) {
      setSelectedCertId(filtered[0].id);
    }
  }, [filtered, selectedCertId]);

  const selectedCert = certificates.find((c) => c.id === selectedCertId) || null;
  const score        = passportData?.score      || { score: 245, level: "Beginner" };
  const completion   = passportData?.completion || 5;

  function handleSelectCert(id) {
    setSelectedCertId(id);
    if (isMobile) setMobileView("detail");
  }

  function handleMobileBack() {
    setMobileView("list");
  }

  if (loading) {
    return (
      <div className="dashboard">
        <WalletDashboardDecorations />
        <div className="dashboard-header"><h2>My Credential Wallet</h2></div>
        <div className="card">
          <SkeletonCard rows={3} heights={["2rem", "6rem", "10rem"]} gap="1rem" />
        </div>
      </div>
    );
  }

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      <WalletDashboardDecorations />

      {/* ── DASHBOARD HEADER ─────────────────────────────────────── */}
      <div className="dashboard-header">
        <h2>My Credential Wallet</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn" style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }} onClick={() => { loadCerts(user); loadPassport(); }} id="wallet-refresh-btn">Refresh</button>
          <button className="btn-secondary" onClick={() => navigate("/student")} id="wallet-back-btn">← Back to Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="wallet-logout-btn">Logout</button>
        </div>
      </div>

      {/* ── STUDENT DIGITAL IDENTITY CARD ────────────────────────── */}
      <motion.div className="card" variants={cardVariants}>
        {(() => {
          const walletId = `CWID-${user?.id ? user.id.slice(0, 8).toUpperCase() : "STUDENT"}`;
          const frontendPublicUrl = `${window.location.origin}/student/profile/${user?.id || ""}`;
          const identityQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(frontendPublicUrl)}`;

          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flex: 1, minWidth: "260px" }}>
                  <div style={{ width: "68px", height: "68px", background: "#0a0a0a", color: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", fontWeight: 700, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "S")}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#0a0a0a" }}>{user?.name || "Student Profile"}</h3>
                      <span style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, borderRadius: "25px" }}>✓ VERIFIED IDENTITY</span>
                      <span style={{ background: "#f5f5f5", border: "1.5px solid #0a0a0a", color: "#0a0a0a", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, borderRadius: "25px" }}>⛓ BLOCKCHAIN ANCHORED</span>
                    </div>

                    {/* Tagline / Professional Headline — Modern Pill & Badge Style */}
                    <div style={{ marginTop: "6px" }}>
                      {editingTagline ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#ffffff", border: "1.5px solid #0a0a0a", borderRadius: "20px", padding: "0.15rem 0.25rem 0.15rem 0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                          <input
                            type="text"
                            value={taglineInput}
                            onChange={(e) => setTaglineInput(e.target.value)}
                            placeholder="e.g. Aspiring Full Stack Developer & AI Specialist"
                            autoFocus
                            style={{
                              border: "none",
                              outline: "none",
                              fontSize: "0.82rem",
                              fontWeight: 500,
                              color: "#0a0a0a",
                              width: "250px",
                              background: "transparent"
                            }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveTagline(); if (e.key === "Escape") setEditingTagline(false); }}
                          />
                          <button
                            onClick={handleSaveTagline}
                            disabled={savingTagline}
                            style={{
                              background: "#0a0a0a",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "14px",
                              padding: "0.25rem 0.65rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem"
                            }}
                          >
                            {savingTagline ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingTagline(false)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#64748b",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              padding: "0.2rem 0.4rem",
                              fontWeight: 700
                            }}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : tagline ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "#f1f5f9", padding: "0.25rem 0.75rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>
                            "{tagline}"
                          </span>
                          <button
                            onClick={() => { setTaglineInput(tagline); setEditingTagline(true); }}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#475569",
                              padding: 0
                            }}
                            title="Edit Tagline"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setTaglineInput(""); setEditingTagline(true); }}
                          style={{
                            background: "#f8fafc",
                            border: "1px dashed #94a3b8",
                            color: "#475569",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem"
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Add professional tagline</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identity QR Code & Quick Public Access Card */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", background: "#ffffff", border: "1.5px solid #0a0a0a", padding: "0.6rem 0.85rem", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", minWidth: "150px" }}>
                  <a href={frontendPublicUrl} target="_blank" rel="noreferrer" title="Click to view public profile web page" style={{ textDecoration: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img src={identityQrUrl} alt="Digital Identity QR" style={{ width: "72px", height: "72px", borderRadius: "6px" }} />
                  </a>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, fontFamily: "monospace", color: "#0a0a0a", letterSpacing: "0.04em" }}>{walletId}</span>

                  {/* Copy Link Button */}
                  <div style={{ marginTop: "2px", width: "100%", textAlign: "center" }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(frontendPublicUrl);
                        alert("Public portfolio link copied to clipboard:\n" + frontendPublicUrl);
                      }}
                      style={{
                        background: "#0a0a0a",
                        color: "#ffffff",
                        border: "none",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "14px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        width: "100%"
                      }}
                      title="Copy public link to clipboard"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Academic Attributes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", background: "#f9f9f9", border: "1px solid #0a0a0a", padding: "1.1rem 1.35rem", borderRadius: "16px", marginBottom: "1.25rem", width: "100%", boxSizing: "border-box" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>COURSE / MAJOR</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px" }}>{certificates[0]?.course || "Information Technology"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>UNIVERSITY</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px" }}>{certificates[0]?.university_name || "Issuing University"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>GRADUATION YEAR</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px" }}>{certificates[0]?.end_year || "2028"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>REGISTER NUMBER</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px", fontFamily: "monospace" }}>{user?.register_number || "—"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>WALLET ID</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px", fontFamily: "monospace" }}>{walletId}</div>
                </div>
              </div>
            </>
          );
        })()}

        {/* Profile Score & Completion Bar */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", width: "100%" }}>
          <div style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.55rem 1.15rem", borderRadius: "25px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85, fontWeight: 600 }}>PROFILE SCORE</span>
            <span style={{ fontSize: "1.15rem", fontWeight: 700 }}><CountUp to={score.score} duration={0.8} /> / 1000</span>
            <span style={{ background: "#ffffff", color: "#0a0a0a", padding: "0.15rem 0.55rem", fontSize: "0.72rem", fontWeight: 700, borderRadius: "14px" }}>{score.level}</span>
          </div>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "#0a0a0a", marginBottom: "4px" }}>
              <span>PROFILE COMPLETION</span>
              <span><CountUp to={completion} suffix="%" duration={0.6} /></span>
            </div>
            <div style={{ background: "#e2e8f0", height: "10px", width: "100%", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ background: "#0a0a0a", height: "100%", width: `${completion}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── PHASE 2: SKILL PASSPORT PREVIEW ────────────────────────── */}
      <motion.div className="card" variants={cardVariants} style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: GS.ink }}>
              Skill Passport Preview
            </h3>
          </div>
          <button
            className="btn"
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            onClick={() => navigate("/skill-passport")}
            id="wallet-view-skill-passport-btn"
          >
            View full Skill Passport →
          </button>
        </div>

        {(() => {
          const recordedSkills = passportData?.skills || [];

          if (recordedSkills.length === 0) {
            return (
              <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "1.25rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <span style={{ color: GS.muted, fontSize: "0.88rem", fontWeight: 500 }}>
                  No skills added yet to your Digital Skill Passport.
                </span>
                <button
                  className="btn"
                  style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
                  onClick={() => navigate("/skill-passport")}
                >
                  + Add Skills in Passport
                </button>
              </div>
            );
          }

          return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
              {recordedSkills.slice(0, 10).map((sk, idx) => (
                <span
                  key={sk.id || idx}
                  style={{
                    background: "#0a0a0a",
                    color: "#ffffff",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.06)"
                  }}
                >
                  <span>{sk.skill_name}</span>
                  {sk.proficiency && (
                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.1rem 0.4rem", borderRadius: "10px", fontSize: "0.68rem" }}>
                      {sk.proficiency}
                    </span>
                  )}
                </span>
              ))}
              {recordedSkills.length > 10 && (
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: GS.muted, padding: "0.35rem 0.5rem" }}>
                  +{recordedSkills.length - 10} more
                </span>
              )}
            </div>
          );
        })()}
      </motion.div>

      {/* ── PHASE 3: ACHIEVEMENT TIMELINE ──────────────────────────── */}
      <motion.div className="card" variants={cardVariants} style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: GS.ink }}>
            Achievement Timeline
          </h3>
        </div>

        <AchievementTimeline
          timelineItems={passportData?.timeline || []}
          certificates={certificates}
        />
      </motion.div>

      {/* ── LEARNING GOAL TRACKER & HABIT MONITOR ────────────────────── */}
      <motion.div className="card" variants={cardVariants} style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: GS.ink }}>
            Learning Goal Tracker & Habit Monitor
          </h3>
        </div>

        <LearningGoalTracker />
      </motion.div>

      {/* ── PHASE 6: PORTFOLIO LINKS SECTION ──────────────────────── */}
      <motion.div className="card" variants={cardVariants} style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: GS.ink }}>
            Verified Portfolio Links
          </h3>
        </div>

        <PortfolioLinksCard />
      </motion.div>

      {error && <motion.div className="card" variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}
    </motion.div>
  );
}

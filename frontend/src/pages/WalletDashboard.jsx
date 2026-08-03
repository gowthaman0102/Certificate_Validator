import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentCertificates }            from "../api/client";
import { recordWalletEvent, fetchWalletStats } from "../api/wallet";
import { recordEvent, getStats }             from "../utils/walletStore";
import { getMyPassport }                     from "../api/passport";
import WalletStats    from "../components/wallet/WalletStats";
import WalletIndexList from "../components/wallet/WalletIndexList";
import WalletDetailPane from "../components/wallet/WalletDetailPane";
import WalletDashboardDecorations from "../components/decorations/WalletDashboardDecorations";
import { CountUp, SkeletonCard } from "../components/motion";

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
  const navigate = useNavigate();
  const [user, setUser]             = useState(null);
  const [certificates, setCerts]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [localStats, setLocalStats] = useState({ downloads: 0, shares: 0, verifications: 0, views: 0 });
  const [passportData, setPassportData] = useState(null);

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
      setPassportData(res.data.data);
    } catch { /* Fallback profile values if backend not connected */ }
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

      {/* ── STUDENT ACADEMIC PROFILE CARD ────────────────────────── */}
      <motion.div className="card" variants={cardVariants}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "#0a0a0a", color: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, flexShrink: 0 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "S")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#0a0a0a" }}>{user?.name || "Student Profile"}</h3>
                <span style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, borderRadius: "25px" }}>✓ VERIFIED IDENTITY</span>
                <span style={{ background: "#f5f5f5", border: "1.5px solid #0a0a0a", color: "#0a0a0a", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, borderRadius: "25px" }}>⛓ BLOCKCHAIN ANCHORED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Attributes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", background: "#f9f9f9", border: "1px solid #0a0a0a", padding: "1.1rem 1.35rem", borderRadius: "16px", marginBottom: "1.25rem", width: "100%", boxSizing: "border-box" }}>
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
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px" }}>{certificates[0]?.end_year || "2026"}</div>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>REGISTER NUMBER</span>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginTop: "3px", fontFamily: "monospace" }}>{user?.register_number || "—"}</div>
          </div>
        </div>

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

      {/* ── WALLET ACTIVITY SUMMARY (always reflects full count — unaffected by filters) ── */}
      <motion.div className="card" variants={cardVariants}>
        <WalletStats stats={localStats} totalCerts={certificates.length} />
      </motion.div>

      {error && <motion.div className="card" variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}

      {/* ── MASTER-DETAIL SPLIT VIEW ─────────────────────────────── */}
      <motion.div className="card" variants={cardVariants}>
        {certificates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: GS.muted }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: GS.ink, marginBottom: "0.5rem" }}>No certificates in your wallet</p>
            <p style={{ fontSize: "0.85rem" }}>Your issued digital credentials will appear here once the university issues them.</p>
          </div>
        ) : isMobile ? (
          /* ── MOBILE: Single-column slide-over behavior ── */
          <AnimatePresence mode="wait">
            {mobileView === "list" ? (
              <motion.div
                key="mobile-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <WalletIndexList
                  certificates={certificates}
                  filteredCertificates={filtered}
                  selectedCertId={selectedCertId}
                  onSelectCert={handleSelectCert}
                  search={search}
                  setSearch={setSearch}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onClearFilters={handleClearFilters}
                />
              </motion.div>
            ) : (
              <motion.div
                key="mobile-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <WalletDetailPane
                  cert={selectedCert}
                  onDownload={handleDownload}
                  onBackMobile={handleMobileBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          /* ── DESKTOP: Side-by-side split view ── */
          <div className="wallet-split-container">
            <WalletIndexList
              certificates={certificates}
              filteredCertificates={filtered}
              selectedCertId={selectedCertId}
              onSelectCert={handleSelectCert}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
            <WalletDetailPane
              cert={selectedCert}
              onDownload={handleDownload}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

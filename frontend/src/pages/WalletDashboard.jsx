import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getStudentCertificates }            from "../api/client";
import { recordWalletEvent, fetchWalletStats } from "../api/wallet";
import { recordEvent, getStats }             from "../utils/walletStore";
import { getMyPassport }                     from "../api/passport";
import WalletStats    from "../components/wallet/WalletStats";
import WalletCertCard from "../components/wallet/WalletCertCard";
import WalletDashboardDecorations from "../components/decorations/WalletDashboardDecorations";
import { CountUp, SkeletonCard } from "../components/motion";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff", mid: "#8c8c8c" };
const PREMIUM = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: PREMIUM } },
};

function WalletDashboard() {
  const navigate = useNavigate();
  const [user, setUser]             = useState(null);
  const [certificates, setCerts]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [localStats, setLocalStats] = useState({ downloads: 0, shares: 0, verifications: 0, views: 0 });
  const [search, setSearch]  = useState("");
  const [filter, setFilter]  = useState("ALL");
  const [sortBy, setSortBy]  = useState("date_desc");

  const [passportData, setPassportData] = useState(null);

  useEffect(() => {
    const token      = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || storedUser.role !== "STUDENT") { navigate("/student-login"); return; }
    setUser(storedUser);
    loadCerts(storedUser);
    loadPassport();
    setLocalStats(getStats());
    fetchWalletStats().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCerts(u) {
    setError(""); setLoading(true);
    try { const res = await getStudentCertificates({ email: u.email, registerNumber: u.register_number || "" }); setCerts(Array.isArray(res.data) ? res.data : []); }
    catch { setError("Failed to load certificates. Please check your connection and try again."); }
    finally { setLoading(false); }
  }

  async function loadPassport() {
    try {
      const res = await getMyPassport();
      setPassportData(res.data.data);
    } catch {
      /* Fallback profile values if backend not connected */
    }
  }

  const logEvent = useCallback((type, cert) => {
    recordEvent(type, cert.id, { certNumber: cert.certificate_number, course: cert.course });
    setLocalStats(getStats());
    recordWalletEvent(type, cert.id, { certNumber: cert.certificate_number }).catch(() => {});
  }, []);

  function handleDownload(cert) { logEvent("DOWNLOAD", cert); }
  function handleLogout() { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }

  const filtered = certificates
    .filter((c) => { if (filter === "VALID") return c.status === "VALID"; if (filter === "REVOKED") return c.status === "REVOKED"; return true; })
    .filter((c) => { if (!search.trim()) return true; const q = search.trim().toLowerCase(); return c.student_name?.toLowerCase().includes(q) || c.course?.toLowerCase().includes(q) || c.certificate_number?.toLowerCase().includes(q) || (c.university_name || "").toLowerCase().includes(q); })
    .sort((a, b) => { if (sortBy === "date_desc") return new Date(b.created_at) - new Date(a.created_at); if (sortBy === "date_asc") return new Date(a.created_at) - new Date(b.created_at); if (sortBy === "name_asc") return (a.course || "").localeCompare(b.course || ""); return 0; });

  const score      = passportData?.score      || { score: 245, level: "Beginner" };
  const completion = passportData?.completion || 5;

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
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <WalletDashboardDecorations />
      <div className="dashboard-header">
        <h2>My Credential Wallet</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn" style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }} onClick={() => { loadCerts(user); loadPassport(); }} id="wallet-refresh-btn">Refresh</button>
          <button className="btn-secondary" onClick={() => navigate("/student")} id="wallet-back-btn">← Back to Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="wallet-logout-btn">Logout</button>
        </div>
      </div>

      {/* ── FIXED IMMUTABLE STUDENT ACADEMIC PROFILE CARD ────────────────── */}
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
                <span style={{ background: "#f5f5f5", border: "1px solid #0a0a0a", color: "#0a0a0a", padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, borderRadius: "25px" }}>⛓ BLOCKCHAIN ANCHORED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid for Academic Attributes */}
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

      {/* ── WALLET ACTIVITY SUMMARY ────────────────────────────────────── */}
      <WalletStats stats={localStats} totalCerts={certificates.length} />

      {error && <motion.div className="card" variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}

      {/* ── SEARCH & FILTER CONTROLS ──────────────────────────────────── */}
      <motion.div className="card" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }} variants={cardVariants}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search certificates by title, ID, or university..."
          style={{ flex: 1, minWidth: "220px" }}
          id="wallet-search-input"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "140px" }} id="wallet-filter-select">
          <option value="ALL">All Status</option>
          <option value="VALID">Valid Only</option>
          <option value="REVOKED">Revoked Only</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: "160px" }} id="wallet-sort-select">
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="name_asc">Course A–Z</option>
        </select>
      </motion.div>

      {/* ── CERTIFICATES LIST ─────────────────────────────────────────── */}
      <motion.div className="card" variants={cardVariants}>
        <h3 style={{ fontWeight: 700, fontSize: "1.2rem", color: GS.ink, marginBottom: "1rem" }}>
          Credential Vault Cards (<CountUp to={filtered.length} duration={0.6} />)
        </h3>
        {filtered.length === 0 ? (
          <p style={{ color: GS.muted, padding: "1rem 0" }}>No certificates found matching your search and filter criteria.</p>
        ) : (
          <div className="wallet-cert-list">
            {filtered.map((cert) => (
              <WalletCertCard
                key={cert.id}
                cert={cert}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default WalletDashboard;

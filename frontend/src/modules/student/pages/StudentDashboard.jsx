import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentCertificates } from "../../../shared/api/client";
import WalletIndexList from "../../skill-passport-wallet/components/WalletIndexList";
import WalletDetailPane from "../../skill-passport-wallet/components/WalletDetailPane";
import StudentDashboardDecorations from "../components/StudentDashboardDecorations";
import { CountUp, SkeletonCard } from "../../../shared/motion/index";
import useHeaderHeight from "../../../shared/hooks/useHeaderHeight";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };
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

function StudentDashboard() {
  useHeaderHeight(".dashboard-header");
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");

  // Master-Detail filter & selection state
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [mobileView, setMobileView]     = useState("list");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "STUDENT") { navigate("/student-login"); return; }
    setUserName(user.name || "");
    if (user.email || user.register_number) {
      setUserEmail(user.email || "");
      setRegisterNumber(user.register_number || "");
      loadCertificates(user.email || "", user.register_number || "");
    } else { setLoading(false); }
  }, []);

  async function loadCertificates(email, regNumber) {
    setError(""); setLoading(true);
    try {
      const res = await getStudentCertificates({ email, registerNumber: regNumber });
      const list = Array.isArray(res.data) ? res.data : [];
      setCertificates(list);
      if (list.length > 0) {
        const sorted = [...list].sort((a, b) => {
          const d1 = a.issue_date || a.created_at || 0;
          const d2 = b.issue_date || b.created_at || 0;
          return new Date(d2) - new Date(d1);
        });
        setSelectedCertId(sorted[0].id);
      }
    } catch {
      setError("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  const filtered = useMemo(() => {
    let result = [...certificates];

    if (statusFilter === "VALID")   result = result.filter((c) => c.status === "VALID");
    if (statusFilter === "REVOKED") result = result.filter((c) => c.status === "REVOKED");

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((c) =>
        (c.course || "").toLowerCase().includes(q) ||
        (c.certificate_number || "").toLowerCase().includes(q) ||
        (c.student_name || "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const d1 = a.issue_date || a.created_at || 0;
      const d2 = b.issue_date || b.created_at || 0;
      return new Date(d2) - new Date(d1);
    });

    return result;
  }, [certificates, search, statusFilter]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((c) => c.id === selectedCertId)) {
      setSelectedCertId(filtered[0].id);
    }
  }, [filtered, selectedCertId]);

  const selectedCert = certificates.find((c) => c.id === selectedCertId) || null;

  function handleSelectCert(id) {
    setSelectedCertId(id);
    if (isMobile) setMobileView("detail");
  }

  function handleMobileBack() {
    setMobileView("list");
  }

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <StudentDashboardDecorations />
      <div className="dashboard-header">
        <h2>My Certificates</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn" onClick={() => navigate("/analytics/student")} id="student-analytics-btn">Analytics</button>
          <button className="btn" onClick={() => navigate("/wallet")} id="student-open-wallet-btn">My Wallet</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <motion.div className="card" variants={cardVariants}>
        <p style={{ color: GS.muted, fontSize: "0.9rem" }}>
          Showing certificates issued to <strong style={{ color: GS.ink }}>{userName || userEmail}</strong> {userName && userEmail ? `(${userEmail}${registerNumber ? ` / ${registerNumber}` : ""})` : (registerNumber ? `/ ${registerNumber}` : "")}
        </p>
        {error && <div className="error-msg" style={{ marginTop: "1rem" }}>{error}</div>}
      </motion.div>

      {loading && (
        <div className="card">
          <SkeletonCard rows={3} heights={["1.5rem", "4rem", "12rem"]} gap="1rem" />
        </div>
      )}

      {!loading && (
        <motion.div className="card" variants={cardVariants}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>
              Results (<CountUp to={certificates.length} duration={0.6} />)
            </h3>
          </div>

          {certificates.length === 0 ? (
            <p style={{ color: GS.muted, padding: "2rem 0", textAlign: "center" }}>No certificates found for your account.</p>
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
              />
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default StudentDashboard;

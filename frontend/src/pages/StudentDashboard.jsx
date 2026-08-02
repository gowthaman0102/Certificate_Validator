import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getStudentCertificates } from "../api/client";
import CertificateTemplate from "../components/CertificateTemplate";
import { downloadCertificateAsPDF } from "../utils/certificatePdf";
import StudentDashboardDecorations from "../components/StudentDashboardDecorations";
import { CountUp, SkeletonCard } from "../components/motion";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const copyBtnStyle = {
  background: "transparent", border: `1px solid ${GS.border}`, borderRadius: "0",
  color: GS.ink, fontSize: "0.7rem", padding: "1px 6px", cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};

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
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const hiddenCertRefs = useRef({});

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
      setCertificates(Array.isArray(res.data) ? res.data : []);
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

  function getHiddenRef(certId) {
    if (!hiddenCertRefs.current[certId]) hiddenCertRefs.current[certId] = { current: null };
    return hiddenCertRefs.current[certId];
  }

  async function handleDownload(cert) {
    const ref = getHiddenRef(cert.id);
    await downloadCertificateAsPDF(ref, `certificate_${cert.certificate_number}`);
  }

  async function handleCopyId(certNumber) {
    try {
      await navigator.clipboard.writeText(certNumber);
      setCopiedId(certNumber);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      alert("Certificate ID: " + certNumber);
    }
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
          <h3>
            Results (<CountUp to={certificates.length} duration={0.6} />)
          </h3>
          {certificates.length === 0 && (
            <p style={{ color: GS.muted }}>No certificates found for your email.</p>
          )}
          <div className="cert-list">
            {certificates.map((cert, index) => {
              const isRevoked = cert.status === "REVOKED";
              return (
                <motion.div
                  key={cert.id}
                  className="card-lift"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.04, ease: PREMIUM }}
                  style={{
                    background: GS.bg,
                    border: `1.5px solid ${isRevoked ? "#0a0a0a" : GS.border}`,
                    padding: "1.25rem",
                    marginBottom: "0.75rem",
                    opacity: isRevoked ? 0.75 : 1,
                    filter: isRevoked ? "grayscale(0.8)" : "none",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 600, color: GS.ink }}>{cert.student_name}</div>
                      {isRevoked && (
                        <div style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700, marginTop: "2px" }}>
                          ⚠️ Certificate Revoked by Issuing University
                        </div>
                      )}
                    </div>
                    <span className={`status-badge ${isRevoked ? "status-revoked" : "status-valid"}`} style={isRevoked ? { background: "#0a0a0a", color: "#ffffff", border: "1px solid #0a0a0a" } : {}}>
                      {isRevoked ? "REVOKED" : cert.status}
                    </span>
                  </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem 1.5rem", background: GS.bg, border: `1px solid ${GS.border}`, padding: "1rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
                  <div><span style={{ color: GS.muted }}>Course</span><br /><strong style={{ color: GS.ink }}>{cert.course}</strong></div>
                  <div><span style={{ color: GS.muted }}>Duration</span><br /><strong style={{ color: GS.ink }}>{cert.start_year} - {cert.end_year}</strong></div>
                  <div>
                    <span style={{ color: GS.muted }}>Certificate ID</span><br />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <strong style={{ color: GS.ink }}>{cert.certificate_number}</strong>
                      <button onClick={() => handleCopyId(cert.certificate_number)} style={copyBtnStyle}>
                        {copiedId === cert.certificate_number ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div><span style={{ color: GS.muted }}>Issue Date</span><br /><strong style={{ color: GS.ink }}>{cert.issue_date}</strong></div>
                  <div><span style={{ color: GS.muted }}>Issuing University</span><br /><strong style={{ color: GS.ink }}>{cert.university_name || cert.issuer_id || "—"}</strong></div>
                  <div><span style={{ color: GS.muted }}>Student Email</span><br /><strong style={{ color: GS.ink }}>{cert.student_email}</strong></div>
                </div>
                {(() => {
                  const isVertical = cert.certificate_category === "Degree / Graduation Certificate";
                  return (
                    <div style={{
                      background: "#f8f9fa",
                      border: `1px solid ${GS.border}`,
                      borderRadius: "12px",
                      padding: "1rem 0.5rem",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      height: isVertical ? "420px" : "315px",
                      marginBottom: "1rem",
                      boxSizing: "border-box"
                    }}>
                      <div style={{
                        transform: isVertical ? "scale(0.46)" : "scale(0.52)",
                        transformOrigin: "top center",
                        marginBottom: isVertical ? "-475px" : "-275px"
                      }}>
                        <CertificateTemplate certificate={cert} qrCodeUrl={`http://localhost:5000/uploads/qr_${cert.id}.png`} />
                      </div>
                    </div>
                  );
                })()}
                <div style={{ textAlign: "center", marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn" onClick={() => handleDownload(cert)}>Download PDF</button>
                  {cert.file_path && (
                    <a href={`http://localhost:5000${cert.file_path}`} target="_blank" rel="noreferrer"
                      style={{ color: GS.ink, fontSize: "0.85rem", fontWeight: 500, textDecoration: "underline", alignSelf: "center" }}>
                      View Original PDF
                    </a>
                  )}
                </div>
                <div style={{ position: "fixed", top: 0, left: "-9999px", width: "800px", zIndex: -1, pointerEvents: "none" }}>
                  <CertificateTemplate ref={getHiddenRef(cert.id)} certificate={cert} qrCodeUrl={`http://localhost:5000/uploads/qr_${cert.id}.png`} />
                </div>
              </motion.div>
            );
          })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default StudentDashboard;

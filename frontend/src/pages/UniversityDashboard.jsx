import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMyUniversity, createUniversity, uploadCertificate,
  bulkUploadCertificates, getCertificatesByUniversity, revokeCertificate,
  getUniversityVerifications,
} from "../api/client";
import CategoryCertificateTemplate from "../components/templates/CategoryCertificateTemplate";
import { downloadCertificateAsPDF } from "../utils/certificatePdf";
import { parseCertificateExcel } from "../utils/excelParser";
import { CATEGORIES, NEEDS_DETAIL } from "../utils/certificateCategory";
import UniversityDashboardDecorations from "../components/UniversityDashboardDecorations";
import { CountUp, SkeletonCard } from "../components/motion";
import useHeaderHeight from "../hooks/useHeaderHeight";

const API_BASE = "http://localhost:5000";

const GS = {
  ink:    "#0a0a0a",
  muted:  "#666666",
  subtle: "#999999",
  border: "#0a0a0a",
  bg:     "#ffffff",
  mid:    "#8c8c8c",
};

const copyBtnStyle = {
  background: "transparent",
  border: `1px solid ${GS.border}`,
  borderRadius: "0",
  color: GS.ink,
  fontSize: "0.7rem",
  padding: "1px 6px",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};

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

function UniversityDashboard() {
  useHeaderHeight(".dashboard-header");
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uniName, setUniName] = useState("");
  const [issuerCode, setIssuerCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [course, setCourse] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [file, setFile] = useState(null);
  const [certCategory, setCertCategory] = useState(CATEGORIES[0].value);
  const [certDetail, setCertDetail] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState(null);
  const [copiedId, setCopiedId] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkError, setBulkError] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const hiddenCertRef = useRef(null);
  const modalCertRef = useRef(null);

  const [verifications, setVerifications] = useState([]);
  const [totalVerificationsMonth, setTotalVerificationsMonth] = useState(0);
  const [emailNotify, setEmailNotify] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "UNIVERSITY") { navigate("/university-login"); return; }
    loadUniversity();
  }, []);

  async function loadUniversity() {
    setLoading(true);
    try {
      const res = await getMyUniversity();
      setUniversity(res.data);
      loadCertificates(res.data.id);
      loadVerificationActivity();
    } catch { setUniversity(null); }
    finally { setLoading(false); }
  }

  async function loadVerificationActivity() {
    try {
      const res = await getUniversityVerifications();
      setVerifications(res.data.verifications || []);
      setTotalVerificationsMonth(res.data.totalThisMonth || 0);
    } catch (e) { console.error(e); }
  }

  async function loadCertificates(universityId) {
    try { const res = await getCertificatesByUniversity(universityId); setCertificates(res.data); }
    catch (err) { console.error(err); }
  }

  async function handleCreateUniversity(e) {
    e.preventDefault(); setError(""); setCreating(true);
    try { await createUniversity({ name: uniName, issuer_code: issuerCode }); await loadUniversity(); }
    catch (err) { setError(err.response?.data?.error || "Failed to create university profile"); }
    finally { setCreating(false); }
  }

  async function handleIssueCertificate(e) {
    e.preventDefault(); setError(""); setIssuing(true); setLastIssued(null);
    try {
      const formData = new FormData();
      formData.append("student_name", studentName);
      formData.append("register_number", registerNumber);
      if (studentEmail) formData.append("student_email", studentEmail);
      formData.append("course", course);
      formData.append("cgpa", cgpa);
      if (startYear) formData.append("start_year", startYear);
      formData.append("end_year", endYear);
      formData.append("issue_date", issueDate);
      formData.append("certificate_category", certCategory);
      if (certDetail.trim()) formData.append("certificate_detail", certDetail.trim());
      if (file) formData.append("file", file);
      const res = await uploadCertificate(formData);
      setLastIssued(res.data.certificate);
      setStudentName(""); setRegisterNumber(""); setStudentEmail(""); setCourse("");
      setCgpa(""); setStartYear(""); setEndYear(""); setIssueDate("");
      setFile(null); setCertCategory(CATEGORIES[0].value); setCertDetail("");
      loadCertificates(university.id);
    } catch (err) { setError(err.response?.data?.error || err.response?.data?.debug || err.message || "Failed to issue certificate"); }
    finally { setIssuing(false); }
  }

  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  async function confirmRevoke() {
    if (!revokeTarget) return;
    if (!revokeReason.trim()) {
      alert("Please provide a reason for revoking this certificate.");
      return;
    }
    setRevoking(true);
    try {
      await revokeCertificate(revokeTarget.id, revokeReason.trim());
      alert(`Certificate ${revokeTarget.certificate_number || ''} has been successfully revoked.`);
      setRevokeTarget(null);
      setRevokeReason("");
      if (university?.id) {
        loadCertificates(university.id);
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to revoke certificate");
    } finally {
      setRevoking(false);
    }
  }

  function handleLogout() { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); }

  async function handleDownloadPdf() {
    if (!lastIssued) return;
    await downloadCertificateAsPDF(hiddenCertRef, `certificate_${lastIssued.certificate_number}`);
  }

  async function handleCopyId(certNumber) {
    try { await navigator.clipboard.writeText(certNumber); setCopiedId(certNumber); setTimeout(() => setCopiedId(""), 1500); }
    catch { alert("Certificate ID: " + certNumber); }
  }

  function handleBulkFileChange(e) {
    const f = e.target.files[0];
    if (f) { setBulkFile(f); setBulkResults(null); setBulkError(""); }
  }

  async function handleBulkIssue() {
    if (!bulkFile) return;
    setBulkError(""); setBulkResults(null); setBulkProcessing(true);
    try {
      const rows = await parseCertificateExcel(bulkFile);
      if (rows.length === 0) { setBulkError("No data rows found in the spreadsheet."); return; }
      const res = await bulkUploadCertificates(rows);
      setBulkResults(res.data);
      loadCertificates(university.id);
    } catch (err) { setBulkError(err.response?.data?.error || err.message || "Bulk issuance failed"); }
    finally { setBulkProcessing(false); }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header"><h2>University Dashboard</h2></div>
        <div className="card">
          <SkeletonCard rows={3} heights={["1.5rem", "5rem", "10rem"]} gap="1rem" />
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Set Up Your University</h2>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreateUniversity}>
            <label>University Name</label>
            <input value={uniName} onChange={(e) => setUniName(e.target.value)} required />
            <label>Issuer Code (unique, e.g. UNI001)</label>
            <input value={issuerCode} onChange={(e) => setIssuerCode(e.target.value)} required />
            <button className="btn" type="submit" disabled={creating} style={{ marginTop: "1rem" }}>
              {creating ? "Creating..." : "Create University Profile"}
            </button>
          </form>
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
      <UniversityDashboardDecorations />
      <div className="dashboard-header">
        <h2>{university.name}</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={() => navigate("/analytics/university")} id="university-analytics-btn">Analytics</button>
          <button className="btn" onClick={() => navigate("/analytics/verification")} id="university-verification-analytics-btn">Verification Stats</button>
          <button className="btn" onClick={() => navigate("/audit")} id="university-audit-btn">Audit Logs</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <motion.div className="card" variants={cardVariants}>
        <h3 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0a0a0a", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.4rem", marginBottom: "1.2rem" }}>University Info</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1.25rem" }}>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "0.68rem",
              textTransform: "uppercase",
              letterSpacing: "0.13em",
              color: "#3a3a3a",
              flexShrink: 0
            }}>Issuer Code</span>
            <span style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#0a0a0a",
              letterSpacing: "0.04em"
            }}>{university.issuer_code}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1.25rem" }}>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "0.68rem",
              textTransform: "uppercase",
              letterSpacing: "0.13em",
              color: "#3a3a3a",
              flexShrink: 0
            }}>University ID</span>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: "#0a0a0a",
              letterSpacing: "0.01em",
              wordBreak: "break-all"
            }}>{university.id}</span>
          </div>
        </div>
      </motion.div>

      <motion.div className="card" variants={cardVariants}>
        <h3 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0a0a0a", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.4rem", marginBottom: "1.2rem" }}>Issue New Certificate</h3>
        {error && (
          <div className="error-msg" style={{ background: "#fef2f2", border: "2px solid #dc2626", borderLeft: "6px solid #dc2626", color: "#991b1b", padding: "0.85rem 1.1rem", borderRadius: "10px", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.25rem", boxShadow: "0 4px 14px rgba(220,38,38,0.12)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.15rem" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleIssueCertificate}>
          <label>Student Name</label>
          <input value={studentName} onChange={(e) => { setStudentName(e.target.value); if (error) setError(""); }} required />

          <label>Register Number</label>
          <input value={registerNumber} onChange={(e) => { setRegisterNumber(e.target.value); if (error) setError(""); }} required placeholder="e.g. 21CS1042" />

          <label>Student Email</label>
          <input type="email" value={studentEmail} onChange={(e) => { setStudentEmail(e.target.value); if (error) setError(""); }} placeholder="student@example.com" required />

          <label>Department / Course</label>
          <input value={course} onChange={(e) => { setCourse(e.target.value); if (error) setError(""); }} required />
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}><label>CGPA</label><input value={cgpa} onChange={(e) => setCgpa(e.target.value)} required placeholder="8.7" /></div>
            <div style={{ flex: 1 }}><label>Start Year (optional)</label><input type="number" min="1950" max="2100" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="2022" /></div>
            <div style={{ flex: 1 }}><label>Year of Passing</label><input type="number" min="1950" max="2100" value={endYear} onChange={(e) => setEndYear(e.target.value)} required placeholder="2026" /></div>
          </div>
          <label style={{ cursor: "pointer" }} onClick={(e) => { const el = e.currentTarget.nextElementSibling; if (el) { try { el.showPicker(); } catch { el.focus(); } } }}>Issue Date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            onClick={(e) => { try { e.target.showPicker(); } catch {} }}
            onFocus={(e) => { try { e.target.showPicker(); } catch {} }}
            required
            style={{ cursor: "pointer" }}
          />
          <label>Certificate Category</label>
          <select value={certCategory} onChange={(e) => { setCertCategory(e.target.value); setCertDetail(""); }} required id="cert-category-select">
            {CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          {NEEDS_DETAIL.has(certCategory) && (
            <>
              <label>Certificate Detail <span style={{ color: GS.ink }}>*</span></label>
              <input value={certDetail} onChange={(e) => setCertDetail(e.target.value)}
                placeholder={{
                  "Course Completion Certificate": "e.g. Full Stack Web Development",
                  "Internship Completion Certificate": "e.g. Software Development Internship",
                  "Project Completion Certificate": "e.g. Smart Attendance System",
                  "Participation Certificate": "e.g. National Hackathon",
                  "Bonafide Certificate": "e.g. Higher Studies",
                }[certCategory] || "Enter detail"}
                required id="cert-detail-input"
              />
            </>
          )}
          <button className="btn" type="submit" disabled={issuing} style={{ marginTop: "1rem" }}>
            {issuing ? "Issuing..." : "Issue Certificate"}
          </button>
          </form>

        {lastIssued && (
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ marginBottom: "1rem", color: GS.ink, textAlign: "center", fontWeight: 600 }}>✓ Certificate issued successfully!</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.9rem", color: GS.ink }}>Certificate ID: <strong>{lastIssued.certificate_number}</strong></span>
              <button style={copyBtnStyle} onClick={() => handleCopyId(lastIssued.certificate_number)}>
                {copiedId === lastIssued.certificate_number ? "Copied!" : "Copy ID"}
              </button>
            </div>
            {(() => {
              const isVertical = lastIssued.certificate_category === "Degree / Graduation Certificate";
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
                    <CategoryCertificateTemplate certificate={{ ...lastIssued, university_name: university?.name }} qrCodeUrl={`${API_BASE}${lastIssued.qr_code_url}`} />
                  </div>
                </div>
              );
            })()}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="btn" onClick={handleDownloadPdf}>Download Certificate PDF</button>
            </div>
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
              <CategoryCertificateTemplate ref={hiddenCertRef} certificate={{ ...lastIssued, university_name: university?.name }} qrCodeUrl={`${API_BASE}${lastIssued.qr_code_url}`} />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div className="card" variants={cardVariants}>
        <h3 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0a0a0a", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.4rem", marginBottom: "1.2rem" }}>Bulk Issue Certificates</h3>
        <p style={{ color: GS.muted, fontSize: "0.85rem", marginBottom: "1rem", lineHeight: "1.5" }}>
          Upload an Excel file (.xlsx) with mandatory columns: <strong>Name</strong>, <strong>Register Number</strong>, <strong>Student Email</strong>, <strong>Department / Course</strong>, <strong>CGPA</strong>, <strong>Year of Passing</strong>, <strong>Issue Date</strong>, <strong>Certificate Category</strong>, and <strong>Certificate Detail</strong> (if required by category). All fields mandatory in single issuance are also mandatory in bulk issuance.
        </p>
        <input type="file" accept=".xlsx,.xls" onChange={handleBulkFileChange} />
        <div style={{ marginTop: "1rem" }}>
          <button className="btn" onClick={handleBulkIssue} disabled={!bulkFile || bulkProcessing}>
            {bulkProcessing ? "Processing..." : "Issue Certificates from Excel"}
          </button>
        </div>
        {bulkError && (
          <div className="error-msg" style={{ marginTop: "1rem", background: "#fef2f2", border: "2px solid #dc2626", borderLeft: "6px solid #dc2626", color: "#991b1b", padding: "0.85rem 1.1rem", borderRadius: "10px", fontWeight: 600, fontSize: "0.9rem", boxShadow: "0 4px 14px rgba(220,38,38,0.12)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span>⚠️</span>
            <span>{bulkError}</span>
          </div>
        )}
        {bulkResults && (
          <div style={{
            marginTop: "1rem",
            background: bulkResults.failed > 0 ? "#fef2f2" : "#f0fdf4",
            border: bulkResults.failed > 0 ? "2px solid #dc2626" : "2px solid #10b981",
            borderLeft: bulkResults.failed > 0 ? "6px solid #dc2626" : "6px solid #10b981",
            padding: "1.1rem",
            borderRadius: "10px",
            fontSize: "0.88rem",
            boxShadow: bulkResults.failed > 0 ? "0 4px 14px rgba(220,38,38,0.12)" : "0 4px 14px rgba(16,185,129,0.12)",
            color: bulkResults.failed > 0 ? "#991b1b" : "#065f46"
          }}>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>{bulkResults.failed > 0 ? "⚠️ Bulk Upload Summary" : "✓ Bulk Upload Summary"}</span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.4rem 1rem", marginBottom: "0.6rem" }}>
              <div><span>Total Rows:</span> <strong>{bulkResults.total}</strong></div>
              <div><span>Issued:</span> <strong>{bulkResults.succeeded}</strong></div>
              <div><span>Skipped:</span> <strong>{bulkResults.skipped_restricted ?? 0}</strong></div>
              <div><span style={{ color: bulkResults.failed > 0 ? "#dc2626" : "inherit" }}>Failed:</span> <strong style={{ color: bulkResults.failed > 0 ? "#dc2626" : "inherit" }}>{bulkResults.failed}</strong></div>
            </div>
            <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>{bulkResults.message}</p>
            {bulkResults.results?.filter(r => !r.success).map((r, i) => (
              <div key={i} style={{ marginTop: "0.4rem", padding: "0.4rem 0.6rem", background: "#ffffff", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "0.82rem", color: "#991b1b", fontWeight: 600 }}>
                ⚠️ Row {r.row} ({r.register_number}): {r.error}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div className="card" variants={cardVariants}>
        <h3 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0a0a0a", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.4rem", marginBottom: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Issued Certificates</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, background: "#0a0a0a", color: "#ffffff", border: "1px solid #0a0a0a", padding: "0.2rem 0.8rem", borderRadius: "16px", fontFamily: '"Inter", sans-serif' }}>
            Total: <CountUp to={certificates.length} duration={0.6} />
          </span>
        </h3>
        <div className="cert-list">
          {certificates.length === 0 && <p style={{ color: GS.muted }}>No certificates issued yet.</p>}
          {certificates.map((cert, index) => (
            <motion.div
              className="cert-item card-lift"
              key={cert.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03, ease: PREMIUM }}
              style={{ cursor: "pointer", transition: "background 0.15s ease" }}
              onClick={() => setSelectedCert(cert)}
            >
              <div>
                <strong>{cert.student_name}</strong> — {cert.course}
                <div style={{ fontSize: "0.8rem", color: GS.muted, display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginTop: "2px" }}>
                  <span>{cert.certificate_number}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleCopyId(cert.certificate_number); }} style={copyBtnStyle}>
                    {copiedId === cert.certificate_number ? "Copied!" : "Copy"}
                  </button>
                  <span>| Reg: {cert.register_number} | {cert.end_year}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={`status-badge ${cert.status === "VALID" ? "status-valid" : "status-revoked"}`}>{cert.status}</span>
                {cert.status === "VALID" && (
                  <button
                    className="btn-secondary"
                    onClick={(e) => { e.stopPropagation(); setRevokeTarget(cert); setRevokeReason(""); }}
                    style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── VERIFICATION ACTIVITY FEED (Phase 2) ────────────────────────────── */}
      <motion.div className="card" variants={cardVariants}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
              Verification Activity
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: GS.muted }}>
              Real-time feed of verifiers checking your institution's credentials.
            </p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, background: "#0a0a0a", color: "#ffffff", padding: "0.25rem 0.85rem", borderRadius: "16px" }}>
              Verifications This Month: <CountUp to={totalVerificationsMonth} duration={0.8} />
            </span>

            {/* Email Notification Preference Toggle (Phase 2) */}
            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 600, color: GS.ink, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => {
                  setEmailNotify(e.target.checked);
                  setNotifyMsg(e.target.checked ? "✉️ Email notification alerts enabled" : "Disabled notification alerts");
                  setTimeout(() => setNotifyMsg(""), 2500);
                }}
                style={{ cursor: "pointer" }}
              />
              Notify me by email
            </label>
          </div>
        </div>

        {notifyMsg && (
          <div style={{ fontSize: "0.78rem", background: "#f1f5f9", border: "1px solid #0a0a0a", padding: "0.4rem 0.8rem", borderRadius: "6px", marginBottom: "0.85rem", color: GS.ink, fontWeight: 600 }}>
            {notifyMsg}
          </div>
        )}

        <div className="cert-list">
          {verifications.length === 0 ? (
            <p style={{ color: GS.muted, fontSize: "0.88rem" }}>No verifications recorded yet. When employers or verifiers check credentials on the Verifier page, live feedback will appear here.</p>
          ) : (
            verifications.map((v, idx) => (
              <motion.div
                key={v.id || idx}
                className="cert-item card-lift"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.03, ease: PREMIUM }}
                style={{ background: "#ffffff", border: `1.5px solid ${GS.border}`, borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "0.5rem" }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: GS.ink, fontSize: "0.9rem" }}>
                    Certificate <code>{v.certificate_number}</code> ({v.student_name || "Student"}) was verified by <strong>{v.verifier_org || "Anonymous Verifier"}</strong>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: GS.muted, marginTop: "2px" }}>
                    {new Date(v.verified_at).toLocaleString("en-IN", { hour12: false })}
                  </div>
                </div>
                <div>
                  <span className={`status-badge ${v.verification_result === "VALID" ? "status-valid" : "status-revoked"}`}>
                    {v.verification_result}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── CERTIFICATE PREVIEW MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedCert && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.65)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: PREMIUM }}
              style={{
                background: "#ffffff",
                border: "2px solid #0a0a0a",
                borderRadius: "16px",
                maxWidth: "850px",
                width: "100%",
                maxHeight: "92vh",
                overflow: "hidden",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.65rem" }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.15rem", color: "#0a0a0a" }}>
                  Certificate Preview — {selectedCert.certificate_number}
                </h3>
                <button
                  onClick={() => setSelectedCert(null)}
                  style={{ background: "#0a0a0a", color: "#ffffff", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              </div>

              {(() => {
                const isVertical = selectedCert.certificate_category === "Degree / Graduation Certificate";
                return (
                  <div style={{
                    background: "#e2e8f0",
                    padding: "1rem 0.5rem",
                    borderRadius: "12px",
                    marginBottom: "0.75rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    overflow: "hidden",
                    height: isVertical ? "430px" : "330px",
                    boxSizing: "border-box"
                  }}>
                    <div style={{
                      transform: isVertical ? "scale(0.46)" : "scale(0.53)",
                      transformOrigin: "top center",
                      marginBottom: isVertical ? "-470px" : "-270px"
                    }}>
                      <CategoryCertificateTemplate
                        certificate={{
                          ...selectedCert,
                          university_name: university?.name || "Issuing University",
                        }}
                        qrCodeUrl={`${API_BASE}/uploads/qr_${selectedCert.id}.png`}
                      />
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  className="btn"
                  onClick={async () => {
                    await downloadCertificateAsPDF(modalCertRef, `certificate_${selectedCert.certificate_number}`);
                  }}
                >
                  📄 Download Certificate PDF
                </button>
                <button className="btn-secondary" onClick={() => setSelectedCert(null)}>Close</button>
              </div>

              <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <CategoryCertificateTemplate ref={modalCertRef} certificate={{ ...selectedCert, university_name: university?.name }} qrCodeUrl={`${API_BASE}/uploads/qr_${selectedCert.id}.png`} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REVOCATION CONFIRMATION MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {revokeTarget && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
              zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
            }}
            onClick={() => setRevokeTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: PREMIUM }}
              style={{
                background: "#ffffff", border: `2px solid ${GS.border}`, borderRadius: "16px",
                width: "100%", maxWidth: "480px", padding: "1.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 700, color: GS.ink }}>
                🚫 Revoke Certificate
              </h3>
              <p style={{ fontSize: "0.85rem", color: GS.muted, marginBottom: "1rem" }}>
                Revoking <strong>{revokeTarget.student_name}</strong>'s certificate (<code>{revokeTarget.certificate_number}</code>) will cryptographically invalidate it with an RSA-2048 signature anchored to the blockchain ledger.
              </p>
              
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: GS.ink, marginBottom: "0.4rem" }}>
                Reason for Revocation *
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Clerical error during issuance, disciplinary expulsion, or record correction"
                rows={3}
                style={{
                  width: "100%", padding: "0.6rem 0.8rem", border: `1.5px solid ${GS.border}`, borderRadius: "8px",
                  fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", marginBottom: "1.25rem", boxSizing: "border-box"
                }}
              />

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button className="btn-secondary" onClick={() => setRevokeTarget(null)} disabled={revoking}>
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={confirmRevoke}
                  disabled={revoking || !revokeReason.trim()}
                  style={{ background: "#0a0a0a", color: "#ffffff" }}
                >
                  {revoking ? "Revoking..." : "Confirm & Sign Revocation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default UniversityDashboard;

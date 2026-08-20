import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { fetchVerificationAnalytics } from "../../../shared/api/analytics";
import VerificationAnalyticsDecorations from "../components/VerificationAnalyticsDecorations";
import { CountUp, SkeletonCard } from "../../../shared/motion/index";
import useHeaderHeight from "../../../shared/hooks/useHeaderHeight";

const GS = { ink: "#0a0a0a", muted: "#64748b", subtle: "#94a3b8", border: "#0a0a0a", bg: "#ffffff", mid: "#334155" };
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

const customTooltipStyle = {
  background: "#ffffff",
  border: "2px solid #0a0a0a",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  fontSize: "0.82rem",
  color: "#0a0a0a",
  padding: "8px 14px",
  fontWeight: 600,
  fontFamily: '"Inter", sans-serif'
};

function StatBox({ label, value }) {
  const numVal = typeof value === "number" ? value : parseInt(value, 10);
  const isValidNum = !isNaN(numVal);

  return (
    <div className="card-lift" style={{
      background: "#ffffff",
      border: `2px solid ${GS.border}`,
      borderRadius: "12px",
      padding: "1.1rem 1rem",
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: GS.ink, fontFamily: '"Prata", serif', lineHeight: 1.1, marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {isValidNum ? <CountUp to={numVal} duration={0.8} /> : (value ?? 0)}
      </div>
      <div style={{ fontSize: "0.75rem", color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function VerificationAnalytics() {
  useHeaderHeight(".dashboard-header");
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "UNIVERSITY") { navigate("/university-login"); return; }
    loadData();
  }, []); // eslint-disable-line

  async function loadData() {
    setLoading(true); setError("");
    try { const res = await fetchVerificationAnalytics(); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || "Failed to load verification analytics"); }
    finally { setLoading(false); }
  }

  function handleLogout() { localStorage.clear(); navigate("/"); }

  function handleExcel() {
    if (!data) return; setExporting("excel");
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Metric", "Value"], ["Total Verifications", data.summary.total], ["Valid Results", data.summary.valid_count], ["Tampered Results", data.summary.tampered_count], ["Revoked Results", data.summary.revoked_count], [], ["Auth Events", data.authSummary.total], ["Login Success", data.authSummary.login_success], ["Login Failures", data.authSummary.login_failure], ["Registrations", data.authSummary.registrations]]), "Summary");
      if (data.monthly?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.monthly.map(r => ({ Month: r.month, Total: r.total, Valid: r.valid_count, Tampered: r.tampered_count, Revoked: r.revoked_count }))), "Monthly Trend");
      XLSX.writeFile(wb, `verification_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
    } finally { setExporting(""); }
  }

  async function handlePdf() {
    if (!pageRef.current) return; setExporting("pdf");
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 1.5, useCORS: true, backgroundColor: GS.bg });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let y = 0; const pageH = pdf.internal.pageSize.getHeight();
      while (y < pdfH) { if (y > 0) pdf.addPage(); pdf.addImage(imgData, "PNG", 0, -y, pdfW, pdfH); y += pageH; }
      pdf.save(`verification_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(""); }
  }

  function fmt(ts) { if (!ts) return "—"; try { return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return ts; } }
  function formatIp(ip) {
    if (!ip) return "—";
    let cleanIp = String(ip).trim();
    if (cleanIp === "::1" || cleanIp === "::ffff:127.0.0.1") return "127.0.0.1";
    if (cleanIp.startsWith("::ffff:")) return cleanIp.replace("::ffff:", "");
    return cleanIp;
  }
  function parseDetail(raw) { try { return JSON.parse(raw); } catch { return {}; } }

  const genuineRecent = (data?.recent || []).filter(row => {
    if (!row.resource_id || row.resource_id.startsWith("FAKE") || row.resource_id.startsWith("TESTVERIF")) return false;
    const det = parseDetail(row.details);
    const res = (det.result || row.status || "").toUpperCase();
    return res === "VALID" || res === "REVOKED";
  });

  if (loading) return (
    <div className="dashboard">
      <VerificationAnalyticsDecorations />
      <div className="dashboard-header"><h2>Verification Analytics</h2></div>
      <div className="card">
        <SkeletonCard rows={3} heights={["1.5rem", "5rem", "10rem"]} gap="1rem" />
      </div>
    </div>
  );

  return (
    <motion.div
      className="dashboard"
      ref={pageRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ minHeight: "100vh", paddingBottom: "3rem" }}
    >
      <VerificationAnalyticsDecorations />

      <div className="dashboard-header">
        <h2>Verification Analytics</h2>
        <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={handleExcel} disabled={!!exporting} id="vanalytics-excel-btn">{exporting === "excel" ? "Exporting…" : "Export Excel"}</button>
          <button className="btn" onClick={handlePdf} disabled={!!exporting} id="vanalytics-pdf-btn">{exporting === "pdf" ? "Exporting…" : "Export PDF"}</button>
          <button className="btn-secondary" onClick={() => navigate("/university")} id="vanalytics-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="vanalytics-logout-btn">Logout</button>
        </div>
      </div>

      {error && <motion.div className="card" variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}

      {data?.summary && (
        <motion.div className="card" style={{ border: "2px solid #0a0a0a", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
            Verification Overview
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <StatBox label="Total Verifications" value={data.summary.total ?? 0} />
            <StatBox label="Valid Results" value={data.summary.valid_count ?? 0} />
            <StatBox label="Tampered Attempts" value={data.summary.tampered_count ?? 0} />
            <StatBox label="Revoked Certificates" value={data.summary.revoked_count ?? 0} />
          </div>
        </motion.div>
      )}


      {data?.monthly?.length > 0 && (
        <motion.div className="card" style={{ marginTop: "1.5rem", border: "2px solid #0a0a0a", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
            Result Breakdown by Month
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthly} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.ink, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: GS.ink, fontWeight: 600 }} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: "rgba(15, 23, 42, 0.06)" }} />
              <Legend wrapperStyle={{ fontSize: "0.8rem", fontWeight: 600, color: GS.ink }} />
              <Bar dataKey="valid_count" name="Valid" fill="#0a0a0a" maxBarSize={38} radius={[0, 0, 0, 0]} stackId="a" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
              <Bar dataKey="revoked_count" name="Revoked" fill="#64748b" maxBarSize={38} radius={[0, 0, 0, 0]} stackId="a" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
              <Bar dataKey="tampered_count" name="Tampered" fill="#94a3b8" maxBarSize={38} radius={[3, 3, 0, 0]} stackId="a" isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── Top Verified Certificates ──────────────────────────────────── */}
      {data?.topCertificates?.length > 0 && (
        <motion.div className="card" style={{ marginTop: "1.5rem", border: "2px solid #0a0a0a", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
            Most Verified Certificates
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {data.topCertificates.map((cert, i) => {
              const det = parseDetail(cert.details);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", background: i === 0 ? "#0a0a0a" : "#f8fafc", borderRadius: "8px", border: "1.5px solid #cbd5e1" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: i === 0 ? "#ffffff" : GS.muted, minWidth: "28px", textAlign: "center", fontFamily: '"Prata", serif' }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: i === 0 ? "#ffffff" : GS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cert.certificate_number}</div>
                    <div style={{ fontSize: "0.75rem", color: i === 0 ? "#94a3b8" : GS.muted, marginTop: "2px" }}>
                      {det.student_name && `${det.student_name}`}{det.course && ` · ${det.course}`} · Last: {fmt(cert.last_verified)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: i === 0 ? "#ffffff" : GS.ink, fontFamily: '"Prata", serif', lineHeight: 1 }}>{cert.verify_count}</div>
                    <div style={{ fontSize: "0.68rem", color: i === 0 ? "#94a3b8" : GS.subtle, textTransform: "uppercase", letterSpacing: "0.05em" }}>verifications</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}



      {/* ── Activity by Day of Week ────────────────────────────────────── */}
      {data?.byDay && (
        <motion.div className="card" style={{ marginTop: "1.5rem", border: "2px solid #0a0a0a", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
            Verification Activity by Day of Week
          </h3>
          {(() => {
            const maxCount = Math.max(...data.byDay.map(d => d.count), 1);
            return (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: "120px" }}>
                {data.byDay.map(({ day, count }) => (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GS.muted }}>{count > 0 ? count : ""}</div>
                    <div style={{ width: "100%", background: count > 0 ? "#0a0a0a" : "#e2e8f0", borderRadius: "4px 4px 0 0", height: `${Math.max((count / maxCount) * 80, count > 0 ? 6 : 3)}px`, transition: "height 0.5s ease" }} />
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: GS.ink }}>{day}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </motion.div>
      )}



      {/* ── Recent Verification Events ─────────────────────────────────── */}
      {genuineRecent.length > 0 && (
        <motion.div className="card" style={{ marginTop: "1.5rem", border: "2px solid #0a0a0a", borderRadius: "12px" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
            Recent Verification Events
          </h3>
          <div className="cert-list">
            {genuineRecent.map((row, i) => {
              const det = parseDetail(row.details);
              const result = (det.result || row.status || "VALID").toUpperCase();
              return (
                <motion.div
                  key={i}
                  className="card-lift"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.03, ease: PREMIUM }}
                  style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "8px", padding: "0.85rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: GS.ink, fontSize: "0.92rem" }}>{row.resource_id || "—"}</div>
                    <div style={{ fontSize: "0.8rem", color: GS.muted, marginTop: "2px" }}>{det.student_name && `${det.student_name} · `}{det.course && `${det.course} · `}IP: {formatIp(row.ip_address)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.78rem", color: GS.subtle, fontWeight: 500 }}>{fmt(row.timestamp)}</span>
                    <span className={`status-badge ${result === "VALID" ? "status-valid" : "status-revoked"}`}>{result}</span>
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

export default VerificationAnalytics;

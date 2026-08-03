import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { fetchStudentAnalytics } from "../api/analytics";
import StudentAnalyticsDecorations from "../components/decorations/StudentAnalyticsDecorations";
import { CountUp, SkeletonCard, SkeletonStat } from "../components/motion";
import useHeaderHeight from "../hooks/useHeaderHeight";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff", mid: "#8c8c8c" };
const PREMIUM = [0.16, 1, 0.3, 1];
const tooltipStyle = { background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: "0", fontSize: "0.8rem", color: GS.ink };

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

function StatBox({ label, value }) {
  const numericVal = typeof value === "number" ? value : parseInt(value, 10);
  const isValidNum = !isNaN(numericVal);

  return (
    <div className="card-lift" style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: "1rem", textAlign: "center" }}>
      <div style={{ fontSize: "1.6rem", fontWeight: 400, color: GS.ink, fontFamily: "'Prata', serif", lineHeight: 1, marginBottom: "4px" }}>
        {isValidNum ? <CountUp to={numericVal} duration={0.8} /> : (value ?? "—")}
      </div>
      <div style={{ fontSize: "0.78rem", color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}

function StudentAnalytics() {
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
    if (!token || user.role !== "STUDENT") { navigate("/student-login"); return; }
    loadData();
  }, []); // eslint-disable-line

  async function loadData() {
    setLoading(true); setError("");
    try { const res = await fetchStudentAnalytics(); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || "Failed to load analytics"); }
    finally { setLoading(false); }
  }

  function handleLogout() { localStorage.clear(); navigate("/"); }

  function handleExcel() {
    if (!data) return; setExporting("excel");
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Metric", "Value"], ["Total Certificates", data.summary.total], ["Valid", data.summary.valid_count], ["Revoked", data.summary.revoked_count], ["Universities", data.summary.universities], [], ["Wallet Downloads", data.walletStats.downloads], ["Wallet Shares", data.walletStats.shares], ["Wallet Verifications", data.walletStats.verifications]]), "Summary");
      if (data.certificates?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.certificates.map(c => ({ "Certificate No": c.certificate_number, Student: c.student_name, Course: c.course, University: c.university_name, Status: c.status, "Issue Date": c.issue_date, "Issued At": c.created_at }))), "Certificates");
      XLSX.writeFile(wb, `student_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
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
      pdf.save(`student_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(""); }
  }

  function fmt(d) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; } }

  if (loading) return (
    <div className="dashboard">
      <div className="dashboard-header"><h2>My Analytics</h2></div>
      <div className="card" style={{ maxWidth: "900px" }}>
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
    >
      <StudentAnalyticsDecorations />
      <div className="dashboard-header">
        <h2>My Analytics</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={handleExcel} disabled={!!exporting} id="sanalytics-excel-btn">{exporting === "excel" ? "Exporting…" : "Export Excel"}</button>
          <button className="btn" onClick={handlePdf} disabled={!!exporting} id="sanalytics-pdf-btn">{exporting === "pdf" ? "Exporting…" : "Export PDF"}</button>
          <button className="btn-secondary" onClick={() => navigate("/student")} id="sanalytics-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="sanalytics-logout-btn">Logout</button>
        </div>
      </div>
      {error && <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}
      {data?.summary && (
        <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}>
          <h3>Certificate Overview</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
            <StatBox label="Total Certificates" value={data.summary.total} />
            <StatBox label="Valid" value={data.summary.valid_count} />
            <StatBox label="Revoked" value={data.summary.revoked_count} />
            <StatBox label="Universities" value={data.summary.universities} />
          </div>
        </motion.div>
      )}
      {data?.walletStats && (
        <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}>
          <h3>Wallet Activity</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
            <StatBox label="Downloads" value={data.walletStats.downloads} />
            <StatBox label="Shares" value={data.walletStats.shares} />
            <StatBox label="Verifications" value={data.walletStats.verifications} />
          </div>
        </motion.div>
      )}
      {data?.timeline?.length > 0 && (
        <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}>
          <h3>Certificate Receipt Timeline</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.timeline} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: GS.muted }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="count"
                name="Certificates"
                fill="#0a0a0a"
                maxBarSize={38}
                radius={[3, 3, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
      {data?.certificates?.length > 0 && (
        <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}>
          <h3>
            All Certificates (<CountUp to={data.certificates.length} duration={0.6} />)
          </h3>
          <div className="cert-list">
            {data.certificates.map((cert, idx) => (
              <motion.div
                key={cert.id}
                className="card-lift"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03, ease: PREMIUM }}
                style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: GS.ink, fontSize: "0.9rem" }}>{cert.course}</div>
                  <div style={{ fontSize: "0.8rem", color: GS.muted }}>{cert.university_name} · {cert.certificate_number}</div>
                  <div style={{ fontSize: "0.78rem", color: GS.subtle, marginTop: "2px" }}>Issued: {fmt(cert.issue_date)}</div>
                </div>
                <span className={`status-badge ${cert.status === "VALID" ? "status-valid" : "status-revoked"}`}>{cert.status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {data?.certificates?.length === 0 && (
        <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}>
          <p style={{ color: GS.muted }}>No certificates found for your account.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default StudentAnalytics;

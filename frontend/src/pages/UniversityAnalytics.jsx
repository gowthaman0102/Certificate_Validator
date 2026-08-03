import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { fetchUniversityAnalytics } from "../api/analytics";
import UniversityAnalyticsDecorations from "../components/decorations/UniversityAnalyticsDecorations";
import { CountUp, SkeletonCard } from "../components/motion";
import useHeaderHeight from "../hooks/useHeaderHeight";

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

const MONOCHROME_COLORS = ["#0a0a0a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#0f172a"];





function normalizeDepartmentName(dept) {
  if (!dept) return "General / Unspecified";
  const clean = dept.trim();
  const lower = clean.toLowerCase();
  if (lower === "it" || lower === "information technology" || lower === "infotech") return "Information Technology";
  if (lower === "cs" || lower === "computer science" || lower === "cse" || lower === "computer science & engineering") return "Computer Science & Engg";
  if (lower === "mech" || lower === "mechanical" || lower === "me" || lower === "mechanical engineering") return "Mechanical Engineering";
  if (lower === "ece" || lower === "electronics" || lower === "electronics & communication" || lower === "electronics engineering") return "Electronics & Comm";
  if (lower === "civil" || lower === "ce" || lower === "civil engineering") return "Civil Engineering";
  if (lower === "ee" || lower === "electrical" || lower === "electrical engineering") return "Electrical Engineering";
  if (lower === "sdf" || lower === "rsg") return clean.toUpperCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function StatCard({ label, value, subtext, icon }) {
  const valStr = String(value ?? "");
  const numVal = typeof value === "number" ? value : parseInt(value, 10);
  const isValidNum = !isNaN(numVal);
  const fontSize = valStr.length > 14 ? "1.05rem" : (valStr.length > 9 ? "1.22rem" : "1.8rem");

  return (
    <div className="card-lift" style={{
      background: "#ffffff",
      border: `2px solid ${GS.border}`,
      borderRadius: "12px",
      padding: "1.1rem 1.2rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      overflow: "hidden",
      boxSizing: "border-box"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
      </div>
      <div style={{
        fontSize,
        fontWeight: 700,
        color: GS.ink,
        fontFamily: '"Prata", serif',
        lineHeight: 1.2,
        marginBottom: "6px",
        wordBreak: "break-word",
        overflowWrap: "break-word"
      }}>
        {isValidNum ? <CountUp to={numVal} duration={0.8} /> : (value ?? "—")}
      </div>
      {subtext && <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{subtext}</div>}
    </div>
  );
}

function UniversityAnalytics() {
  useHeaderHeight(".dashboard-header");
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const donutCardRef = useRef(null);
  const isDonutInView = useInView(donutCardRef, { once: false, amount: 0.25 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "UNIVERSITY") {
      navigate("/university-login");
      return;
    }
    loadData();
  }, []); // eslint-disable-line

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchUniversityAnalytics({ date_from: dateFrom, date_to: dateTo });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  const normalizedDepartments = useMemo(() => {
    if (!data?.departments) return [];
    const grouped = {};
    data.departments.forEach((item) => {
      const name = normalizeDepartmentName(item.course);
      grouped[name] = (grouped[name] || 0) + item.count;
    });
    return Object.keys(grouped)
      .map((course) => ({ course, count: grouped[course] }))
      .sort((a, b) => b.count - a.count);
  }, [data?.departments]);

  const renderAnimatedPieLabel = useCallback((props) => {
    const { cx, cy, midAngle, outerRadius, percent, name, index } = props;
    const RADIAN = Math.PI / 180;
    
    const cosVal = Math.cos(-midAngle * RADIAN);
    const sinVal = Math.sin(-midAngle * RADIAN);

    const isRSG = (name || "").toUpperCase().includes("RSG");
    const isRightSide = isRSG || cosVal >= -0.1;
    
    const isSmall = percent < 0.08;
    const isTop = sinVal < -0.3;

    let extraRadius = 0;
    let yOffset = 0;

    if (isSmall) {
      extraRadius = isRSG ? 26 : (index % 2 === 0 ? 10 : 22);
      if (isTop) {
        yOffset = isRSG ? -18 : (index % 2 === 0 ? -10 : -18);
      }
    }

    const lineStartRadius = outerRadius + 4;
    const lineEndRadius = outerRadius + 16 + extraRadius;

    const sx = cx + lineStartRadius * cosVal;
    const sy = cy + lineStartRadius * sinVal;
    const ex = cx + lineEndRadius * cosVal;
    const ey = cy + lineEndRadius * sinVal + yOffset;

    const elbowX = ex + (isRightSide ? 16 : -16);
    const textX = elbowX + (isRightSide ? 6 : -6);
    const textAnchor = isRightSide ? "start" : "end";
    const pctStr = `${(percent * 100).toFixed(0)}%`;

    let cumulativeCount = 0;
    for (let i = 0; i <= index; i++) {
      cumulativeCount += (normalizedDepartments[i]?.count || 0);
    }
    const totalCount = normalizedDepartments.reduce((acc, d) => acc + (d.count || 0), 0) || 1;
    const cumulativeRatio = cumulativeCount / totalCount;
    const sliceFinishDelaySec = (0.08 + cumulativeRatio * 1.05).toFixed(2);

    return (
      <g
        className="pie-label-animated"
        style={{
          opacity: 0,
          animation: `fadeInPieLabel 0.1s ease-out ${sliceFinishDelaySec}s forwards`,
        }}
      >
        <path
          d={`M${sx},${sy} L${ex},${ey} L${elbowX},${ey}`}
          stroke="#0a0a0a"
          strokeWidth={1.5}
          fill="none"
        />
        <text
          x={textX}
          y={ey}
          fill="#0a0a0a"
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {`${name} (${pctStr})`}
        </text>
      </g>
    );
  }, [normalizedDepartments]);

  function applyPreset(months) {
    const d = new Date();
    if (months === 0) {
      setDateFrom("2020-01-01");
    } else {
      d.setMonth(d.getMonth() - months);
      setDateFrom(d.toISOString().slice(0, 10));
    }
    setDateTo(new Date().toISOString().slice(0, 10));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  function handleExcelExport() {
    if (!data) return;
    setExporting("excel");
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["University", data.university?.name],
        ["Issuer Code", data.university?.issuer_code],
        [],
        ["Metric", "Value"],
        ["Total Certificates", data.summary.total],
        ["Active Certificates", data.summary.active],
        ["Revoked Certificates", data.summary.revoked],
        ["Unique Students", data.summary.students],
        ["Departments", normalizedDepartments.length]
      ]), "Summary");
      if (data.monthly?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.monthly.map(r => ({ Month: r.month, "Certificates Issued": r.count }))), "Monthly Issuance");
      if (normalizedDepartments.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(normalizedDepartments.map(r => ({ Department: r.course, Count: r.count }))), "Departments");
      if (data.recent?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.recent.map(r => ({ "Certificate No": r.certificate_number, Student: r.student_name, Course: r.course, Status: r.status, "Issued At": r.created_at }))), "Recent Certificates");
      XLSX.writeFile(wb, `university_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
    } finally {
      setExporting("");
    }
  }

  async function handlePdfExport() {
    if (!pageRef.current) return;
    setExporting("pdf");
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 1.5, useCORS: true, backgroundColor: GS.bg });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let y = 0;
      const pageH = pdf.internal.pageSize.getHeight();
      while (y < pdfH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pdfW, pdfH);
        y += pageH;
      }
      pdf.save(`university_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally {
      setExporting("");
    }
  }

  function fmt(ts) {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return ts;
    }
  }

  if (loading) return (
    <div className="dashboard" id="univ-analytics-container">
      <UniversityAnalyticsDecorations />
      <div className="dashboard-header"><h2>University Analytics</h2></div>
      <div className="card" style={{ maxWidth: "900px" }}>
        <SkeletonCard rows={3} heights={["1.5rem", "5rem", "10rem"]} gap="1rem" />
      </div>
    </div>
  );

  const activePercent = data?.summary?.total ? Math.round((data.summary.active / data.summary.total) * 100) : 100;
  const topDepartmentName = normalizedDepartments[0]?.course || "N/A";

  return (
    <motion.div
      className="dashboard"
      ref={pageRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ minHeight: "100vh", paddingBottom: "3rem" }}
    >
      <UniversityAnalyticsDecorations />

      <div className="dashboard-header">
        <div>
          <h2>University Analytics</h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: GS.muted }}>
            {data?.university?.name} <span style={{ opacity: 0.8 }}>({data?.university?.issuer_code})</span>
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={handleExcelExport} disabled={!!exporting} id="analytics-excel-btn">
            {exporting === "excel" ? "Exporting…" : "Export Excel"}
          </button>
          <button className="btn" onClick={handlePdfExport} disabled={!!exporting} id="analytics-pdf-btn">
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </button>
          <button className="btn-secondary" onClick={() => navigate("/university")} id="analytics-back-btn">
            ← Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout} id="analytics-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {error && <motion.div className="card" style={{ maxWidth: "900px" }} variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}

      {data?.summary && (
        <motion.div
          variants={cardVariants}
          style={{ maxWidth: "900px", margin: "0 auto 1.5rem auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}
        >
          <StatCard label="Total Issued" value={data.summary.total} subtext="Lifetime credentials" />
          <StatCard label="Active Credentials" value={data.summary.active} subtext={`${activePercent}% operational integrity`} />
          <StatCard label="Revoked Credentials" value={data.summary.revoked} subtext="Flagged / cancelled" />
          <StatCard label="Top Department" value={topDepartmentName} subtext={`${normalizedDepartments[0]?.count || 0} certificates`} />
        </motion.div>
      )}

      {/* ── Monthly Certificate Issuance (Bar Chart Card) ── */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6, ease: PREMIUM }}
        style={{ maxWidth: "900px", border: "2px solid #0a0a0a", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.75rem" }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
            Monthly Certificate Issuance
          </h3>

          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: GS.muted, marginRight: "4px" }}>Preset:</span>
            <button className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={() => applyPreset(1)}>1M</button>
            <button className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={() => applyPreset(6)}>6M</button>
            <button className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={() => applyPreset(12)}>1Y</button>
            <button className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={() => applyPreset(0)}>All</button>
          </div>
        </div>

        {data?.monthly?.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthly} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.ink, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: GS.ink, fontWeight: 600 }} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: "rgba(15, 23, 42, 0.06)" }} />
              <Bar
                dataKey="count"
                name="Certificates Issued"
                fill="#0a0a0a"
                maxBarSize={42}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationBegin={150}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: GS.muted, padding: "2rem 0", textAlign: "center" }}>No issuance records found for the selected date range.</p>
        )}
      </motion.div>

      {/* ── Top Departments & Programs (Donut Chart Card) ── */}
      {normalizedDepartments.length > 0 && (
        <motion.div
          ref={donutCardRef}
          className="card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: PREMIUM }}
          style={{ maxWidth: "900px", border: "2px solid #0a0a0a", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginTop: "1.5rem" }}
        >
          <style>{`
            @keyframes fadeInPieLabel {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{ marginBottom: "1.25rem", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.75rem" }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: GS.ink }}>
              Top Departments & Programs
            </h3>
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "440px", width: "100%" }}>
            <ResponsiveContainer width="100%" height={440}>
              <PieChart key={isDonutInView ? "donut-active" : "donut-idle"}>
                <Pie
                  data={normalizedDepartments}
                  dataKey="count"
                  nameKey="course"
                  cx="50%"
                  cy="54%"
                  innerRadius={68}
                  outerRadius={110}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={4}
                  label={renderAnimatedPieLabel}
                  labelLine={false}
                  isAnimationActive={true}
                  animationBegin={100}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {normalizedDepartments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {data?.recent?.length > 0 && (
        <motion.div className="card" style={{ maxWidth: "900px", marginTop: "1.5rem", border: "2px solid #0a0a0a", borderRadius: "12px" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700 }}>
            Recent Issued Certificates
          </h3>
          <div className="cert-list">
            {data.recent.map((cert, idx) => (
              <motion.div
                key={cert.id}
                className="card-lift"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03, ease: PREMIUM }}
                style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "8px", padding: "0.85rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: GS.ink, fontSize: "0.92rem" }}>{cert.student_name}</div>
                  <div style={{ fontSize: "0.8rem", color: GS.muted, marginTop: "2px" }}>{cert.course} · <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{cert.certificate_number}</span></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.78rem", color: GS.subtle, fontWeight: 500 }}>{fmt(cert.created_at)}</span>
                  <span className={`status-badge ${cert.status === "VALID" ? "status-valid" : "status-revoked"}`}>{cert.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {data?.revocations?.length > 0 && (
        <motion.div className="card" style={{ maxWidth: "900px", marginTop: "1.5rem", border: "2px solid #0a0a0a", borderRadius: "12px" }} variants={cardVariants}>
          <h3 style={{ borderBottom: "2px solid #0a0a0a", paddingBottom: "0.6rem", marginBottom: "1rem", fontWeight: 700, color: "#dc2626" }}>
            Revocation Records
          </h3>
          <div className="cert-list">
            {data.revocations.map((r, i) => (
              <motion.div
                key={i}
                className="card-lift"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03, ease: PREMIUM }}
                style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: "8px", padding: "0.85rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.92rem" }}>{r.student_name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#7f1d1d", marginTop: "2px" }}>{r.course} · <span style={{ fontFamily: "monospace" }}>{r.certificate_number}</span></div>
                  <div style={{ fontSize: "0.78rem", color: "#991b1b", marginTop: "4px", fontWeight: 600 }}>Reason: {r.reason}</div>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#7f1d1d", fontWeight: 500 }}>{fmt(r.revoked_at)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default UniversityAnalytics;

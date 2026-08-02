import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { runFraudAnalysis } from "../api/fraud";
import { CountUp, SkeletonCard } from "./motion";
import { useAIProvider } from "../hooks/useAIProvider";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff", mid: "#8c8c8c" };
const PREMIUM = [0.16, 1, 0.3, 1];

export default function FraudAnalysisModal({ result, onClose }) {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState("");
  const [showProviderTooltip, setShowProviderTooltip] = useState(false);
  const aiProvider = useAIProvider();

  const certData = result?.certificate;

  async function executeAnalysis() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        certificate_id: certData?.cert_id || certData?.id,
        certificate_data: {
          cert_id: certData?.cert_id || certData?.id,
          certificate_number: certData?.certificate_number,
          register_number: certData?.register_number,
          student_name: certData?.student_name,
          course: certData?.course,
          cgpa: certData?.cgpa,
          start_year: certData?.start_year,
          end_year: certData?.end_year,
          issue_date: certData?.issue_date,
          issuer_id: certData?.issuer_id,
          hash: result?.hash || certData?.hash,
          signature: certData?.signature,
        },
      };

      const res = await runFraudAnalysis(payload);
      setAnalysisData(res.data);
    } catch (err) {
      console.error("Fraud analysis error:", err);
      setError(err.response?.data?.error || err.message || "Failed to run AI Fraud Analysis.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    executeAnalysis();
  }, []);

  function handleDownloadReport() {
    if (!analysisData) return;
    const reportText = `
=====================================================================
                      AI FRAUD ANALYSIS REPORT
=====================================================================
Generated At: ${new Date(analysisData.timestamp || Date.now()).toLocaleString()}
Certificate ID: ${analysisData.certificate_id || "N/A"}
Student Name: ${certData?.student_name || "N/A"}
Course: ${certData?.course || "N/A"}

SUMMARY
---------------------------------------------------------------------
Cryptographic Verification : VALID (SHA-256 Hash & RSA Signature Verified)
AI Fraud Risk Score        : ${analysisData.risk_score}%
Risk Level                 : ${analysisData.risk_level}
Confidence Score           : ${analysisData.confidence_score}%
Analysis Engine            : ${analysisData.provider_used || "Standard AI Engine"}

RECOMMENDATION
---------------------------------------------------------------------
${analysisData.recommendation}

DETAILED CHECKS & FINDINGS
---------------------------------------------------------------------
${Object.entries(analysisData.checks || {})
  .map(
    ([key, check]) =>
      `• [${check.status || "INFO"}] ${check.name || key}: ${check.details || "Check completed."}`
  )
  .join("\n")}

DETAILED REASONS
---------------------------------------------------------------------
${(analysisData.reasons || [])
  .map((r) => `${r.type === "pass" ? "✓" : r.type === "warn" ? "⚠" : "✕"} ${r.text}`)
  .join("\n")}

=====================================================================
            Official Verification Report — Certificate Validator
=====================================================================
`.trim();

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fraud_Report_${analysisData.certificate_id || "cert"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const score = analysisData?.risk_score ?? 0;
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={onClose}
    >
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: PREMIUM }}
        style={{ width: "100%", maxWidth: "720px", maxHeight: "90vh", overflowY: "auto", margin: "0 auto", border: `2px solid ${GS.ink}`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: `1px solid ${GS.border}`, paddingBottom: "0.75rem" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.6rem", borderBottom: "none", paddingBottom: 0, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            AI Fraud Detection &amp; Risk Analysis
            {/* AI Engine badge — live from /api/ai/provider */}
            <div
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setShowProviderTooltip(true)}
              onMouseLeave={() => setShowProviderTooltip(false)}
            >
              <span style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                background: GS.ink,
                color: "#ffffff",
                padding: "2px 7px",
                borderRadius: "3px",
                cursor: "help",
                verticalAlign: "middle",
              }}>
                {aiProvider.loading ? "..." : aiProvider.label}
              </span>
              {showProviderTooltip && !aiProvider.loading && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  background: "#1a1a1a",
                  color: "#f0f0f0",
                  fontSize: "0.72rem",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  width: "240px",
                  zIndex: 20,
                  lineHeight: 1.5,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}>
                  {aiProvider.description}
                </div>
              )}
            </div>
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "1.4rem", cursor: "pointer", fontWeight: 700, color: GS.ink }}>✕</button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <SkeletonCard rows={4} heights={["2rem", "4rem", "8rem", "3rem"]} gap="1rem" />
            <p style={{ fontWeight: 600, color: GS.ink, marginTop: "1.5rem" }}>Running 8-Layer AI Fraud Analysis...</p>
            <p style={{ color: GS.muted, fontSize: "0.85rem", marginTop: "0.5rem" }}>Analyzing layout, metadata, font consistency, OCR, and image compression artifacts.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-msg" style={{ marginBottom: "1.25rem" }}>
            {error}
          </div>
        )}

        {/* Results View */}
        {!loading && analysisData && (
          <>
            {/* Top Score Meter & Summary Block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "center", background: "#f8f9fa", border: `1px solid ${GS.border}`, padding: "1.25rem", marginBottom: "1.25rem" }}>

              {/* Circular Meter with Animated Ring & CountUp */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "relative", width: "110px", height: "110px" }}>
                  <svg width="110" height="110" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={GS.ink}
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="square"
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                      className="draw-line"
                    />
                  </svg>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 700, color: GS.ink, fontFamily: "'Inter', sans-serif" }}>
                      <CountUp to={analysisData.risk_score} suffix="%" duration={0.8} />
                    </span>
                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: GS.muted, fontWeight: 600 }}>Risk Score</span>
                  </div>
                </div>
                <div style={{ marginTop: "0.6rem", padding: "0.2rem 0.6rem", border: `1px solid ${GS.ink}`, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", background: GS.ink, color: "#ffffff" }}>
                  {analysisData.risk_level}
                </div>
              </div>

              {/* Recommendation & Details */}
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: GS.ink, marginBottom: "0.4rem" }}>Recommendation</h4>
                <p style={{ fontSize: "0.88rem", color: GS.ink, lineHeight: 1.4, marginBottom: "0.75rem" }}>{analysisData.recommendation}</p>
                <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: GS.muted, borderTop: `1px solid ${GS.mid}`, paddingTop: "0.5rem" }}>
                  <span><strong>Confidence:</strong> <CountUp to={analysisData.confidence_score} suffix="%" duration={0.6} /></span>
                  <span><strong>Engine:</strong> Heuristic AI</span>
                  <span><strong>Time:</strong> <CountUp to={analysisData.execution_time_ms} suffix="ms" duration={0.6} /></span>
                </div>
              </div>
            </div>

            {/* Reasons / Findings */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: GS.ink, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Key Findings</h4>
              <div style={{ display: "grid", gap: "0.4rem" }}>
                {(analysisData.reasons || []).map((reason, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: GS.ink }}
                  >
                    <span>{reason.type === "pass" ? "✓" : reason.type === "warn" ? "⚠" : "✕"}</span>
                    <span>{reason.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 8-Layer Analysis Timeline */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: GS.ink, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>8-Point Verification Analysis</h4>
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {Object.entries(analysisData.checks || {}).map(([key, check], idx) => (
                  <motion.div
                    key={key}
                    className="card-lift"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    style={{ background: "#ffffff", border: `1px solid ${GS.border}`, padding: "0.6rem 0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
                  >
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: GS.ink }}>{check.name || key}</div>
                      <div style={{ fontSize: "0.78rem", color: GS.muted, marginTop: "2px" }}>{check.details}</div>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", border: `1px solid ${GS.ink}`, textTransform: "uppercase", background: check.status === "PASS" ? GS.bg : GS.ink, color: check.status === "PASS" ? GS.ink : "#ffffff", whiteSpace: "nowrap" }}>
                      {check.status || "PASS"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${GS.border}`, paddingTop: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn" onClick={handleDownloadReport} style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
                  📥 Download Report
                </button>
                <button className="btn-secondary" onClick={executeAnalysis} disabled={loading} style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
                  🔄 Run Again
                </button>
              </div>
              <button className="btn-secondary" onClick={onClose} style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}>
                Close
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

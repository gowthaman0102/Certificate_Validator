import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { getPublicKey } from "../../api/client";
import { getCachedPublicKey, setCachedPublicKey } from "../../utils/keyCache";
import { verifyOffline } from "../../utils/offlineCrypto";
import { downloadCertificateAsPDF } from "../../utils/certificatePdf";
import CertificateTemplate from "../CertificateTemplate";
import { getHistory } from "../../utils/walletStore";
import { createDisclosure } from "../../api/disclosure";

const API_BASE = "http://localhost:5000";
const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff", mid: "#8c8c8c" };

function WalletCertCard({ cert, onCopyLink, onDownload, onShare }) {
  const [sigStatus, setSigStatus]   = useState("checking");
  const [copiedId,  setCopiedId]    = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDisclosureModal, setShowDisclosureModal] = useState(false);
  const [claimType, setClaimType]                     = useState("cgpa_gte");
  const [claimVal, setClaimVal]                       = useState("3.5");
  const [generating, setGenerating]                   = useState(false);
  const [discResult, setDiscResult]                   = useState(null);
  const [discError, setDiscError]                     = useState("");
  const [copiedDiscLink, setCopiedDiscLink]           = useState(false);

  function openDisclosureModal() {
    setShowDisclosureModal(true);
    setDiscResult(null);
    setDiscError("");
    setClaimType("cgpa_gte");
    setClaimVal(cert.cgpa ? String(cert.cgpa) : "3.5");
  }

  function handleClaimTypeChange(newType) {
    setClaimType(newType);
    setDiscResult(null);
    setDiscError("");
    if (newType === "cgpa_gte") {
      setClaimVal(cert.cgpa ? String(cert.cgpa) : "3.5");
    } else if (newType === "graduated_by") {
      setClaimVal(cert.end_year ? String(cert.end_year) : "2026");
    } else if (newType === "course_match") {
      setClaimVal(cert.course ? String(cert.course) : "Computer Science");
    } else if (newType === "status_valid") {
      setClaimVal("VALID");
    }
  }

  async function handleGenerateDisclosure() {
    setGenerating(true);
    setDiscError("");
    setDiscResult(null);
    try {
      const res = await createDisclosure(cert.id, { claim_type: claimType, claim_value: claimVal });
      setDiscResult(res.data);
    } catch (err) {
      setDiscError(err.response?.data?.error || err.message || "Failed to generate disclosure claim");
    } finally {
      setGenerating(false);
    }
  }
  const hiddenRef                   = useRef(null);
  const cardRef                     = useRef(null);

  // 3D Perspective Tilt State capped at 2.5 deg
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => { checkSignature(); }, [cert.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkSignature() {
    if (cert.status === "REVOKED") { setSigStatus("revoked"); return; }
    try {
      const qrPayload = typeof cert.qr_data === "string" ? JSON.parse(cert.qr_data) : cert.qr_data;
      const issuerId  = qrPayload?.issuer_id;
      if (!issuerId) { setSigStatus("failed"); return; }
      let pem;
      const cached = getCachedPublicKey(issuerId);
      if (cached) { pem = cached.public_key; }
      else { const res = await getPublicKey(issuerId); pem = res.data.public_key; setCachedPublicKey(issuerId, res.data.name, pem); }
      const result = await verifyOffline(qrPayload, pem);
      setSigStatus(result.result === "VALID" ? "verified" : "failed");
    } catch { setSigStatus("failed"); }
  }

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Map offset to max +- 2.5 degrees
    const rotateX = (-y / (rect.height / 2)) * 2.5;
    const rotateY = (x / (rect.width / 2)) * 2.5;
    setTilt({ rotateX, rotateY });
  }

  function handleMouseLeave() {
    setTilt({ rotateX: 0, rotateY: 0 });
  }

  async function handleDownloadPdf() {
    await downloadCertificateAsPDF(hiddenRef, `certificate_${cert.certificate_number}`);
    if (onDownload) onDownload(cert);
  }

  async function handleCopyId() {
    try { await navigator.clipboard.writeText(cert.certificate_number); setCopiedId(true); setTimeout(() => setCopiedId(false), 1500); }
    catch { alert("Certificate ID: " + cert.certificate_number); }
  }

  function fmt(d) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; } }

  const sigMap = {
    checking: { cls: "wallet-sig-checking", text: "Verifying signature…" },
    verified: { cls: "wallet-sig-verified", text: "✓ Signature Verified" },
    failed:   { cls: "wallet-sig-failed",   text: "✕ Signature Invalid" },
    revoked:  { cls: "wallet-sig-failed",   text: "✕ Certificate Revoked" },
  };
  const sig = sigMap[sigStatus];
  const qrUrl = `${API_BASE}/uploads/qr_${cert.id}.png`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        perspective: "600px",
        transformStyle: "preserve-3d",
        background: GS.bg,
        border: `1px solid ${GS.border}`,
        padding: "1.25rem",
        marginBottom: "0.75rem",
        borderRadius: "12px",
      }}
      className="card-lift"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontSize: "1.05rem", fontWeight: 600, color: GS.ink }}>{cert.student_name}</div>
          <div style={{ fontSize: "0.82rem", color: GS.muted, marginTop: "2px" }}>{cert.university_name || "—"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className={`wallet-sig-badge ${sig.cls}`}>{sig.text}</span>
          <span className={`status-badge ${cert.status === "VALID" ? "status-valid" : "status-revoked"}`}>{cert.status}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem 1.5rem", background: GS.bg, border: `1px solid ${GS.border}`, padding: "1rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
        <div><span style={{ color: GS.muted }}>Course</span><br /><strong style={{ color: GS.ink }}>{cert.course}</strong></div>
        <div><span style={{ color: GS.muted }}>Duration</span><br /><strong style={{ color: GS.ink }}>{cert.start_year ? `${cert.start_year} – ` : ""}{cert.end_year}</strong></div>
        <div>
          <span style={{ color: GS.muted }}>Certificate ID</span><br />
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <strong style={{ color: GS.ink }}>{cert.certificate_number}</strong>
            <button className={`wallet-copy-btn${copiedId ? " copied" : ""}`} onClick={handleCopyId}>{copiedId ? "Copied!" : "Copy"}</button>
          </div>
        </div>
        <div><span style={{ color: GS.muted }}>Issue Date</span><br /><strong style={{ color: GS.ink }}>{fmt(cert.issue_date)}</strong></div>
        <div><span style={{ color: GS.muted }}>Register No.</span><br /><strong style={{ color: GS.ink }}>{cert.register_number}</strong></div>
        {cert.cgpa && <div><span style={{ color: GS.muted }}>CGPA</span><br /><strong style={{ color: GS.ink }}>{cert.cgpa}</strong></div>}
        <div><span style={{ color: GS.muted }}>Student Email</span><br /><strong style={{ color: GS.ink }}>{cert.student_email || "—"}</strong></div>
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
              <CertificateTemplate certificate={cert} qrCodeUrl={qrUrl} />
            </div>
          </div>
        );
      })()}

      <div style={{ textAlign: "center", marginTop: "1rem", display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={handleDownloadPdf}>Download Certificate PDF</button>
        <button className="btn-secondary" onClick={openDisclosureModal} style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}>
          🔒 Share Verified Claim (Selective Disclosure)
        </button>
        {cert.file_path && (
          <a href={`${API_BASE}${cert.file_path}`} target="_blank" rel="noreferrer"
            style={{ color: GS.ink, fontSize: "0.85rem", fontWeight: 500, textDecoration: "underline", display: "flex", alignItems: "center" }}>
            View Original PDF
          </a>
        )}
      </div>

      {/* ── SELECTIVE DISCLOSURE MODAL ─────────────────────────────── */}
      {showDisclosureModal && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }} onClick={() => setShowDisclosureModal(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", margin: "auto", background: "#ffffff", border: "2.5px solid #0a0a0a", borderRadius: "24px", padding: "1.75rem", position: "relative", color: "#0a0a0a", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.75rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🔒</span> Share Verified Claim (Selective Disclosure)
              </h3>
              <button onClick={() => setShowDisclosureModal(false)} style={{ background: "transparent", border: "none", fontSize: "1.4rem", cursor: "pointer", fontWeight: 700 }}>✕</button>
            </div>

            <p style={{ fontSize: "0.86rem", color: GS.muted, marginBottom: "1.25rem", lineHeight: 1.5 }}>
              Generate an <strong>RSA-2048 signed proof</strong> of a single claim (e.g. <em>CGPA ≥ 3.5</em>). The recipient receives a cryptographic verification link proving the claim is authentic without exposing your full transcript, student name, or grade details.
            </p>

            <div style={{ background: "#f8fafc", border: "1.5px solid #0a0a0a", padding: "1.1rem", borderRadius: "14px", marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>Select Predicate to Prove:</label>
              <select value={claimType} onChange={(e) => handleClaimTypeChange(e.target.value)} style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "12px", border: "1.5px solid #0a0a0a", fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", marginBottom: "0.75rem" }}>
                <option value="cgpa_gte">Academic Honor: CGPA ≥ Threshold</option>
                <option value="graduated_by">Timeline: Degree Conferred by Year</option>
                <option value="course_match">Degree Field: Course Matches Subject</option>
                <option value="status_valid">Credential Status: Active (Not Revoked)</option>
              </select>

              {claimType === "cgpa_gte" && (
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>CGPA Threshold:</label>
                  <input value={claimVal} onChange={(e) => setClaimVal(e.target.value)} placeholder="e.g. 3.5" style={{ width: "100%", padding: "0.55rem 1rem", borderRadius: "10px", border: "1px solid #0a0a0a", fontSize: "0.88rem" }} />
                </div>
              )}
              {claimType === "graduated_by" && (
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Year Threshold:</label>
                  <input value={claimVal} onChange={(e) => setClaimVal(e.target.value)} placeholder="e.g. 2026" style={{ width: "100%", padding: "0.55rem 1rem", borderRadius: "10px", border: "1px solid #0a0a0a", fontSize: "0.88rem" }} />
                </div>
              )}
              {claimType === "course_match" && (
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Course Subject Name:</label>
                  <input value={claimVal} onChange={(e) => setClaimVal(e.target.value)} placeholder="e.g. Computer Science" style={{ width: "100%", padding: "0.55rem 1rem", borderRadius: "10px", border: "1px solid #0a0a0a", fontSize: "0.88rem" }} />
                </div>
              )}
            </div>

            {/* Live Preview Box */}
            <div style={{ background: "#0a0a0a", color: "#ffffff", padding: "1rem 1.25rem", borderRadius: "14px", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.8, marginBottom: "0.3rem" }}>
                👁️ Recipient Live Preview (What They See)
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                ✓ {claimType === "cgpa_gte" ? `Student holds academic CGPA ≥ ${claimVal}` : claimType === "graduated_by" ? `Degree conferred in or prior to ${claimVal}` : claimType === "course_match" ? `Course field matches '${claimVal}'` : 'Certificate credential is valid and active'}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>
                Signed by: {cert.university_name || "Issuing University"} · Zero Transcript Data Leakage
              </div>
            </div>

            {discError && <div className="error-msg" style={{ marginBottom: "1rem" }}>{discError}</div>}

            {discResult ? (
              <div style={{ background: "#f1f5f9", border: "1.5px solid #10B981", padding: "1.1rem", borderRadius: "14px", marginBottom: "1rem" }}>
                <div style={{ color: "#10B981", fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                  ✓ RSA Signed Selective Disclosure Claim Generated!
                </div>
                <div style={{ fontSize: "0.8rem", color: GS.muted, marginBottom: "0.5rem" }}>
                  Shareable Verification URL:
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input readOnly value={`${window.location.origin}${discResult.shareable_url}`} style={{ flex: 1, fontFamily: "monospace", fontSize: "0.78rem", padding: "0.5rem", borderRadius: "8px", border: "1px solid #0a0a0a" }} />
                  <button className="btn" style={{ fontSize: "0.78rem", padding: "0.5rem 0.9rem" }} onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}${discResult.shareable_url}`);
                    setCopiedDiscLink(true);
                    setTimeout(() => setCopiedDiscLink(false), 2000);
                  }}>
                    {copiedDiscLink ? "✓ Copied" : "Copy Link"}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn" onClick={handleGenerateDisclosure} disabled={generating} style={{ width: "100%", padding: "0.7rem", fontSize: "0.9rem", fontWeight: 800 }}>
                {generating ? "Generating RSA Signed Claim..." : "Generate Shareable Claim Link & QR"}
              </button>
            )}

            <div style={{ textAlign: "right", marginTop: "1rem" }}>
              <button className="btn-secondary" onClick={() => setShowDisclosureModal(false)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <CertificateTemplate ref={hiddenRef} certificate={cert} qrCodeUrl={qrUrl} />
      </div>
    </motion.div>
  );
}

export default WalletCertCard;

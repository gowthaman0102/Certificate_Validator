import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { getPublicKey } from "../../../shared/api/client";
import { getCachedPublicKey, setCachedPublicKey } from "../../../shared/utils/keyCache";
import { verifyOffline } from "../../../shared/utils/offlineCrypto";
import { downloadCertificateAsPDF } from "../../certificate-templates/utils/certificatePdf";
import CertificateTemplate from "../../../shared/components/CertificateTemplate";
import { createDisclosure } from "../api/disclosure";
import CertDetailModal from "./CertDetailModal";
import { API_BASE } from "../../../app/config";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };

function WalletCertCard({ cert, onDownload }) {
  const [sigStatus, setSigStatus]           = useState("checking");
  const [copiedId, setCopiedId]             = useState(false);
  const [showDetails, setShowDetails]       = useState(false);
  const [showFullModal, setShowFullModal]   = useState(false);
  const [showDisclosureModal, setShowDisclosureModal] = useState(false);

  // Disclosure Modal State
  const [claimType, setClaimType]           = useState("cgpa_gte");
  const [claimVal, setClaimVal]             = useState("3.5");
  const [generating, setGenerating]         = useState(false);
  const [discResult, setDiscResult]         = useState(null);
  const [discError, setDiscError]           = useState("");
  const [copiedDiscLink, setCopiedDiscLink] = useState(false);

  const hiddenRef = useRef(null);
  const cardRef   = useRef(null);

  // 3D Perspective Tilt State (capped at +-2.5 deg)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    checkSignature();
  }, [cert.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkSignature() {
    if (cert.status === "REVOKED") {
      setSigStatus("revoked");
      return;
    }
    try {
      const qrPayload = typeof cert.qr_data === "string" ? JSON.parse(cert.qr_data) : cert.qr_data;
      const issuerId  = qrPayload?.issuer_id;
      if (!issuerId) {
        setSigStatus("failed");
        return;
      }
      let pem;
      const cached = getCachedPublicKey(issuerId);
      if (cached) {
        pem = cached.public_key;
      } else {
        const res = await getPublicKey(issuerId);
        pem = res.data.public_key;
        setCachedPublicKey(issuerId, res.data.name, pem);
      }
      const result = await verifyOffline(qrPayload, pem);
      setSigStatus(result.result === "VALID" ? "verified" : "failed");
    } catch {
      setSigStatus("failed");
    }
  }

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
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
    try {
      await navigator.clipboard.writeText(cert.certificate_number);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    } catch {
      alert("Certificate ID: " + cert.certificate_number);
    }
  }

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

  function fmt(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  }

  const sigMap = {
    checking: { cls: "wallet-sig-checking", text: "Verifying signature…" },
    verified: { cls: "wallet-sig-verified", text: "✓ Verified" },
    failed:   { cls: "wallet-sig-failed",   text: "✕ Invalid" },
    revoked:  { cls: "wallet-sig-failed",   text: "✕ Revoked" },
  };
  const sig = sigMap[sigStatus];
  const qrUrl = `${API_BASE}/uploads/qr_${cert.id}.png`;

  return (
    <>
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
          border: `1.5px solid ${GS.border}`,
          padding: "1.15rem",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          height: "100%",
        }}
        className="card-lift"
      >
        {/* Top Section: Badges + Course Title */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span className={`wallet-sig-badge ${sig.cls}`} style={{ fontSize: "0.7rem", padding: "0.18rem 0.6rem" }}>
              {sig.text}
            </span>
            <span className={`status-badge ${cert.status === "VALID" ? "status-valid" : "status-revoked"}`} style={{ fontSize: "0.68rem" }}>
              {cert.status}
            </span>
          </div>

          <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", fontWeight: 700, color: GS.ink, lineHeight: 1.3 }}>
            {cert.course}
          </h4>
          <div style={{ fontSize: "0.8rem", color: GS.muted, marginBottom: "0.85rem" }}>
            {cert.university_name || "Issuing University"}
          </div>

          {/* Compact Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem 0.85rem",
              background: "#f8fafc",
              border: `1px solid ${GS.border}`,
              padding: "0.75rem",
              borderRadius: "12px",
              fontSize: "0.8rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <span style={{ color: GS.muted, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>Issue Date</span>
              <br />
              <strong style={{ color: GS.ink }}>{fmt(cert.issue_date)}</strong>
            </div>

            <div>
              <span style={{ color: GS.muted, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>Certificate ID</span>
              <br />
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <strong style={{ color: GS.ink, fontFamily: "monospace", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cert.certificate_number}
                </strong>
                <button
                  className={`wallet-copy-btn${copiedId ? " copied" : ""}`}
                  onClick={handleCopyId}
                  style={{ padding: "1px 6px", fontSize: "0.65rem" }}
                >
                  {copiedId ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Details Section */}
          {showDetails && (
            <div
              style={{
                background: "#ffffff",
                border: `1px solid ${GS.border}`,
                borderRadius: "10px",
                padding: "0.65rem 0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.78rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.4rem",
              }}
            >
              <div>
                <span style={{ color: GS.muted, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Register No</span>
                <br />
                <strong style={{ color: GS.ink, fontFamily: "monospace" }}>{cert.register_number || "—"}</strong>
              </div>
              {cert.cgpa && (
                <div>
                  <span style={{ color: GS.muted, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>CGPA</span>
                  <br />
                  <strong style={{ color: GS.ink }}>{cert.cgpa}</strong>
                </div>
              )}
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: GS.muted, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Student Email</span>
                <br />
                <strong style={{ color: GS.ink, wordBreak: "break-all" }}>{cert.student_email || "—"}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: GS.ink,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              {showDetails ? "▲ Less Details" : "▼ Details"}
            </button>

            <button
              onClick={() => setShowFullModal(true)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: GS.ink,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              👁️ View Full Certificate
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            <button
              className="btn"
              onClick={handleDownloadPdf}
              style={{ fontSize: "0.75rem", padding: "0.45rem 0.5rem", width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
            >
              Download PDF
            </button>
            <button
              className="btn-secondary"
              onClick={openDisclosureModal}
              style={{ fontSize: "0.75rem", padding: "0.45rem 0.5rem", width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
            >
              🔒 Claim Proof
            </button>
          </div>
        </div>

        {/* Hidden Container for PDF Rendering */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <CertificateTemplate ref={hiddenRef} certificate={cert} qrCodeUrl={qrUrl} />
        </div>
      </motion.div>

      {/* ── FULL CERTIFICATE PREVIEW MODAL ─────────────────────────── */}
      {showFullModal && (
        <CertDetailModal
          cert={cert}
          onClose={() => setShowFullModal(false)}
          onDownload={handleDownloadPdf}
        />
      )}

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
    </>
  );
}

export default WalletCertCard;

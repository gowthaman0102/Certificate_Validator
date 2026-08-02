import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getPublicKey } from "../../api/client";
import { getCachedPublicKey, setCachedPublicKey } from "../../utils/keyCache";
import { verifyOffline } from "../../utils/offlineCrypto";
import { downloadCertificateAsPDF } from "../../utils/certificatePdf";
import CertificateTemplate from "../CertificateTemplate";
import { getHistory } from "../../utils/walletStore";

const API_BASE = "http://localhost:5000";
const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff", mid: "#8c8c8c" };

function WalletCertCard({ cert, onCopyLink, onDownload, onShare }) {
  const [sigStatus, setSigStatus]   = useState("checking");
  const [copiedId,  setCopiedId]    = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
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
        {cert.file_path && (
          <a href={`${API_BASE}${cert.file_path}`} target="_blank" rel="noreferrer"
            style={{ color: GS.ink, fontSize: "0.85rem", fontWeight: 500, textDecoration: "underline", display: "flex", alignItems: "center" }}>
            View Original PDF
          </a>
        )}
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <CertificateTemplate ref={hiddenRef} certificate={cert} qrCodeUrl={qrUrl} />
      </div>
    </motion.div>
  );
}

export default WalletCertCard;

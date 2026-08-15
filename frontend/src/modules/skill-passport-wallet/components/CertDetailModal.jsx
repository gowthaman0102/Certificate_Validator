import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CertificateTemplate from "../../../shared/components/CertificateTemplate";
import { downloadCertificateAsPDF } from "../../certificate-templates/utils/certificatePdf";
import { API_BASE } from "../../../app/config";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };

export default function CertDetailModal({ cert, onClose, onDownload }) {
  const hiddenRef = useRef(null);

  if (!cert) return null;

  const qrUrl = `${API_BASE}/uploads/qr_${cert.id}.png`;
  const isVertical = cert.certificate_category === "Degree / Graduation Certificate";

  async function handleDownloadPdf() {
    await downloadCertificateAsPDF(hiddenRef, `certificate_${cert.certificate_number}`);
    if (onDownload) onDownload(cert);
  }

  function fmt(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  }

  return createPortal(
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          boxSizing: "border-box",
        }}
        onClick={onClose}
      >
        <motion.div
          className="card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            width: "100%",
            maxWidth: "880px",
            maxHeight: "92vh",
            overflowY: "auto",
            margin: "auto",
            background: "#ffffff",
            border: `2.5px solid ${GS.border}`,
            borderRadius: "24px",
            padding: "1.75rem",
            position: "relative",
            color: GS.ink,
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              borderBottom: `2px solid ${GS.border}`,
              paddingBottom: "0.75rem",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>{cert.course}</h3>
              <div style={{ fontSize: "0.82rem", color: GS.muted, marginTop: "2px" }}>{cert.university_name}</div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                fontWeight: 700,
                color: GS.ink,
              }}
            >
              ✕
            </button>
          </div>

          {/* Full Certificate Render */}
          <div
            style={{
              background: "#f8f9fa",
              border: `1.5px solid ${GS.border}`,
              borderRadius: "16px",
              padding: "1.25rem 0.5rem",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              minHeight: isVertical ? "480px" : "360px",
              marginBottom: "1.25rem",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                transform: isVertical ? "scale(0.58)" : "scale(0.62)",
                transformOrigin: "top center",
                marginBottom: isVertical ? "-360px" : "-200px",
              }}
            >
              <CertificateTemplate certificate={cert} qrCodeUrl={qrUrl} />
            </div>
          </div>

          {/* Key Metadata Table */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.85rem",
              background: "#f8fafc",
              border: `1px solid ${GS.border}`,
              padding: "1rem",
              borderRadius: "14px",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <span style={{ color: GS.muted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>Student Name</span>
              <br />
              <strong style={{ color: GS.ink }}>{cert.student_name}</strong>
            </div>
            <div>
              <span style={{ color: GS.muted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>Register No</span>
              <br />
              <strong style={{ color: GS.ink, fontFamily: "monospace" }}>{cert.register_number || "—"}</strong>
            </div>
            <div>
              <span style={{ color: GS.muted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>Certificate ID</span>
              <br />
              <strong style={{ color: GS.ink, fontFamily: "monospace" }}>{cert.certificate_number}</strong>
            </div>
            <div>
              <span style={{ color: GS.muted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>Issue Date</span>
              <br />
              <strong style={{ color: GS.ink }}>{fmt(cert.issue_date)}</strong>
            </div>
            {cert.cgpa && (
              <div>
                <span style={{ color: GS.muted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>CGPA</span>
                <br />
                <strong style={{ color: GS.ink }}>{cert.cgpa}</strong>
              </div>
            )}
            <div>
              <span style={{ color: GS.muted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>Student Email</span>
              <br />
              <strong style={{ color: GS.ink }}>{cert.student_email || "—"}</strong>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button className="btn" onClick={handleDownloadPdf}>
              Download Certificate PDF
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>

          {/* Hidden Print Container */}
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <CertificateTemplate ref={hiddenRef} certificate={cert} qrCodeUrl={qrUrl} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

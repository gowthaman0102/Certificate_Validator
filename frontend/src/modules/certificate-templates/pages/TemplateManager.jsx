import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CategoryCertificateTemplate from "../components/CategoryCertificateTemplate";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const SAMPLE_CERTIFICATE = {
  id: "sample-101",
  certificate_number: "UNI001-2026-SAMPLE",
  student_name: "Alex Johnson",
  register_number: "21CS1042",
  course: "B.Tech Computer Science & Engineering",
  cgpa: "9.4",
  start_year: "2022",
  end_year: "2026",
  issue_date: "2026-07-24",
  university_name: "Apex Institute of Technology",
  certificate_category: "Degree / Graduation Certificate",
  certificate_detail: "First Class with Distinction",
  status: "VALID",
};

const CATEGORY_LIST = [
  { value: "Degree / Graduation Certificate",    label: "Degree / Graduation" },
  { value: "Distinction Certificate",             label: "Distinction" },
  { value: "Merit Certificate",                   label: "Merit" },
  { value: "Academic Excellence Certificate",     label: "Academic Excellence" },
  { value: "Course Completion Certificate",       label: "Course Completion" },
  { value: "Internship Completion Certificate",   label: "Internship" },
  { value: "Project Completion Certificate",      label: "Project Completion" },
  { value: "Bonafide Certificate",                label: "Bonafide" },
  { value: "Participation Certificate",           label: "Participation" },
];

export default function TemplateManager() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Degree / Graduation Certificate");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "UNIVERSITY") { navigate("/university-login"); return; }
  }, [navigate]);

  const sampleCertData = {
    ...SAMPLE_CERTIFICATE,
    certificate_category: selectedCategory,
  };

  return (
    <motion.div
      className="dashboard"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: PREMIUM }}
    >
      <div className="dashboard-header">
        <div>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Certificate Template Preview</h2>
          <Link to="/university" style={{ color: GS.ink, fontSize: "0.9rem", fontWeight: 500, textDecoration: "underline", marginTop: "0.2rem", display: "inline-block" }}>← Back to University Dashboard</Link>
        </div>
        <button className="btn" onClick={() => navigate("/university")}>University Dashboard</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* ── LEFT PANEL: CATEGORY LIST ── */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.75rem" }}>Certificate Categories</h3>
          <p style={{ color: GS.muted, fontSize: "0.82rem", marginBottom: "1.25rem" }}>Click a category to preview its template.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {CATEGORY_LIST.map((cat, index) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <motion.div
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: PREMIUM }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: isSelected ? "#0a0a0a" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#0a0a0a",
                    border: `1.5px solid ${isSelected ? "#0a0a0a" : "#e2e8f0"}`,
                    padding: "0.75rem 1rem",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    fontSize: "0.88rem",
                    fontWeight: isSelected ? 700 : 500,
                    boxShadow: isSelected ? "0 4px 14px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {cat.label}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: LIVE TEMPLATE PREVIEW ── */}
        <div className="card" style={{ padding: "1.5rem", overflow: "hidden" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Live Certificate Template Preview</h3>
            <p style={{ margin: "0.3rem 0 0 0", color: GS.muted, fontSize: "0.85rem" }}>
              Category: <strong>{selectedCategory}</strong>
            </p>
          </div>

          <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "1rem", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "hidden", minHeight: "440px", maxHeight: "460px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: PREMIUM }}
                style={{ 
                  transform: selectedCategory === "Degree / Graduation Certificate" ? "scale(0.48)" : "scale(0.62)", 
                  transformOrigin: "top center",
                  marginBottom: selectedCategory === "Degree / Graduation Certificate" ? "-440px" : "-220px"
                }}
              >
                <CategoryCertificateTemplate
                  certificate={sampleCertData}
                  qrCodeUrl={null}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: GS.muted, textAlign: "center" }}>
            Sample preview — real certificates include your university name, student details, and QR code.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

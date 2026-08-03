import { CountUp } from "../motion";

const GS = { ink: "#0a0a0a", muted: "#64748b", subtle: "#94a3b8", border: "#e2e8f0", bg: "#ffffff" };

export default function CareerReadinessCard({ readinessData }) {
  const { score = 0, level = "Developing", hasData = false, breakdown = {} } = readinessData || {};

  if (!hasData && score === 0) {
    return (
      <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "1.25rem", borderRadius: "12px", textAlign: "center", color: GS.muted, fontSize: "0.9rem" }}>
        📊 Add more certificates to see your Career Readiness Score & breakdown.
      </div>
    );
  }

  const breakdownItems = [
    { label: "Certifications & Diversity", value: breakdown.certifications || 0, max: 35, color: "#0a0a0a" },
    { label: "Internship Experience", value: breakdown.internships || 0, max: 30, color: "#2563eb" },
    { label: "Skills Breadth", value: breakdown.skills || 0, max: 20, color: "#10b981" },
    { label: "Academic Standing", value: breakdown.academicStanding || 0, max: 15, color: "#8b5cf6" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.4rem 0.9rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700 }}>
            <CountUp to={score} duration={0.8} /> / 100
          </div>
          <span style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#0a0a0a", padding: "0.2rem 0.65rem", fontSize: "0.75rem", fontWeight: 700, borderRadius: "14px" }}>
            {level}
          </span>
        </div>

        <span style={{ fontSize: "0.75rem", color: GS.muted, fontWeight: 600 }}>
          Algorithmic Career Index
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#e2e8f0", height: "12px", width: "100%", borderRadius: "6px", overflow: "hidden", marginBottom: "1.25rem" }}>
        <div style={{ background: "linear-gradient(90deg, #0a0a0a 0%, #2563eb 100%)", height: "100%", width: `${score}%`, transition: "width 0.6s ease" }} />
      </div>

      {/* Category Breakdown Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
        {breakdownItems.map((item, idx) => (
          <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem 0.9rem", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "#0a0a0a", marginBottom: "4px" }}>
              <span>{item.label}</span>
              <span>{item.value}/{item.max}</span>
            </div>
            <div style={{ background: "#cbd5e1", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ background: item.color, height: "100%", width: `${(item.value / item.max) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

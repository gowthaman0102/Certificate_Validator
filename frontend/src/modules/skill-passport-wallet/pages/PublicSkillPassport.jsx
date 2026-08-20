import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPublicPassport } from "../api/passport";
import { CountUp, SkeletonCard } from "../../../shared/motion/index";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: PREMIUM } },
};

export default function PublicSkillPassport() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPublicData();
  }, [id]);

  async function loadPublicData() {
    setLoading(true);
    setError("");
    try {
      const res = await getPublicPassport(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load student portfolio");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="dashboard-header"><h2>Verified Academic Identity</h2></div>
        <div className="card">
          <SkeletonCard rows={4} heights={["2rem", "6rem", "8rem", "4rem"]} gap="1rem" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="card">
          <h2 style={{ color: "#0a0a0a" }}>Student Portfolio</h2>
          <div className="error-msg">{error}</div>
          <Link to="/" className="btn-back-home-oval" style={{ marginTop: "1rem" }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  const profile = data?.profile || {};
  const score = data?.profileScore || { score: 0, level: "Beginner" };
  const certs = data?.certificates || [];
  const skills = data?.skills || [];
  const projects = data?.projects || [];

  return (
    <motion.div
      className="dashboard"
      style={{ maxWidth: "1000px", margin: "0 auto" }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="dashboard-header">
        <motion.h2
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          transition={{ duration: 0.65, ease: PREMIUM }}
        >
          Verified Academic Identity
        </motion.h2>
        <Link to="/" className="btn-back-home-oval">← Back to Home</Link>
      </div>

      {/* Profile Header Card */}
      <motion.div className="card" style={{ padding: "1.75rem" }} variants={cardVariants}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ width: "90px", height: "90px", borderRadius: "50%", background: "#0a0a0a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", fontWeight: "bold" }}
          >
            {data.student_name ? data.student_name.charAt(0).toUpperCase() : "S"}
          </motion.div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{data.student_name}</h2>
              <span className="pulse-live" style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 700, borderRadius: "25px" }}>
                ✓ VERIFIED STUDENT
              </span>
            </div>

            <p style={{ margin: "0.25rem 0 0.5rem 0", color: GS.muted, fontSize: "0.95rem", fontWeight: 500 }}>
              {profile.headline || "Verified Digital Academic Portfolio"}
            </p>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.85rem", color: GS.muted }}>
              <span>🏛 <strong>Department:</strong> {profile.department || (certs[0]?.course ? `${certs[0].course}` : "Academic")}</span>
              <span>🎓 <strong>Program:</strong> {profile.program || (certs[0]?.certificate_category ? `${certs[0].certificate_category}` : "Degree")}</span>
              <span>📅 <strong>Graduation:</strong> {profile.graduation_year || (certs[0]?.end_year ? String(certs[0].end_year) : "2028")}</span>
            </div>

            {/* Profile Score */}
            <div style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "#0a0a0a", color: "#ffffff", padding: "0.4rem 0.9rem", borderRadius: "25px" }}>
              <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>PROFILE SCORE:</span>
              <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                <CountUp to={score.score} duration={0.8} /> / 1000
              </span>
              <span style={{ background: "#ffffff", color: "#0a0a0a", padding: "0.1rem 0.45rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "12px" }}>{score.level}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verified Certificates */}
      {certs.length > 0 && (
        <motion.div className="card" variants={cardVariants}>
          <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Verified Certificates (<CountUp to={certs.length} duration={0.6} />)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            {certs.map((c, idx) => (
              <motion.div
                key={c.id}
                className="card-lift"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                style={{ background: "#f9f9f9", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0a0a0a" }}>{c.course}</div>
                  <div style={{ fontSize: "0.82rem", color: GS.muted }}>Issued by {c.university_name || "Verified University"} • {c.issue_date}</div>
                </div>
                <span className={`status-badge ${c.status === "VALID" ? "status-valid" : "status-revoked"}`}>{c.status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills Stagger & Stamp Animation */}
      {skills.length > 0 && (
        <motion.div className="card" variants={cardVariants}>
          <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Verified Skills (<CountUp to={skills.length} duration={0.6} />)
          </h3>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
            {skills.map((sk, idx) => (
              <motion.div
                key={sk.id}
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18, delay: idx * 0.05 }}
                style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.4rem 0.85rem", borderRadius: "25px", fontSize: "0.85rem" }}
              >
                <strong>{sk.skill_name}</strong> <span style={{ opacity: 0.7, fontSize: "0.75rem" }}>({sk.proficiency})</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <motion.div className="card" variants={cardVariants}>
          <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Projects (<CountUp to={projects.length} duration={0.6} />)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1rem" }}>
            {projects.map((p, idx) => (
              <motion.div
                key={p.id}
                className="card-lift"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                style={{ background: "#ffffff", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px" }}
              >
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{p.project_name}</h4>
                <div style={{ fontSize: "0.8rem", color: GS.muted, margin: "0.2rem 0" }}>Tech Stack: <strong>{p.tech_stack}</strong></div>
                <p style={{ fontSize: "0.88rem", color: "#222222", margin: "0.4rem 0" }}>{p.description}</p>
                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: "#0a0a0a", fontWeight: 600 }}>🔗 GitHub Repo</a>}
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ color: "#0a0a0a", fontWeight: 600 }}>🚀 Live Demo</a>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

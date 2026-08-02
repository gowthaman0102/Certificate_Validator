import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMyPassport,
  updatePassportProfile,
  addPassportSkill,
  deletePassportSkill,
  addPassportProject,
  deletePassportProject,
  addPassportInternship,
  deletePassportInternship,
  addPassportPublication,
  deletePassportPublication,
  addPassportAchievement,
  deletePassportAchievement,
  addPassportLicense,
  deletePassportLicense,
  updatePassportSettings,
  logPassportExport,
} from "../api/passport";
import { CountUp, SkeletonCard } from "../components/motion";

const GS = { ink: "#0a0a0a", muted: "#666666", subtle: "#999999", border: "#0a0a0a", bg: "#ffffff" };
const PREMIUM = [0.16, 1, 0.3, 1];

const SKILL_CATEGORIES = [
  "Programming", "AI", "Cloud", "Cybersecurity", "Data Science", "Design", "Soft Skills", "Languages", "Business", "Other"
];

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: PREMIUM } },
};

export default function DigitalSkillPassport() {
  const navigate = useNavigate();
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: "", headline: "", department: "", program: "", graduation_year: "", career_interests: "" });

  const [skillForm, setSkillForm] = useState({ skill_name: "", category: SKILL_CATEGORIES[0], proficiency: "Intermediate" });
  const [projectForm, setProjectForm] = useState({ project_name: "", description: "", tech_stack: "", github_url: "", demo_url: "", start_date: "", end_date: "", status: "Completed" });
  const [internshipForm, setInternshipForm] = useState({ company: "", role: "", duration: "", description: "", cert_link: "" });
  const [pubForm, setPubForm] = useState({ title: "", type: "Research Paper", publisher: "", date: "", doi: "", url: "" });
  const [achForm, setAchForm] = useState({ title: "", category: "Award", organization: "", date: "", description: "" });
  const [licForm, setLicForm] = useState({ name: "", issuer: "", issue_date: "", expiry_date: "", credential_id: "", url: "" });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || u.role !== "STUDENT") { navigate("/student-login"); return; }
    setUser(u);
    loadPassport();
  }, []);

  async function loadPassport() {
    setLoading(true);
    setError("");
    try {
      const res = await getMyPassport();
      const data = res.data.data;
      setPassportData(data);
      setProfileForm({
        bio: data.profile?.bio || "",
        headline: data.profile?.headline || "",
        department: data.profile?.department || "",
        program: data.profile?.program || "",
        graduation_year: data.profile?.graduation_year || "",
        career_interests: data.profile?.career_interests || "",
      });
    } catch (err) {
      setError("Failed to load skill passport");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      await updatePassportProfile(profileForm);
      setEditProfile(false);
      loadPassport();
    } catch {
      alert("Failed to save profile");
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    try {
      await addPassportSkill(skillForm);
      setSkillForm({ skill_name: "", category: SKILL_CATEGORIES[0], proficiency: "Intermediate" });
      loadPassport();
    } catch { alert("Failed to add skill"); }
  }

  async function handleDeleteSkill(id) {
    try { await deletePassportSkill(id); loadPassport(); }
    catch { alert("Failed to delete skill"); }
  }

  async function handleAddProject(e) {
    e.preventDefault();
    try {
      await addPassportProject(projectForm);
      setProjectForm({ project_name: "", description: "", tech_stack: "", github_url: "", demo_url: "", start_date: "", end_date: "", status: "Completed" });
      loadPassport();
    } catch { alert("Failed to add project"); }
  }

  async function handleDeleteProject(id) {
    try { await deletePassportProject(id); loadPassport(); }
    catch { alert("Failed to delete project"); }
  }

  async function handleCopyShareLink() {
    if (!passportData?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(passportData.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert("Share Link: " + passportData.shareUrl);
    }
  }

  if (loading) {
    return (
      <div className="dashboard" style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="dashboard-header"><h2>Digital Skill Passport</h2></div>
        <div className="card">
          <SkeletonCard rows={4} heights={["2rem", "6rem", "8rem", "4rem"]} gap="1rem" />
        </div>
      </div>
    );
  }

  const profile = passportData?.profile || {};
  const score = passportData?.profileScore || { score: 0, level: "Beginner" };
  const certs = passportData?.certificates || [];
  const skills = passportData?.skills || [];
  const projects = passportData?.projects || [];
  const internships = passportData?.internships || [];
  const publications = passportData?.publications || [];
  const achievements = passportData?.achievements || [];
  const licenses = passportData?.licenses || [];
  const settings = passportData?.settings || {};

  return (
    <motion.div
      className="dashboard"
      style={{ maxWidth: "1100px", margin: "0 auto" }}
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
          Digital Skill Passport
        </motion.h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button className="btn" onClick={handleCopyShareLink}>
            {copiedLink ? "✓ Link Copied!" : "🔗 Share Portfolio"}
          </button>
          <button className="btn-secondary" onClick={() => navigate("/student")}>← Dashboard</button>
        </div>
      </div>

      {error && <motion.div className="card" variants={cardVariants}><div className="error-msg">{error}</div></motion.div>}

      {/* Header Profile Card */}
      <motion.div className="card" style={{ padding: "1.75rem" }} variants={cardVariants}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ width: "90px", height: "90px", borderRadius: "50%", background: "#0a0a0a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", fontWeight: "bold" }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "S"}
          </motion.div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{user.name}</h2>
              <span className="pulse-live" style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 700, borderRadius: "25px" }}>
                ✓ VERIFIED IDENTITY
              </span>
            </div>

            <p style={{ margin: "0.25rem 0 0.5rem 0", color: GS.muted, fontSize: "0.95rem", fontWeight: 500 }}>
              {profile.headline || "Digital Academic & Skill Passport"}
            </p>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.85rem", color: GS.muted }}>
              <span>🏛 <strong>Department:</strong> {profile.department || "N/A"}</span>
              <span>🎓 <strong>Program:</strong> {profile.program || "N/A"}</span>
              <span>📅 <strong>Graduation:</strong> {profile.graduation_year || "N/A"}</span>
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

      {/* Tabs Navigation */}
      <motion.div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem" }} variants={cardVariants}>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.2rem" }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "skills", label: `Skills (${skills.length})` },
            { id: "projects", label: `Projects (${projects.length})` },
            { id: "internships", label: `Internships (${internships.length})` },
            { id: "publications", label: `Publications (${publications.length})` },
            { id: "achievements", label: `Achievements (${achievements.length})` },
            { id: "licenses", label: `Licenses (${licenses.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "#0a0a0a" : "transparent",
                color: activeTab === tab.id ? "#ffffff" : "#0a0a0a",
                border: "1.5px solid #0a0a0a",
                borderRadius: "25px",
                padding: "0.4rem 1rem",
                fontSize: "0.82rem",
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content Panes */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Verified Certificates</h3>
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
            </div>
          </motion.div>
        )}

        {activeTab === "skills" && (
          <motion.div key="skills" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Skills</h3>
              <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <input
                  value={skillForm.skill_name}
                  onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                  placeholder="Skill Name (e.g. React, Python)"
                  required
                  style={{ flex: 2, minWidth: "180px" }}
                />
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  style={{ flex: 1, minWidth: "140px" }}
                >
                  {SKILL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                  value={skillForm.proficiency}
                  onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                  style={{ flex: 1, minWidth: "120px" }}
                >
                  {PROFICIENCY_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
                <button className="btn" type="submit">Add Skill</button>
              </form>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {skills.map((sk, idx) => (
                  <motion.div
                    key={sk.id}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: idx * 0.04 }}
                    style={{ background: "#0a0a0a", color: "#ffffff", padding: "0.4rem 0.85rem", borderRadius: "25px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span><strong>{sk.skill_name}</strong> <small style={{ opacity: 0.7 }}>({sk.proficiency})</small></span>
                    <button
                      onClick={() => handleDeleteSkill(sk.id)}
                      style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "0.8rem", opacity: 0.7 }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "projects" && (
          <motion.div key="projects" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Projects</h3>
              <form onSubmit={handleAddProject} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <input
                  value={projectForm.project_name}
                  onChange={(e) => setProjectForm({ ...projectForm, project_name: e.target.value })}
                  placeholder="Project Name"
                  required
                />
                <input
                  value={projectForm.tech_stack}
                  onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })}
                  placeholder="Tech Stack (e.g. React, Node.js, SQLite)"
                  required
                />
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project Description"
                  rows={3}
                  required
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={projectForm.github_url}
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                    placeholder="GitHub Repo URL (optional)"
                    style={{ flex: 1 }}
                  />
                  <input
                    value={projectForm.demo_url}
                    onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                    placeholder="Live Demo URL (optional)"
                    style={{ flex: 1 }}
                  />
                </div>
                <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>Add Project</button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {projects.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    className="card-lift"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                    style={{ background: "#ffffff", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{p.project_name}</h4>
                      <button className="btn-secondary" onClick={() => handleDeleteProject(p.id)} style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}>Delete</button>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: GS.muted, margin: "0.2rem 0" }}>Tech Stack: <strong>{p.tech_stack}</strong></div>
                    <p style={{ fontSize: "0.88rem", color: "#222222", margin: "0.4rem 0" }}>{p.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

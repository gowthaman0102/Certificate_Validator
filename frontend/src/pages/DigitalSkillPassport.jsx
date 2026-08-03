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
  "Programming & Languages",
  "Web & Full Stack",
  "Mobile Development",
  "AI & Machine Learning",
  "Data Science & Analytics",
  "Cloud & DevOps",
  "Cybersecurity & Networks",
  "Databases & Storage",
  "Software Architecture & Systems",
  "QA, Testing & Automation",
  "Blockchain & Web3",
  "UI/UX & Creative Design",
  "Hardware, IoT & Embedded",
  "Project & Agile Management",
  "Soft Skills & Leadership",
  "Business, Finance & Marketing"
];

const POPULAR_SKILL_SUGGESTIONS = [
  // Programming & Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go (Golang)", "Rust", "Kotlin", "Swift", "PHP", "Ruby", "R", "Scala", "Dart", "Lua", "Perl", "Haskell", "Assembly", "MATLAB", "SQL", "HTML5", "CSS3",
  // Web & Frameworks
  "React.js", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET Core", "Laravel", "Ruby on Rails", "Tailwind CSS", "Bootstrap", "GraphQL", "REST APIs", "WebSockets", "Redux", "Zustand", "Svelte", "Vite", "Webpack",
  // Mobile Development
  "React Native", "Flutter", "Android SDK", "iOS / SwiftUI", "Jetpack Compose", "Expo", "Ionic",
  // AI, ML & Data Science
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "scikit-learn", "Generative AI", "LLMs (Large Language Models)", "Prompt Engineering", "OpenAI API", "LangChain", "Computer Vision (OpenCV)", "NLP (Natural Language Processing)", "Pandas", "NumPy", "Apache Spark", "Hadoop", "Power BI", "Tableau", "Data Mining", "Feature Engineering", "Neural Networks",
  // Cloud, DevOps & Infrastructure
  "AWS (Amazon Web Services)", "Microsoft Azure", "Google Cloud Platform (GCP)", "Docker", "Kubernetes", "Terraform", "Ansible", "CI/CD Pipelines", "GitHub Actions", "Jenkins", "Nginx", "Linux System Administration", "Bash / Shell Scripting", "Serverless Architecture", "Prometheus", "Grafana",
  // Cybersecurity & Networking
  "Ethical Hacking", "Penetration Testing", "Network Security", "Cryptography", "OWASP Security", "SOC Analysis", "Wireshark", "Metasploit", "Identity & Access Management (IAM)", "Firewalls & VPNs", "Zero Trust Architecture", "SIEM", "Incident Response",
  // Databases & Storage
  "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Firebase / Firestore", "Supabase", "Elasticsearch", "Neo4j", "Prisma ORM", "Sequelize",
  // QA, Testing & Automation
  "Jest", "Cypress", "Playwright", "Selenium", "JUnit", "Postman", "API Testing", "Load Testing (k6 / JMeter)", "Unit Testing", "Test-Driven Development (TDD)",
  // Blockchain & Emerging Tech
  "Solidity", "Smart Contracts", "Ethereum", "Web3.js", "Ethers.js", "Hardhat", "Polygon", "IPFS", "Zero-Knowledge Proofs",
  // UI/UX & Design
  "Figma", "Adobe XD", "UI Design", "UX Research", "Wireframing & Prototyping", "User Centric Design", "Design Systems", "Canva", "Adobe Illustrator", "Photoshop",
  // Business & Project Management
  "Agile & Scrum", "Jira", "Trello", "Product Management", "Strategic Planning", "Technical Writing", "Git & GitHub", "Microservices Architecture", "System Design"
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
  const [user, setUser] = useState({});
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: "", headline: "", department: "", program: "", graduation_year: "", career_interests: "" });

  const [skillForm, setSkillForm] = useState({ skill_name: "", category: SKILL_CATEGORIES[0], proficiency: "Intermediate" });
  const [projectForm, setProjectForm] = useState({ project_name: "", description: "", tech_stack: "", github_url: "", demo_url: "", start_date: "", end_date: "", status: "Completed" });
  const [internshipForm, setInternshipForm] = useState({ company: "", role: "", duration: "", description: "", cert_link: "" });
  const [pubForm, setPubForm] = useState({ title: "", type: "Research Paper", publisher: "", date: "", doi: "", url: "" });
  const [achForm, setAchForm] = useState({ title: "", category: "Award", organization: "", date: "", description: "" });
  const [licForm, setLicForm] = useState({ name: "", issuer: "", issue_date: "", expiry_date: "", credential_id: "", url: "" });

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

  // ---- Skills Handlers ----
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

  // ---- Projects Handlers ----
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

  // ---- Internships Handlers ----
  async function handleAddInternship(e) {
    e.preventDefault();
    try {
      await addPassportInternship(internshipForm);
      setInternshipForm({ company: "", role: "", duration: "", description: "", cert_link: "" });
      loadPassport();
    } catch { alert("Failed to add internship"); }
  }

  async function handleDeleteInternship(id) {
    try { await deletePassportInternship(id); loadPassport(); }
    catch { alert("Failed to delete internship"); }
  }

  // ---- Publications Handlers ----
  async function handleAddPub(e) {
    e.preventDefault();
    try {
      await addPassportPublication(pubForm);
      setPubForm({ title: "", type: "Research Paper", publisher: "", date: "", doi: "", url: "" });
      loadPassport();
    } catch { alert("Failed to add publication"); }
  }

  async function handleDeletePub(id) {
    try { await deletePassportPublication(id); loadPassport(); }
    catch { alert("Failed to delete publication"); }
  }

  // ---- Achievements Handlers ----
  async function handleAddAch(e) {
    e.preventDefault();
    try {
      await addPassportAchievement(achForm);
      setAchForm({ title: "", category: "Award", organization: "", date: "", description: "" });
      loadPassport();
    } catch { alert("Failed to add achievement"); }
  }

  async function handleDeleteAch(id) {
    try { await deletePassportAchievement(id); loadPassport(); }
    catch { alert("Failed to delete achievement"); }
  }

  // ---- Licenses Handlers ----
  async function handleAddLic(e) {
    e.preventDefault();
    try {
      await addPassportLicense(licForm);
      setLicForm({ name: "", issuer: "", issue_date: "", expiry_date: "", credential_id: "", url: "" });
      loadPassport();
    } catch { alert("Failed to add license"); }
  }

  async function handleDeleteLic(id) {
    try { await deletePassportLicense(id); loadPassport(); }
    catch { alert("Failed to delete license"); }
  }

  async function handleCopyShareLink() {
    const studentId = user?.id || passportData?.user_id;
    const linkToShare = passportData?.shareUrl || (studentId ? `${window.location.origin}/student/profile/${studentId}` : "");
    if (!linkToShare) {
      alert("Student portfolio link unavailable");
      return;
    }
    try {
      await navigator.clipboard.writeText(linkToShare);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      alert("Share Portfolio Link:\n" + linkToShare);
    }
  }

  if (loading) {
    return (
      <div className="dashboard" style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", paddingTop: "5rem" }}>
        <SkeletonCard />
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

  return (
    <motion.div
      className="dashboard"
      style={{ maxWidth: "1100px", margin: "0 auto" }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HTML Datalist for World Skills Auto-Suggestions */}
      <datalist id="world-skills-list">
        {POPULAR_SKILL_SUGGESTIONS.map((sk) => (
          <option key={sk} value={sk} />
        ))}
      </datalist>

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
          <button className="btn-secondary" onClick={() => navigate("/wallet")}>← Back to Wallet</button>
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
        {/* OVERVIEW TAB */}
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

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <motion.div key="skills" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Add & Manage Skills</h3>
              <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <input
                  list="world-skills-list"
                  value={skillForm.skill_name}
                  onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                  placeholder="Search or enter any skill in the world (e.g. React, PyTorch, Kubernetes, Solidity)"
                  required
                  style={{ flex: 2, minWidth: "220px" }}
                />
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  style={{ flex: 1, minWidth: "160px" }}
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

              {/* Quick Preset Buttons */}
              <div style={{ marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GS.muted, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "0.5rem" }}>Popular Skill Suggestions:</span>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {POPULAR_SKILL_SUGGESTIONS.slice(0, 18).map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => setSkillForm({ ...skillForm, skill_name: sk })}
                      style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "0.2rem 0.55rem", fontSize: "0.75rem", cursor: "pointer", color: "#1e293b" }}
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>

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

        {/* PROJECTS TAB */}
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
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#0a0a0a", fontWeight: 700 }}>GitHub →</a>}
                      {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700 }}>Live Demo →</a>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* INTERNSHIPS TAB */}
        {activeTab === "internships" && (
          <motion.div key="internships" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Internships & Experience</h3>
              <form onSubmit={handleAddInternship} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={internshipForm.company}
                    onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                    placeholder="Company / Organization Name"
                    required
                    style={{ flex: 1 }}
                  />
                  <input
                    value={internshipForm.role}
                    onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })}
                    placeholder="Role / Title (e.g. Software Intern)"
                    required
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={internshipForm.duration}
                    onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                    placeholder="Duration (e.g. June 2025 - August 2025)"
                    required
                    style={{ flex: 1 }}
                  />
                  <input
                    value={internshipForm.cert_link}
                    onChange={(e) => setInternshipForm({ ...internshipForm, cert_link: e.target.value })}
                    placeholder="Certificate / Verification Link (optional)"
                    style={{ flex: 1 }}
                  />
                </div>
                <textarea
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  placeholder="Key Responsibilities & Achievements"
                  rows={3}
                />
                <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>Add Internship</button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {internships.map((i, idx) => (
                  <motion.div
                    key={i.id}
                    className="card-lift"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                    style={{ background: "#ffffff", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{i.role} at {i.company}</h4>
                      <button className="btn-secondary" onClick={() => handleDeleteInternship(i.id)} style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}>Delete</button>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: GS.muted, margin: "0.2rem 0" }}>📅 {i.duration}</div>
                    {i.description && <p style={{ fontSize: "0.88rem", color: "#222222", margin: "0.4rem 0" }}>{i.description}</p>}
                    {i.cert_link && <a href={i.cert_link} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700 }}>Verification Link →</a>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PUBLICATIONS TAB */}
        {activeTab === "publications" && (
          <motion.div key="publications" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Publications & Research</h3>
              <form onSubmit={handleAddPub} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <input
                  value={pubForm.title}
                  onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                  placeholder="Paper / Article Title"
                  required
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <select
                    value={pubForm.type}
                    onChange={(e) => setPubForm({ ...pubForm, type: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="Research Paper">Research Paper</option>
                    <option value="Journal Article">Journal Article</option>
                    <option value="Conference Paper">Conference Paper</option>
                    <option value="Patent">Patent</option>
                    <option value="Book Chapter">Book Chapter</option>
                  </select>
                  <input
                    value={pubForm.publisher}
                    onChange={(e) => setPubForm({ ...pubForm, publisher: e.target.value })}
                    placeholder="Publisher / Journal Name (e.g. IEEE, Springer)"
                    required
                    style={{ flex: 2 }}
                  />
                  <input
                    type="date"
                    value={pubForm.date}
                    onChange={(e) => setPubForm({ ...pubForm, date: e.target.value })}
                    onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    onFocus={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    style={{ flex: 1, cursor: "pointer" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={pubForm.doi}
                    onChange={(e) => setPubForm({ ...pubForm, doi: e.target.value })}
                    placeholder="DOI (optional)"
                    style={{ flex: 1 }}
                  />
                  <input
                    value={pubForm.url}
                    onChange={(e) => setPubForm({ ...pubForm, url: e.target.value })}
                    placeholder="Publication URL (optional)"
                    style={{ flex: 1 }}
                  />
                </div>
                <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>Add Publication</button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {publications.map((pub, idx) => (
                  <motion.div
                    key={pub.id}
                    className="card-lift"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                    style={{ background: "#ffffff", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{pub.title}</h4>
                      <button className="btn-secondary" onClick={() => handleDeletePub(pub.id)} style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}>Delete</button>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: GS.muted, margin: "0.2rem 0" }}>{pub.type} • {pub.publisher} {pub.date ? `(${pub.date})` : ""}</div>
                    {pub.doi && <div style={{ fontSize: "0.8rem", color: GS.muted }}>DOI: <code>{pub.doi}</code></div>}
                    {pub.url && <a href={pub.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700, marginTop: "0.3rem", display: "inline-block" }}>Read Paper →</a>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <motion.div key="achievements" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Achievements & Hackathons</h3>
              <form onSubmit={handleAddAch} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <input
                  value={achForm.title}
                  onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                  placeholder="Achievement / Award Title (e.g. 1st Place Smart India Hackathon)"
                  required
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <select
                    value={achForm.category}
                    onChange={(e) => setAchForm({ ...achForm, category: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="Award">Award</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Competition">Competition</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Honor">Honor</option>
                  </select>
                  <input
                    value={achForm.organization}
                    onChange={(e) => setAchForm({ ...achForm, organization: e.target.value })}
                    placeholder="Organizing Institution / Company"
                    required
                    style={{ flex: 2 }}
                  />
                  <input
                    type="date"
                    value={achForm.date}
                    onChange={(e) => setAchForm({ ...achForm, date: e.target.value })}
                    onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    onFocus={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    style={{ flex: 1, cursor: "pointer" }}
                  />
                </div>
                <textarea
                  value={achForm.description}
                  onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                  placeholder="Description of Achievement"
                  rows={2}
                />
                <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>Add Achievement</button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {achievements.map((ach, idx) => (
                  <motion.div
                    key={ach.id}
                    className="card-lift"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                    style={{ background: "#ffffff", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{ach.title}</h4>
                      <button className="btn-secondary" onClick={() => handleDeleteAch(ach.id)} style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}>Delete</button>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: GS.muted, margin: "0.2rem 0" }}>🏆 {ach.category} • {ach.organization} {ach.date ? `(${ach.date})` : ""}</div>
                    {ach.description && <p style={{ fontSize: "0.88rem", color: "#222222", margin: "0.4rem 0" }}>{ach.description}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* LICENSES TAB */}
        {activeTab === "licenses" && (
          <motion.div key="licenses" variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
            <div className="card">
              <h3 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Licenses & External Certifications</h3>
              <form onSubmit={handleAddLic} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={licForm.name}
                    onChange={(e) => setLicForm({ ...licForm, name: e.target.value })}
                    placeholder="Certification Name (e.g. AWS Certified Solutions Architect)"
                    required
                    style={{ flex: 2 }}
                  />
                  <input
                    value={licForm.issuer}
                    onChange={(e) => setLicForm({ ...licForm, issuer: e.target.value })}
                    placeholder="Issuing Organization (e.g. AWS, Cisco, Coursera)"
                    required
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="date"
                    value={licForm.issue_date}
                    onChange={(e) => setLicForm({ ...licForm, issue_date: e.target.value })}
                    onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    onFocus={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    style={{ flex: 1, cursor: "pointer" }}
                  />
                  <input
                    type="date"
                    value={licForm.expiry_date}
                    onChange={(e) => setLicForm({ ...licForm, expiry_date: e.target.value })}
                    onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    onFocus={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch {} }}
                    placeholder="Expiration Date (if applicable)"
                    style={{ flex: 1, cursor: "pointer" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={licForm.credential_id}
                    onChange={(e) => setLicForm({ ...licForm, credential_id: e.target.value })}
                    placeholder="Credential ID (optional)"
                    style={{ flex: 1 }}
                  />
                  <input
                    value={licForm.url}
                    onChange={(e) => setLicForm({ ...licForm, url: e.target.value })}
                    placeholder="Verification URL (optional)"
                    style={{ flex: 1 }}
                  />
                </div>
                <button className="btn" type="submit" style={{ alignSelf: "flex-start" }}>Add Certification</button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {licenses.map((lic, idx) => (
                  <motion.div
                    key={lic.id}
                    className="card-lift"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04, ease: PREMIUM }}
                    style={{ background: "#ffffff", border: "1px solid #0a0a0a", padding: "1rem", borderRadius: "12px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>{lic.name}</h4>
                      <button className="btn-secondary" onClick={() => handleDeleteLic(lic.id)} style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}>Delete</button>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: GS.muted, margin: "0.2rem 0" }}>Issued by <strong>{lic.issuer}</strong> {lic.issue_date ? `• ${lic.issue_date}` : ""}</div>
                    {lic.credential_id && <div style={{ fontSize: "0.8rem", color: GS.muted }}>Credential ID: <code>{lic.credential_id}</code></div>}
                    {lic.url && <a href={lic.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700, marginTop: "0.3rem", display: "inline-block" }}>Verify Credential →</a>}
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

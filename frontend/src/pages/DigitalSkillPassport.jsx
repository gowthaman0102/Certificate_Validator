import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '../api/passport';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff' };

const SKILL_CATEGORIES = [
  'Programming', 'AI', 'Cloud', 'Cybersecurity', 'Data Science', 'Design', 'Soft Skills', 'Languages', 'Business', 'Other'
];

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function DigitalSkillPassport() {
  const navigate = useNavigate();
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, skills, projects, internships, publications, achievements, licenses, privacy
  const [user, setUser] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: '', headline: '', department: '', program: '', graduation_year: '', career_interests: '' });

  const [skillForm, setSkillForm] = useState({ skill_name: '', category: SKILL_CATEGORIES[0], proficiency: 'Intermediate' });
  const [projectForm, setProjectForm] = useState({ project_name: '', description: '', tech_stack: '', github_url: '', demo_url: '', start_date: '', end_date: '', status: 'Completed' });
  const [internshipForm, setInternshipForm] = useState({ company: '', role: '', duration: '', description: '', cert_link: '' });
  const [pubForm, setPubForm] = useState({ title: '', type: 'Research Paper', publisher: '', date: '', doi: '', url: '' });
  const [achForm, setAchForm] = useState({ title: '', category: 'Award', organization: '', date: '', description: '' });
  const [licForm, setLicForm] = useState({ name: '', issuer: '', issue_date: '', expiry_date: '', credential_id: '', url: '' });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || u.role !== 'STUDENT') { navigate('/student-login'); return; }
    setUser(u);
    loadPassport();
  }, []);

  async function loadPassport() {
    setLoading(true);
    setError('');
    try {
      const res = await getMyPassport();
      const data = res.data.data;
      setPassportData(data);
      setProfileForm({
        bio: data.profile?.bio || '',
        headline: data.profile?.headline || '',
        department: data.profile?.department || '',
        program: data.profile?.program || '',
        graduation_year: data.profile?.graduation_year || '',
        career_interests: data.profile?.career_interests || '',
      });
    } catch (err) {
      setError('Failed to load skill passport');
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
      alert('Failed to save profile');
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    try {
      await addPassportSkill(skillForm);
      setSkillForm({ skill_name: '', category: SKILL_CATEGORIES[0], proficiency: 'Intermediate' });
      loadPassport();
    } catch { alert('Failed to add skill'); }
  }

  async function handleDeleteSkill(id) {
    try { await deletePassportSkill(id); loadPassport(); } catch { alert('Failed to delete skill'); }
  }

  async function handleAddProject(e) {
    e.preventDefault();
    try {
      await addPassportProject(projectForm);
      setProjectForm({ project_name: '', description: '', tech_stack: '', github_url: '', demo_url: '', start_date: '', end_date: '', status: 'Completed' });
      loadPassport();
    } catch { alert('Failed to add project'); }
  }

  async function handleDeleteProject(id) {
    try { await deletePassportProject(id); loadPassport(); } catch { alert('Failed to delete project'); }
  }

  async function handleAddInternship(e) {
    e.preventDefault();
    try {
      await addPassportInternship(internshipForm);
      setInternshipForm({ company: '', role: '', duration: '', description: '', cert_link: '' });
      loadPassport();
    } catch { alert('Failed to add internship'); }
  }

  async function handleDeleteInternship(id) {
    try { await deletePassportInternship(id); loadPassport(); } catch { alert('Failed to delete internship'); }
  }

  async function handleAddPublication(e) {
    e.preventDefault();
    try {
      await addPassportPublication(pubForm);
      setPubForm({ title: '', type: 'Research Paper', publisher: '', date: '', doi: '', url: '' });
      loadPassport();
    } catch { alert('Failed to add publication'); }
  }

  async function handleDeletePublication(id) {
    try { await deletePassportPublication(id); loadPassport(); } catch { alert('Failed to delete publication'); }
  }

  async function handleAddAchievement(e) {
    e.preventDefault();
    try {
      await addPassportAchievement(achForm);
      setAchForm({ title: '', category: 'Award', organization: '', date: '', description: '' });
      loadPassport();
    } catch { alert('Failed to add achievement'); }
  }

  async function handleDeleteAchievement(id) {
    try { await deletePassportAchievement(id); loadPassport(); } catch { alert('Failed to delete achievement'); }
  }

  async function handleAddLicense(e) {
    e.preventDefault();
    try {
      await addPassportLicense(licForm);
      setLicForm({ name: '', issuer: '', issue_date: '', expiry_date: '', credential_id: '', url: '' });
      loadPassport();
    } catch { alert('Failed to add license'); }
  }

  async function handleDeleteLicense(id) {
    try { await deletePassportLicense(id); loadPassport(); } catch { alert('Failed to delete license'); }
  }

  async function handleVisibilityChange(section, value) {
    const newSettings = { ...passportData.settings, [section]: value };
    try {
      await updatePassportSettings(newSettings);
      loadPassport();
    } catch { alert('Failed to update visibility settings'); }
  }

  function handleCopyPublicLink() {
    const publicUrl = `${window.location.origin}/student/profile/${user.id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleExportPDF() {
    try {
      await logPassportExport('PDF');
      window.print();
    } catch { window.print(); }
  }

  if (loading) return <div className="dashboard"><p style={{ color: GS.muted }}>Loading Digital Skill Passport...</p></div>;

  const profile = passportData?.profile || {};
  const score = passportData?.profileScore || { score: 0, level: 'Beginner' };
  const completion = passportData?.completionPercentage || 0;
  const certs = passportData?.certificates || [];
  const skills = passportData?.skills || [];
  const projects = passportData?.projects || [];
  const internships = passportData?.internships || [];
  const publications = passportData?.publications || [];
  const achievements = passportData?.achievements || [];
  const licenses = passportData?.licenses || [];
  const timeline = passportData?.timeline || [];

  // Filter skills/projects by search
  const filteredSkills = skills.filter((s) =>
    s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tech_stack.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabStyle = (tab) => ({
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    background: activeTab === tab ? '#0a0a0a' : '#ffffff',
    color: activeTab === tab ? '#ffffff' : '#0a0a0a',
    border: '1px solid #0a0a0a',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderRadius: '25px',
  });

  return (
    <div className="dashboard">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <h2 style={{ margin: 0 }}>Verified Digital Skill Passport</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={() => navigate('/student')}>← Back to My Certificates</button>
          <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </div>
      </div>

      {error && <div className="card"><div className="error-msg">{error}</div></div>}

      {/* ── PROFILE HEADER CARD ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: 'none', marginBottom: '1.5rem' }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e0e0e0', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0a0a0a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{user.name}</h3>
                <span style={{ background: '#0a0a0a', color: '#ffffff', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: '25px' }}>✓ VERIFIED IDENTITY</span>
                <span style={{ background: '#f5f5f5', border: '1px solid #0a0a0a', color: '#0a0a0a', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: '25px' }}>⛓ BLOCKCHAIN ANCHORED</span>
              </div>
              <p style={{ margin: '0.3rem 0 0 0', color: GS.muted, fontSize: '0.95rem', fontWeight: 500 }}>
                {profile.headline || 'Digital Academic Passport & Portfolio'}
              </p>
            </div>
          </div>
          <button className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }} onClick={() => setEditProfile(!editProfile)}>
            {editProfile ? 'Cancel Edit' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* Full-Width Grid for Academic Attributes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1.1rem 1.35rem', borderRadius: '16px', marginBottom: '1.25rem', width: '100%' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DEPARTMENT</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a0a', marginTop: '3px' }}>{profile.department || 'Academic'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>PROGRAM</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a0a', marginTop: '3px' }}>{profile.program || 'Degree'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>GRADUATION YEAR</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a0a', marginTop: '3px' }}>{profile.graduation_year || '2026'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>REGISTER NUMBER</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a0a0a', marginTop: '3px', fontFamily: 'monospace' }}>{user.register_number || '—'}</div>
          </div>
        </div>

        {/* Bottom Score & Full Width Progress Row */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ background: '#0a0a0a', color: '#ffffff', padding: '0.55rem 1.15rem', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, fontWeight: 600 }}>PROFILE SCORE</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{score.score} / 1000</span>
            <span style={{ background: '#ffffff', color: '#0a0a0a', padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: '14px' }}>{score.level}</span>
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '4px' }}>
              <span>PROFILE COMPLETION</span>
              <span>{completion}%</span>
            </div>
            <div style={{ background: '#e2e8f0', height: '10px', width: '100%', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: '#0a0a0a', height: '100%', width: `${completion}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {profile.bio && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0', fontSize: '0.9rem', color: '#222222', fontStyle: 'italic' }}>
            "{profile.bio}"
          </div>
        )}

        {/* Edit Profile Form */}
        {editProfile && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e0e0e0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div><label>Headline</label><input value={profileForm.headline} onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })} placeholder="e.g. Software Engineer & AI Researcher" /></div>
              <div><label>Department</label><input value={profileForm.department} onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} placeholder="e.g. Computer Science & Engineering" /></div>
              <div><label>Program</label><input value={profileForm.program} onChange={(e) => setProfileForm({ ...profileForm, program: e.target.value })} placeholder="e.g. B.Tech Computer Science" /></div>
              <div><label>Graduation Year</label><input value={profileForm.graduation_year} onChange={(e) => setProfileForm({ ...profileForm, graduation_year: e.target.value })} placeholder="e.g. 2026" /></div>
            </div>
            <label style={{ marginTop: '0.75rem' }}>Professional Summary / Bio</label>
            <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Write a short summary about your academic profile and interests..." rows={3} style={{ width: '100%' }} />
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Save Profile Changes</button>
          </form>
        )}
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', textAlign: 'center', borderRadius: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0a0a0a' }}>{certs.length}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase' }}>Verified Certificates</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', textAlign: 'center', borderRadius: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0a0a0a' }}>{skills.length}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase' }}>Skills</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', textAlign: 'center', borderRadius: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0a0a0a' }}>{projects.length}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase' }}>Projects</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', textAlign: 'center', borderRadius: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0a0a0a' }}>{internships.length}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase' }}>Internships</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', textAlign: 'center', borderRadius: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0a0a0a' }}>{achievements.length}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, textTransform: 'uppercase' }}>Achievements</div>
        </div>
      </div>

      {/* ── MODULE TAB NAVIGATION ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview & Timeline</button>
        <button style={tabStyle('skills')} onClick={() => setActiveTab('skills')}>Skills ({skills.length})</button>
        <button style={tabStyle('projects')} onClick={() => setActiveTab('projects')}>Projects ({projects.length})</button>
        <button style={tabStyle('internships')} onClick={() => setActiveTab('internships')}>Internships ({internships.length})</button>
        <button style={tabStyle('publications')} onClick={() => setActiveTab('publications')}>Publications ({publications.length})</button>
        <button style={tabStyle('achievements')} onClick={() => setActiveTab('achievements')}>Achievements ({achievements.length})</button>
        <button style={tabStyle('licenses')} onClick={() => setActiveTab('licenses')}>Licenses ({licenses.length})</button>
        <button style={tabStyle('privacy')} onClick={() => setActiveTab('privacy')}>Privacy Settings</button>
      </div>

      {/* SEARCH BAR */}
      {(activeTab === 'skills' || activeTab === 'projects') && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            style={{ width: '100%', borderRadius: '25px', padding: '0.65rem 1.25rem' }}
          />
        </div>
      )}

      {/* ── TAB CONTENT: OVERVIEW & TIMELINE ────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Academic Portfolio Timeline</h3>
          <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1.25rem' }}>Chronological record of verified certificates, projects, internships, awards, and research papers.</p>
          
          {timeline.length === 0 && <p style={{ color: GS.muted }}>No timeline entries recorded yet.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid #0a0a0a', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
            {timeline.map((item) => (
              <div key={item.id} style={{ position: 'relative', background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ position: 'absolute', left: '-1.65rem', top: '1.1rem', width: '12px', height: '12px', background: '#0a0a0a', borderRadius: '50%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: '#0a0a0a', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>{item.type}</span>
                  <span style={{ fontSize: '0.78rem', color: GS.muted, fontWeight: 600 }}>{item.date || 'Present'}</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a0a0a' }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: GS.muted }}>{item.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: SKILLS ─────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Skills Module</h3>
          
          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div><label>Skill Name</label><input value={skillForm.skill_name} onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })} placeholder="e.g. Python, React, Solidity" required /></div>
              <div>
                <label>Category</label>
                <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}>
                  {SKILL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label>Proficiency</label>
                <select value={skillForm.proficiency} onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}>
                  {PROFICIENCY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
            </div>
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Add Skill</button>
          </form>

          {/* Skill List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {filteredSkills.map((sk) => (
              <div key={sk.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '0.85rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0a0a0a' }}>{sk.skill_name}</div>
                  <div style={{ fontSize: '0.75rem', color: GS.muted }}>{sk.category} • <strong style={{ color: '#0a0a0a' }}>{sk.proficiency}</strong></div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDeleteSkill(sk.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: PROJECTS ───────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Projects Module</h3>

          {/* Add Project Form */}
          <form onSubmit={handleAddProject} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><label>Project Name</label><input value={projectForm.project_name} onChange={(e) => setProjectForm({ ...projectForm, project_name: e.target.value })} placeholder="e.g. AI Fraud Detector" required /></div>
              <div><label>Tech Stack</label><input value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} placeholder="e.g. React, Node.js, Python" required /></div>
              <div><label>GitHub URL</label><input value={projectForm.github_url} onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} placeholder="https://github.com/..." /></div>
              <div><label>Demo URL</label><input value={projectForm.demo_url} onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })} placeholder="https://demo.com" /></div>
            </div>
            <label style={{ marginTop: '0.5rem' }}>Description</label>
            <textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Describe the project objective, features, and results..." rows={2} required />
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Add Project</button>
          </form>

          {/* Project List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredProjects.map((p) => (
              <div key={p.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1.1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{p.project_name}</h4>
                  <button style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDeleteProject(p.id)}>Delete</button>
                </div>
                <div style={{ fontSize: '0.8rem', color: GS.muted, margin: '0.2rem 0 0.5rem 0' }}>Tech Stack: <strong>{p.tech_stack}</strong></div>
                <p style={{ fontSize: '0.88rem', color: '#222222', margin: '0.5rem 0' }}>{p.description}</p>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: '#0a0a0a', fontWeight: 600 }}>🔗 GitHub Repo</a>}
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ color: '#0a0a0a', fontWeight: 600 }}>🚀 Live Demo</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: INTERNSHIPS ────────────────────────────────────── */}
      {activeTab === 'internships' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Internship Module</h3>

          <form onSubmit={handleAddInternship} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><label>Company</label><input value={internshipForm.company} onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })} placeholder="e.g. Google" required /></div>
              <div><label>Role</label><input value={internshipForm.role} onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })} placeholder="e.g. Software Engineering Intern" required /></div>
              <div><label>Duration</label><input value={internshipForm.duration} onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })} placeholder="e.g. May 2025 - Aug 2025" required /></div>
            </div>
            <label style={{ marginTop: '0.5rem' }}>Description</label>
            <textarea value={internshipForm.description} onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })} placeholder="Key achievements during internship..." rows={2} />
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Add Internship</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {internships.map((intern) => (
              <div key={intern.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1.1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{intern.role} at {intern.company}</h4>
                  <div style={{ fontSize: '0.8rem', color: GS.muted, margin: '0.2rem 0' }}>📅 {intern.duration}</div>
                  {intern.description && <p style={{ fontSize: '0.85rem', color: '#222222', margin: '0.4rem 0' }}>{intern.description}</p>}
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDeleteInternship(intern.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: PUBLICATIONS ───────────────────────────────────── */}
      {activeTab === 'publications' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Publications & Research</h3>

          <form onSubmit={handleAddPublication} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><label>Title</label><input value={pubForm.title} onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })} placeholder="Paper or Patent Title" required /></div>
              <div>
                <label>Type</label>
                <select value={pubForm.type} onChange={(e) => setPubForm({ ...pubForm, type: e.target.value })}>
                  <option value="Research Paper">Research Paper</option>
                  <option value="Journal">Journal</option>
                  <option value="Conference">Conference</option>
                  <option value="Patent">Patent</option>
                </select>
              </div>
              <div><label>Publisher / Journal</label><input value={pubForm.publisher} onChange={(e) => setPubForm({ ...pubForm, publisher: e.target.value })} placeholder="IEEE, Springer, etc." /></div>
              <div><label>DOI / URL</label><input value={pubForm.url} onChange={(e) => setPubForm({ ...pubForm, url: e.target.value })} placeholder="https://doi.org/..." /></div>
            </div>
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Add Publication</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {publications.map((pub) => (
              <div key={pub.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pub.title}</div>
                  <div style={{ fontSize: '0.8rem', color: GS.muted }}>{pub.type} • {pub.publisher}</div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDeletePublication(pub.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: ACHIEVEMENTS ───────────────────────────────────── */}
      {activeTab === 'achievements' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Achievements & Hackathons</h3>

          <form onSubmit={handleAddAchievement} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><label>Title</label><input value={achForm.title} onChange={(e) => setAchForm({ ...achForm, title: e.target.value })} placeholder="e.g. 1st Place National Hackathon" required /></div>
              <div>
                <label>Category</label>
                <select value={achForm.category} onChange={(e) => setAchForm({ ...achForm, category: e.target.value })}>
                  <option value="Award">Award</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Competition">Competition</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Olympiad">Olympiad</option>
                  <option value="Volunteering">Volunteering</option>
                </select>
              </div>
              <div><label>Organization</label><input value={achForm.organization} onChange={(e) => setAchForm({ ...achForm, organization: e.target.value })} placeholder="Organization / Host" /></div>
            </div>
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Add Achievement</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {achievements.map((ach) => (
              <div key={ach.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: '#0a0a0a', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>{ach.category}</span>
                  <h4 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '1rem', fontWeight: 700 }}>{ach.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: GS.muted }}>{ach.organization}</div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDeleteAchievement(ach.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: LICENSES ───────────────────────────────────────── */}
      {activeTab === 'licenses' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Licenses & Cloud Certifications</h3>

          <form onSubmit={handleAddLicense} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div><label>Certification Name</label><input value={licForm.name} onChange={(e) => setLicForm({ ...licForm, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" required /></div>
              <div><label>Issuer</label><input value={licForm.issuer} onChange={(e) => setLicForm({ ...licForm, issuer: e.target.value })} placeholder="e.g. Amazon Web Services, Microsoft" required /></div>
              <div><label>Credential ID</label><input value={licForm.credential_id} onChange={(e) => setLicForm({ ...licForm, credential_id: e.target.value })} placeholder="Credential ID / Hash" /></div>
            </div>
            <button className="btn" type="submit" style={{ marginTop: '0.75rem' }}>Add License / Certification</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {licenses.map((lic) => (
              <div key={lic.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{lic.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: GS.muted }}>Issuer: <strong>{lic.issuer}</strong></div>
                  {lic.credential_id && <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: GS.muted, marginTop: '2px' }}>ID: {lic.credential_id}</div>}
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDeleteLicense(lic.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: PRIVACY SETTINGS ───────────────────────────────── */}
      {activeTab === 'privacy' && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <h3 style={{ fontWeight: 700 }}>Portfolio Privacy & Visibility</h3>
          <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1.25rem' }}>Control section visibility on your public portfolio URL (`/student/profile/{user.id}`).</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['certificates', 'skills', 'projects', 'internships', 'publications', 'achievements', 'licenses', 'timeline'].map((sec) => (
              <div key={sec} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{sec}</span>
                <select
                  value={passportData?.settings?.[sec] || 'Public'}
                  onChange={(e) => handleVisibilityChange(sec, e.target.value)}
                  style={{ borderRadius: '25px', padding: '0.3rem 0.8rem', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="Public">Public (Everyone)</option>
                  <option value="Verified Only">Verified Only</option>
                  <option value="Private">Private (Hidden)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

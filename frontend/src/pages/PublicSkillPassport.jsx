import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicPassport } from '../api/passport';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff' };

export default function PublicSkillPassport() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPublicData();
  }, [id]);

  async function loadPublicData() {
    setLoading(true);
    setError('');
    try {
      const res = await getPublicPassport(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load student portfolio');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="dashboard"><div className="card"><p style={{ color: GS.muted }}>Loading Public Student Passport...</p></div></div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="card">
          <h2 style={{ color: '#0a0a0a' }}>Student Portfolio</h2>
          <div className="error-msg">{error}</div>
          <Link to="/" style={{ color: GS.ink, marginTop: '1rem', display: 'inline-block' }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  const profile = data?.profile || {};
  const score = data?.profileScore || { score: 0, level: 'Beginner' };
  const certs = data?.certificates || [];
  const skills = data?.skills || [];
  const projects = data?.projects || [];
  const internships = data?.internships || [];
  const publications = data?.publications || [];
  const achievements = data?.achievements || [];
  const timeline = data?.timeline || [];

  return (
    <div className="dashboard" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <h2>Verified Academic Identity</h2>
        <Link to="/" style={{ color: GS.ink, textDecoration: 'underline', fontSize: '0.9rem' }}>Certificate Validator Home</Link>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#0a0a0a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 'bold' }}>
            {data.student_name ? data.student_name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem' }}>{data.student_name}</h2>
              <span style={{ background: '#0a0a0a', color: '#ffffff', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '25px' }}>✓ VERIFIED STUDENT</span>
            </div>

            <p style={{ margin: '0.25rem 0 0.5rem 0', color: GS.muted, fontSize: '0.95rem', fontWeight: 500 }}>
              {profile.headline || 'Verified Digital Academic Portfolio'}
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: GS.muted }}>
              <span>🏛 <strong>Department:</strong> {profile.department || 'Academic'}</span>
              <span>🎓 <strong>Program:</strong> {profile.program || 'Degree'}</span>
              <span>📅 <strong>Graduation:</strong> {profile.graduation_year || '2026'}</span>
            </div>

            {/* Profile Score */}
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#0a0a0a', color: '#ffffff', padding: '0.4rem 0.9rem', borderRadius: '25px' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>PROFILE SCORE:</span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{score.score} / 1000</span>
              <span style={{ background: '#ffffff', color: '#0a0a0a', padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: '12px' }}>{score.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Certificates */}
      {certs.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verified Certificates ({certs.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {certs.map((c) => (
              <div key={c.id} style={{ background: '#f9f9f9', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0a0a0a' }}>{c.course}</div>
                  <div style={{ fontSize: '0.82rem', color: GS.muted }}>Issued by {c.university_name || 'Verified University'} • {c.issue_date}</div>
                </div>
                <span className={`status-badge ${c.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verified Skills ({skills.length})</h3>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {skills.map((sk) => (
              <div key={sk.id} style={{ background: '#0a0a0a', color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '25px', fontSize: '0.85rem' }}>
                <strong>{sk.skill_name}</strong> <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({sk.proficiency})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Projects ({projects.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
            {projects.map((p) => (
              <div key={p.id} style={{ background: '#ffffff', border: '1px solid #0a0a0a', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{p.project_name}</h4>
                <div style={{ fontSize: '0.8rem', color: GS.muted, margin: '0.2rem 0' }}>Tech Stack: <strong>{p.tech_stack}</strong></div>
                <p style={{ fontSize: '0.88rem', color: '#222222', margin: '0.4rem 0' }}>{p.description}</p>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: '#0a0a0a', fontWeight: 600 }}>🔗 GitHub Repo</a>}
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" style={{ color: '#0a0a0a', fontWeight: 600 }}>🚀 Live Demo</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTemplateList, getUniversityAssignments, assignTemplateToCategory } from '../api/templateApi';
import CategoryCertificateTemplate from '../components/templates/CategoryCertificateTemplate';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff' };

const SAMPLE_CERTIFICATE = {
  id: 'sample-101',
  certificate_number: 'UNI001-2026-DEGREE',
  student_name: 'Alex Johnson',
  register_number: '21CS1042',
  course: 'B.Tech Computer Science & Engineering',
  cgpa: '9.4',
  start_year: '2022',
  end_year: '2026',
  issue_date: '2026-07-24',
  university_name: 'Apex Institute of Technology',
  certificate_category: 'Degree Certificate',
  certificate_detail: 'First Class with Distinction',
  status: 'VALID',
};

export default function TemplateManager() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Degree Certificate');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('degree_template');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'UNIVERSITY') { navigate('/university-login'); return; }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [tmplRes, assignRes] = await Promise.all([getTemplateList(), getUniversityAssignments()]);
      const tmplList = tmplRes.data.data || [];
      setTemplates(tmplList);

      const assignMap = {};
      (assignRes.data.data || []).forEach((a) => {
        assignMap[a.category] = a.template_key;
      });
      setAssignments(assignMap);

      if (tmplList.length > 0) {
        setSelectedTemplateKey(assignMap['Degree Certificate'] || tmplList[0].template_key);
      }
    } catch {
      setError('Failed to load template configuration');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAssignment(category, templateKey) {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await assignTemplateToCategory(category, templateKey);
      setAssignments((prev) => ({ ...prev, [category]: templateKey }));
      setMsg(`Assigned '${templateKey}' to category '${category}' successfully!`);
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setError('Failed to save template assignment');
    } finally {
      setSaving(false);
    }
  }

  const currentTemplate = templates.find((t) => t.template_key === selectedTemplateKey) || templates[0];

  const sampleCertData = {
    ...SAMPLE_CERTIFICATE,
    certificate_category: selectedCategory,
  };

  if (loading) return <div className="dashboard"><div className="card"><p style={{ color: GS.muted }}>Loading Template Manager...</p></div></div>;

  return (
    <div className="dashboard" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Certificate Template Manager</h2>
          <Link to="/university" style={{ color: GS.ink, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'underline', marginTop: '0.2rem', display: 'inline-block' }}>← Back to University Dashboard</Link>
        </div>
        <button className="btn" onClick={() => navigate('/university')}>University Dashboard</button>
      </div>

      {msg && <div className="card" style={{ background: '#f0fdf4', border: '1px solid #16a34a' }}><p style={{ color: '#16a34a', fontWeight: 600, margin: 0 }}>{msg}</p></div>}
      {error && <div className="card"><div className="error-msg">{error}</div></div>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* ── LEFT PANEL: CATEGORY ASSIGNMENT MATRIX ────────────────────── */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Category Assignments</h3>
          <p style={{ color: GS.muted, fontSize: '0.82rem', marginBottom: '1.25rem' }}>Select a category to view and customize its colorful template design.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {templates.map((tmpl) => {
              const assignedKey = assignments[tmpl.category] || tmpl.template_key;
              const isSelected = selectedCategory === tmpl.category;

              return (
                <div
                  key={tmpl.id || tmpl.template_key}
                  onClick={() => {
                    setSelectedCategory(tmpl.category);
                    setSelectedTemplateKey(assignedKey);
                  }}
                  style={{
                    background: isSelected ? '#0a0a0a' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0a0a0a',
                    border: `1.5px solid ${isSelected ? '#0a0a0a' : '#e2e8f0'}`,
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{tmpl.category}</div>
                  <div style={{ fontSize: '0.75rem', color: isSelected ? '#e2e8f0' : GS.muted, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: tmpl.primary_color, display: 'inline-block' }} />
                    {tmpl.template_name.split('(')[1]?.replace(')', '') || tmpl.template_name}
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #333333' }}>
                      <label style={{ fontSize: '0.72rem', color: '#ffffff', display: 'block', marginBottom: '0.3rem' }}>Assign Template:</label>
                      <select
                        value={assignedKey}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          setSelectedTemplateKey(newKey);
                          handleSaveAssignment(tmpl.category, newKey);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={saving}
                        style={{ width: '100%', borderRadius: '25px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#ffffff', color: '#0a0a0a' }}
                      >
                        {templates.map((t) => (
                          <option key={t.template_key} value={t.template_key}>
                            {t.template_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: LIVE TEMPLATE PREVIEWER ───────────────────────── */}
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Live Certificate Template Preview</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: GS.muted, fontSize: '0.85rem' }}>
                Category: <strong>{selectedCategory}</strong> • Active Style: <strong>{currentTemplate?.template_name}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn"
                onClick={() => handleSaveAssignment(selectedCategory, selectedTemplateKey)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Set as Category Default'}
              </button>
            </div>
          </div>

          {/* Color Palette Chips */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', background: '#f9f9f9', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #0a0a0a' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0a0a' }}>Design Palette:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentTemplate?.primary_color, display: 'inline-block', border: '1px solid #0a0a0a' }} />
              Primary ({currentTemplate?.primary_color})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentTemplate?.secondary_color, display: 'inline-block', border: '1px solid #0a0a0a' }} />
              Secondary ({currentTemplate?.secondary_color})
            </div>
          </div>

          {/* Rendered Template */}
          <div style={{ overflowX: 'auto', background: '#e2e8f0', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
            <CategoryCertificateTemplate
              certificate={sampleCertData}
              templatePreset={currentTemplate}
              qrCodeUrl="http://localhost:5000/uploads/qr_sample.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

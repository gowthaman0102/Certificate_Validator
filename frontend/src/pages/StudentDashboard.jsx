import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentCertificates } from '../api/client';
import CertificateTemplate from '../components/CertificateTemplate';
import { downloadCertificateAsPDF } from '../utils/certificatePdf';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff' };

const copyBtnStyle = {
  background: 'transparent', border: `1px solid ${GS.border}`, borderRadius: '0',
  color: GS.ink, fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const hiddenCertRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'STUDENT') { navigate('/student-login'); return; }
    if (user.email) {
      setUserEmail(user.email);
      setRegisterNumber(user.register_number || '');
      loadCertificates(user.email, user.register_number || '');
    } else { setLoading(false); }
  }, []);

  async function loadCertificates(email, regNumber) {
    setError(''); setLoading(true);
    try { const res = await getStudentCertificates({ email, registerNumber: regNumber }); setCertificates(Array.isArray(res.data) ? res.data : []); }
    catch { setError('Failed to load certificates'); }
    finally { setLoading(false); }
  }

  function handleLogout() { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }

  function getHiddenRef(certId) {
    if (!hiddenCertRefs.current[certId]) hiddenCertRefs.current[certId] = { current: null };
    return hiddenCertRefs.current[certId];
  }

  async function handleDownload(cert) {
    const ref = getHiddenRef(cert.id);
    await downloadCertificateAsPDF(ref, `certificate_${cert.certificate_number}`);
  }

  async function handleCopyId(certNumber) {
    try { await navigator.clipboard.writeText(certNumber); setCopiedId(certNumber); setTimeout(() => setCopiedId(''), 1500); }
    catch { alert('Certificate ID: ' + certNumber); }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Certificates</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn" onClick={() => navigate('/analytics/student')} id="student-analytics-btn">Analytics</button>
          <button className="btn" onClick={() => navigate('/wallet')} id="student-open-wallet-btn">My Wallet</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card">
        <p style={{ color: GS.muted, fontSize: '0.9rem' }}>
          Showing certificates issued to <strong style={{ color: GS.ink }}>{userEmail}</strong>
          {registerNumber ? ` / ${registerNumber}` : ''}
        </p>
        {error && <div className="error-msg" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {loading && <div className="card"><p style={{ color: GS.muted }}>Loading your certificates...</p></div>}

      {!loading && (
        <div className="card">
          <h3>Results ({certificates.length})</h3>
          {certificates.length === 0 && (
            <p style={{ color: GS.muted }}>No certificates found for your email.</p>
          )}
          <div className="cert-list">
            {certificates.map((cert) => (
              <div key={cert.id} style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: GS.ink }}>{cert.student_name}</div>
                  <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{cert.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem 1.5rem', background: GS.bg, border: `1px solid ${GS.border}`, padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div><span style={{ color: GS.muted }}>Course</span><br /><strong style={{ color: GS.ink }}>{cert.course}</strong></div>
                  <div><span style={{ color: GS.muted }}>Duration</span><br /><strong style={{ color: GS.ink }}>{cert.start_year} - {cert.end_year}</strong></div>
                  <div>
                    <span style={{ color: GS.muted }}>Certificate ID</span><br />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ color: GS.ink }}>{cert.certificate_number}</strong>
                      <button onClick={() => handleCopyId(cert.certificate_number)} style={copyBtnStyle}>
                        {copiedId === cert.certificate_number ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div><span style={{ color: GS.muted }}>Issue Date</span><br /><strong style={{ color: GS.ink }}>{cert.issue_date}</strong></div>
                  <div><span style={{ color: GS.muted }}>Issuing University</span><br /><strong style={{ color: GS.ink }}>{cert.university_name || cert.issuer_id || '—'}</strong></div>
                  <div><span style={{ color: GS.muted }}>Student Email</span><br /><strong style={{ color: GS.ink }}>{cert.student_email}</strong></div>
                </div>
                <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center', marginBottom: '-280px' }}>
                    <CertificateTemplate certificate={cert} qrCodeUrl={`http://localhost:5000/uploads/qr_${cert.id}.png`} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button className="btn" onClick={() => handleDownload(cert)}>Download Certificate PDF</button>
                  {cert.file_path && (
                    <a href={`http://localhost:5000${cert.file_path}`} target="_blank" rel="noreferrer"
                      style={{ marginLeft: '1rem', color: GS.ink, fontSize: '0.85rem', fontWeight: 500, textDecoration: 'underline' }}>
                      View Original PDF
                    </a>
                  )}
                </div>
                <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '800px', zIndex: -1, pointerEvents: 'none' }}>
                  <CertificateTemplate ref={getHiddenRef(cert.id)} certificate={cert} qrCodeUrl={`http://localhost:5000/uploads/qr_${cert.id}.png`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;

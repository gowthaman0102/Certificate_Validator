import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCertificatesByEmail } from '../api/client';
import CertificateTemplate from '../components/CertificateTemplate';
import { downloadCertificateAsPDF } from '../utils/certificatePdf';

function StudentDashboard() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const hiddenCertRefs = useRef({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setUserEmail(user.email);
      loadCertificates(user.email);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadCertificates(email) {
    setError('');
    setLoading(true);
    try {
      const res = await getCertificatesByEmail(email);
      setCertificates(res.data);
    } catch (err) {
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  function getHiddenRef(certId) {
    if (!hiddenCertRefs.current[certId]) {
      hiddenCertRefs.current[certId] = { current: null };
    }
    return hiddenCertRefs.current[certId];
  }

  async function handleDownload(cert) {
    const ref = getHiddenRef(cert.id);
    await downloadCertificateAsPDF(ref, `certificate_${cert.certificate_number}`);
  }

  async function handleCopyId(certNumber) {
    try {
      await navigator.clipboard.writeText(certNumber);
      setCopiedId(certNumber);
      setTimeout(() => setCopiedId(''), 1500);
    } catch (err) {
      alert('Could not copy to clipboard. Certificate ID: ' + certNumber);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Certificates</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="card">
        <p style={{color: '#3d4a5c', fontSize: '0.9rem'}}>
          Showing certificates issued to <strong>{userEmail}</strong>
        </p>
        {error && <div className="error-msg" style={{marginTop: '1rem'}}>{error}</div>}
      </div>

      {loading && (
        <div className="card">
          <p style={{color: '#7a8699'}}>Loading your certificates...</p>
        </div>
      )}

      {!loading && (
        <div className="card">
          <h3>Results ({certificates.length})</h3>
          {certificates.length === 0 && (
            <p style={{color: '#7a8699'}}>
              No certificates found for your email. If your university has issued you a certificate,
              make sure you registered with the same email address they used.
            </p>
          )}
          <div className="cert-list">
            {certificates.map((cert) => (
              <div key={cert.id} style={{background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '6px', padding: '1.25rem'}}>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'}}>
                  <div style={{fontSize: '1.05rem', fontWeight: 600, color: '#1e2b3a'}}>{cert.student_name}</div>
                  <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>
                    {cert.status}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.6rem 1.5rem',
                  background: '#ffffff',
                  border: '1px solid #d8dde4',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                }}>
                  <div><span style={{color: '#7a8699'}}>Course</span><br /><strong style={{color: '#1e2b3a'}}>{cert.course}</strong></div>
                  <div><span style={{color: '#7a8699'}}>Duration</span><br /><strong style={{color: '#1e2b3a'}}>{cert.start_year} - {cert.end_year}</strong></div>
                  <div>
                    <span style={{color: '#7a8699'}}>Certificate ID</span><br />
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                      <strong style={{color: '#1e2b3a'}}>{cert.certificate_number}</strong>
                      <button
                        onClick={() => handleCopyId(cert.certificate_number)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #d8dde4',
                          borderRadius: '3px',
                          color: '#0f2540',
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === cert.certificate_number ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div><span style={{color: '#7a8699'}}>Issue Date</span><br /><strong style={{color: '#1e2b3a'}}>{cert.issue_date}</strong></div>
                  <div><span style={{color: '#7a8699'}}>Issuing University</span><br /><strong style={{color: '#1e2b3a'}}>{cert.university_name || cert.issuer_id || '—'}</strong></div>
                  <div><span style={{color: '#7a8699'}}>Student Email</span><br /><strong style={{color: '#1e2b3a'}}>{cert.student_email}</strong></div>
                </div>

                <div style={{overflowX: 'auto', display: 'flex', justifyContent: 'center'}}>
                  <div style={{transform: 'scale(0.5)', transformOrigin: 'top center', marginBottom: '-280px'}}>
                    <CertificateTemplate
                      certificate={cert}
                      qrCodeUrl={`http://localhost:5000/uploads/qr_${cert.id}.png`}
                    />
                  </div>
                </div>

                <div style={{textAlign: 'center', marginTop: '1rem'}}>
                  <button className="btn-primary" onClick={() => handleDownload(cert)}>Download Certificate PDF</button>
                  {cert.file_path && (
                    <a href={`http://localhost:5000${cert.file_path}`} target="_blank" rel="noreferrer" style={{marginLeft: '1rem', color: '#0f2540', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'underline'}}>
                      View Original PDF
                    </a>
                  )}
                </div>

                <div style={{position: 'absolute', left: '-9999px', top: 0}}>
                  <CertificateTemplate
                    ref={getHiddenRef(cert.id)}
                    certificate={cert}
                    qrCodeUrl={`http://localhost:5000/uploads/qr_${cert.id}.png`}
                  />
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

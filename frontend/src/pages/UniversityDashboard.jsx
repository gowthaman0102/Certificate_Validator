import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyUniversity, createUniversity, uploadCertificate,
  bulkUploadCertificates, getCertificatesByUniversity, revokeCertificate,
} from '../api/client';
import CertificateTemplate from '../components/CertificateTemplate';
import { downloadCertificateAsPDF } from '../utils/certificatePdf';
import { parseCertificateExcel } from '../utils/excelParser';
import { CATEGORIES, NEEDS_DETAIL } from '../utils/certificateCategory';
import UniversityDashboardDecorations from '../components/UniversityDashboardDecorations';

const GS = {
  ink:    '#0a0a0a',
  muted:  '#666666',
  subtle: '#999999',
  border: '#0a0a0a',
  bg:     '#ffffff',
  mid:    '#8c8c8c',
};

const copyBtnStyle = {
  background: 'transparent',
  border: `1px solid ${GS.border}`,
  borderRadius: '0',
  color: GS.ink,
  fontSize: '0.7rem',
  padding: '1px 6px',
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};

function UniversityDashboard() {
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uniName, setUniName] = useState('');
  const [issuerCode, setIssuerCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [course, setCourse] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [file, setFile] = useState(null);
  const [certCategory, setCertCategory] = useState(CATEGORIES[0].value);
  const [certDetail, setCertDetail] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkError, setBulkError] = useState('');
  const hiddenCertRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'UNIVERSITY') { navigate('/university-login'); return; }
    loadUniversity();
  }, []);

  async function loadUniversity() {
    setLoading(true);
    try {
      const res = await getMyUniversity();
      setUniversity(res.data);
      loadCertificates(res.data.id);
    } catch { setUniversity(null); }
    finally { setLoading(false); }
  }

  async function loadCertificates(universityId) {
    try { const res = await getCertificatesByUniversity(universityId); setCertificates(res.data); }
    catch (err) { console.error(err); }
  }

  async function handleCreateUniversity(e) {
    e.preventDefault(); setError(''); setCreating(true);
    try { await createUniversity({ name: uniName, issuer_code: issuerCode }); await loadUniversity(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to create university profile'); }
    finally { setCreating(false); }
  }

  async function handleIssueCertificate(e) {
    e.preventDefault(); setError(''); setIssuing(true); setLastIssued(null);
    try {
      const formData = new FormData();
      formData.append('student_name', studentName);
      formData.append('register_number', registerNumber);
      if (studentEmail) formData.append('student_email', studentEmail);
      formData.append('course', course);
      formData.append('cgpa', cgpa);
      if (startYear) formData.append('start_year', startYear);
      formData.append('end_year', endYear);
      formData.append('issue_date', issueDate);
      formData.append('certificate_category', certCategory);
      if (certDetail.trim()) formData.append('certificate_detail', certDetail.trim());
      if (file) formData.append('file', file);
      const res = await uploadCertificate(formData);
      setLastIssued(res.data.certificate);
      setStudentName(''); setRegisterNumber(''); setStudentEmail(''); setCourse('');
      setCgpa(''); setStartYear(''); setEndYear(''); setIssueDate('');
      setFile(null); setCertCategory(CATEGORIES[0].value); setCertDetail('');
      loadCertificates(university.id);
    } catch (err) { setError(err.response?.data?.error || 'Failed to issue certificate'); }
    finally { setIssuing(false); }
  }

  async function handleRevoke(certificateId) {
    if (!confirm('Are you sure you want to revoke this certificate?')) return;
    try { await revokeCertificate({ certificate_id: certificateId, reason: 'Revoked by issuer' }); loadCertificates(university.id); }
    catch (err) { alert(err.response?.data?.error || 'Failed to revoke certificate'); }
  }

  function handleLogout() { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }

  async function handleDownloadPdf() {
    if (!lastIssued) return;
    await downloadCertificateAsPDF(hiddenCertRef, `certificate_${lastIssued.certificate_number}`);
  }

  async function handleCopyId(certNumber) {
    try { await navigator.clipboard.writeText(certNumber); setCopiedId(certNumber); setTimeout(() => setCopiedId(''), 1500); }
    catch { alert('Certificate ID: ' + certNumber); }
  }

  function handleBulkFileChange(e) {
    const f = e.target.files[0];
    if (f) { setBulkFile(f); setBulkResults(null); setBulkError(''); }
  }

  async function handleBulkIssue() {
    if (!bulkFile) return;
    setBulkError(''); setBulkResults(null); setBulkProcessing(true);
    try {
      const rows = await parseCertificateExcel(bulkFile);
      if (rows.length === 0) { setBulkError('No data rows found in the spreadsheet.'); return; }
      const res = await bulkUploadCertificates(rows);
      setBulkResults(res.data);
      loadCertificates(university.id);
    } catch (err) { setBulkError(err.response?.data?.error || err.message || 'Bulk issuance failed'); }
    finally { setBulkProcessing(false); }
  }

  if (loading) return <div className="dashboard"><p style={{ color: GS.muted }}>Loading...</p></div>;

  if (!university) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Set Up Your University</h2>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreateUniversity}>
            <label>University Name</label>
            <input value={uniName} onChange={(e) => setUniName(e.target.value)} required />
            <label>Issuer Code (unique, e.g. UNI001)</label>
            <input value={issuerCode} onChange={(e) => setIssuerCode(e.target.value)} required />
            <button className="btn" type="submit" disabled={creating} style={{ marginTop: '1rem' }}>
              {creating ? 'Creating...' : 'Create University Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <UniversityDashboardDecorations />
      <div className="dashboard-header">
        <h2>{university.name}</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => navigate('/analytics/university')} id="university-analytics-btn">Analytics</button>
          <button className="btn" onClick={() => navigate('/analytics/verification')} id="university-verification-analytics-btn">Verification Stats</button>
          <button className="btn" onClick={() => navigate('/audit')} id="university-audit-btn">Audit Logs</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card">
        <h3>University Info</h3>
        <p><strong>Issuer Code:</strong> {university.issuer_code}</p>
        <p><strong>University ID:</strong> {university.id}</p>
      </div>

      <div className="card">
        <h3>Issue New Certificate</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleIssueCertificate}>
          <label>Student Name</label>
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
          <label>Register Number</label>
          <input value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} required placeholder="e.g. 21CS1042" />
          <label>Student Email (optional)</label>
          <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.com" />
          <label>Department / Course</label>
          <input value={course} onChange={(e) => setCourse(e.target.value)} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><label>CGPA</label><input value={cgpa} onChange={(e) => setCgpa(e.target.value)} required placeholder="8.7" /></div>
            <div style={{ flex: 1 }}><label>Start Year (optional)</label><input type="number" min="1950" max="2100" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="2022" /></div>
            <div style={{ flex: 1 }}><label>Year of Passing</label><input type="number" min="1950" max="2100" value={endYear} onChange={(e) => setEndYear(e.target.value)} required placeholder="2026" /></div>
          </div>
          <label>Issue Date</label>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          <label>Certificate Category</label>
          <select value={certCategory} onChange={(e) => { setCertCategory(e.target.value); setCertDetail(''); }} required id="cert-category-select">
            {CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          {NEEDS_DETAIL.has(certCategory) && (
            <>
              <label>Certificate Detail <span style={{ color: GS.ink }}>*</span></label>
              <input value={certDetail} onChange={(e) => setCertDetail(e.target.value)}
                placeholder={{
                  'Course Completion Certificate': 'e.g. Full Stack Web Development',
                  'Internship Completion Certificate': 'e.g. Software Development Internship',
                  'Project Completion Certificate': 'e.g. Smart Attendance System',
                  'Participation Certificate': 'e.g. National Hackathon',
                  'Bonafide Certificate': 'e.g. Higher Studies',
                }[certCategory] || 'Enter detail'}
                required id="cert-detail-input"
              />
            </>
          )}
          <label>Certificate PDF (optional)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn" type="submit" disabled={issuing} style={{ marginTop: '1rem' }}>
            {issuing ? 'Issuing...' : 'Issue Certificate'}
          </button>
        </form>

        {lastIssued && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ marginBottom: '1rem', color: GS.ink, textAlign: 'center', fontWeight: 600 }}>✓ Certificate issued successfully!</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: GS.ink }}>Certificate ID: <strong>{lastIssued.certificate_number}</strong></span>
              <button style={copyBtnStyle} onClick={() => handleCopyId(lastIssued.certificate_number)}>
                {copiedId === lastIssued.certificate_number ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
            <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', marginBottom: '-250px' }}>
                <CertificateTemplate certificate={lastIssued} qrCodeUrl={`http://localhost:5000${lastIssued.qr_code_url}`} />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn" onClick={handleDownloadPdf}>Download Certificate PDF</button>
            </div>
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              <CertificateTemplate ref={hiddenCertRef} certificate={lastIssued} qrCodeUrl={`http://localhost:5000${lastIssued.qr_code_url}`} />
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Bulk Issue Certificates</h3>
        <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
          Upload an Excel file (.xlsx) with columns: Register Number, Name, Department / Course, CGPA, Year of Passing.
          Certificate Category and Certificate Detail are optional columns. Start Year, Email, and Issue Date are also optional.
        </p>
        <input type="file" accept=".xlsx,.xls" onChange={handleBulkFileChange} />
        <div style={{ marginTop: '1rem' }}>
          <button className="btn" onClick={handleBulkIssue} disabled={!bulkFile || bulkProcessing}>
            {bulkProcessing ? 'Processing...' : 'Issue Certificates from Excel'}
          </button>
        </div>
        {bulkError && <div className="error-msg" style={{ marginTop: '1rem' }}>{bulkError}</div>}
        {bulkResults && (
          <div style={{ marginTop: '1rem', background: GS.bg, border: `1px solid ${GS.border}`, padding: '1rem', fontSize: '0.85rem' }}>
            <p style={{ fontWeight: 600, color: GS.ink, marginBottom: '0.5rem' }}>Bulk Upload Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.4rem 1rem' }}>
              <div><span style={{ color: GS.muted }}>Total Rows:</span> <strong>{bulkResults.total}</strong></div>
              <div><span style={{ color: GS.muted }}>Issued:</span> <strong>{bulkResults.succeeded}</strong></div>
              <div><span style={{ color: GS.muted }}>Skipped:</span> <strong>{bulkResults.skipped_restricted ?? 0}</strong></div>
              <div><span style={{ color: GS.muted }}>Failed:</span> <strong>{bulkResults.failed}</strong></div>
            </div>
            <p style={{ marginTop: '0.5rem', color: GS.muted }}>{bulkResults.message}</p>
            {bulkResults.results?.filter(r => !r.success).map((r, i) => (
              <div key={i} style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: GS.ink }}>Row {r.row} ({r.register_number}): {r.error}</div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Issued Certificates ({certificates.length})</h3>
        <div className="cert-list">
          {certificates.length === 0 && <p style={{ color: GS.muted }}>No certificates issued yet.</p>}
          {certificates.map((cert) => (
            <div className="cert-item" key={cert.id}>
              <div>
                <strong>{cert.student_name}</strong> — {cert.course}
                <div style={{ fontSize: '0.8rem', color: GS.muted, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2px' }}>
                  <span>{cert.certificate_number}</span>
                  <button onClick={() => handleCopyId(cert.certificate_number)} style={copyBtnStyle}>
                    {copiedId === cert.certificate_number ? 'Copied!' : 'Copy'}
                  </button>
                  <span>| Reg: {cert.register_number} | {cert.end_year}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{cert.status}</span>
                {cert.status === 'VALID' && (
                  <button className="btn-secondary" onClick={() => handleRevoke(cert.id)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>Revoke</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UniversityDashboard;

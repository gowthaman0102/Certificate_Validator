import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyUniversity,
  createUniversity,
  uploadCertificate,
  bulkUploadCertificates,
  getCertificatesByUniversity,
  revokeCertificate,
} from '../api/client';
import CertificateTemplate from '../components/CertificateTemplate';
import { downloadCertificateAsPDF } from '../utils/certificatePdf';
import { parseCertificateExcel } from '../utils/excelParser';
import { CATEGORIES, NEEDS_DETAIL } from '../utils/certificateCategory';

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
  const [certDetail, setCertDetail]     = useState('');
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
    if (!token || user.role !== 'UNIVERSITY') {
      navigate('/university-login');
      return;
    }
    loadUniversity();
  }, []);

  async function loadUniversity() {
    setLoading(true);
    try {
      const res = await getMyUniversity();
      setUniversity(res.data);
      loadCertificates(res.data.id);
    } catch (err) {
      setUniversity(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadCertificates(universityId) {
    try {
      const res = await getCertificatesByUniversity(universityId);
      setCertificates(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateUniversity(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await createUniversity({ name: uniName, issuer_code: issuerCode });
      await loadUniversity();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create university profile');
    } finally {
      setCreating(false);
    }
  }

  async function handleIssueCertificate(e) {
    e.preventDefault();
    setError('');
    setIssuing(true);
    setLastIssued(null);
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
      setStudentName('');
      setRegisterNumber('');
      setStudentEmail('');
      setCourse('');
      setCgpa('');
      setStartYear('');
      setEndYear('');
      setIssueDate('');
      setFile(null);
      setCertCategory(CATEGORIES[0].value);
      setCertDetail('');
      loadCertificates(university.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue certificate');
    } finally {
      setIssuing(false);
    }
  }

  async function handleRevoke(certificateId) {
    if (!confirm('Are you sure you want to revoke this certificate?')) return;
    try {
      await revokeCertificate({ certificate_id: certificateId, reason: 'Revoked by issuer' });
      loadCertificates(university.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke certificate');
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  async function handleDownloadPdf() {
    if (!lastIssued) return;
    await downloadCertificateAsPDF(hiddenCertRef, `certificate_${lastIssued.certificate_number}`);
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

  function handleBulkFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setBulkFile(f);
      setBulkResults(null);
      setBulkError('');
    }
  }

  async function handleBulkIssue() {
    if (!bulkFile) return;
    setBulkError('');
    setBulkResults(null);
    setBulkProcessing(true);
    try {
      const rows = await parseCertificateExcel(bulkFile);
      if (rows.length === 0) {
        setBulkError('No data rows found in the spreadsheet.');
        return;
      }
      const res = await bulkUploadCertificates(rows);
      setBulkResults(res.data);
      loadCertificates(university.id);
    } catch (err) {
      setBulkError(err.response?.data?.error || err.message || 'Bulk issuance failed');
    } finally {
      setBulkProcessing(false);
    }
  }

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>;
  }

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
            <button className="btn-primary" type="submit" disabled={creating} style={{marginTop: '1rem'}}>
              {creating ? 'Creating...' : 'Create University Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{university.name}</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/analytics/university')}
            id="university-analytics-btn"
          >
            Analytics
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/analytics/verification')}
            id="university-verification-analytics-btn"
          >
            Verification Stats
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/audit')}
            id="university-audit-btn"
          >
            Audit Logs
          </button>
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
          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label>CGPA</label>
              <input value={cgpa} onChange={(e) => setCgpa(e.target.value)} required placeholder="8.7" />
            </div>
            <div style={{flex: 1}}>
              <label>Start Year (optional)</label>
              <input type="number" min="1950" max="2100" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="2022" />
            </div>
            <div style={{flex: 1}}>
              <label>Year of Passing</label>
              <input type="number" min="1950" max="2100" value={endYear} onChange={(e) => setEndYear(e.target.value)} required placeholder="2026" />
            </div>
          </div>
          <label>Issue Date</label>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />

          <label>Certificate Category</label>
          <select
            value={certCategory}
            onChange={(e) => { setCertCategory(e.target.value); setCertDetail(''); }}
            required
            id="cert-category-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {NEEDS_DETAIL.has(certCategory) && (
            <>
              <label>Certificate Detail <span style={{ color: '#a02622' }}>*</span></label>
              <input
                value={certDetail}
                onChange={(e) => setCertDetail(e.target.value)}
                placeholder={{
                  'Course Completion Certificate':     'e.g. Full Stack Web Development, Data Science',
                  'Internship Completion Certificate': 'e.g. Software Development Internship',
                  'Project Completion Certificate':    'e.g. Smart Attendance System',
                  'Participation Certificate':         'e.g. National Hackathon, Workshop on AI',
                  'Bonafide Certificate':              'e.g. Higher Studies, Passport Application',
                }[certCategory] || 'Enter detail'}
                required
                id="cert-detail-input"
              />
            </>
          )}

          <label>Certificate PDF (optional)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn-primary" type="submit" disabled={issuing} style={{marginTop: '1rem'}}>
            {issuing ? 'Issuing...' : 'Issue Certificate'}
          </button>
        </form>

        {lastIssued && (
          <div style={{marginTop: '1.5rem'}}>
            <p style={{marginBottom: '1rem', color: '#1e6b34', textAlign: 'center'}}>Certificate issued successfully!</p>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem'}}>
              <span style={{fontSize: '0.9rem', color: '#3d4a5c'}}>Certificate ID: <strong>{lastIssued.certificate_number}</strong></span>
              <button className="btn-danger" onClick={() => handleCopyId(lastIssued.certificate_number)} style={{fontSize: '0.75rem', padding: '4px 10px'}}>
                {copiedId === lastIssued.certificate_number ? 'Copied!' : 'Copy ID'}
              </button>
            </div>

            <div style={{overflowX: 'auto', display: 'flex', justifyContent: 'center'}}>
              <div style={{transform: 'scale(0.55)', transformOrigin: 'top center', marginBottom: '-250px'}}>
                <CertificateTemplate
                  certificate={lastIssued}
                  qrCodeUrl={`http://localhost:5000${lastIssued.qr_code_url}`}
                />
              </div>
            </div>
            <div style={{textAlign: 'center', marginTop: '1rem'}}>
              <button className="btn-primary" onClick={handleDownloadPdf}>Download Certificate PDF</button>
            </div>

            <div style={{position: 'absolute', left: '-9999px', top: 0}}>
              <CertificateTemplate
                ref={hiddenCertRef}
                certificate={lastIssued}
                qrCodeUrl={`http://localhost:5000${lastIssued.qr_code_url}`}
              />
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Bulk Issue Certificates</h3>
        <p style={{color: '#7a8699', fontSize: '0.85rem', marginBottom: '1rem'}}>
          Upload an Excel file (.xlsx) with columns in any order: Register Number, Name, Department / Course,
          CGPA, Year of Passing. <strong>Certificate Category</strong> and <strong>Certificate Detail</strong> are
          new optional columns — if omitted, category defaults to "Course Completion Certificate".
          Start Year, Email, and Issue Date columns are also optional.
        </p>
        <input type="file" accept=".xlsx,.xls" onChange={handleBulkFileChange} />
        <div style={{marginTop: '1rem'}}>
          <button className="btn-primary" onClick={handleBulkIssue} disabled={!bulkFile || bulkProcessing}>
            {bulkProcessing ? 'Processing...' : 'Issue Certificates from Excel'}
          </button>
        </div>
        {bulkError && <div className="error-msg" style={{marginTop: '1rem'}}>{bulkError}</div>}
        {bulkResults && (
          <div style={{ marginTop: '1rem', background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '6px', padding: '1rem', fontSize: '0.85rem' }}>
            <p style={{ fontWeight: 600, color: '#1e2b3a', marginBottom: '0.5rem' }}>Bulk Upload Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.4rem 1rem' }}>
              <div><span style={{ color: '#7a8699' }}>Total Rows:</span> <strong>{bulkResults.total}</strong></div>
              <div><span style={{ color: '#7a8699' }}>Issued:</span> <strong style={{ color: '#1e6b34' }}>{bulkResults.succeeded}</strong></div>
              <div><span style={{ color: '#7a8699' }}>Skipped (duplicate restricted):</span> <strong style={{ color: '#c9a227' }}>{bulkResults.skipped_restricted ?? 0}</strong></div>
              <div><span style={{ color: '#7a8699' }}>Failed:</span> <strong style={{ color: '#a02622' }}>{bulkResults.failed}</strong></div>
            </div>
            <p style={{ marginTop: '0.5rem', color: '#7a8699' }}>{bulkResults.message}</p>
            {bulkResults.results?.filter(r => !r.success).map((r, i) => (
              <div key={i} style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#a02622' }}>
                Row {r.row} ({r.register_number}): {r.error}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Issued Certificates ({certificates.length})</h3>
        <div className="cert-list">
          {certificates.length === 0 && <p style={{color: '#7a8699'}}>No certificates issued yet.</p>}
          {certificates.map((cert) => (
            <div className="cert-item" key={cert.id}>
              <div>
                <strong>{cert.student_name}</strong> - {cert.course}
                <div style={{fontSize: '0.8rem', color: '#7a8699', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap'}}>
                  <span>{cert.certificate_number}</span>
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
                  <span>| Reg: {cert.register_number} | {cert.end_year}</span>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>
                  {cert.status}
                </span>
                {cert.status === 'VALID' && (
                  <button className="btn-danger" onClick={() => handleRevoke(cert.id)}>Revoke</button>
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

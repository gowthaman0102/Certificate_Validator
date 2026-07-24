import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchStudentAnalytics } from '../api/analytics';
import StudentAnalyticsDecorations from '../components/decorations/StudentAnalyticsDecorations';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };
const tooltipStyle = { background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '0', fontSize: '0.8rem', color: GS.ink };

function StatBox({ label, value }) {
  return (
    <div style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 400, color: GS.ink, fontFamily: "'Prata', serif", lineHeight: 1, marginBottom: '4px' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.78rem', color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

function StudentAnalytics() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'STUDENT') { navigate('/student-login'); return; }
    loadData();
  }, []); // eslint-disable-line

  async function loadData() {
    setLoading(true); setError('');
    try { const res = await fetchStudentAnalytics(); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || 'Failed to load analytics'); }
    finally { setLoading(false); }
  }

  function handleLogout() { localStorage.clear(); navigate('/'); }

  function handleExcel() {
    if (!data) return; setExporting('excel');
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Metric', 'Value'], ['Total Certificates', data.summary.total], ['Valid', data.summary.valid_count], ['Revoked', data.summary.revoked_count], ['Universities', data.summary.universities], [], ['Wallet Downloads', data.walletStats.downloads], ['Wallet Shares', data.walletStats.shares], ['Wallet Verifications', data.walletStats.verifications]]), 'Summary');
      if (data.certificates?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.certificates.map(c => ({ 'Certificate No': c.certificate_number, Student: c.student_name, Course: c.course, University: c.university_name, Status: c.status, 'Issue Date': c.issue_date, 'Issued At': c.created_at }))), 'Certificates');
      XLSX.writeFile(wb, `student_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
    } finally { setExporting(''); }
  }

  async function handlePdf() {
    if (!pageRef.current) return; setExporting('pdf');
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 1.5, useCORS: true, backgroundColor: GS.bg });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let y = 0; const pageH = pdf.internal.pageSize.getHeight();
      while (y < pdfH) { if (y > 0) pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, -y, pdfW, pdfH); y += pageH; }
      pdf.save(`student_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(''); }
  }

  function fmt(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } }

  if (loading) return (
    <div className="dashboard">
      <div className="dashboard-header"><h2>My Analytics</h2></div>
      <div className="card"><p style={{ color: GS.muted }}>Loading analytics…</p></div>
    </div>
  );

  return (
    <div className="dashboard" ref={pageRef}>
      <StudentAnalyticsDecorations />
      <div className="dashboard-header">
        <h2>My Analytics</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleExcel} disabled={!!exporting} id="sanalytics-excel-btn">{exporting === 'excel' ? 'Exporting…' : 'Export Excel'}</button>
          <button className="btn" onClick={handlePdf} disabled={!!exporting} id="sanalytics-pdf-btn">{exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}</button>
          <button className="btn-secondary" onClick={() => navigate('/student')} id="sanalytics-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="sanalytics-logout-btn">Logout</button>
        </div>
      </div>
      {error && <div className="card"><div className="error-msg">{error}</div></div>}
      {data?.summary && (
        <div className="card">
          <h3>Certificate Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Total Certificates" value={data.summary.total} />
            <StatBox label="Valid" value={data.summary.valid_count} />
            <StatBox label="Revoked" value={data.summary.revoked_count} />
            <StatBox label="Universities" value={data.summary.universities} />
          </div>
        </div>
      )}
      {data?.walletStats && (
        <div className="card">
          <h3>Wallet Activity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Downloads" value={data.walletStats.downloads} />
            <StatBox label="Shares" value={data.walletStats.shares} />
            <StatBox label="Verifications" value={data.walletStats.verifications} />
          </div>
        </div>
      )}
      {data?.timeline?.length > 0 && (
        <div className="card">
          <h3>Certificate Receipt Timeline</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.timeline} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: GS.muted }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Certificates" fill="#0a0a0a" maxBarSize={38} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {data?.certificates?.length > 0 && (
        <div className="card">
          <h3>All Certificates ({data.certificates.length})</h3>
          <div className="cert-list">
            {data.certificates.map(cert => (
              <div key={cert.id} style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.9rem' }}>{cert.course}</div>
                  <div style={{ fontSize: '0.8rem', color: GS.muted }}>{cert.university_name} · {cert.certificate_number}</div>
                  <div style={{ fontSize: '0.78rem', color: GS.subtle, marginTop: '2px' }}>Issued: {fmt(cert.issue_date)}</div>
                </div>
                <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{cert.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {data?.certificates?.length === 0 && (
        <div className="card"><p style={{ color: GS.muted }}>No certificates found for your account.</p></div>
      )}
    </div>
  );
}

export default StudentAnalytics;

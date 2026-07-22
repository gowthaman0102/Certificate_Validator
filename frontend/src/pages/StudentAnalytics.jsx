/**
 * StudentAnalytics.jsx
 *
 * Analytics dashboard for STUDENT role.
 * Shows certificate stats, timeline LineChart, and wallet activity.
 * Follows exact same .dashboard / .card layout as StudentDashboard.jsx.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchStudentAnalytics } from '../api/analytics';

const tooltipStyle = {
  background: '#ffffff', border: '1px solid #d8dde4',
  borderRadius: '4px', fontSize: '0.8rem', color: '#1e2b3a',
};

function StatBox({ label, value, colour }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #d8dde4', borderRadius: '6px', padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colour || '#0f2540', fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1, marginBottom: '4px' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.78rem', color: '#7a8699' }}>{label}</div>
    </div>
  );
}

function StudentAnalytics() {
  const navigate  = useNavigate();
  const pageRef   = useRef(null);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'STUDENT') { navigate('/student-login'); return; }
    loadData();
  }, []); // eslint-disable-line

  async function loadData() {
    setLoading(true); setError('');
    try {
      const res = await fetchStudentAnalytics();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally { setLoading(false); }
  }

  function handleLogout() { localStorage.clear(); navigate('/'); }

  function handleExcel() {
    if (!data) return;
    setExporting('excel');
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ['Metric', 'Value'],
        ['Total Certificates', data.summary.total],
        ['Valid', data.summary.valid_count],
        ['Revoked', data.summary.revoked_count],
        ['Universities', data.summary.universities],
        [], ['Wallet Downloads', data.walletStats.downloads],
        ['Wallet Shares', data.walletStats.shares],
        ['Wallet Verifications', data.walletStats.verifications],
      ]), 'Summary');
      if (data.certificates?.length) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
          data.certificates.map(c => ({
            'Certificate No': c.certificate_number, Student: c.student_name,
            Course: c.course, University: c.university_name,
            Status: c.status, 'Issue Date': c.issue_date, 'Issued At': c.created_at,
          }))
        ), 'Certificates');
      }
      XLSX.writeFile(wb, `student_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
    } finally { setExporting(''); }
  }

  async function handlePdf() {
    if (!pageRef.current) return;
    setExporting('pdf');
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 1.5, useCORS: true, backgroundColor: '#eef1f5' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let y = 0;
      const pageH = pdf.internal.pageSize.getHeight();
      while (y < pdfH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -y, pdfW, pdfH);
        y += pageH;
      }
      pdf.save(`student_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(''); }
  }

  function fmt(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  if (loading) return (
    <div className="dashboard">
      <div className="dashboard-header"><h2>My Analytics</h2></div>
      <div className="card"><p style={{ color: '#7a8699' }}>Loading analytics…</p></div>
    </div>
  );

  return (
    <div className="dashboard" ref={pageRef}>

      <div className="dashboard-header">
        <h2>My Analytics</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleExcel} disabled={!!exporting} id="sanalytics-excel-btn">
            {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
          </button>
          <button className="btn-primary" onClick={handlePdf} disabled={!!exporting} id="sanalytics-pdf-btn">
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          <button className="btn-danger" onClick={() => navigate('/student')} id="sanalytics-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="sanalytics-logout-btn">Logout</button>
        </div>
      </div>

      {error && <div className="card"><div className="error-msg">{error}</div></div>}

      {/* Summary */}
      {data?.summary && (
        <div className="card">
          <h3>Certificate Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Total Certificates" value={data.summary.total}          colour="#0f2540" />
            <StatBox label="Valid"              value={data.summary.valid_count}    colour="#1e6b34" />
            <StatBox label="Revoked"            value={data.summary.revoked_count}  colour="#a02622" />
            <StatBox label="Universities"       value={data.summary.universities}   colour="#3d4a5c" />
          </div>
        </div>
      )}

      {/* Wallet activity */}
      {data?.walletStats && (
        <div className="card">
          <h3>Wallet Activity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Downloads"     value={data.walletStats.downloads}     colour="#0f2540" />
            <StatBox label="Shares"        value={data.walletStats.shares}        colour="#c9a227" />
            <StatBox label="Verifications" value={data.walletStats.verifications} colour="#3d4a5c" />
          </div>
        </div>
      )}

      {/* Certificate timeline */}
      {data?.timeline?.length > 0 && (
        <div className="card">
          <h3>Certificate Receipt Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.timeline} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8dde4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7a8699' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7a8699' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Certificates" fill="#0f2540" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Certificate list */}
      {data?.certificates?.length > 0 && (
        <div className="card">
          <h3>All Certificates ({data.certificates.length})</h3>
          <div className="cert-list">
            {data.certificates.map(cert => (
              <div key={cert.id} style={{ background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '6px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e2b3a', fontSize: '0.9rem' }}>{cert.course}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7a8699' }}>{cert.university_name} · {cert.certificate_number}</div>
                  <div style={{ fontSize: '0.78rem', color: '#7a8699', marginTop: '2px' }}>Issued: {fmt(cert.issue_date)}</div>
                </div>
                <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{cert.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.certificates?.length === 0 && (
        <div className="card">
          <p style={{ color: '#7a8699' }}>No certificates found for your account.</p>
        </div>
      )}

    </div>
  );
}

export default StudentAnalytics;

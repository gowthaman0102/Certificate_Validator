import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchUniversityAnalytics } from '../api/analytics';

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

function UniversityAnalytics() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');
  const defaultFrom = (() => { const d = new Date(); d.setMonth(d.getMonth() - 11); d.setDate(1); return d.toISOString().slice(0, 10); })();
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'UNIVERSITY') { navigate('/university-login'); return; }
    loadData();
  }, []); // eslint-disable-line

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try { const res = await fetchUniversityAnalytics({ date_from: dateFrom, date_to: dateTo }); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || 'Failed to load analytics'); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo]);

  function handleLogout() { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }

  function handleExcelExport() {
    if (!data) return; setExporting('excel');
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['University', data.university?.name], ['Issuer Code', data.university?.issuer_code], [], ['Metric', 'Value'], ['Total Certificates', data.summary.total], ['Active Certificates', data.summary.active], ['Revoked Certificates', data.summary.revoked], ['Unique Students', data.summary.students], ['Departments', data.summary.departments]]), 'Summary');
      if (data.monthly?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.monthly.map(r => ({ Month: r.month, 'Certificates Issued': r.count }))), 'Monthly Issuance');
      if (data.departments?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.departments.map(r => ({ Department: r.course, Count: r.count }))), 'Departments');
      if (data.recent?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.recent.map(r => ({ 'Certificate No': r.certificate_number, Student: r.student_name, Course: r.course, Status: r.status, 'Issued At': r.created_at }))), 'Recent Certificates');
      XLSX.writeFile(wb, `university_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
    } finally { setExporting(''); }
  }

  async function handlePdfExport() {
    if (!pageRef.current) return; setExporting('pdf');
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 1.5, useCORS: true, backgroundColor: GS.bg });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let y = 0; const pageH = pdf.internal.pageSize.getHeight();
      while (y < pdfH) { if (y > 0) pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, -y, pdfW, pdfH); y += pageH; }
      pdf.save(`university_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(''); }
  }

  function fmt(ts) { if (!ts) return '—'; try { return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return ts; } }

  if (loading) return (
    <div className="dashboard" id="univ-analytics-container">
      <AnalyticsDecorations />
      <div className="dashboard-header"><h2>University Analytics</h2></div>
      <div className="card"><p style={{ color: GS.muted }}>Loading analytics…</p></div>
    </div>
  );

  return (
    <div className="dashboard" ref={pageRef}>
      <div className="dashboard-header">
        <h2>University Analytics</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleExcelExport} disabled={!!exporting} id="analytics-excel-btn">{exporting === 'excel' ? 'Exporting…' : 'Export Excel'}</button>
          <button className="btn" onClick={handlePdfExport} disabled={!!exporting} id="analytics-pdf-btn">{exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}</button>
          <button className="btn-secondary" onClick={() => navigate('/university')} id="analytics-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="analytics-logout-btn">Logout</button>
        </div>
      </div>
      {error && <div className="card"><div className="error-msg">{error}</div></div>}
      {data?.university && (
        <div className="card">
          <p style={{ color: GS.muted, fontSize: '0.9rem' }}>Analytics for <strong style={{ color: GS.ink }}>{data.university.name}</strong> <span style={{ color: GS.subtle }}>({data.university.issuer_code})</span></p>
        </div>
      )}
      {data?.summary && (
        <div className="card">
          <h3>Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Total Issued" value={data.summary.total} />
            <StatBox label="Active" value={data.summary.active} />
            <StatBox label="Revoked" value={data.summary.revoked} />
            <StatBox label="Unique Students" value={data.summary.students} />
            <StatBox label="Departments" value={data.summary.departments} />
          </div>
        </div>
      )}
      <div className="card">
        <h3>Monthly Certificate Issuance</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div><label style={{ display: 'block', color: GS.muted, fontSize: '0.78rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} id="analytics-date-from" /></div>
          <div><label style={{ display: 'block', color: GS.muted, fontSize: '0.78rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} id="analytics-date-to" /></div>
          <button className="btn" onClick={loadData} style={{ alignSelf: 'flex-end' }} id="analytics-filter-btn">Apply Filter</button>
          <button className="btn-secondary" onClick={() => { setDateFrom(defaultFrom); setDateTo(new Date().toISOString().slice(0,10)); }} style={{ alignSelf: 'flex-end' }} id="analytics-reset-btn">Reset</button>
        </div>
        {data?.monthly?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GS.mid} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: GS.muted }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Certificates Issued" fill={GS.ink} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: GS.muted }}>No issuance data for the selected date range.</p>}
      </div>
      {data?.departments?.length > 0 && (
        <div className="card">
          <h3>Top Departments / Courses</h3>
          <ResponsiveContainer width="100%" height={Math.max(180, data.departments.length * 36)}>
            <BarChart data={data.departments} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GS.mid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: GS.muted }} allowDecimals={false} />
              <YAxis type="category" dataKey="course" width={130} tick={{ fontSize: 11, fill: GS.muted }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Certificates" fill={GS.mid} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {data?.recent?.length > 0 && (
        <div className="card">
          <h3>Recent Certificates (Last 10)</h3>
          <div className="cert-list">
            {data.recent.map(cert => (
              <div key={cert.id} style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.9rem' }}>{cert.student_name}</div>
                  <div style={{ fontSize: '0.8rem', color: GS.muted }}>{cert.course} · {cert.certificate_number}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: GS.subtle }}>{fmt(cert.created_at)}</span>
                  <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{cert.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data?.revocations?.length > 0 && (
        <div className="card">
          <h3>Recent Revocations</h3>
          <div className="cert-list">
            {data.revocations.map((r, i) => (
              <div key={i} style={{ background: GS.bg, border: `2px solid ${GS.border}`, padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.9rem' }}>{r.student_name}</div>
                  <div style={{ fontSize: '0.8rem', color: GS.muted }}>{r.course} · {r.certificate_number}</div>
                  <div style={{ fontSize: '0.78rem', color: GS.ink, marginTop: '2px' }}>Reason: {r.reason}</div>
                </div>
                <span style={{ fontSize: '0.78rem', color: GS.subtle }}>{fmt(r.revoked_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityAnalytics;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchVerificationAnalytics } from '../api/analytics';

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

function VerificationAnalytics() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'UNIVERSITY') { navigate('/university-login'); return; }
    loadData();
  }, []); // eslint-disable-line

  async function loadData() {
    setLoading(true); setError('');
    try { const res = await fetchVerificationAnalytics(); setData(res.data); }
    catch (err) { setError(err.response?.data?.error || 'Failed to load verification analytics'); }
    finally { setLoading(false); }
  }

  function handleLogout() { localStorage.clear(); navigate('/'); }

  function handleExcel() {
    if (!data) return; setExporting('excel');
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Metric', 'Value'], ['Total Verifications', data.summary.total], ['Valid Results', data.summary.valid_count], ['Tampered Results', data.summary.tampered_count], ['Revoked Results', data.summary.revoked_count], [], ['Auth Events', data.authSummary.total], ['Login Success', data.authSummary.login_success], ['Login Failures', data.authSummary.login_failure], ['Registrations', data.authSummary.registrations]]), 'Summary');
      if (data.monthly?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.monthly.map(r => ({ Month: r.month, Total: r.total, Valid: r.valid_count, Tampered: r.tampered_count, Revoked: r.revoked_count }))), 'Monthly Trend');
      XLSX.writeFile(wb, `verification_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
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
      pdf.save(`verification_analytics_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally { setExporting(''); }
  }

  function fmt(ts) { if (!ts) return '—'; try { return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ts; } }
  function parseDetail(raw) { try { return JSON.parse(raw); } catch { return {}; } }

  if (loading) return (
    <div className="dashboard">
      <div className="dashboard-header"><h2>Verification Analytics</h2></div>
      <div className="card"><p style={{ color: GS.muted }}>Loading analytics…</p></div>
    </div>
  );

  return (
    <div className="dashboard" ref={pageRef}>
      <div className="dashboard-header">
        <h2>Verification Analytics</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleExcel} disabled={!!exporting} id="vanalytics-excel-btn">{exporting === 'excel' ? 'Exporting…' : 'Export Excel'}</button>
          <button className="btn" onClick={handlePdf} disabled={!!exporting} id="vanalytics-pdf-btn">{exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}</button>
          <button className="btn-secondary" onClick={() => navigate('/university')} id="vanalytics-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="vanalytics-logout-btn">Logout</button>
        </div>
      </div>
      {error && <div className="card"><div className="error-msg">{error}</div></div>}
      {data?.summary && (
        <div className="card">
          <h3>Verification Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Total Verifications" value={data.summary.total} />
            <StatBox label="Valid Results" value={data.summary.valid_count} />
            <StatBox label="Tampered Attempts" value={data.summary.tampered_count} />
            <StatBox label="Revoked Certificates" value={data.summary.revoked_count} />
          </div>
        </div>
      )}
      {data?.authSummary && (
        <div className="card">
          <h3>Authentication Events</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <StatBox label="Total Auth Events" value={data.authSummary.total} />
            <StatBox label="Successful Logins" value={data.authSummary.login_success} />
            <StatBox label="Failed Logins" value={data.authSummary.login_failure} />
            <StatBox label="New Registrations" value={data.authSummary.registrations} />
          </div>
        </div>
      )}
      {data?.monthly?.length > 0 && (
        <div className="card">
          <h3>Monthly Verification Trend (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GS.mid} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: GS.muted }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              <Line type="monotone" dataKey="total" name="Total" stroke={GS.ink} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="valid_count" name="Valid" stroke={GS.mid} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tampered_count" name="Tampered" stroke={GS.ink} strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="revoked_count" name="Revoked" stroke={GS.mid} strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {data?.monthly?.length > 0 && (
        <div className="card">
          <h3>Result Breakdown by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GS.mid} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GS.muted }} />
              <YAxis tick={{ fontSize: 11, fill: GS.muted }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              <Bar dataKey="valid_count" name="Valid" fill={GS.mid} stackId="a" />
              <Bar dataKey="revoked_count" name="Revoked" fill={GS.ink} stackId="a" />
              <Bar dataKey="tampered_count" name="Tampered" fill={GS.ink} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {data?.recent?.length > 0 && (
        <div className="card">
          <h3>Recent Verification Events</h3>
          <div className="cert-list">
            {data.recent.map((row, i) => {
              const det = parseDetail(row.details);
              const result = det.result || '—';
              return (
                <div key={i} style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.88rem' }}>{row.resource_id || '—'}</div>
                    <div style={{ fontSize: '0.78rem', color: GS.muted }}>{det.student_name && `${det.student_name} · `}{det.course && `${det.course} · `}IP: {row.ip_address || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: GS.subtle }}>{fmt(row.timestamp)}</span>
                    <span className={`status-badge ${result === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{result}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationAnalytics;

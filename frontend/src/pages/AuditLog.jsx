import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuditLogs, fetchAuditStats, downloadAuditCSV } from '../api/audit';
import AuditLogDecorations from '../components/AuditLogDecorations';

const MODULES  = ['', 'AUTH', 'CERTIFICATE', 'VERIFICATION', 'REVOCATION', 'WALLET'];
const ACTIONS  = ['', 'LOGIN', 'LOGOUT', 'REGISTER', 'ISSUE', 'BULK_ISSUE', 'VERIFY', 'REVOKE', 'DOWNLOAD', 'SHARE', 'VIEW'];
const STATUSES = ['', 'SUCCESS', 'FAILURE'];
const ROLES    = ['', 'UNIVERSITY', 'STUDENT'];
const PAGE_SIZE = 25;

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

/* Grayscale badge map — black text on white for positive, white on black for negative */
const MODULE_COLOURS = {
  AUTH:         { bg: GS.bg,  color: GS.ink  },
  CERTIFICATE:  { bg: GS.ink, color: '#ffffff' },
  VERIFICATION: { bg: GS.mid, color: '#ffffff' },
  REVOCATION:   { bg: GS.ink, color: '#ffffff' },
  WALLET:       { bg: GS.bg,  color: GS.ink   },
};

const ACTION_COLOURS = {
  LOGIN:      { bg: GS.bg,  color: GS.ink  },
  LOGOUT:     { bg: GS.bg,  color: GS.muted },
  REGISTER:   { bg: GS.ink, color: '#ffffff' },
  ISSUE:      { bg: GS.ink, color: '#ffffff' },
  BULK_ISSUE: { bg: GS.ink, color: '#ffffff' },
  VERIFY:     { bg: GS.mid, color: '#ffffff' },
  REVOKE:     { bg: GS.ink, color: '#ffffff' },
  DOWNLOAD:   { bg: GS.bg,  color: GS.ink   },
  SHARE:      { bg: GS.mid, color: '#ffffff' },
  VIEW:       { bg: GS.bg,  color: GS.ink   },
};

function SmallBadge({ text, colours }) {
  const c = colours[text] || { bg: GS.bg, color: GS.ink };
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '0.2rem 0.55rem', borderRadius: '0',
      fontSize: '0.7rem', fontWeight: 600,
      letterSpacing: '0.05em', whiteSpace: 'nowrap',
      border: `1px solid ${GS.border}`,
      fontFamily: "'Inter', sans-serif",
    }}>{text}</span>
  );
}

function AuditLog() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'UNIVERSITY') { navigate('/university-login'); return; }
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadLogs(); }, [page, module, action, status, role, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadStats() {
    try { const res = await fetchAuditStats(); setStats(res.data); } catch { }
  }

  const loadLogs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (module)   params.module    = module;
      if (action)   params.action    = action;
      if (status)   params.status    = status;
      if (role)     params.role      = role;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;
      const res = await fetchAuditLogs(params);
      setRows(res.data.rows); setTotal(res.data.total); setPages(res.data.pages);
    } catch (err) { setError(err.response?.data?.error || 'Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [page, search, module, action, status, role, dateFrom, dateTo]);

  function handleSearch(e) { e.preventDefault(); setPage(1); loadLogs(); }
  function handleClear() { setSearch(''); setModule(''); setAction(''); setStatus(''); setRole(''); setDateFrom(''); setDateTo(''); setPage(1); }

  function handleExport() {
    setExporting(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (module)   params.module    = module;
      if (action)   params.action    = action;
      if (status)   params.status    = status;
      if (role)     params.role      = role;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;
      downloadAuditCSV(params);
    } finally { setTimeout(() => setExporting(false), 1500); }
  }

  function handleLogout() { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }

  async function handleCopyId(id) {
    try { await navigator.clipboard.writeText(id); setCopiedId(id); setTimeout(() => setCopiedId(''), 1500); }
    catch { alert('ID: ' + id); }
  }

  function fmt(ts) { if (!ts) return '—'; try { return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch { return ts; } }
  function parseDetails(raw) { if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } }

  const copyBtnStyle = { background: 'transparent', border: `1px solid ${GS.border}`, borderRadius: '0', color: GS.ink, fontSize: '0.68rem', padding: '1px 5px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" };

  return (
    <div className="dashboard">
      <AuditLogDecorations />
      <div className="dashboard-header">
        <h2>Audit Log</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleExport} disabled={exporting} id="audit-export-btn">{exporting ? 'Exporting…' : 'Export CSV'}</button>
          <button className="btn-secondary" onClick={() => navigate('/university')} id="audit-back-btn">← Dashboard</button>
          <button className="logout-btn" onClick={handleLogout} id="audit-logout-btn">Logout</button>
        </div>
      </div>

      {stats && (
        <div className="card">
          <h3>Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {[['Total Events', stats.total], ['Successful', stats.success_count], ['Failed', stats.failure_count], ['Auth Events', stats.auth_events], ['Certificate Events', stats.cert_events], ['Verifications', stats.verify_events], ['Revocations', stats.revoke_events]].map(([label, val]) => (
              <div key={label} style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 400, color: GS.ink, fontFamily: "'Prata', serif" }}>{val}</div>
                <div style={{ fontSize: '0.72rem', color: GS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Filters</h3>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label>Search</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, IP…" id="audit-search-input" />
            </div>
            <div><label>Module</label><select value={module} onChange={e => setModule(e.target.value)} id="audit-module-select">{MODULES.map(m => <option key={m} value={m}>{m || 'All Modules'}</option>)}</select></div>
            <div><label>Action</label><select value={action} onChange={e => setAction(e.target.value)} id="audit-action-select">{ACTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}</select></div>
            <div><label>Status</label><select value={status} onChange={e => setStatus(e.target.value)} id="audit-status-select">{STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}</select></div>
            <div><label>Role</label><select value={role} onChange={e => setRole(e.target.value)} id="audit-role-select">{ROLES.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}</select></div>
            <div><label>From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} id="audit-date-from" /></div>
            <div><label>To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} id="audit-date-to" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" type="submit" id="audit-search-btn">Search</button>
            <button className="btn-secondary" type="button" onClick={handleClear} id="audit-clear-btn">Clear Filters</button>
          </div>
        </form>
      </div>

      {error && <div className="card"><div className="error-msg">{error}</div></div>}

      <div className="card">
        <h3>Results {total > 0 && <span style={{ fontSize: '0.85rem', fontWeight: 400, color: GS.muted, fontFamily: "'Inter', sans-serif" }}>({total} total)</span>}</h3>
        {loading && <p style={{ color: GS.muted }}>Loading audit logs…</p>}
        {!loading && rows.length === 0 && <p style={{ color: GS.muted }}>No audit log entries match the current filters.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {rows.map((row) => {
            const details = parseDetails(row.details);
            const isExpanded = expandedRow === row.id;
            return (
              <div key={row.id} style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: GS.subtle, marginBottom: '4px' }}>{fmt(row.timestamp)}</div>
                    <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.92rem', marginBottom: '4px' }}>
                      {row.user_name || '—'}
                      {row.status === 'FAILURE' && <span style={{ fontWeight: 400, color: GS.ink, fontSize: '0.78rem', marginLeft: '6px' }}>✕ FAILURE</span>}
                      {row.status === 'SUCCESS' && <span style={{ fontWeight: 400, color: GS.muted, fontSize: '0.78rem', marginLeft: '6px' }}>✓ SUCCESS</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: GS.muted }}>{row.user_name && row.email !== row.user_name ? row.email : ''}</div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '4px' }}>
                      <SmallBadge text={row.module} colours={MODULE_COLOURS} />
                      <SmallBadge text={row.action} colours={ACTION_COLOURS} />
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                    style={{ ...copyBtnStyle, fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    {isExpanded ? 'Hide' : 'Details'}
                  </button>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: '0.75rem', background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      <div><span style={{ color: GS.muted }}>Role</span><br /><strong style={{ color: GS.ink }}>{row.role || '—'}</strong></div>
                      <div><span style={{ color: GS.muted }}>IP Address</span><br /><strong style={{ color: GS.ink }}>{row.ip_address || '—'}</strong></div>
                      {row.resource_id && (
                        <div>
                          <span style={{ color: GS.muted }}>Resource ID</span><br />
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <strong style={{ color: GS.ink, wordBreak: 'break-all' }}>{row.resource_id}</strong>
                            <button style={{ ...copyBtnStyle, marginLeft: '6px' }} onClick={() => handleCopyId(row.resource_id)}>
                              {copiedId === row.resource_id ? '✓' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {details && Object.keys(details).length > 0 && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${GS.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.35rem' }}>
                        {Object.entries(details).map(([k, v]) => (
                          <div key={k}>
                            <span style={{ color: GS.muted }}>{k.replace(/_/g, ' ')}</span><br />
                            <strong style={{ color: GS.ink, wordBreak: 'break-all' }}>{String(v ?? '—')}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>← Prev</button>
            <span style={{ fontSize: '0.85rem', color: GS.muted }}>Page {page} of {pages}</span>
            <button className="btn-secondary" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLog;

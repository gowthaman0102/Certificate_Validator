/**
 * AuditLog.jsx
 *
 * Audit log dashboard for UNIVERSITY users.
 * Follows the EXACT same structure as UniversityDashboard.jsx:
 *   <div className="dashboard">
 *     <div className="dashboard-header">
 *     <div className="card">  ← summary stats (same inner white grid)
 *     <div className="card">  ← filter panel  (same .card inputs)
 *     <div className="card">  ← results       (same .cert-item rows)
 *   </div>
 *
 * All class names, inline styles, colours, spacing, and typography
 * are identical to the existing application. No new design language.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuditLogs, fetchAuditStats, downloadAuditCSV } from '../api/audit';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULES  = ['', 'AUTH', 'CERTIFICATE', 'VERIFICATION', 'REVOCATION', 'WALLET'];
const ACTIONS  = ['', 'LOGIN', 'LOGOUT', 'REGISTER', 'ISSUE', 'BULK_ISSUE', 'VERIFY', 'REVOKE', 'DOWNLOAD', 'SHARE', 'VIEW'];
const STATUSES = ['', 'SUCCESS', 'FAILURE'];
const ROLES    = ['', 'UNIVERSITY', 'STUDENT'];
const PAGE_SIZE = 25;

// ─── Badge colours ────────────────────────────────────────────────────────────
// Reuse the same inline-style approach already used throughout the app.

const MODULE_COLOURS = {
  AUTH:         { bg: '#eef1f5', color: '#0f2540' },
  CERTIFICATE:  { bg: '#e6f2e8', color: '#1e6b34' },
  VERIFICATION: { bg: '#fdf3e0', color: '#8a6d1a' },
  REVOCATION:   { bg: '#fdecea', color: '#a02622' },
  WALLET:       { bg: '#eef1f5', color: '#3d4a5c' },
};

const ACTION_COLOURS = {
  LOGIN:      { bg: '#eef1f5', color: '#0f2540' },
  LOGOUT:     { bg: '#eef1f5', color: '#3d4a5c' },
  REGISTER:   { bg: '#e6f2e8', color: '#1e6b34' },
  ISSUE:      { bg: '#e6f2e8', color: '#1e6b34' },
  BULK_ISSUE: { bg: '#e6f2e8', color: '#1e6b34' },
  VERIFY:     { bg: '#fdf3e0', color: '#8a6d1a' },
  REVOKE:     { bg: '#fdecea', color: '#a02622' },
  DOWNLOAD:   { bg: '#eef1f5', color: '#3d4a5c' },
  SHARE:      { bg: '#fdf3e0', color: '#8a6d1a' },
  VIEW:       { bg: '#eef1f5', color: '#3d4a5c' },
};

function SmallBadge({ text, colours }) {
  const c = colours[text] || { bg: '#eef1f5', color: '#3d4a5c' };
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      padding: '0.2rem 0.55rem',
      borderRadius: '3px',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.3px',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function AuditLog() {
  const navigate = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId]   = useState('');

  // Filters
  const [search,   setSearch]   = useState('');
  const [module,   setModule]   = useState('');
  const [action,   setAction]   = useState('');
  const [status,   setStatus]   = useState('');
  const [role,     setRole]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'UNIVERSITY') {
      navigate('/university-login');
      return;
    }
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters or page change
  useEffect(() => {
    loadLogs();
  }, [page, module, action, status, role, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data loaders ───────────────────────────────────────────────────────────

  async function loadStats() {
    try {
      const res = await fetchAuditStats();
      setStats(res.data);
    } catch {
      // non-critical — summary is cosmetic
    }
  }

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search.trim()) params.search   = search.trim();
      if (module)        params.module   = module;
      if (action)        params.action   = action;
      if (status)        params.status   = status;
      if (role)          params.role     = role;
      if (dateFrom)      params.date_from = dateFrom;
      if (dateTo)        params.date_to   = dateTo;

      const res = await fetchAuditLogs(params);
      setRows(res.data.rows);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, module, action, status, role, dateFrom, dateTo]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    loadLogs();
  }

  function handleClear() {
    setSearch(''); setModule(''); setAction('');
    setStatus(''); setRole(''); setDateFrom(''); setDateTo('');
    setPage(1);
  }

  function handleExport() {
    setExporting(true);
    try {
      const params = {};
      if (search.trim()) params.search   = search.trim();
      if (module)        params.module   = module;
      if (action)        params.action   = action;
      if (status)        params.status   = status;
      if (role)          params.role     = role;
      if (dateFrom)      params.date_from = dateFrom;
      if (dateTo)        params.date_to   = dateTo;
      downloadAuditCSV(params);
    } finally {
      setTimeout(() => setExporting(false), 1500);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  async function handleCopyId(id) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1500);
    } catch {
      alert('ID: ' + id);
    }
  }

  function fmt(ts) {
    if (!ts) return '—';
    try { return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch { return ts; }
  }

  function parseDetails(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="dashboard">

      {/* ── Header — identical to UniversityDashboard ── */}
      <div className="dashboard-header">
        <h2>Audit Logs</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
            onClick={handleExport}
            disabled={exporting}
            id="audit-export-btn"
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            className="btn-danger"
            onClick={() => navigate('/university')}
            id="audit-back-btn"
          >
            ← Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout} id="audit-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* ── Summary stats — same inner white grid as StudentDashboard certs ── */}
      {stats && (
        <div className="card">
          <h3>Summary</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.6rem 1.5rem',
            background: '#ffffff',
            border: '1px solid #d8dde4',
            borderRadius: '6px',
            padding: '1rem',
            fontSize: '0.85rem',
          }}>
            <div><span style={{ color: '#7a8699' }}>Total Events</span><br /><strong style={{ color: '#1e2b3a', fontSize: '1.1rem' }}>{stats.total}</strong></div>
            <div><span style={{ color: '#7a8699' }}>Successful</span><br /><strong style={{ color: '#1e6b34', fontSize: '1.1rem' }}>{stats.success_count}</strong></div>
            <div><span style={{ color: '#7a8699' }}>Failed</span><br /><strong style={{ color: '#a02622', fontSize: '1.1rem' }}>{stats.failure_count}</strong></div>
            <div><span style={{ color: '#7a8699' }}>Auth Events</span><br /><strong style={{ color: '#1e2b3a', fontSize: '1.1rem' }}>{stats.auth_events}</strong></div>
            <div><span style={{ color: '#7a8699' }}>Certificate Events</span><br /><strong style={{ color: '#1e2b3a', fontSize: '1.1rem' }}>{stats.cert_events}</strong></div>
            <div><span style={{ color: '#7a8699' }}>Verifications</span><br /><strong style={{ color: '#1e2b3a', fontSize: '1.1rem' }}>{stats.verify_events}</strong></div>
            <div><span style={{ color: '#7a8699' }}>Revocations</span><br /><strong style={{ color: '#1e2b3a', fontSize: '1.1rem' }}>{stats.revoke_events}</strong></div>
          </div>
        </div>
      )}

      {/* ── Filter panel — styled as .card with .card inputs ── */}
      <div className="card">
        <h3>Filter Logs</h3>
        <form onSubmit={handleSearch}>
          <label>Search (email, name, certificate number, details)</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            id="audit-search-input"
          />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label>Module</label>
              <select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }} id="audit-module-select">
                {MODULES.map((m) => <option key={m} value={m}>{m || 'All Modules'}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label>Action</label>
              <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} id="audit-action-select">
                {ACTIONS.map((a) => <option key={a} value={a}>{a || 'All Actions'}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <label>Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} id="audit-status-select">
                {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Status'}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <label>Role</label>
              <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} id="audit-role-select">
                {ROLES.map((r) => <option key={r} value={r}>{r || 'All Roles'}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label>Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} id="audit-date-from" />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label>Date To</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} id="audit-date-to" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn-primary" type="submit" id="audit-search-btn">Search</button>
            <button className="btn-danger" type="button" onClick={handleClear} id="audit-clear-btn">Clear Filters</button>
          </div>
        </form>
      </div>

      {/* ── Results card ── */}
      <div className="card">
        <h3>Results ({total})</h3>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        {loading && <p style={{ color: '#7a8699' }}>Loading audit logs…</p>}

        {!loading && rows.length === 0 && (
          <p style={{ color: '#7a8699' }}>No audit log entries match the current filters.</p>
        )}

        {/* Log rows — same .cert-item pattern */}
        <div className="cert-list">
          {rows.map((row) => {
            const det = parseDetails(row.details);
            return (
              <div
                key={row.id}
                style={{ background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '6px', padding: '1rem' }}
              >
                {/* Row top: timestamp + module + action + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#7a8699', marginBottom: '4px' }}>{fmt(row.timestamp)}</div>
                    <div style={{ fontWeight: 600, color: '#1e2b3a', fontSize: '0.92rem' }}>
                      {row.user_email || row.user_id || '(anonymous)'}
                    </div>
                    {row.user_name && row.user_name !== row.user_email && (
                      <div style={{ fontSize: '0.8rem', color: '#7a8699' }}>{row.user_name}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <SmallBadge text={row.module} colours={MODULE_COLOURS} />
                    <SmallBadge text={row.action} colours={ACTION_COLOURS} />
                    <span className={`status-badge ${row.status === 'SUCCESS' ? 'status-valid' : 'status-revoked'}`}>
                      {row.status}
                    </span>
                  </div>
                </div>

                {/* Info grid — same white inner box as StudentDashboard */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.5rem 1.5rem',
                  background: '#ffffff',
                  border: '1px solid #d8dde4',
                  borderRadius: '6px',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                }}>
                  <div>
                    <span style={{ color: '#7a8699' }}>Role</span><br />
                    <strong style={{ color: '#1e2b3a' }}>{row.role || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#7a8699' }}>IP Address</span><br />
                    <strong style={{ color: '#1e2b3a' }}>{row.ip_address || '—'}</strong>
                  </div>
                  {row.resource_id && (
                    <div>
                      <span style={{ color: '#7a8699' }}>Resource ID</span><br />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong style={{ color: '#1e2b3a', wordBreak: 'break-all' }}>{row.resource_id}</strong>
                        <button
                          onClick={() => handleCopyId(row.resource_id)}
                          style={{
                            background: 'transparent', border: '1px solid #d8dde4',
                            borderRadius: '3px', color: '#0f2540',
                            fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer',
                          }}
                        >
                          {copiedId === row.resource_id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                  {det && Object.keys(det).slice(0, 3).map((k) => (
                    <div key={k}>
                      <span style={{ color: '#7a8699' }}>{k.replace(/_/g, ' ')}</span><br />
                      <strong style={{ color: '#1e2b3a', wordBreak: 'break-all' }}>
                        {typeof det[k] === 'object' ? JSON.stringify(det[k]) : String(det[k])}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination — same btn-danger style already used for actions in the app */}
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              className="btn-danger"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              id="audit-prev-btn"
            >
              ← Prev
            </button>
            <span style={{ fontSize: '0.85rem', color: '#3d4a5c' }}>
              Page {page} of {pages} &nbsp;·&nbsp; {total} records
            </span>
            <button
              className="btn-danger"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              id="audit-next-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default AuditLog;

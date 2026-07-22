/**
 * WalletDashboard.jsx
 *
 * Follows the EXACT same structure, class names, and inline-style
 * conventions as StudentDashboard.jsx and UniversityDashboard.jsx.
 *
 * Structure mirrors StudentDashboard:
 *   <div className="dashboard">
 *     <div className="dashboard-header">  ← identical
 *     <div className="card">              ← student info (mirrors the "Showing certs for" card)
 *     stats row                           ← wallet-only addition, white inner boxes
 *     <div className="card">              ← results (mirrors "Results (N)" card)
 *       toolbar
 *       cert list (WalletCertCard rows)
 *     </div>
 *   </div>
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getStudentCertificates }         from '../api/client';
import { recordWalletEvent, fetchWalletStats } from '../api/wallet';
import { recordEvent, getStats }          from '../utils/walletStore';

import WalletStats    from '../components/wallet/WalletStats';
import WalletCertCard from '../components/wallet/WalletCertCard';

// ─────────────────────────────────────────────────────────────────────────────

function WalletDashboard() {
  const navigate = useNavigate();

  const [user, setUser]             = useState(null);
  const [certificates, setCerts]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [localStats, setLocalStats] = useState({ downloads: 0, shares: 0, verifications: 0, views: 0 });

  // Toolbar
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const token      = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || storedUser.role !== 'STUDENT') {
      navigate('/student-login');
      return;
    }
    setUser(storedUser);
    loadCerts(storedUser);
    setLocalStats(getStats());
    fetchWalletStats().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCerts(u) {
    setError('');
    setLoading(true);
    try {
      const res = await getStudentCertificates({ email: u.email, registerNumber: u.register_number || '' });
      setCerts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load certificates. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Event logging ────────────────────────────────────────────────────────
  const logEvent = useCallback((type, cert) => {
    recordEvent(type, cert.id, { certNumber: cert.certificate_number, course: cert.course });
    setLocalStats(getStats());
    recordWalletEvent(type, cert.id, { certNumber: cert.certificate_number }).catch(() => {});
  }, []);

  function handleDownload(cert) { logEvent('DOWNLOAD', cert); }
  function handleShare(cert)    { logEvent('SHARE', cert); }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  // ── Filter / sort ────────────────────────────────────────────────────────
  const filtered = certificates
    .filter((c) => {
      if (filter === 'VALID')   return c.status === 'VALID';
      if (filter === 'REVOKED') return c.status === 'REVOKED';
      return true;
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        c.student_name?.toLowerCase().includes(q)       ||
        c.course?.toLowerCase().includes(q)             ||
        c.certificate_number?.toLowerCase().includes(q) ||
        (c.university_name || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date_asc')  return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name_asc')  return (a.course || '').localeCompare(b.course || '');
      return 0;
    });

  // ── Loading state ────────────────────────────────────────────────────────
  // Matches UniversityDashboard loading: <div className="dashboard"><p>Loading...</p></div>
  if (loading) {
    return (
      <div className="dashboard">
        <p style={{ color: '#7a8699' }}>Loading your credential wallet…</p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="dashboard">

      {/* ── Header — identical structure to StudentDashboard ── */}
      <div className="dashboard-header">
        <h2>My Credential Wallet</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
            onClick={() => loadCerts(user)}
            id="wallet-refresh-btn"
          >
            Refresh
          </button>
          <button
            className="btn-danger"
            onClick={() => navigate('/student')}
            id="wallet-back-btn"
          >
            ← Back to Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout} id="wallet-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* ── Student info card — mirrors "Showing certificates for…" card ── */}
      <div className="card">
        <p style={{ color: '#3d4a5c', fontSize: '0.9rem' }}>
          Credential Wallet for <strong>{user?.email}</strong>
          {user?.register_number ? ` / ${user.register_number}` : ''}
        </p>
        {error && <div className="error-msg" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {/* ── Stats — inside a card like all other summary sections ── */}
      <div className="card">
        <h3>Wallet Summary</h3>
        <WalletStats totalCerts={certificates.length} stats={localStats} />
      </div>

      {/* ── Certificate list — mirrors the "Results (N)" card ── */}
      <div className="card">
        <h3>Issued Certificates ({certificates.length})</h3>

        {/* Toolbar — search + filter dropdowns */}
        <div className="wallet-toolbar" style={{ marginBottom: '1rem' }}>
          <input
            id="wallet-search-input"
            className="wallet-search-input"
            type="text"
            placeholder="Search by name, course, or certificate ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            id="wallet-filter-select"
            className="wallet-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="VALID">Valid Only</option>
            <option value="REVOKED">Revoked Only</option>
          </select>
          <select
            id="wallet-sort-select"
            className="wallet-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Course A–Z</option>
          </select>
          {(search || filter !== 'ALL') && (
            <span style={{ fontSize: '0.8rem', color: '#7a8699', alignSelf: 'center' }}>
              {filtered.length} of {certificates.length} shown
            </span>
          )}
        </div>

        {/* Empty states — same style as StudentDashboard */}
        {certificates.length === 0 && (
          <p style={{ color: '#7a8699' }}>
            No certificates found for your account. If your university has issued you a certificate,
            it will appear here automatically.
          </p>
        )}
        {certificates.length > 0 && filtered.length === 0 && (
          <p style={{ color: '#7a8699' }}>
            No certificates match your search or filter. Try adjusting your criteria.
          </p>
        )}

        {/* Certificate rows */}
        <div className="cert-list">
          {filtered.map((cert) => (
            <WalletCertCard
              key={cert.id}
              cert={cert}
              onDownload={handleDownload}
              onShare={handleShare}
              onCopyLink={handleShare}
            />
          ))}
        </div>
      </div>

      {/* ── Footer note — matches the light helper-text pattern ── */}
      {certificates.length > 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <p style={{ color: '#7a8699', fontSize: '0.82rem' }}>
            🔒 All certificates are protected with RSA-2048 digital signatures. Signature status is verified locally using the issuer's public key.
          </p>
        </div>
      )}
    </div>
  );
}

export default WalletDashboard;

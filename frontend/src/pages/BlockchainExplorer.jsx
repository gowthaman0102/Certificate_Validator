/**
 * BlockchainExplorer.jsx
 *
 * Public page — no login required.
 * Mirrors real blockchain explorers (Etherscan / PolygonScan) in structure.
 * Uses ONLY existing CSS classes: .dashboard, .dashboard-header, .card,
 * .cert-item, .btn-primary, .btn-danger, .status-badge, .status-valid, .error-msg
 * Color palette: #0f2540 (navy), #c9a227 (gold), #1e6b34 (green), #7a8699 (muted)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchBlockchainStats,
  fetchRecentAnchors,
  fetchAnchorByTxId,
  searchBlockchainAnchors,
} from '../api/blockchain';
import BlockchainExplorerDecorations from '../components/decorations/BlockchainExplorerDecorations';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncate(str, n = 12) {
  if (!str) return '—';
  if (str.length <= n * 2 + 3) return str;
  return `${str.slice(0, n)}...${str.slice(-n)}`;
}

function fmtTime(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('en-IN', { hour12: false }); }
  catch { return ts; }
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* ignore */ }
  }
  return (
    <button
      onClick={copy}
      style={{
        background: 'transparent', border: '1px solid #d8dde4', borderRadius: '3px',
        color: '#0f2540', fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer', marginLeft: '6px',
      }}
    >
      {copied ? '✓' : 'Copy'}
    </button>
  );
}

// ─── Transaction Detail Panel ─────────────────────────────────────────────────

function TxDetail({ anchor, onClose }) {
  if (!anchor) return null;
  const rows = [
    { label: 'Transaction ID',     value: anchor.tx_id,             copy: true },
    { label: 'Block Number',       value: anchor.block_number,      copy: false },
    { label: 'Block Hash',         value: anchor.block_hash,        copy: true },
    { label: 'Previous Block Hash',value: anchor.prev_block_hash,   copy: true },
    { label: 'Certificate Hash',   value: anchor.cert_hash,         copy: true },
    { label: 'Certificate No.',    value: anchor.certificate_number,copy: false },
    { label: 'Issuer Code',        value: anchor.issuer_code,       copy: false },
    { label: 'University',         value: anchor.university_name,   copy: false },
    { label: 'Anchored At',        value: fmtTime(anchor.anchored_at), copy: false },
    { label: 'Network',            value: anchor.network,           copy: false },
    { label: 'Status',             value: anchor.status,            copy: false },
  ];

  return (
    <div className="card" style={{ marginBottom: 0, border: '2px solid #c9a227' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Transaction Detail</h3>
        <button className="btn-danger" onClick={onClose} style={{ fontSize: '0.8rem' }}>✕ Close</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            {rows.map(({ label, value, copy }) => (
              <tr key={label} style={{ borderBottom: '1px solid #d8dde4' }}>
                <td style={{ padding: '0.55rem 0.75rem', color: '#7a8699', whiteSpace: 'nowrap', width: '180px', fontWeight: 500 }}>{label}</td>
                <td style={{ padding: '0.55rem 0.75rem', color: '#1e2b3a', wordBreak: 'break-all', fontFamily: label.includes('Hash') || label.includes('ID') ? 'monospace' : 'inherit', fontSize: label.includes('Hash') || label.includes('ID') ? '0.78rem' : '0.85rem' }}>
                  {String(value ?? '—')}
                  {copy && value && <CopyBtn value={String(value)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BlockchainExplorer() {
  const [stats,    setStats]    = useState(null);
  const [anchors,  setAnchors]  = useState([]);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(true);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState('');
  const [searching,setSearching]= useState(false);

  const LIMIT = 20;

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true); setError('');
    try {
      const [sRes, aRes] = await Promise.all([
        fetchBlockchainStats(),
        fetchRecentAnchors(1, LIMIT),
      ]);
      setStats(sRes.data);
      setAnchors(aRes.data.anchors || []);
      setHasMore((aRes.data.anchors || []).length === LIMIT);
      setPage(1);
    } catch (err) {
      setError('Could not connect to the blockchain node. Make sure the backend is running.');
    } finally { setLoading(false); }
  }

  async function loadMore() {
    const nextPage = page + 1;
    try {
      const res = await fetchRecentAnchors(nextPage, LIMIT);
      const rows = res.data.anchors || [];
      setAnchors((prev) => [...prev, ...rows]);
      setHasMore(rows.length === LIMIT);
      setPage(nextPage);
    } catch { /* ignore */ }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim() || search.trim().length < 3) return;
    setSearching(true); setError(''); setSelected(null);
    try {
      const res = await searchBlockchainAnchors(search.trim());
      const rows = Array.isArray(res.data) ? res.data : [];
      setAnchors(rows);
      setHasMore(false);
      if (rows.length === 1) setSelected(rows[0]);
      if (rows.length === 0) setError('No transactions found matching your query.');
    } catch { setError('Search failed.'); }
    finally { setSearching(false); }
  }

  function handleClearSearch() {
    setSearch(''); setSelected(null); setError(''); loadAll();
  }

  async function handleSelectTx(anchor) {
    setSelected(anchor);
    // Scroll detail into view
    try { document.getElementById('bc-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
  }

  return (
    <div className="dashboard">
      <BlockchainExplorerDecorations />
      <div className="dashboard-header">
        <div>
          <h2>Blockchain Explorer</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.5px' }}>
            SIMULATED LEDGER — Ethereum-Compatible Hash Anchoring
          </p>
        </div>
        <Link to="/" className="btn-back-home-oval" id="blockchain-back-home-btn">← Back to Home</Link>
      </div>

      {/* ── Network Stats ── */}
      {stats && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Total Transactions', value: stats.totalTransactions, colour: '#0f2540' },
              { label: 'Latest Block',       value: stats.latestBlock,       colour: '#1e6b34' },
              { label: 'Network',            value: stats.network,           colour: '#c9a227' },
              { label: 'Consensus',          value: 'SHA-256 Proof',         colour: '#3d4a5c' },
            ].map(({ label, value, colour }) => (
              <div key={label} style={{ background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '6px', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: colour, lineHeight: 1, marginBottom: '4px', fontFamily: "Georgia, 'Times New Roman', serif" }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: '#7a8699' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Search ── */}
      <div className="card">
        <h3>Search Transactions</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction ID, Certificate No., or Hash…"
            id="bc-search-input"
            style={{ flex: 1, minWidth: '220px' }}
          />
          <button className="btn-primary" type="submit" disabled={searching} id="bc-search-btn">
            {searching ? 'Searching…' : 'Search'}
          </button>
          {search && (
            <button className="btn-danger" type="button" onClick={handleClearSearch} id="bc-clear-btn">
              Clear
            </button>
          )}
        </form>
        {error && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</div>}
      </div>

      {/* ── Transaction Detail Panel ── */}
      {selected && (
        <div id="bc-detail">
          <TxDetail anchor={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* ── Transactions Table ── */}
      <div className="card">
        <h3>Recent Transactions {loading && <span style={{ fontSize: '0.8rem', color: '#7a8699', fontWeight: 400 }}>— Loading…</span>}</h3>

        {anchors.length === 0 && !loading && !error && (
          <p style={{ color: '#7a8699' }}>No transactions anchored yet. Issue a certificate to anchor its hash.</p>
        )}

        {anchors.length > 0 && (
          <div className="cert-list">
            {anchors.map((a) => (
              <div
                key={a.tx_id}
                className="cert-item"
                onClick={() => handleSelectTx(a)}
                style={{ cursor: 'pointer', outline: selected?.tx_id === a.tx_id ? '2px solid #c9a227' : 'none' }}
                id={`bc-tx-${a.block_number}`}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#0f2540', fontWeight: 600 }}>
                      {truncate(a.tx_id, 10)}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#eef1f5', color: '#3d4a5c', padding: '1px 7px', borderRadius: '10px' }}>
                      Block #{a.block_number}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7a8699', marginTop: '3px' }}>
                    {a.certificate_number} · {a.university_name} · {fmtTime(a.anchored_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="status-badge status-valid">{a.status}</span>
                  <span style={{ fontSize: '0.75rem', color: '#7a8699' }}>{a.network}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={loadMore} id="bc-load-more-btn">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockchainExplorer;

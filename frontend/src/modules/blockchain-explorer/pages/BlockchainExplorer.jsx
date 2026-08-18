/**
 * BlockchainExplorer.jsx
 *
 * Public page — no login required.
 * Mirrors real blockchain explorers (Etherscan / PolygonScan) in structure.
 * Uses ONLY existing CSS classes: .dashboard, .dashboard-header, .card,
 * .cert-item, .btn-primary, .btn-danger, .status-badge, .status-valid, .error-msg
 *
 * Motion additions (Phase 6):
 *   • Transaction rows cascade in on scroll — stagger 30ms/row, translateY 12px
 *   • Latest / newest block pulses opacity 0.6↔1 (1.5s loop) via .pulse-live
 *   • Hash values scramble through random hex chars on hover (200ms) then
 *     resolve to real value — pure JS, uses .hash-scramble CSS class
 *   • Clicking a block expands inline with height auto-animation (layout prop)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  fetchBlockchainStats,
  fetchRecentAnchors,
  searchBlockchainAnchors,
} from "../api/blockchain";
import { getCertificateByCertNumber } from "../../../shared/api/client";
import CategoryCertificateTemplate from "../../certificate-templates/components/CategoryCertificateTemplate";
import BlockchainExplorerDecorations from "../components/BlockchainExplorerDecorations";
import { CountUp, SkeletonCard } from "../../../shared/motion/index";
import useHeaderHeight from "../../../shared/hooks/useHeaderHeight";

// ─── Constants ────────────────────────────────────────────────────────────────

const PREMIUM    = [0.16, 1, 0.3, 1];
const LIMIT      = 20;
const HEX_CHARS  = "0123456789abcdef";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(str, n = 12) {
  if (!str) return "—";
  if (str.length <= n * 2 + 3) return str;
  return `${str.slice(0, n)}...${str.slice(-n)}`;
}

function fmtTime(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleString("en-IN", { hour12: false }); }
  catch { return ts; }
}

// ─── Hash Scramble Hook ───────────────────────────────────────────────────────

function useHashScramble(realValue) {
  const [display, setDisplay] = useState(realValue);
  const rafRef = useRef(null);

  const scramble = useCallback(() => {
    if (!realValue) return;
    const len       = realValue.length;
    const startTime = performance.now();
    const duration  = 200; // ms

    function frame(now) {
      const elapsed = now - startTime;
      if (elapsed >= duration) {
        setDisplay(realValue);
        return;
      }
      const revealed = Math.floor((elapsed / duration) * len);
      const scrambled = realValue
        .split("")
        .map((ch, i) => {
          if (i < revealed) return ch;
          if (/[0-9a-fA-F]/.test(ch)) return HEX_CHARS[Math.floor(Math.random() * 16)];
          return ch;
        })
        .join("");
      setDisplay(scrambled);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
  }, [realValue]);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setDisplay(realValue);
  }, [realValue]);

  useEffect(() => { setDisplay(realValue); }, [realValue]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return { display, scramble, reset };
}

// ─── CopyBtn ─────────────────────────────────────────────────────────────────

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* ignore */ }
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); copy(); }}
      style={{
        background: "transparent", border: "1px solid #d8dde4", borderRadius: "3px",
        color: "#0f2540", fontSize: "0.7rem", padding: "1px 6px", cursor: "pointer", marginLeft: "6px",
      }}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

// ─── AnimatedHashSpan ────────────────────────────────────────────────────────

function AnimatedHashSpan({ value, style = {} }) {
  const { display, scramble, reset } = useHashScramble(value || "—");
  return (
    <span
      className="hash-scramble"
      onMouseEnter={scramble}
      onMouseLeave={reset}
      style={style}
    >
      {display}
    </span>
  );
}

// ─── AnimatedRow with Inline Layout Expansion ─────────────────────────────────

const rowVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: (delay) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: PREMIUM, delay },
  }),
};

function AnimatedRow({ anchor, index, isNewest, isSelected, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const delay = Math.min(index * 0.03, 0.6);

  const detailRows = [
    { label: "Transaction ID",      value: anchor.tx_id,              copy: true,  isHash: true  },
    { label: "Block Number",        value: anchor.block_number,       copy: false, isHash: false },
    { label: "Block Hash",          value: anchor.block_hash,         copy: true,  isHash: true  },
    { label: "Previous Block Hash", value: anchor.prev_block_hash,    copy: true,  isHash: true  },
    { label: "Certificate Hash",    value: anchor.cert_hash,          copy: true,  isHash: true  },
    { label: "Certificate No.",     value: anchor.certificate_number, copy: false, isHash: false },
    { label: "Issuer Code",         value: anchor.issuer_code,        copy: false, isHash: false },
    { label: "University",          value: anchor.university_name,    copy: false, isHash: false },
    { label: "Anchored At",         value: fmtTime(anchor.anchored_at), copy: false, isHash: false },
    { label: "Network",             value: anchor.network,            copy: false, isHash: false },
    { label: "Status",              value: anchor.status,             copy: false, isHash: false },
  ];

  return (
    <motion.div
      ref={ref}
      layout
      key={anchor.tx_id}
      className="cert-item card-lift"
      variants={rowVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      style={{
        cursor: "pointer",
        outline: isSelected ? "2px solid #0a0a0a" : "none",
        flexDirection: "column",
        alignItems: "stretch",
      }}
      onClick={onClick}
      id={`bc-tx-${anchor.block_number}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <AnimatedHashSpan
              value={truncate(anchor.tx_id, 10)}
              style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#0f2540", fontWeight: 600 }}
            />
            <span style={{ fontSize: "0.75rem", background: "#eef1f5", color: "#3d4a5c", padding: "1px 7px", borderRadius: "10px" }}>
              Block #{anchor.block_number}
            </span>
            {anchor.status === "REVOKED" ? (
              <span style={{ fontSize: "0.68rem", background: "#0a0a0a", color: "#ffffff", padding: "1px 7px", borderRadius: "10px", letterSpacing: "0.04em", fontWeight: 700 }}>
                REVOCATION
              </span>
            ) : (
              <span style={{ fontSize: "0.68rem", background: "#f1f5f9", color: "#0a0a0a", border: "1px solid #0a0a0a", padding: "1px 7px", borderRadius: "10px", letterSpacing: "0.04em", fontWeight: 700 }}>
                ISSUANCE
              </span>
            )}
            {isNewest && (
              <span className="pulse-live" style={{ fontSize: "0.68rem", background: "#0a0a0a", color: "#ffffff", padding: "1px 7px", borderRadius: "10px", letterSpacing: "0.04em", fontWeight: 700 }}>
                LIVE
              </span>
            )}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#7a8699", marginTop: "3px" }}>
            {anchor.certificate_number} · {anchor.university_name} · {fmtTime(anchor.anchored_at)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className={`status-badge ${anchor.status === "VALID" ? "status-valid" : "status-revoked"}`}>{anchor.status}</span>
          <span style={{ fontSize: "0.75rem", color: "#7a8699" }}>{anchor.network}</span>
        </div>
      </div>

      {/* Inline Layout Auto-Expand Animation */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: PREMIUM }}
            style={{ overflow: "hidden", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0" }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0a0a0a" }}>
              Transaction Detail & Block Hash Verification
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <tbody>
                {detailRows.map(({ label, value, copy, isHash }) => (
                  <tr key={label} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.45rem 0.5rem", color: "#64748b", whiteSpace: "nowrap", width: "160px", fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: "0.45rem 0.5rem", color: "#0a0a0a", wordBreak: "break-all", fontSize: isHash ? "0.78rem" : "0.82rem" }}>
                      {isHash ? <AnimatedHashSpan value={String(value ?? "—")} /> : String(value ?? "—")}
                      {copy && value && <CopyBtn value={String(value)} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LedgerDetailModal({ anchor, onClose }) {
  const [certData, setCertData] = useState(null);
  const [loadingCert, setLoadingCert] = useState(true);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    if (!anchor?.certificate_number) {
      setLoadingCert(false);
      return;
    }
    setLoadingCert(true);
    getCertificateByCertNumber(anchor.certificate_number)
      .then((res) => {
        if (isMounted) setCertData(res.data);
      })
      .catch(() => {
        if (isMounted) setCertData(null);
      })
      .finally(() => {
        if (isMounted) setLoadingCert(false);
      });
    return () => { isMounted = false; };
  }, [anchor]);

  if (!anchor) return null;

  const detailRows = [
    { label: "Transaction ID",      value: anchor.tx_id,              copy: true,  isHash: true  },
    { label: "Block Number",        value: anchor.block_number,       copy: false, isHash: false },
    { label: "Block Hash",          value: anchor.block_hash,         copy: true,  isHash: true  },
    { label: "Previous Block Hash", value: anchor.prev_block_hash,    copy: true,  isHash: true  },
    { label: "Certificate Hash",    value: anchor.cert_hash,          copy: true,  isHash: true  },
    { label: "Certificate No.",     value: anchor.certificate_number, copy: false, isHash: false },
    { label: "Issuer Code",         value: anchor.issuer_code,        copy: false, isHash: false },
    { label: "University",          value: anchor.university_name,    copy: false, isHash: false },
    { label: "Anchored At",         value: fmtTime(anchor.anchored_at), copy: false, isHash: false },
    { label: "Network",             value: anchor.network,            copy: false, isHash: false },
    { label: "Status",              value: anchor.status,             copy: false, isHash: false },
  ];

  const statusUpper = (anchor.status || "").toUpperCase();
  const isRevoked = statusUpper === "REVOKED";

  // Portrait (Graduation) needs different scale & height to show full certificate
  const isPortrait = certData?.certificate_category === "Degree / Graduation Certificate";
  const certPreviewScale  = isPortrait ? 0.42 : 0.56;
  const certPreviewHeight = isPortrait ? "420px" : "400px";
  const certPreviewWidth  = isPortrait ? "620px" : "800px";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box"
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: PREMIUM }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          border: "2.5px solid #0a0a0a",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "880px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          padding: "1.5rem",
          position: "relative",
          boxSizing: "border-box"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0a0a0a", paddingBottom: "0.85rem", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0a0a0a", fontFamily: '"Prata", serif' }}>
              Ledger Block & Certificate Details
            </div>
            <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "2px", fontWeight: 600 }}>
              Block #{anchor.block_number} · Tx: {truncate(anchor.tx_id, 12)}
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close Pop-up"
            style={{
              background: "#f1f5f9",
              border: "1.5px solid #0a0a0a",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              color: "#0a0a0a",
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Certificate Preview Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginBottom: "0.75rem", borderLeft: "4px solid #0a0a0a", paddingLeft: "0.5rem" }}>
            Visual Certificate Document Preview
          </div>

          {loadingCert ? (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
              <SkeletonCard rows={2} heights={["2rem", "6rem"]} gap="0.75rem" />
            </div>
          ) : certData ? (
            <div style={{
              position: "relative",
              borderRadius: "12px",
              border: "1.5px solid #cbd5e1",
              background: "#f8fafc",
              padding: "0.5rem",
              height: certPreviewHeight,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start"
            }}>
              <div style={{
                width: certPreviewWidth,
                transform: `scale(${certPreviewScale})`,
                transformOrigin: "top center",
                marginTop: "0.2rem",
                flexShrink: 0
              }}>
                <CategoryCertificateTemplate
                  certificate={{
                    ...certData,
                    status: isRevoked ? "REVOKED" : (certData.status || "VALID"),
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: "1.2rem", background: "#f8fafc", borderRadius: "10px", border: "1.5px solid #cbd5e1" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div><span style={{ color: "#64748b" }}>Certificate Number:</span><br /><strong style={{ color: "#0a0a0a" }}>{anchor.certificate_number}</strong></div>
                <div><span style={{ color: "#64748b" }}>University:</span><br /><strong style={{ color: "#0a0a0a" }}>{anchor.university_name}</strong></div>
                <div><span style={{ color: "#64748b" }}>Issuer Code:</span><br /><strong style={{ color: "#0a0a0a" }}>{anchor.issuer_code}</strong></div>
                <div><span style={{ color: "#64748b" }}>Status:</span><br /><span className={`status-badge ${isRevoked ? "status-revoked" : "status-valid"}`}>{anchor.status}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Ledger Details Table Section */}
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0a0a0a", marginBottom: "0.75rem", borderLeft: "4px solid #0a0a0a", paddingLeft: "0.5rem" }}>
            Blockchain Transaction & Hash Verification
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
            <tbody>
              {detailRows.map(({ label, value, copy, isHash }) => (
                <tr key={label} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.55rem 0.6rem", color: "#64748b", whiteSpace: "nowrap", width: "170px", fontWeight: 600 }}>{label}</td>
                  <td style={{ padding: "0.55rem 0.6rem", color: "#0a0a0a", wordBreak: "break-all", fontSize: isHash ? "0.8rem" : "0.84rem" }}>
                    {isHash ? <AnimatedHashSpan value={String(value ?? "—")} /> : String(value ?? "—")}
                    {copy && value && <CopyBtn value={String(value)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── LedgerBadge: visible architecture declaration ───────────────────────────
// This owns the "simulated ledger" choice openly rather than hiding it.

function LedgerBadge() {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", letterSpacing: "0.5px" }}>
        SIMULATED LEDGER — Ethereum-Compatible Hash Anchoring
      </p>
    </div>
  );
}



function BlockchainExplorer() {
  useHeaderHeight(".dashboard-header");
  const [stats,     setStats]     = useState(null);
  const [anchors,   setAnchors]   = useState([]);
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(true);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [searching, setSearching] = useState(false);
  const [newestTxId, setNewestTxId] = useState(null);

  const statsRef   = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-40px" });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const [sRes, aRes] = await Promise.all([
        fetchBlockchainStats(),
        fetchRecentAnchors(1, LIMIT),
      ]);
      setStats(sRes.data);
      const rows = aRes.data.anchors || [];
      setAnchors(rows);
      setHasMore(rows.length === LIMIT);
      setPage(1);
      if (rows.length > 0) {
        const newest = rows.reduce((a, b) => (a.block_number > b.block_number ? a : b));
        setNewestTxId(newest.tx_id);
        setTimeout(() => setNewestTxId(null), 6000);
      }
    } catch {
      setError("Could not connect to the blockchain node. Make sure the backend is running.");
    } finally { setLoading(false); }
  }

  async function loadMore() {
    const nextPage = page + 1;
    try {
      const res  = await fetchRecentAnchors(nextPage, LIMIT);
      const rows = res.data.anchors || [];
      setAnchors((prev) => {
        const merged = [...prev, ...rows];
        if (rows.length > 0) {
          const newest = rows.reduce((a, b) => (a.block_number > b.block_number ? a : b));
          setNewestTxId(newest.tx_id);
          setTimeout(() => setNewestTxId(null), 6000);
        }
        return merged;
      });
      setHasMore(rows.length === LIMIT);
      setPage(nextPage);
    } catch { /* ignore */ }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim() || search.trim().length < 3) return;
    setSearching(true); setError(""); setSelected(null); setNewestTxId(null);
    try {
      const res  = await searchBlockchainAnchors(search.trim());
      const rows = Array.isArray(res.data) ? res.data : [];
      setAnchors(rows);
      setHasMore(false);
      if (rows.length === 1) setSelected(rows[0]);
      if (rows.length === 0) setError("No transactions found matching your query.");
    } catch { setError("Search failed."); }
    finally { setSearching(false); }
  }

  function handleClearSearch() {
    setSearch(""); setSelected(null); setError(""); loadAll();
  }

  function handleSelectTx(anchor) {
    setSelected(prev => (prev?.tx_id === anchor.tx_id ? null : anchor));
  }

  const statContainerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const statItemVariants = {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: PREMIUM } },
  };

  return (
    <div className="dashboard">
      <BlockchainExplorerDecorations />
      <div className="dashboard-header">
        <div>
          <h2>Blockchain Explorer</h2>
          <LedgerBadge />
        </div>
        <Link to="/" className="btn-back-home-oval" id="blockchain-back-home-btn">← Back to Home</Link>
      </div>


      {/* ── Network Stats — CountUp ── */}
      <div className="card">
        {loading && !stats ? (
          <SkeletonCard rows={1} heights={["3.5rem"]} gap="0.75rem" />
        ) : (
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}
            variants={statContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { label: "Total Transactions", value: stats?.totalTransactions ?? 0, colour: "#0f2540", isNum: true },
              { label: "Latest Block",       value: stats?.latestBlock ?? 0,       colour: "#1e6b34", isNum: true },
              { label: "Network",            value: stats?.network || "Polygon Testnet", colour: "#c9a227", isNum: false },
              { label: "Consensus",          value: "SHA-256 Proof",         colour: "#3d4a5c", isNum: false },
            ].map(({ label, value, colour, isNum }) => (
              <motion.div
                key={label}
                className="card-lift"
                variants={statItemVariants}
                style={{ background: "#f7f8fa", border: "1px solid #d8dde4", borderRadius: "6px", padding: "0.85rem", textAlign: "center" }}
              >
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: colour, lineHeight: 1, marginBottom: "4px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {isNum && typeof value === "number" ? <CountUp to={value} duration={0.8} /> : value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#7a8699" }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Search ── */}
      <div className="card">
        <h3>Search Transactions</h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction ID, Certificate No., or Hash…"
            id="bc-search-input"
            style={{ flex: 1, minWidth: "220px" }}
          />
          <button className="btn-primary" type="submit" disabled={searching} id="bc-search-btn">
            {searching ? "Searching…" : "Search"}
          </button>
          {search && (
            <button className="btn-danger" type="button" onClick={handleClearSearch} id="bc-clear-btn">
              Clear
            </button>
          )}
        </form>
        {error && <div className="error-msg" style={{ marginTop: "0.75rem" }}>{error}</div>}
      </div>

      {/* ── Transactions Table — row cascade ── */}
      <div className="card">
        <h3>
          Recent Transactions{" "}
          {loading && <span style={{ fontSize: "0.8rem", color: "#7a8699", fontWeight: 400 }}>— Loading…</span>}
        </h3>

        {loading && anchors.length === 0 && (
          <SkeletonCard rows={4} heights={["2.5rem", "2.5rem", "2.5rem", "2.5rem"]} gap="0.75rem" />
        )}

        {anchors.length === 0 && !loading && !error && (
          <p style={{ color: "#7a8699" }}>No transactions anchored yet. Issue a certificate to anchor its hash.</p>
        )}

        {anchors.length > 0 && (
          <div className="cert-list">
            {anchors.map((a, index) => (
              <AnimatedRow
                key={a.tx_id}
                anchor={a}
                index={index}
                isNewest={a.tx_id === newestTxId}
                isSelected={selected?.tx_id === a.tx_id}
                onClick={() => handleSelectTx(a)}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button className="btn-primary" onClick={loadMore} id="bc-load-more-btn">
              Load More
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <LedgerDetailModal
            anchor={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default BlockchainExplorer;

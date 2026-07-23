import { useState, useEffect, useRef } from 'react';
import { getPublicKey } from '../../api/client';
import { getCachedPublicKey, setCachedPublicKey } from '../../utils/keyCache';
import { verifyOffline } from '../../utils/offlineCrypto';
import { downloadCertificateAsPDF } from '../../utils/certificatePdf';
import CertificateTemplate from '../CertificateTemplate';
import { getHistory } from '../../utils/walletStore';

const API_BASE = 'http://localhost:5000';
const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

const copyBtnStyle = { background: 'transparent', border: `1px solid ${GS.border}`, borderRadius: '0', color: GS.ink, fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" };

function WalletCertCard({ cert, onCopyLink, onDownload, onShare }) {
  const [sigStatus, setSigStatus]   = useState('checking');
  const [copiedId,  setCopiedId]    = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const hiddenRef                   = useRef(null);
  const history                     = getHistory(cert.id);

  useEffect(() => { checkSignature(); }, [cert.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkSignature() {
    if (cert.status === 'REVOKED') { setSigStatus('revoked'); return; }
    try {
      const qrPayload = typeof cert.qr_data === 'string' ? JSON.parse(cert.qr_data) : cert.qr_data;
      const issuerId  = qrPayload?.issuer_id;
      if (!issuerId) { setSigStatus('failed'); return; }
      let pem;
      const cached = getCachedPublicKey(issuerId);
      if (cached) { pem = cached.public_key; }
      else { const res = await getPublicKey(issuerId); pem = res.data.public_key; setCachedPublicKey(issuerId, res.data.name, pem); }
      const result = await verifyOffline(qrPayload, pem);
      setSigStatus(result.result === 'VALID' ? 'verified' : 'failed');
    } catch { setSigStatus('failed'); }
  }

  async function handleDownloadPdf() { await downloadCertificateAsPDF(hiddenRef, `certificate_${cert.certificate_number}`); if (onDownload) onDownload(cert); }

  async function handleCopyId() {
    try { await navigator.clipboard.writeText(cert.certificate_number); setCopiedId(true); setTimeout(() => setCopiedId(false), 1500); }
    catch { alert('Certificate ID: ' + cert.certificate_number); }
  }

  async function handleCopyLink() {
    const link = `${window.location.origin}/verify?cert=${encodeURIComponent(cert.certificate_number)}`;
    try { await navigator.clipboard.writeText(link); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1500); }
    catch { window.prompt('Copy this verification link:', link); }
    if (onShare) onShare(cert);
  }

  function handleToggleShare() { setShareOpen((v) => !v); if (onShare && !shareOpen) onShare(cert); }

  function fmt(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } }
  function fmtDT(iso) { if (!iso) return '—'; try { return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return iso; } }

  const sigMap = {
    checking: { cls: 'wallet-sig-checking', text: 'Verifying signature…' },
    verified: { cls: 'wallet-sig-verified', text: '✓ Signature Verified' },
    failed:   { cls: 'wallet-sig-failed',   text: '✕ Signature Invalid' },
    revoked:  { cls: 'wallet-sig-failed',   text: '✕ Certificate Revoked' },
  };
  const sig = sigMap[sigStatus];
  const verifyLink = `${window.location.origin}/verify?cert=${encodeURIComponent(cert.certificate_number)}`;
  const qrUrl = `${API_BASE}/uploads/qr_${cert.id}.png`;

  return (
    <div style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '1.25rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: GS.ink }}>{cert.student_name}</div>
          <div style={{ fontSize: '0.82rem', color: GS.muted, marginTop: '2px' }}>{cert.university_name || '—'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`wallet-sig-badge ${sig.cls}`}>{sig.text}</span>
          <span className={`status-badge ${cert.status === 'VALID' ? 'status-valid' : 'status-revoked'}`}>{cert.status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem 1.5rem', background: GS.bg, border: `1px solid ${GS.border}`, padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
        <div><span style={{ color: GS.muted }}>Course</span><br /><strong style={{ color: GS.ink }}>{cert.course}</strong></div>
        <div><span style={{ color: GS.muted }}>Duration</span><br /><strong style={{ color: GS.ink }}>{cert.start_year ? `${cert.start_year} – ` : ''}{cert.end_year}</strong></div>
        <div>
          <span style={{ color: GS.muted }}>Certificate ID</span><br />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <strong style={{ color: GS.ink }}>{cert.certificate_number}</strong>
            <button className={`wallet-copy-btn${copiedId ? ' copied' : ''}`} onClick={handleCopyId}>{copiedId ? 'Copied!' : 'Copy'}</button>
          </div>
        </div>
        <div><span style={{ color: GS.muted }}>Issue Date</span><br /><strong style={{ color: GS.ink }}>{fmt(cert.issue_date)}</strong></div>
        <div><span style={{ color: GS.muted }}>Register No.</span><br /><strong style={{ color: GS.ink }}>{cert.register_number}</strong></div>
        {cert.cgpa && <div><span style={{ color: GS.muted }}>CGPA</span><br /><strong style={{ color: GS.ink }}>{cert.cgpa}</strong></div>}
        <div><span style={{ color: GS.muted }}>Student Email</span><br /><strong style={{ color: GS.ink }}>{cert.student_email || '—'}</strong></div>
      </div>

      <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center', marginBottom: '-280px' }}>
          <CertificateTemplate certificate={cert} qrCodeUrl={qrUrl} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn" onClick={handleDownloadPdf}>Download Certificate PDF</button>
        <button className="btn" onClick={handleToggleShare} style={{ opacity: shareOpen ? 0.8 : 1 }}>{shareOpen ? 'Hide Share Options' : 'Share Certificate'}</button>
        {cert.file_path && (
          <a href={`${API_BASE}${cert.file_path}`} target="_blank" rel="noreferrer"
            style={{ color: GS.ink, fontSize: '0.85rem', fontWeight: 500, textDecoration: 'underline', display: 'flex', alignItems: 'center' }}>
            View Original PDF
          </a>
        )}
      </div>

      {shareOpen && (
        <div style={{ marginTop: '1.25rem', background: GS.bg, border: `1px solid ${GS.border}`, padding: '1.25rem' }}>
          <h3 style={{ color: GS.ink, fontFamily: "'Prata', serif", fontWeight: 400, fontSize: '1.05rem', marginBottom: '1rem' }}>Share &amp; Verify</h3>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <span style={{ color: GS.muted, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>QR Code (scan to verify)</span>
              <img src={qrUrl} alt="Certificate QR Code"
                style={{ width: '100px', height: '100px', border: `1px solid ${GS.border}`, padding: '4px', background: GS.bg, display: 'block' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ color: GS.muted, fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Verification Link</span>
                <div className="wallet-link-box">
                  <span className="wallet-link-url">{verifyLink}</span>
                  <button className={`wallet-copy-btn${copiedLink ? ' copied' : ''}`} onClick={handleCopyLink}>{copiedLink ? 'Copied!' : 'Copy'}</button>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: GS.muted, lineHeight: '1.5' }}>Recipients can verify this certificate without an account using the link above or by scanning the QR code.</p>
            </div>
          </div>

          <div style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
            <div style={{ color: GS.muted, marginBottom: '0.4rem', fontWeight: 600 }}>Cryptographic Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <div><span style={{ color: GS.muted }}>Algorithm</span><br /><strong style={{ color: GS.ink }}>RSA-2048 / SHA-256</strong></div>
              <div><span style={{ color: GS.muted }}>Signature Status</span><br /><span className={`wallet-sig-badge ${sig.cls}`}>{sig.text}</span></div>
            </div>
            {cert.certificate_hash && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ color: GS.muted }}>SHA-256 Hash</span><br />
                <code style={{ fontSize: '0.72rem', color: GS.ink, wordBreak: 'break-all', fontFamily: 'Courier New, monospace' }}>{cert.certificate_hash}</code>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div>
              <div style={{ color: GS.muted, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Activity History</div>
              {history.slice(0, 8).map((evt) => (
                <div key={evt.id} className="wallet-hist-row">
                  <span className={`wallet-hist-type wallet-hist-${evt.type}`}>{evt.type}</span>
                  <span>{evt.type === 'DOWNLOAD' && 'Downloaded as PDF'}{evt.type === 'SHARE' && 'Shared via link'}{evt.type === 'VIEW' && 'Viewed details'}{evt.type === 'VERIFY' && 'Verification requested'}</span>
                  <span className="wallet-hist-time">{fmtDT(evt.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <CertificateTemplate ref={hiddenRef} certificate={cert} qrCodeUrl={qrUrl} />
      </div>
    </div>
  );
}

export default WalletCertCard;

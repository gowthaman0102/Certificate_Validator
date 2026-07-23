import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { verifyCertificate, getPublicKey, getRevokedList, getCertificateByCertNumber } from '../api/client';
import { verifyOffline } from '../utils/offlineCrypto';
import { getCachedPublicKey, setCachedPublicKey } from '../utils/keyCache';
import { cacheRevokedList, isCertRevokedLocally, getLastSyncTime } from '../utils/revocationCache';
import { decodeQrFromCertificateFile } from '../utils/qrDecoder';
import { getCategoryLabel } from '../utils/certificateCategory';
import VerifierBackgroundDecorations from '../components/VerifierBackgroundDecorations';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

function Verifier() {
  /* ── Verification State ── */
  const [inputMode, setInputMode] = useState('certId');
  const [mode, setMode] = useState('online');
  const [qrText, setQrText] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [keySource, setKeySource] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(getLastSyncTime());
  const [bcCopied, setBcCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Single Button Modal/Panel State for "Get QR Data" ── */
  const [showGetQrModal, setShowGetQrModal] = useState(false);
  const [helperTab, setHelperTab] = useState('certId'); // 'certId' | 'file'
  const [helperCertId, setHelperCertId] = useState('');
  const [helperFile, setHelperFile] = useState(null);
  const [retrievedQrData, setRetrievedQrData] = useState('');
  const [helperLoading, setHelperLoading] = useState(false);
  const [helperError, setHelperError] = useState('');
  const [helperCopied, setHelperCopied] = useState(false);
  const helperFileInputRef = useRef(null);

  async function handleSync() {
    setSyncing(true);
    try { const res = await getRevokedList(); cacheRevokedList(res.data); setLastSync(getLastSyncTime()); }
    catch { setError('Could not sync revocation list - no internet connection available.'); }
    finally { setSyncing(false); }
  }

  /* ── Get QR Data Modal Functions ── */
  async function handleGetQrData() {
    setHelperError(''); setRetrievedQrData(''); setHelperLoading(true);
    try {
      if (helperTab === 'certId') {
        if (!helperCertId.trim()) throw new Error('Enter a Certificate ID to get its QR data.');
        const res = await getCertificateByCertNumber(helperCertId.trim());
        const cert = res.data;
        let qrJson;
        if (cert.qr_data) {
          qrJson = cert.qr_data;
        } else {
          // Construct payload JSON if qr_data column was empty
          const payload = {
            cert_id: cert.id,
            certificate_number: cert.certificate_number,
            register_number: cert.register_number,
            student_name: cert.student_name,
            course: cert.course,
            cgpa: cert.cgpa ?? '',
            start_year: cert.start_year ?? '',
            end_year: cert.end_year,
            issue_date: cert.issue_date,
            issuer_id: cert.issuer_code,
            hash: cert.certificate_hash,
            signature: cert.signature
          };
          qrJson = JSON.stringify(payload, null, 2);
        }
        setRetrievedQrData(qrJson);
      } else if (helperTab === 'file') {
        if (!helperFile) throw new Error('Choose a certificate file to extract QR data.');
        const payload = await decodeQrFromCertificateFile(helperFile);
        setRetrievedQrData(JSON.stringify(payload, null, 2));
      }
    } catch (err) {
      setHelperError(err.response?.data?.error || err.message || 'Failed to retrieve QR data.');
    } finally {
      setHelperLoading(false);
    }
  }

  async function handleCopyQrData() {
    if (!retrievedQrData) return;
    try {
      await navigator.clipboard.writeText(retrievedQrData);
      setHelperCopied(true);
      setTimeout(() => setHelperCopied(false), 1800);
    } catch {}
  }

  function handleAutoFillAndVerify() {
    if (!retrievedQrData) return;
    setMode('online');
    setInputMode('qr');
    setQrText(retrievedQrData);
    setResult(null);
    setError('');
    setShowGetQrModal(false);
  }

  /* ── Verification Functions ── */
  async function buildPayload() {
    if (inputMode === 'qr') {
      let text = qrText.replace(/^\uFEFF/, '').trim().replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/[\u00A0]/g, ' ');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      try { return JSON.parse(text); }
      catch { throw new Error('Invalid QR data — could not parse as JSON.'); }
    }
    if (inputMode === 'certId') {
      if (!certNumber.trim()) throw new Error('Enter a certificate ID.');
      const res = await getCertificateByCertNumber(certNumber.trim());
      const cert = res.data;
      return { cert_id: cert.id, certificate_number: cert.certificate_number, register_number: cert.register_number, student_name: cert.student_name, course: cert.course, cgpa: cert.cgpa ?? '', start_year: cert.start_year ?? '', end_year: cert.end_year, issue_date: cert.issue_date, issuer_id: cert.issuer_code, hash: cert.certificate_hash, signature: cert.signature };
    }
    if (inputMode === 'file') {
      if (!uploadedFile) throw new Error('Choose a certificate file to upload.');
      return await decodeQrFromCertificateFile(uploadedFile);
    }
  }

  async function handleVerify() {
    setError(''); setResult(null); setKeySource(''); setLoading(true);
    let payload;
    try { payload = await buildPayload(); }
    catch (err) { setError(err.response?.data?.error || err.message || 'Could not read certificate data'); setLoading(false); return; }
    if (mode === 'online') {
      try { const res = await verifyCertificate(payload); setResult(res.data); }
      catch (err) { setError(err.response?.data?.error || 'Verification request failed'); }
      finally { setLoading(false); } return;
    }
    try {
      const cached = getCachedPublicKey(payload.issuer_id);
      let publicKeyPem;
      if (cached) { publicKeyPem = cached.public_key; setKeySource('cache'); }
      else {
        const res = await getPublicKey(payload.issuer_id);
        publicKeyPem = res.data.public_key;
        setCachedPublicKey(payload.issuer_id, res.data.name, publicKeyPem);
        setKeySource('network (now cached for future offline use)');
      }
      const verifyResult = await verifyOffline(payload, publicKeyPem);
      if (verifyResult.result === 'VALID') {
        const revokedStatus = isCertRevokedLocally(payload.cert_id);
        if (revokedStatus === true) setResult({ result: 'REVOKED', reason: 'This certificate appears in the last synced revocation list.', certificate: verifyResult.certificate, algorithm: verifyResult.algorithm, verifiedAt: verifyResult.verifiedAt, verificationMode: verifyResult.verificationMode, hashStatus: verifyResult.hashStatus, signatureStatus: verifyResult.signatureStatus });
        else if (revokedStatus === null) setResult({ ...verifyResult, message: verifyResult.message + ' (revocation status unknown — sync the revocation list to check)' });
        else setResult(verifyResult);
      } else { setResult(verifyResult); }
    } catch (err) {
      if (err.response?.status === 404) setError('Cannot verify: unknown issuer, and no cached public key available.');
      else if (!err.response) setError('No cached key for this issuer, and no network available to fetch it.');
      else setError('Offline verification failed');
    } finally { setLoading(false); }
  }

  function handleClear() { setQrText(''); setCertNumber(''); setUploadedFile(null); setResult(null); setError(''); setKeySource(''); }
  function handleFileChange(e) { const f = e.target.files[0]; if (f) setUploadedFile(f); }
  function handleRemoveFile() { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  function handleDrop(e) { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (!f) return; const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']; if (!allowed.includes(f.type) && !f.type.startsWith('image/')) { setError('Unsupported file type. Please drop a PDF or image (PNG/JPG).'); return; } setError(''); setResult(null); setUploadedFile(f); }
  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e) { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }

  function resultClass() {
    if (!result) return '';
    if (result.result === 'VALID') return 'result-valid';
    if (result.result === 'REVOKED') return 'result-revoked';
    return 'result-tampered';
  }

  function canVerify() {
    if (inputMode === 'qr') return qrText.trim().length > 0;
    if (inputMode === 'certId') return certNumber.trim().length > 0;
    if (inputMode === 'file') return uploadedFile !== null;
    return false;
  }

  const tabBase = { padding: '8px 14px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${GS.border}`, borderRadius: '0', fontFamily: "'Inter', sans-serif" };
  const tabActive   = { ...tabBase, background: GS.ink, color: '#ffffff' };
  const tabInactive = { ...tabBase, background: GS.bg,  color: GS.ink };

  return (
    <div className="dashboard">
      <VerifierBackgroundDecorations />
      <div className="dashboard-header" style={{ position: 'relative', zIndex: 2 }}>
        <h2>Verify a Certificate</h2>
        <Link to="/" style={{ color: GS.ink, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'underline' }}>Back to Home</Link>
      </div>

      {/* ── MAIN VERIFICATION PROCESS CARD ───────────────────────────────── */}
      <div className="card" id="verification-area" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={mode === 'online' ? tabActive : tabInactive} onClick={() => { setMode('online'); setResult(null); setError(''); }}>Online Verify</button>
            <button style={mode === 'offline' ? tabActive : tabInactive} onClick={() => { setMode('offline'); setResult(null); setError(''); }}>Offline Verify</button>
          </div>

          {/* SINGLE BUTTON FOR "Get QR Data" */}
          <button className="btn-secondary" onClick={() => { setShowGetQrModal(true); setRetrievedQrData(''); setHelperError(''); }} style={{ fontSize: '0.85rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🔍</span> Get QR Data
          </button>
        </div>

        {mode === 'offline' && (
          <div style={{ background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: GS.muted }}>Revocation list last synced: {lastSync ? new Date(lastSync).toLocaleString() : 'never'}</span>
            <button style={tabBase} onClick={handleSync} disabled={syncing}>{syncing ? 'Syncing...' : 'Sync revocation list'}</button>
          </div>
        )}

        <h3>How would you like to verify?</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={inputMode === 'certId' ? tabActive : tabInactive} onClick={() => { setInputMode('certId'); setResult(null); setError(''); }}>Certificate ID</div>
          <div style={inputMode === 'qr'     ? tabActive : tabInactive} onClick={() => { setInputMode('qr');     setResult(null); setError(''); }}>Paste QR Data</div>
          <div style={inputMode === 'file'   ? tabActive : tabInactive} onClick={() => { setInputMode('file');   setResult(null); setError(''); }}>Upload Certificate</div>
        </div>

        {inputMode === 'qr' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>Scan the certificate's QR code with any QR scanner app, then paste the resulting text below.</p>
            <textarea value={qrText} onChange={(e) => setQrText(e.target.value)} placeholder='{"cert_id": "...", "student_name": "...", ...}' rows={6}
              style={{ width: '100%', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '0', color: GS.ink, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }} />
          </>
        )}

        {inputMode === 'certId' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>Enter the certificate ID printed on the certificate (e.g. UNI001-2026-A3F9).</p>
            <input value={certNumber} onChange={(e) => setCertNumber(e.target.value)} placeholder="UNI001-2026-A3F9"
              style={{ width: '100%', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '0', color: GS.ink, padding: '0.65rem 0.75rem', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif" }} />
          </>
        )}

        {inputMode === 'file' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>Upload the certificate file (PDF, PNG, or JPG). The embedded QR code will be read automatically.</p>
            {!uploadedFile && (
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? GS.ink : GS.mid}`, padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#f5f5f5' : GS.bg, transition: 'border-color 0.18s, background 0.18s', userSelect: 'none' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>📄</div>
                <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{isDragging ? 'Release to upload' : 'Drag & drop your certificate here'}</div>
                <div style={{ color: GS.muted, fontSize: '0.8rem', marginBottom: '0.9rem' }}>or click to browse</div>
                <div style={{ display: 'inline-block', background: GS.ink, color: '#ffffff', fontSize: '0.8rem', fontWeight: 500, padding: '0.4rem 1rem', pointerEvents: 'none', fontFamily: "'Prata', serif" }}>Browse File</div>
                <div style={{ color: GS.subtle, fontSize: '0.75rem', marginTop: '0.75rem' }}>Accepted: PDF, PNG, JPG</div>
                <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            )}
            {uploadedFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.7rem 1rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📄</span>
                <span style={{ fontSize: '0.88rem', color: GS.ink, flex: 1, wordBreak: 'break-all' }}>{uploadedFile.name}</span>
                <span style={{ fontSize: '0.75rem', color: GS.muted, whiteSpace: 'nowrap' }}>{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                <button onClick={handleRemoveFile} title="Remove file"
                  style={{ background: GS.ink, color: '#ffffff', border: 'none', borderRadius: '0', width: '24px', height: '24px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, fontWeight: 700, flexShrink: 0 }}>×</button>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button className="btn" onClick={handleVerify} disabled={loading || !canVerify()}>{loading ? 'Verifying...' : 'Verify Certificate'}</button>
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
        </div>
        {error && <div className="error-msg" style={{ marginTop: '1rem' }}>{error}</div>}
        {keySource && <p style={{ color: GS.muted, fontSize: '0.8rem', marginTop: '0.75rem' }}>Public key source: {keySource}</p>}
      </div>

      {/* ── 2. "GET QR DATA" MODAL / EXPANDABLE DIALOG ────────────────────── */}
      {showGetQrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', border: `2px solid ${GS.ink}`, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔍</span> Get QR Data & Hashes
              </h3>
              <button onClick={() => setShowGetQrModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Paste a Certificate ID or upload a certificate file to look up its signed QR data payload and hashes.
            </p>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button style={helperTab === 'certId' ? tabActive : tabInactive} onClick={() => { setHelperTab('certId'); setHelperError(''); setRetrievedQrData(''); }}>Certificate ID</button>
              <button style={helperTab === 'file'   ? tabActive : tabInactive} onClick={() => { setHelperTab('file');   setHelperError(''); setRetrievedQrData(''); }}>Upload Certificate</button>
            </div>

            {/* Tab 1: Certificate ID */}
            {helperTab === 'certId' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: GS.ink, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Certificate ID / Number</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input value={helperCertId} onChange={(e) => setHelperCertId(e.target.value)} placeholder="e.g. ABC001-2026-3953"
                    style={{ flex: 1, minWidth: '220px', background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.65rem 0.75rem', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }} />
                  <button className="btn" onClick={handleGetQrData} disabled={helperLoading || !helperCertId.trim()}>
                    {helperLoading ? 'Fetching...' : 'Get QR Data'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Upload Certificate */}
            {helperTab === 'file' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: GS.ink, marginBottom: '0.35rem', textTransform: 'uppercase' }}>Upload Certificate (PDF / Image)</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input ref={helperFileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => setHelperFile(e.target.files[0])}
                    style={{ flex: 1, minWidth: '220px', background: GS.bg, border: `1px solid ${GS.border}`, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
                  <button className="btn" onClick={handleGetQrData} disabled={helperLoading || !helperFile}>
                    {helperLoading ? 'Extracting...' : 'Get QR Data'}
                  </button>
                </div>
              </div>
            )}

            {helperError && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{helperError}</div>}

            {/* Extracted QR Data Output Box */}
            {retrievedQrData && (
              <div style={{ marginTop: '1rem', background: '#f8f9fa', border: `1px solid ${GS.border}`, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: GS.ink }}>Extracted QR Payload & Hash Data:</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" onClick={handleCopyQrData} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                      {helperCopied ? '✓ Copied' : 'Copy QR Data'}
                    </button>
                    <button className="btn" onClick={handleAutoFillAndVerify} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                      Auto-Fill & Verify
                    </button>
                  </div>
                </div>
                <textarea readOnly value={retrievedQrData} rows={6}
                  style={{ width: '100%', background: '#ffffff', border: `1px solid ${GS.border}`, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.82rem', color: GS.ink, resize: 'vertical' }} />
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '1.25rem' }}>
              <button className="btn-secondary" onClick={() => setShowGetQrModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. VERIFICATION RESULT PANEL ─────────────────────────────────── */}
      {result && (
        <div className={resultClass()}>
          <h2 style={{ marginBottom: '0.5rem' }}>
            {result.result === 'VALID'             && '✓ VALID'}
            {result.result === 'TAMPERED'          && '✕ TAMPERED'}
            {result.result === 'HASH_MISMATCH'     && '✕ HASH MISMATCH'}
            {result.result === 'SIGNATURE_INVALID' && '✕ INVALID SIGNATURE'}
            {result.result === 'REVOKED'           && '✕ REVOKED'}
            {result.result === 'ERROR'             && '⚠ VERIFICATION ERROR'}
          </h2>
          <p>{result.message || result.reason}</p>

          {result.certificate && (
            <div style={{ marginTop: '1rem', textAlign: 'left', display: 'inline-block' }}>
              <p><strong>Student:</strong> {result.certificate.student_name}</p>
              <p><strong>Course:</strong> {result.certificate.course}</p>
              <p><strong>Issue Date:</strong> {result.certificate.issue_date}</p>
              {result.certificate.issuer && <p><strong>Issuer:</strong> {result.certificate.issuer}</p>}
              {result.certificate.issuer_id && <p><strong>Issuer Code:</strong> {result.certificate.issuer_id}</p>}
              {result.certificate.certificate_number && <p><strong>Certificate No.:</strong> {result.certificate.certificate_number}</p>}
              {result.certificate.certificate_category && <p><strong>Certificate Category:</strong> {getCategoryLabel(result.certificate.certificate_category)}</p>}
              {result.certificate.certificate_detail && <p><strong>Certificate Detail:</strong> {result.certificate.certificate_detail}</p>}
            </div>
          )}

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', textAlign: 'left', width: '100%' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Cryptographic Verification</p>
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span>{result.hashStatus === 'MATCH' && '✓'}{result.hashStatus === 'MISMATCH' && '✕'}{(!result.hashStatus || result.hashStatus === 'UNCHECKED') && '○'}</span>
                <span><strong>SHA-256 Hash:</strong>{' '}
                  {result.hashStatus === 'MATCH' && 'Verified — data is intact'}
                  {result.hashStatus === 'MISMATCH' && 'FAILED — data has been tampered'}
                  {(!result.hashStatus || result.hashStatus === 'UNCHECKED') && 'Not checked'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span>{result.signatureStatus === 'VALID' && '✓'}{result.signatureStatus === 'INVALID' && '✕'}{result.signatureStatus === 'ERROR' && '⚠'}{(!result.signatureStatus || result.signatureStatus === 'UNCHECKED') && '○'}</span>
                <span><strong>RSA-2048 Signature:</strong>{' '}
                  {result.signatureStatus === 'VALID' && 'Valid — issued by the stated university'}
                  {result.signatureStatus === 'INVALID' && 'FAILED — signature does not match issuer key'}
                  {result.signatureStatus === 'ERROR' && 'Error — invalid key or corrupted signature'}
                  {(!result.signatureStatus || result.signatureStatus === 'UNCHECKED') && 'Not checked'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span>{result.result === 'VALID' && '✓'}{result.result === 'REVOKED' && '✕'}{result.result !== 'VALID' && result.result !== 'REVOKED' && '○'}</span>
                <span><strong>Revocation Status:</strong>{' '}
                  {result.result === 'VALID' && (mode === 'online' ? 'Active — not revoked' : 'Active (locally cached list)')}
                  {result.result === 'REVOKED' && 'REVOKED by issuer'}
                  {result.result !== 'VALID' && result.result !== 'REVOKED' && 'Skipped (prior check failed)'}
                </span>
              </div>
              {mode === 'online' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <span>{result.blockchain?.verified ? '✓' : '○'}</span>
                  <span><strong>Blockchain Anchor:</strong>{' '}{result.blockchain?.verified ? `Block #${result.blockchain.blockNumber} — ${result.blockchain.network}` : 'Not anchored on ledger'}</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.75rem', display: 'grid', gap: '0.3rem', fontSize: '0.8rem', opacity: 0.9 }}>
              <p style={{ margin: 0 }}><strong>Algorithm:</strong> {result.algorithm || (mode === 'offline' ? 'SHA256-RSA2048' : '—')}</p>
              <p style={{ margin: 0 }}><strong>Verification Mode:</strong> {result.verificationMode || (mode === 'offline' ? 'OFFLINE' : 'ONLINE')}</p>
              <p style={{ margin: 0 }}><strong>Verified At:</strong> {result.verifiedAt ? new Date(result.verifiedAt).toLocaleString('en-IN', { hour12: false }) : new Date().toLocaleString('en-IN', { hour12: false })}</p>
              {keySource && <p style={{ margin: 0 }}><strong>Public Key Source:</strong> {keySource}</p>}
            </div>
          </div>

          {result.result === 'VALID' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', textAlign: 'left', width: '100%' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Blockchain Anchor</p>
              {mode === 'offline' ? (
                <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>Blockchain status not checked — switch to Online Verify to confirm hash anchoring.</p>
              ) : result.blockchain?.verified ? (
                <div style={{ textAlign: 'left', display: 'inline-block' }}>
                  <p><strong>✓ Hash anchored on-chain</strong></p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Transaction ID:</strong>{' '}<span style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}>{result.blockchain.txId}</span>
                    <button onClick={async () => { try { await navigator.clipboard.writeText(result.blockchain.txId); setBcCopied(true); setTimeout(() => setBcCopied(false), 1500); } catch {} }}
                      style={{ marginLeft: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '0', color: 'inherit', fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer' }}>
                      {bcCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Block Number:</strong> {result.blockchain.blockNumber}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Anchored At:</strong> {result.blockchain.anchoredAt ? new Date(result.blockchain.anchoredAt).toLocaleString('en-IN', { hour12: false }) : '—'}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Network:</strong> {result.blockchain.network}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Status:</strong> {result.blockchain.status}</p>
                  <Link to="/blockchain-explorer" style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.82rem', opacity: 0.9 }}>View in Blockchain Explorer →</Link>
                </div>
              ) : (
                <div>
                  <p><strong>⚠ Not anchored</strong></p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>This certificate's hash was not found on the blockchain ledger.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Verifier;

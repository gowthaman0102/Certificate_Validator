import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyCertificate, getPublicKey, getRevokedList, getCertificateByCertNumber } from '../api/client';
import { verifyOffline } from '../utils/offlineCrypto';
import { getCachedPublicKey, setCachedPublicKey } from '../utils/keyCache';
import { cacheRevokedList, isCertRevokedLocally, getLastSyncTime } from '../utils/revocationCache';
import { decodeQrFromCertificateFile } from '../utils/qrDecoder';
import { getCategoryLabel } from '../utils/certificateCategory';
import CategoryCertificateTemplate from '../components/templates/CategoryCertificateTemplate';
import VerifierBackgroundDecorations from '../components/VerifierBackgroundDecorations';
import useHeaderHeight from '../hooks/useHeaderHeight';
import { API_BASE } from '../config';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

/* ── Animation variants — premium ease, only transform+opacity ── */

// QR scan area: show the sweep line while waiting for input
const PREMIUM = [0.16, 1, 0.3, 1];
const INTERACTIVE = [0.4, 0, 0.2, 1];

// Result panel container — wraps on enter; shake on failure
const resultPanelVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: PREMIUM } },
  shake:   { opacity: 1, transition: { duration: 0.3, ease: INTERACTIVE } },
};

// Staggered field reveal inside result card (name, course, date, hash...)
const fieldContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.12 } },
};
const fieldVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: PREMIUM } },
};

// Success checkmark SVG path draw-in
const CHECK_LENGTH = 60; // approximate path length
const checkCircleVariants = {
  hidden:  { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22, mass: 0.8 },
  },
};
const checkPathVariants = {
  hidden:  { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, ease: PREMIUM, delay: 0.18 } },
};

function Verifier() {
  useHeaderHeight('.dashboard-header');
  /* ── Verification State ── */
  const [inputMode, setInputMode]   = useState('certId');
  const [mode, setMode]             = useState('online');
  const [qrText, setQrText]         = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [keySource, setKeySource]   = useState('');
  const [syncing, setSyncing]       = useState(false);
  const [lastSync, setLastSync]     = useState(getLastSyncTime());
  const [bcCopied, setBcCopied]     = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // shake key: changing it re-triggers the animation
  const [shakeKey, setShakeKey]     = useState(0);
  const fileInputRef = useRef(null);

  /* ── Batch Verification State (Phase 6) ── */
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const batchFileInputRef = useRef(null);

  function handleBatchFileSelect(filesList) {
    const files = Array.from(filesList);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const filtered = files.filter(f => validTypes.includes(f.type) || f.type.startsWith('image/'));

    if (filtered.length === 0) {
      setError('No valid PDF or Image files selected.');
      return;
    }

    setError('');
    setBatchFiles(filtered.map((f, i) => ({
      id: `batch-${Date.now()}-${i}`,
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(0),
      status: 'pending',
      result: null,
      error: null,
    })));
  }

  async function handleBatchVerify() {
    if (batchFiles.length === 0 || batchProcessing) return;
    setBatchProcessing(true);
    setError('');

    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'verifying' } : f));

      try {
        let payload = await decodeQrFromCertificateFile(item.file);

        if (payload && payload.cert_id_from_name) {
          const res = await getCertificateByCertNumber(payload.cert_id_from_name);
          const cert = res.data;
          payload = {
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
            signature: cert.signature,
          };
        } else if (typeof payload === 'string') {
          try { payload = JSON.parse(payload); } catch {}
        }

        if (!payload || typeof payload !== 'object' || !payload.hash || !payload.signature) {
          throw new Error('No QR payload found in file');
        }

        if (mode === 'online') {
          const res = await verifyCertificate(payload);
          setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'completed', result: res.data } : f));
        } else {
          const cached = getCachedPublicKey(payload.issuer_id);
          let publicKeyPem;
          if (cached) { publicKeyPem = cached.public_key; }
          else {
            const res = await getPublicKey(payload.issuer_id);
            publicKeyPem = res.data.public_key;
            setCachedPublicKey(payload.issuer_id, res.data.name, publicKeyPem);
          }
          const verifyResult = await verifyOffline(payload, publicKeyPem);
          if (verifyResult.result === 'VALID') {
            const revokedStatus = isCertRevokedLocally(payload.cert_id);
            if (revokedStatus === true) {
              setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'completed', result: { result: 'REVOKED', reason: 'Appears in revocation list', certificate: verifyResult.certificate } } : f));
            } else {
              setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'completed', result: verifyResult } : f));
            }
          } else {
            setBatchFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'completed', result: verifyResult } : f));
          }
        }
      } catch (err) {
        const errReason = err.response?.data?.error || err.message || 'Could not extract or verify QR code';
        setBatchFiles(prev => prev.map((f, idx) => idx === i ? {
          ...f,
          status: 'error',
          error: errReason,
          result: {
            result: 'ERROR',
            reason: errReason,
            hashStatus: 'MISMATCH',
            signatureStatus: 'INVALID',
            certificate: {
              student_name: 'Unverified Document',
              course: 'Unknown Course',
              certificate_number: item.name,
              issue_date: 'N/A',
              issuer: 'Unknown Issuer',
              certificate_category: 'Course Completion Certificate',
            }
          }
        } : f));
      }
    }

    setBatchProcessing(false);
  }

  const [batchModalItem, setBatchModalItem] = useState(null);

  function handleSelectBatchItem(item) {
    if (!item.result && item.status !== 'error') return;
    const resObj = item.result || {
      result: 'ERROR',
      reason: item.error || 'Could not extract or verify QR code',
      hashStatus: 'MISMATCH',
      signatureStatus: 'INVALID',
      certificate: {
        student_name: 'Unverified Document',
        course: 'Unknown Course',
        certificate_number: item.name,
        issue_date: 'N/A',
        issuer: 'Unknown Issuer',
        certificate_category: 'Course Completion Certificate',
      }
    };
    setBatchModalItem({ item, result: resObj });
  }

  /* ── Get QR Data Modal State ── */
  const [showGetQrModal, setShowGetQrModal]   = useState(false);
  const [helperTab, setHelperTab]             = useState('certId');
  const [helperCertId, setHelperCertId]       = useState('');
  const [helperFile, setHelperFile]           = useState(null);
  const [retrievedQrData, setRetrievedQrData] = useState('');
  const [helperLoading, setHelperLoading]     = useState(false);
  const [helperError, setHelperError]         = useState('');
  const [helperCopied, setHelperCopied]       = useState(false);
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
          const payload = {
            cert_id: cert.id, certificate_number: cert.certificate_number,
            register_number: cert.register_number, student_name: cert.student_name,
            course: cert.course, cgpa: cert.cgpa ?? '', start_year: cert.start_year ?? '',
            end_year: cert.end_year, issue_date: cert.issue_date, issuer_id: cert.issuer_code,
            hash: cert.certificate_hash, signature: cert.signature,
          };
          qrJson = JSON.stringify(payload, null, 2);
        }
        setRetrievedQrData(qrJson);
      } else if (helperTab === 'file') {
        if (!helperFile) throw new Error('Choose a certificate file to extract QR data.');
        const payload = await decodeQrFromCertificateFile(helperFile);
        let finalPayload = payload;
        if (payload && payload.cert_id_from_name) {
          const res = await getCertificateByCertNumber(payload.cert_id_from_name);
          const cert = res.data;
          finalPayload = cert.qr_data ? JSON.parse(cert.qr_data) : {
            cert_id: cert.id, certificate_number: cert.certificate_number,
            register_number: cert.register_number, student_name: cert.student_name,
            course: cert.course, cgpa: cert.cgpa ?? '', start_year: cert.start_year ?? '',
            end_year: cert.end_year, issue_date: cert.issue_date, issuer_id: cert.issuer_code,
            hash: cert.certificate_hash, signature: cert.signature,
          };
        }
        setRetrievedQrData(JSON.stringify(finalPayload, null, 2));
      }
    } catch (err) {
      setHelperError(err.response?.data?.error || err.message || 'Failed to retrieve QR data.');
    } finally { setHelperLoading(false); }
  }

  async function handleCopyQrData() {
    if (!retrievedQrData) return;
    try { await navigator.clipboard.writeText(retrievedQrData); setHelperCopied(true); setTimeout(() => setHelperCopied(false), 1800); }
    catch {}
  }

  function handleAutoFillAndVerify() {
    if (!retrievedQrData) return;
    setMode('online'); setInputMode('qr'); setQrText(retrievedQrData);
    setResult(null); setError(''); setShowGetQrModal(false);
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
      return {
        cert_id: cert.id, certificate_number: cert.certificate_number,
        register_number: cert.register_number, student_name: cert.student_name,
        course: cert.course, cgpa: cert.cgpa ?? '', start_year: cert.start_year ?? '',
        end_year: cert.end_year, issue_date: cert.issue_date, issuer_id: cert.issuer_code,
        hash: cert.certificate_hash, signature: cert.signature,
      };
    }
    if (inputMode === 'file') {
      if (!uploadedFile) throw new Error('Choose a certificate file to upload.');
      let payload = await decodeQrFromCertificateFile(uploadedFile);
      if (!payload) throw new Error('No QR code or valid payload found in uploaded file.');

      // Only query DB if file has no embedded QR code/hash and only a Cert ID text match
      if (payload?.cert_id_from_name && !payload?.hash) {
        const res = await getCertificateByCertNumber(payload.cert_id_from_name);
        const cert = res.data;
        return {
          cert_id: cert.id, certificate_number: cert.certificate_number,
          register_number: cert.register_number, student_name: cert.student_name,
          course: cert.course, cgpa: cert.cgpa ?? '', start_year: cert.start_year ?? '',
          end_year: cert.end_year, issue_date: cert.issue_date, issuer_id: cert.issuer_code,
          hash: cert.certificate_hash, signature: cert.signature,
        };
      }
      return payload;
    }
  }

  async function handleVerify() {
    setError(''); setResult(null); setKeySource(''); setLoading(true);
    let payload;
    try { payload = await buildPayload(); }
    catch (err) { setError(err.response?.data?.error || err.message || 'Could not read certificate data'); setLoading(false); return; }

    if (mode === 'online') {
      try {
        const res = await verifyCertificate(payload);
        setResult(res.data);
        if (res.data.result !== 'VALID') setShakeKey(k => k + 1);
      }
      catch (err) {
        if (err.response?.data?.result) {
          setResult(err.response.data);
          setShakeKey(k => k + 1);
        } else {
          setError(err.response?.data?.error || 'Verification request failed');
        }
      }
      finally { setLoading(false); }
      return;
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
      // Asynchronously log verification event to backend so university activity feed updates live
      verifyCertificate(payload).catch(() => {});
      if (verifyResult.result === 'VALID') {
        const revokedStatus = isCertRevokedLocally(payload.cert_id);
        if (revokedStatus === true)
          setResult({ result: 'REVOKED', reason: 'This certificate appears in the last synced revocation list.', certificate: verifyResult.certificate, algorithm: verifyResult.algorithm, verifiedAt: verifyResult.verifiedAt, verificationMode: verifyResult.verificationMode, hashStatus: verifyResult.hashStatus, signatureStatus: verifyResult.signatureStatus });
        else if (revokedStatus === null)
          setResult({ ...verifyResult, message: verifyResult.message + ' (revocation status unknown — sync the revocation list to check)' });
        else
          setResult(verifyResult);
      } else {
        setResult(verifyResult);
        setShakeKey(k => k + 1);
      }
    } catch (err) {
      if (err.response?.status === 404) setError('Cannot verify: unknown issuer, and no cached public key available.');
      else if (!err.response) setError('No cached key for this issuer, and no network available to fetch it.');
      else setError('Offline verification failed');
    } finally { setLoading(false); }
  }

  function handleClear() { setQrText(''); setCertNumber(''); setUploadedFile(null); setResult(null); setError(''); setKeySource(''); }
  function handleFileChange(e) { const f = e.target.files[0]; if (f) setUploadedFile(f); }
  function handleRemoveFile() { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }
  function handleDrop(e) {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (!f) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(f.type) && !f.type.startsWith('image/')) { setError('Unsupported file type. Please drop a PDF or image (PNG/JPG).'); return; }
    setError(''); setResult(null); setUploadedFile(f);
  }
  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e) { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }

  function canVerify() {
    if (inputMode === 'qr')     return qrText.trim().length > 0;
    if (inputMode === 'certId') return certNumber.trim().length > 0;
    if (inputMode === 'file')   return uploadedFile !== null;
    return false;
  }

  const tabBase     = { padding: '8px 18px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${GS.border}`, borderRadius: '25px', fontFamily: "'Inter', sans-serif" };
  const tabActive   = { ...tabBase, background: GS.ink, color: '#ffffff' };
  const tabInactive = { ...tabBase, background: GS.bg,  color: GS.ink };

  const isValid   = result?.result === 'VALID';
  const isRevoked = result?.result === 'REVOKED';
  const isFailed  = result && !isValid;

  return (
    <div className="dashboard">
      <VerifierBackgroundDecorations />
      <div className="dashboard-header">
        <h2>Verify a Certificate</h2>
        <Link to="/" className="btn-back-home-oval" id="verifier-back-home-btn">← Back to Home</Link>
      </div>

      {/* ── MAIN VERIFICATION PROCESS CARD ─────────────────────────── */}
      <div className="card" id="verification-area" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={mode === 'online'  ? tabActive : tabInactive} onClick={() => { setMode('online');  setResult(null); setError(''); }}>Online Verify</button>
            <button style={mode === 'offline' ? tabActive : tabInactive} onClick={() => { setMode('offline'); setResult(null); setError(''); }}>Offline Verify</button>
          </div>
          <button className="btn-secondary" onClick={() => { setShowGetQrModal(true); setRetrievedQrData(''); setHelperError(''); }}
            style={{ fontSize: '0.85rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={inputMode === 'certId' ? tabActive : tabInactive} onClick={() => { setInputMode('certId'); setResult(null); setError(''); }}>Certificate ID</div>
          <div style={inputMode === 'qr'     ? tabActive : tabInactive} onClick={() => { setInputMode('qr');     setResult(null); setError(''); }}>Paste QR Data</div>
          <div style={inputMode === 'file'   ? tabActive : tabInactive} onClick={() => { setInputMode('file');   setResult(null); setError(''); }}>Upload Certificate</div>
          <div style={inputMode === 'batch'  ? tabActive : tabInactive} onClick={() => { setInputMode('batch');  setResult(null); setError(''); }}>Batch Verification</div>
        </div>

        {/* ── QR Input — with animated scan-line ── */}
        {inputMode === 'qr' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
              Scan the certificate's QR code with any QR scanner app, then paste the resulting text below.
            </p>
            {/* Scan-line container: only shows line while textarea is empty */}
            <div style={{ position: 'relative' }}>
              {!qrText.trim() && (
                <div
                  className="qr-scan-line"
                  style={{ top: 0, zIndex: 1, borderRadius: '2px' }}
                />
              )}
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder='{"cert_id": "...", "student_name": "...", ...}'
                rows={6}
                style={{ width: '100%', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '25px', color: GS.ink, padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical', position: 'relative', zIndex: 2 }}
              />
            </div>
          </>
        )}

        {inputMode === 'certId' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
              Enter the certificate ID printed on the certificate (e.g. UNI001-2026-A3F9).
            </p>
            <input value={certNumber} onChange={(e) => setCertNumber(e.target.value)} placeholder="UNI001-2026-A3F9"
              style={{ width: '100%', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '25px', color: GS.ink, padding: '0.65rem 1.25rem', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif" }} />
          </>
        )}

        {inputMode === 'file' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
              Upload the certificate file (PDF, PNG, or JPG). The embedded QR code will be read automatically.
            </p>
            {!uploadedFile && (
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? GS.ink : GS.mid}`, borderRadius: '25px', padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#f5f5f5' : GS.bg, transition: 'border-color 0.18s, background 0.18s', userSelect: 'none' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>📄</div>
                <div style={{ fontWeight: 600, color: GS.ink, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{isDragging ? 'Release to upload' : 'Drag & drop your certificate here'}</div>
                <div style={{ color: GS.muted, fontSize: '0.8rem', marginBottom: '0.9rem' }}>or click to browse</div>
                <div style={{ display: 'inline-block', background: GS.ink, color: '#ffffff', fontSize: '0.8rem', fontWeight: 500, padding: '0.4rem 1.25rem', borderRadius: '25px', pointerEvents: 'none', fontFamily: "'Prata', serif" }}>Browse File</div>
                <div style={{ color: GS.subtle, fontSize: '0.75rem', marginTop: '0.75rem' }}>Accepted: PDF, PNG, JPG</div>
                <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            )}
            {uploadedFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '25px', padding: '0.7rem 1.25rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📄</span>
                <span style={{ fontSize: '0.88rem', color: GS.ink, flex: 1, wordBreak: 'break-all', fontWeight: 500 }}>{uploadedFile.name}</span>
                <span style={{ fontSize: '0.75rem', color: GS.muted, whiteSpace: 'nowrap' }}>{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                <button onClick={handleRemoveFile} title="Remove file"
                  style={{ background: GS.ink, color: '#ffffff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, fontWeight: 700, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            )}
          </>
        )}

        {/* ── Batch Verification Mode (Phase 6) ── */}
        {inputMode === 'batch' && (
          <>
            <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
              Drag and drop multiple certificate files (PDFs/Images) to verify them sequentially with individual status updates and summary statistics.
            </p>
            <div
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleBatchFileSelect(e.dataTransfer.files); }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => batchFileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? GS.ink : GS.mid}`,
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? '#f5f5f5' : GS.bg,
                transition: 'all 0.18s ease',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 700, color: GS.ink, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {isDragging ? 'Release to upload files' : 'Drop multiple certificates here'}
              </div>
              <div style={{ color: GS.muted, fontSize: '0.8rem', marginBottom: '0.8rem' }}>or click to select multiple files</div>
              <div style={{ display: 'inline-block', background: GS.ink, color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 1.2rem', borderRadius: '20px', pointerEvents: 'none' }}>
                Select Files
              </div>
              <input
                ref={batchFileInputRef}
                type="file"
                accept="application/pdf,image/*"
                multiple
                onChange={(e) => { if (e.target.files?.length) handleBatchFileSelect(e.target.files); }}
                style={{ display: 'none' }}
              />
            </div>

            {batchFiles.length > 0 && (
              <div>
                {/* Batch Summary Header */}
                {batchFiles.some(f => f.status === 'completed' || f.status === 'error') && (
                  <div style={{ background: '#0a0a0a', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      SUMMARY: {batchFiles.filter(f => f.result?.result === 'VALID').length} Valid, {batchFiles.filter(f => f.result?.result === 'REVOKED').length} Revoked, {batchFiles.filter(f => f.result && f.result.result !== 'VALID' && f.result.result !== 'REVOKED').length} Tampered / Error
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>
                      Progress: {batchFiles.filter(f => f.status === 'completed' || f.status === 'error').length} / {batchFiles.length}
                    </div>
                  </div>
                )}

                {/* Per-File Sequential Cascade Row List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {batchFiles.map((item, idx) => {
                    const isSelected = batchModalItem && batchModalItem.item.name === item.name;
                    const canInspect = item.status === 'completed' || item.status === 'error';
                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04, ease: PREMIUM }}
                        onClick={() => { if (canInspect) handleSelectBatchItem(item); }}
                        style={{
                          background: isSelected ? '#f1f5f9' : '#ffffff',
                          border: isSelected ? '2px solid #0a0a0a' : `1.5px solid ${GS.border}`,
                          borderRadius: '10px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          cursor: canInspect ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: GS.ink, wordBreak: 'break-all' }}>
                            📄 {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: GS.muted, marginTop: '2px' }}>
                            Size: {item.size} KB {item.result?.certificate?.student_name ? ` · Student: ${item.result.certificate.student_name} (${item.result.certificate.certificate_number || ''})` : item.error ? ` · Error: ${item.error}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.status === 'pending' && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: GS.muted, background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                              PENDING
                            </span>
                          )}
                          {item.status === 'verifying' && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', background: '#0a0a0a', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                              VERIFYING...
                            </span>
                          )}
                          {canInspect && (
                            <>
                              <span className={`status-badge ${item.result?.result === 'VALID' ? 'status-valid' : 'status-revoked'}`} style={item.result?.result === 'REVOKED' ? { background: '#0a0a0a', color: '#ffffff' } : {}}>
                                {item.result?.result || 'ERROR'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: GS.ink, fontWeight: 700, textDecoration: 'underline', paddingLeft: '4px' }}>
                                View Result →
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button className="btn" onClick={handleBatchVerify} disabled={batchProcessing}>
                    {batchProcessing ? 'Processing Batch...' : 'Start Batch Verification'}
                  </button>
                  <button className="btn-secondary" onClick={() => setBatchFiles([])} disabled={batchProcessing}>
                    Clear Batch
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {inputMode !== 'batch' && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn" onClick={handleVerify} disabled={loading || !canVerify()}>{loading ? 'Verifying...' : 'Verify Certificate'}</button>
            <button className="btn-secondary" onClick={handleClear}>Clear</button>
          </div>
        )}
        {error && <div className="error-msg" style={{ marginTop: '1rem' }}>{error}</div>}
        {keySource && <p style={{ color: GS.muted, fontSize: '0.8rem', marginTop: '0.75rem' }}>Public key source: {keySource}</p>}
      </div>

      {/* ── GET QR DATA MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showGetQrModal && (
          <motion.div
            key="qr-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              key="qr-modal-card"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: PREMIUM }}
              className="card"
              style={{ width: '100%', maxWidth: '600px', margin: '0 auto', border: `2px solid ${GS.ink}`, borderRadius: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔍</span> Get QR Data &amp; Hashes
                </h3>
                <button onClick={() => setShowGetQrModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>
              <p style={{ color: GS.muted, fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Paste a Certificate ID or upload a certificate file to look up its signed QR data payload and hashes.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button style={helperTab === 'certId' ? tabActive : tabInactive} onClick={() => { setHelperTab('certId'); setHelperError(''); setRetrievedQrData(''); }}>Certificate ID</button>
                <button style={helperTab === 'file'   ? tabActive : tabInactive} onClick={() => { setHelperTab('file');   setHelperError(''); setRetrievedQrData(''); }}>Upload Certificate</button>
              </div>
              {helperTab === 'certId' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label>Certificate ID / Number</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input value={helperCertId} onChange={(e) => setHelperCertId(e.target.value)} placeholder="e.g. ABC001-2026-3953"
                      style={{ flex: 1, minWidth: '220px', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '25px', padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }} />
                    <button className="btn" onClick={handleGetQrData} disabled={helperLoading || !helperCertId.trim()}>
                      {helperLoading ? 'Fetching...' : 'Get QR Data'}
                    </button>
                  </div>
                </div>
              )}
              {helperTab === 'file' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label>Upload Certificate (PDF / Image)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input ref={helperFileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => setHelperFile(e.target.files[0])}
                      style={{ flex: 1, minWidth: '220px', background: GS.bg, border: `1px solid ${GS.border}`, borderRadius: '25px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} />
                    <button className="btn" onClick={handleGetQrData} disabled={helperLoading || !helperFile}>
                      {helperLoading ? 'Extracting...' : 'Get QR Data'}
                    </button>
                  </div>
                </div>
              )}
              {helperError && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{helperError}</div>}
              {retrievedQrData && (
                <div style={{ marginTop: '1rem', background: '#f8f9fa', border: `1px solid ${GS.border}`, borderRadius: '25px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: GS.ink }}>Extracted QR Payload &amp; Hash Data:</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-secondary" onClick={handleCopyQrData} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>{helperCopied ? '✓ Copied' : 'Copy QR Data'}</button>
                      <button className="btn" onClick={handleAutoFillAndVerify} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>Auto-Fill &amp; Verify</button>
                    </div>
                  </div>
                  <textarea readOnly value={retrievedQrData} rows={6}
                    style={{ width: '100%', background: '#ffffff', border: `1px solid ${GS.border}`, borderRadius: '25px', padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: GS.ink, resize: 'vertical' }} />
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: '1.25rem' }}>
                <button className="btn-secondary" onClick={() => setShowGetQrModal(false)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BATCH RESULT POP-UP MODAL SCREEN ─────────────────────── */}
      <AnimatePresence>
        {batchModalItem && (
          <motion.div
            key="batch-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto',
            }}
            onClick={() => setBatchModalItem(null)}
          >
            <motion.div
              key="batch-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.3, ease: PREMIUM }}
              className="card"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '920px',
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 'auto',
                background: '#ffffff',
                border: '2.5px solid #0a0a0a',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                padding: '1.75rem 2rem',
                position: 'relative',
                color: '#0a0a0a',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #0a0a0a', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>📄</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0a0a0a' }}>
                      {batchModalItem.item.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: GS.muted }}>
                      Verified Batch Certificate Inspection
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setBatchModalItem(null)}
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 700, color: '#0a0a0a', padding: '0 0.5rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Result Status Banner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1.5px solid #0a0a0a', borderRadius: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0a0a0a' }}>
                  {batchModalItem.result.result === 'VALID'             && 'CERTIFICATE AUTHENTIC & VALID'}
                  {batchModalItem.result.result === 'TAMPERED'          && 'TAMPERED / INTEGRITY FAILED'}
                  {batchModalItem.result.result === 'HASH_MISMATCH'     && 'HASH MISMATCH / CORRUPTED'}
                  {batchModalItem.result.result === 'SIGNATURE_INVALID' && 'INVALID DIGITAL SIGNATURE'}
                  {batchModalItem.result.result === 'REVOKED'           && 'CERTIFICATE REVOKED BY ISSUER'}
                  {batchModalItem.result.result === 'ERROR'             && 'VERIFICATION ERROR'}
                </h2>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0.3rem 0.9rem', borderRadius: '25px', background: batchModalItem.result.result === 'VALID' ? '#10B981' : (batchModalItem.result.result === 'REVOKED' ? '#0a0a0a' : '#EF4444'), color: '#ffffff', letterSpacing: '0.05em' }}>
                  STATUS: {batchModalItem.result.result}
                </span>
              </div>

              <p style={{ fontSize: '0.92rem', fontWeight: 500, margin: '0 0 1.25rem 0', color: '#333333' }}>
                {batchModalItem.result.message || batchModalItem.result.reason}
              </p>



              {/* Metadata Grid */}
              {batchModalItem.result.certificate && (
                <div style={{ background: '#e8e8e8', border: '1px solid #0a0a0a', padding: '1.1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem', textAlign: 'left', color: '#0a0a0a' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem 1.25rem', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ color: '#666666', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Student Name</span><br />
                      <strong>{batchModalItem.result.certificate.student_name}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#666666', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Issue Date</span><br />
                      <strong>{batchModalItem.result.certificate.issue_date}</strong>
                    </div>
                    {batchModalItem.result.certificate.issuer && (
                      <div>
                        <span style={{ color: '#666666', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Issuing University</span><br />
                        <strong>{batchModalItem.result.certificate.issuer}</strong>
                      </div>
                    )}
                    {batchModalItem.result.certificate.certificate_number && (
                      <div>
                        <span style={{ color: '#666666', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Certificate Number</span><br />
                        <strong style={{ fontFamily: 'monospace' }}>{batchModalItem.result.certificate.certificate_number}</strong>
                      </div>
                    )}
                    {batchModalItem.result.certificate.certificate_category && (
                      <div>
                        <span style={{ color: '#666666', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Category</span><br />
                        <strong>{getCategoryLabel(batchModalItem.result.certificate.certificate_category)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visual Certificate Document Preview with Status Stamp */}
              {batchModalItem.result.certificate && (
                <div style={{ margin: '1.25rem 0', position: 'relative' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', textAlign: 'left', color: '#0a0a0a' }}>
                    Visual Certificate Document Preview:
                  </div>
                  <div style={{ overflowX: 'auto', background: '#e2e8f0', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #0a0a0a', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <CategoryCertificateTemplate
                      certificate={{ ...batchModalItem.result.certificate, university_name: batchModalItem.result.certificate.issuer || batchModalItem.result.certificate.university_name || 'Issuing University' }}
                      qrCodeUrl={
                        (batchModalItem.result.certificate.id || batchModalItem.result.certificate.cert_id)
                          ? `${API_BASE}/uploads/qr_${batchModalItem.result.certificate.id || batchModalItem.result.certificate.cert_id}.png`
                          : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(batchModalItem.result.certificate.certificate_number || batchModalItem.result.certificate.student_name || 'VERIFIED')}`
                      }
                    />
                    {/* Status Stamp Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-15deg)',
                      fontSize: '3.5rem',
                      fontWeight: 900,
                      color: batchModalItem.result.result === 'VALID' ? '#10B981' : '#EF4444',
                      border: `6px double ${batchModalItem.result.result === 'VALID' ? '#10B981' : '#EF4444'}`,
                      padding: '0.5rem 2rem',
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                      letterSpacing: '0.1em',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}>
                      {batchModalItem.result.result === 'VALID'    && 'VALID'}
                      {batchModalItem.result.result === 'REVOKED'  && 'REVOKED'}
                      {(batchModalItem.result.result === 'TAMPERED' || batchModalItem.result.result === 'HASH_MISMATCH' || batchModalItem.result.result === 'SIGNATURE_INVALID' || batchModalItem.result.result === 'ERROR') && 'TAMPERED'}
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Audit Checklist */}
              <div style={{ marginTop: '1.25rem', borderTop: '2px solid #0a0a0a', paddingTop: '1rem', textAlign: 'left', color: '#0a0a0a' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.92rem' }}>Cryptographic Verification Audit</p>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>{batchModalItem.result.hashStatus === 'MATCH' ? '✓' : '✕'}</span>
                    <span><strong>SHA-256 Hash Integrity:</strong> {batchModalItem.result.hashStatus === 'MATCH' ? 'Verified — data payload is 100% intact' : 'FAILED — data hash mismatch'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>{batchModalItem.result.signatureStatus === 'VALID' ? '✓' : '✕'}</span>
                    <span><strong>RSA-2048 Digital Signature:</strong> {batchModalItem.result.signatureStatus === 'VALID' ? 'Valid — signed by official university key' : 'FAILED — signature invalid'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>{batchModalItem.result.result === 'VALID' ? '✓' : batchModalItem.result.result === 'REVOKED' ? '✕' : '○'}</span>
                    <span><strong>Revocation Status:</strong> {batchModalItem.result.result === 'VALID' ? 'Active — certificate not revoked' : batchModalItem.result.result === 'REVOKED' ? 'REVOKED by issuer' : 'Skipped'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Close Button */}
              <div style={{ textAlign: 'right', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button className="btn" onClick={() => setBatchModalItem(null)}>
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VERIFICATION RESULT PANEL ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {result && inputMode !== 'batch' && (
          <motion.div
            key={`result-${shakeKey}`}
            className="card"
            variants={resultPanelVariants}
            initial="hidden"
            animate={isFailed ? 'shake' : 'visible'}
            style={{ position: 'relative', zIndex: 2, marginTop: '1.5rem', background: '#ffffff', border: '2px solid #0a0a0a', color: '#0a0a0a', padding: '1.75rem', textTransform: 'none' }}
          >
            {/* ── Result header: success circle OR title ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '2px solid #0a0a0a', paddingBottom: '0.75rem' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Success checkmark SVG — on VALID */}
                {isValid && (
                  <motion.div
                    variants={checkCircleVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: 36, height: 36, flexShrink: 0 }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="17" fill="#0a0a0a" />
                      <motion.path
                        d="M10 18 L15.5 23.5 L26 12"
                        stroke="#ffffff"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        variants={checkPathVariants}
                        initial="hidden"
                        animate="visible"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Revoked Strike-through Seal SVG — on REVOKED */}
                {isRevoked && (
                  <motion.div
                    variants={checkCircleVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: 36, height: 36, flexShrink: 0 }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="17" fill="#0a0a0a" />
                      <circle cx="18" cy="18" r="9" fill="none" stroke="#ffffff" strokeWidth="2.2" />
                      <motion.path
                        d="M10 10 L26 26"
                        stroke="#ffffff"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        variants={checkPathVariants}
                        initial="hidden"
                        animate="visible"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Tampered / Warning SVG — on HASH_MISMATCH, SIGNATURE_INVALID, TAMPERED, REPLAY_REJECTED */}
                {!isValid && !isRevoked && (
                  <motion.div
                    variants={checkCircleVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: 36, height: 36, flexShrink: 0 }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="17" fill="#EF4444" />
                      <path d="M18 10 V20 M18 24 V25.5" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                    </svg>
                  </motion.div>
                )}

                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0a0a0a', textTransform: 'none' }}>
                  {result.result === 'VALID'             && 'CERTIFICATE AUTHENTIC & VALID'}
                  {result.result === 'TAMPERED'          && 'TAMPERED / INTEGRITY FAILED'}
                  {result.result === 'HASH_MISMATCH'     && 'HASH MISMATCH / CORRUPTED'}
                  {result.result === 'SIGNATURE_INVALID' && 'INVALID DIGITAL SIGNATURE'}
                  {result.result === 'REVOKED'           && 'CERTIFICATE REVOKED BY ISSUER'}
                  {result.result === 'ERROR'             && 'VERIFICATION ERROR'}
                </h2>
              </div>

              <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.85rem', borderRadius: '25px', background: isValid ? '#10B981' : (isRevoked ? '#0a0a0a' : '#EF4444'), color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                STATUS: {result.result}
              </span>
            </div>

            <p style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 1.25rem 0', color: '#333333', textAlign: 'center' }}>
              {result.message || result.reason}
            </p>



            {/* Certificate Metadata Grid — staggered field reveal */}
            {result.certificate && (
              <motion.div
                variants={fieldContainerVariants}
                initial="hidden"
                animate="visible"
                style={{ background: '#e8e8e8', border: '1px solid #0a0a0a', padding: '1.1rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem', textAlign: 'left', color: '#0a0a0a' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem 1.25rem', fontSize: '0.9rem' }}>
                  <motion.div variants={fieldVariants}>
                    <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Student Name</span><br />
                    <strong style={{ color: '#0a0a0a' }}>{result.certificate.student_name}</strong>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Issue Date</span><br />
                    <strong style={{ color: '#0a0a0a' }}>{result.certificate.issue_date}</strong>
                  </motion.div>
                  {result.certificate.issuer && (
                    <motion.div variants={fieldVariants}>
                      <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Issuing University</span><br />
                      <strong style={{ color: '#0a0a0a' }}>{result.certificate.issuer}</strong>
                    </motion.div>
                  )}
                  {result.certificate.issuer_id && (
                    <motion.div variants={fieldVariants}>
                      <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Issuer Code</span><br />
                      <strong style={{ fontFamily: 'monospace', color: '#0a0a0a' }}>{result.certificate.issuer_id}</strong>
                    </motion.div>
                  )}
                  {result.certificate.certificate_number && (
                    <motion.div variants={fieldVariants}>
                      <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Certificate Number</span><br />
                      <strong style={{ fontFamily: 'monospace', color: '#0a0a0a' }}>{result.certificate.certificate_number}</strong>
                    </motion.div>
                  )}
                  {result.certificate.certificate_category && (
                    <motion.div variants={fieldVariants}>
                      <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Category</span><br />
                      <strong style={{ color: '#0a0a0a' }}>{getCategoryLabel(result.certificate.certificate_category)}</strong>
                    </motion.div>
                  )}
                  {result.certificate.register_number && (
                    <motion.div variants={fieldVariants}>
                      <span style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Register No.</span><br />
                      <strong style={{ fontFamily: 'monospace', color: '#0a0a0a' }}>{result.certificate.register_number}</strong>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Visual Certificate Document Preview */}
            {result.certificate && (
              <div style={{ margin: '1.5rem 0', position: 'relative' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', textAlign: 'left', color: '#0a0a0a' }}>
                  Visual Certificate Document Preview:
                </div>
                <div style={{ overflowX: 'auto', background: '#e2e8f0', padding: '1.25rem', borderRadius: '14px', border: '1px solid #0a0a0a', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <CategoryCertificateTemplate
                    certificate={{ ...result.certificate, university_name: result.certificate.issuer || result.certificate.university_name || 'Issuing University' }}
                    qrCodeUrl={
                      (result.certificate.id || result.certificate.cert_id)
                        ? `${API_BASE}/uploads/qr_${result.certificate.id || result.certificate.cert_id}.png`
                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.certificate.certificate_number || result.certificate.student_name || 'VERIFIED')}`
                    }
                  />
                  {/* Status Stamp Overlay */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', fontSize: '3.5rem', fontWeight: 900, color: isValid ? '#10B981' : '#EF4444', border: `6px double ${isValid ? '#10B981' : '#EF4444'}`, padding: '0.5rem 2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', letterSpacing: '0.1em', userSelect: 'none', pointerEvents: 'none' }}>
                    {result.result === 'VALID'    && 'VALID'}
                    {result.result === 'REVOKED'  && 'REVOKED'}
                    {(result.result === 'TAMPERED' || result.result === 'HASH_MISMATCH' || result.result === 'SIGNATURE_INVALID') && 'TAMPERED'}
                  </div>
                </div>
              </div>
            )}

            {/* Cryptographic Verification Checklist */}
            <div style={{ marginTop: '1.25rem', borderTop: '2px solid #0a0a0a', paddingTop: '1rem', textAlign: 'left', width: '100%', color: '#0a0a0a' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', color: '#0a0a0a' }}>Cryptographic Verification Audit</p>
              <div style={{ display: 'grid', gap: '0.55rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <span>{result.hashStatus === 'MATCH' ? '✓' : result.hashStatus === 'MISMATCH' ? '✕' : '○'}</span>
                  <span><strong>SHA-256 Hash Integrity:</strong>{' '}
                    {result.hashStatus === 'MATCH'    && 'Verified — data payload is 100% intact & untampered'}
                    {result.hashStatus === 'MISMATCH' && 'FAILED — data has been modified or tampered with'}
                    {(!result.hashStatus || result.hashStatus === 'UNCHECKED') && 'Not checked'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <span>{result.signatureStatus === 'VALID' ? '✓' : result.signatureStatus === 'INVALID' ? '✕' : result.signatureStatus === 'ERROR' ? '⚠' : '○'}</span>
                  <span><strong>RSA-2048 Digital Signature:</strong>{' '}
                    {result.signatureStatus === 'VALID'   && 'Valid — signed by the official university private key'}
                    {result.signatureStatus === 'INVALID' && 'FAILED — signature does not match university public key'}
                    {result.signatureStatus === 'ERROR'   && 'Error — invalid key format or corrupted signature'}
                    {(!result.signatureStatus || result.signatureStatus === 'UNCHECKED') && 'Not checked'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <span>{result.result === 'VALID' ? '✓' : result.result === 'REVOKED' ? '✕' : '○'}</span>
                  <span><strong>Revocation Status:</strong>{' '}
                    {result.result === 'VALID'   && (mode === 'online' ? 'Active — certificate is valid & not revoked' : 'Active (verified against local revocation cache)')}
                    {result.result === 'REVOKED' && 'REVOKED — certificate has been officially invalidated by the issuer'}
                    {result.result !== 'VALID' && result.result !== 'REVOKED' && 'Skipped (prior cryptographic checks failed)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <span>{result.blockchain?.verified ? '✓' : '○'}</span>
                  <span><strong>Blockchain Anchor:</strong>{' '}{result.blockchain?.verified ? `Block #${result.blockchain.blockNumber} — ${result.blockchain.network}` : 'Not anchored on ledger'}</span>
                </div>
              </div>
              <div style={{ marginTop: '0.85rem', borderTop: '1px solid #e0e0e0', paddingTop: '0.75rem', display: 'grid', gap: '0.3rem', fontSize: '0.8rem', color: '#555555' }}>
                <p style={{ margin: 0 }}><strong>Algorithm:</strong> {result.algorithm || (mode === 'offline' ? 'SHA256-RSA2048' : '—')}</p>
                <p style={{ margin: 0 }}><strong>Verification Mode:</strong> {result.verificationMode || (mode === 'offline' ? 'OFFLINE' : 'ONLINE')}</p>
                <p style={{ margin: 0 }}><strong>Verified At:</strong> {result.verifiedAt ? new Date(result.verifiedAt).toLocaleString('en-IN', { hour12: false }) : new Date().toLocaleString('en-IN', { hour12: false })}</p>
                {keySource && <p style={{ margin: 0 }}><strong>Public Key Source:</strong> {keySource}</p>}
              </div>
            </div>

            {/* Blockchain Anchor Panel */}
            <div style={{ marginTop: '1.25rem', borderTop: '2px solid #0a0a0a', paddingTop: '1rem', textAlign: 'left', width: '100%', color: '#0a0a0a' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', color: '#0a0a0a' }}>Blockchain Ledger Proof</p>
              {mode === 'offline' ? (
                <p style={{ fontSize: '0.85rem', color: '#555555' }}>Blockchain status not checked in offline mode — switch to Online Verify to confirm on-chain anchoring.</p>
              ) : result.blockchain?.verified ? (
                <div style={{ textAlign: 'left', display: 'inline-block' }}>
                  <p><strong>✓ Hash anchored on-chain</strong></p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Transaction ID:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}>{result.blockchain.txId}</span>
                    <button onClick={async () => { try { await navigator.clipboard.writeText(result.blockchain.txId); setBcCopied(true); setTimeout(() => setBcCopied(false), 1500); } catch {} }}
                      style={{ marginLeft: '6px', background: 'transparent', border: '1px solid #0a0a0a', borderRadius: '0', color: '#0a0a0a', fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer' }}>
                      {bcCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Block Number:</strong> {result.blockchain.blockNumber}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Anchored At:</strong> {result.blockchain.anchoredAt ? new Date(result.blockchain.anchoredAt).toLocaleString('en-IN', { hour12: false }) : '—'}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Network:</strong> {result.blockchain.network}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Status:</strong> {result.blockchain.status}</p>
                  <Link to="/blockchain-explorer" style={{ color: '#0a0a0a', textDecoration: 'underline', fontSize: '0.82rem', fontWeight: 600 }}>View in Blockchain Explorer →</Link>
                </div>
              ) : (
                <div>
                  <p><strong>⚠ Not anchored on-chain</strong></p>
                  <p style={{ fontSize: '0.85rem', color: '#555555' }}>This certificate's hash was not found on the blockchain ledger or verification failed.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

export default Verifier;

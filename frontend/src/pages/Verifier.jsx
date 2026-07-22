import { useState } from 'react';
import { Link } from 'react-router-dom';
import { verifyCertificate, getPublicKey, getRevokedList, getCertificateByCertNumber } from '../api/client';
import { verifyOffline } from '../utils/offlineCrypto';
import { getCachedPublicKey, setCachedPublicKey } from '../utils/keyCache';
import { cacheRevokedList, isCertRevokedLocally, getLastSyncTime } from '../utils/revocationCache';
import { decodeQrFromCertificateFile } from '../utils/qrDecoder';
import { getCategoryLabel } from '../utils/certificateCategory';

function Verifier() {
  const [inputMode, setInputMode] = useState('qr');
  const [mode, setMode] = useState('offline');

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

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await getRevokedList();
      cacheRevokedList(res.data);
      setLastSync(getLastSyncTime());
    } catch (err) {
      setError('Could not sync revocation list - no internet connection available.');
    } finally {
      setSyncing(false);
    }
  }

  async function buildPayload() {
    if (inputMode === 'qr') {
      try {
        return JSON.parse(qrText);
      } catch (err) {
        throw new Error('Invalid QR data - must be valid JSON. Paste the exact text from a certificate QR code.');
      }
    }

    if (inputMode === 'certId') {
      if (!certNumber.trim()) throw new Error('Enter a certificate ID.');
      const res = await getCertificateByCertNumber(certNumber.trim());
      const cert = res.data;
      return {
        cert_id: cert.id,
        certificate_number: cert.certificate_number,
        register_number: cert.register_number,
        student_name: cert.student_name,
        course: cert.course,
        cgpa: cert.cgpa,
        start_year: cert.start_year,
        end_year: cert.end_year,
        issue_date: cert.issue_date,
        issuer_id: cert.issuer_code,
        hash: cert.certificate_hash,
        signature: cert.signature,
      };
    }

    if (inputMode === 'file') {
      if (!uploadedFile) throw new Error('Choose a certificate file to upload.');
      return await decodeQrFromCertificateFile(uploadedFile);
    }
  }

  async function handleVerify() {
    setError('');
    setResult(null);
    setKeySource('');
    setLoading(true);

    let payload;
    try {
      payload = await buildPayload();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not read certificate data');
      setLoading(false);
      return;
    }

    if (mode === 'online') {
      try {
        const res = await verifyCertificate(payload);
        setResult(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Verification request failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const cached = getCachedPublicKey(payload.issuer_id);
      let publicKeyPem;

      if (cached) {
        publicKeyPem = cached.public_key;
        setKeySource('cache');
      } else {
        const res = await getPublicKey(payload.issuer_id);
        publicKeyPem = res.data.public_key;
        setCachedPublicKey(payload.issuer_id, res.data.name, publicKeyPem);
        setKeySource('network (now cached for future offline use)');
      }

      const verifyResult = await verifyOffline(payload, publicKeyPem);

      if (verifyResult.result === 'VALID') {
        const revokedStatus = isCertRevokedLocally(payload.cert_id);
        if (revokedStatus === true) {
          setResult({
            result:          'REVOKED',
            reason:          'This certificate appears in the last synced revocation list.',
            certificate:     verifyResult.certificate,
            // carry forward all granular fields
            algorithm:       verifyResult.algorithm,
            verifiedAt:      verifyResult.verifiedAt,
            verificationMode:verifyResult.verificationMode,
            hashStatus:      verifyResult.hashStatus,
            signatureStatus: verifyResult.signatureStatus,
          });
        } else if (revokedStatus === null) {
          setResult({
            ...verifyResult,
            message: verifyResult.message + ' (revocation status unknown — sync the revocation list to check)',
          });
        } else {
          setResult(verifyResult);
        }
      } else {
        setResult(verifyResult);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Cannot verify: unknown issuer, and no cached public key available.');
      } else if (!err.response) {
        setError('No cached key for this issuer, and no network available to fetch it.');
      } else {
        setError('Offline verification failed');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQrText('');
    setCertNumber('');
    setUploadedFile(null);
    setResult(null);
    setError('');
    setKeySource('');
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setUploadedFile(f);
    }
  }

  function handleRemoveFile() {
    setUploadedFile(null);
  }

  function resultClass() {
    if (!result) return '';
    if (result.result === 'VALID')              return 'result-valid';
    if (result.result === 'REVOKED')            return 'result-revoked';
    // HASH_MISMATCH, SIGNATURE_INVALID, TAMPERED, ERROR all map to tampered style
    return 'result-tampered';
  }

  function canVerify() {
    if (inputMode === 'qr') return qrText.trim().length > 0;
    if (inputMode === 'certId') return certNumber.trim().length > 0;
    if (inputMode === 'file') return uploadedFile !== null;
    return false;
  }

  const tabBtn = (active) => ({
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? 'none' : '1px solid #d8dde4',
    background: active ? '#0f2540' : '#ffffff',
    color: active ? '#ffffff' : '#3d4a5c',
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Verify a Certificate</h2>
        <Link to="/" style={{color: '#c9a227', fontSize: '0.9rem', fontWeight: 500}}>Back to Home</Link>
      </div>

      <div className="card">
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
          <button className={mode === 'offline' ? 'btn-primary' : 'btn-danger'} onClick={() => setMode('offline')}>
            Offline Verify
          </button>
          <button className={mode === 'online' ? 'btn-primary' : 'btn-danger'} onClick={() => setMode('online')}>
            Online Verify
          </button>
        </div>

        {mode === 'offline' && (
          <div style={{background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'}}>
            <span style={{fontSize: '0.8rem', color: '#3d4a5c'}}>
              Revocation list last synced: {lastSync ? new Date(lastSync).toLocaleString() : 'never'}
            </span>
            <button className="btn-danger" onClick={handleSync} disabled={syncing} style={{fontSize: '0.8rem'}}>
              {syncing ? 'Syncing...' : 'Sync revocation list'}
            </button>
          </div>
        )}

        <h3>How would you like to verify?</h3>
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.25rem'}}>
          <div style={tabBtn(inputMode === 'qr')} onClick={() => setInputMode('qr')}>Paste QR Data</div>
          <div style={tabBtn(inputMode === 'certId')} onClick={() => setInputMode('certId')}>Certificate ID</div>
          <div style={tabBtn(inputMode === 'file')} onClick={() => setInputMode('file')}>Upload Certificate</div>
        </div>

        {inputMode === 'qr' && (
          <>
            <p style={{color: '#7a8699', fontSize: '0.85rem', marginBottom: '1rem'}}>
              Scan the certificate's QR code with any QR scanner app, then paste the resulting text below.
            </p>
            <textarea
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder='{"cert_id": "...", "student_name": "...", ...}'
              rows={6}
              style={{width: '100%', background: '#ffffff', border: '1px solid #d8dde4', borderRadius: '4px', color: '#1e2b3a', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical'}}
            />
          </>
        )}

        {inputMode === 'certId' && (
          <>
            <p style={{color: '#7a8699', fontSize: '0.85rem', marginBottom: '1rem'}}>
              Enter the certificate ID printed on the certificate (e.g. UNI001-2026-A3F9). No scanning needed.
            </p>
            <input
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="UNI001-2026-A3F9"
              style={{width: '100%', background: '#ffffff', border: '1px solid #d8dde4', borderRadius: '4px', color: '#1e2b3a', padding: '0.65rem 0.75rem', fontSize: '0.95rem'}}
            />
          </>
        )}

        {inputMode === 'file' && (
          <>
            <p style={{color: '#7a8699', fontSize: '0.85rem', marginBottom: '1rem'}}>
              Upload the certificate file (PDF, PNG, or JPG) generated by the university. The embedded QR code will be read automatically.
            </p>
            {!uploadedFile && (
              <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
            )}
            {uploadedFile && (
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f7f8fa', border: '1px solid #d8dde4', borderRadius: '4px', padding: '0.6rem 0.75rem'}}>
                <span style={{fontSize: '0.85rem', color: '#1e2b3a', flex: 1}}>{uploadedFile.name}</span>
                <button
                  onClick={handleRemoveFile}
                  title="Remove file"
                  style={{
                    background: '#fdecea',
                    color: '#a02622',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    lineHeight: 1,
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </>
        )}

        <div style={{display: 'flex', gap: '0.75rem', marginTop: '1.25rem'}}>
          <button className="btn-primary" onClick={handleVerify} disabled={loading || !canVerify()}>
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
          <button className="btn-danger" onClick={handleClear}>Clear</button>
        </div>
        {error && <div className="error-msg" style={{marginTop: '1rem'}}>{error}</div>}
        {keySource && (
          <p style={{color: '#7a8699', fontSize: '0.8rem', marginTop: '0.75rem'}}>
            Public key source: {keySource}
          </p>
        )}
      </div>

      {result && (
        <div className={resultClass()}>
          <h2 style={{marginBottom: '0.5rem'}}>
            {result.result === 'VALID'              && '✅ VALID'}
            {result.result === 'TAMPERED'           && '⛔ TAMPERED'}
            {result.result === 'HASH_MISMATCH'      && '⛔ HASH MISMATCH'}
            {result.result === 'SIGNATURE_INVALID'  && '⛔ INVALID SIGNATURE'}
            {result.result === 'REVOKED'            && '🚫 REVOKED'}
            {result.result === 'ERROR'              && '⚠️ VERIFICATION ERROR'}
          </h2>
          <p>{result.message || result.reason}</p>

          {result.certificate && (
            <div style={{marginTop: '1rem', textAlign: 'left', display: 'inline-block'}}>
              <p><strong>Student:</strong> {result.certificate.student_name}</p>
              <p><strong>Course:</strong> {result.certificate.course}</p>
              <p><strong>Issue Date:</strong> {result.certificate.issue_date}</p>
              {result.certificate.issuer && <p><strong>Issuer:</strong> {result.certificate.issuer}</p>}
              {result.certificate.issuer_id && <p><strong>Issuer Code:</strong> {result.certificate.issuer_id}</p>}
              {result.certificate.certificate_number && <p><strong>Certificate No.:</strong> {result.certificate.certificate_number}</p>}
              {result.certificate.certificate_category && (
                <p><strong>Certificate Category:</strong> {getCategoryLabel(result.certificate.certificate_category)}</p>
              )}
              {result.certificate.certificate_detail && (
                <p><strong>Certificate Detail:</strong> {result.certificate.certificate_detail}</p>
              )}
            </div>
          )}

          {/* ── Cryptographic Verification Detail Panel ───────────────── */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '1rem', textAlign: 'left', width: '100%' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>🔐 Cryptographic Verification</p>

            {/* Step-by-step checks */}
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              {/* Hash Check */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span style={{ fontSize: '1rem' }}>
                  {result.hashStatus === 'MATCH'     && '✅'}
                  {result.hashStatus === 'MISMATCH'  && '❌'}
                  {(!result.hashStatus || result.hashStatus === 'UNCHECKED') && '⚪'}
                </span>
                <span><strong>SHA-256 Hash:</strong>{' '}
                  {result.hashStatus === 'MATCH'     && 'Verified — data is intact'}
                  {result.hashStatus === 'MISMATCH'  && 'FAILED — data has been tampered'}
                  {(!result.hashStatus || result.hashStatus === 'UNCHECKED') && 'Not checked'}
                </span>
              </div>

              {/* Signature Check */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span style={{ fontSize: '1rem' }}>
                  {result.signatureStatus === 'VALID'   && '✅'}
                  {result.signatureStatus === 'INVALID' && '❌'}
                  {result.signatureStatus === 'ERROR'   && '⚠️'}
                  {(!result.signatureStatus || result.signatureStatus === 'UNCHECKED') && '⚪'}
                </span>
                <span><strong>RSA-2048 Signature:</strong>{' '}
                  {result.signatureStatus === 'VALID'   && 'Valid — issued by the stated university'}
                  {result.signatureStatus === 'INVALID' && 'FAILED — signature does not match issuer key'}
                  {result.signatureStatus === 'ERROR'   && 'Error — invalid key or corrupted signature'}
                  {(!result.signatureStatus || result.signatureStatus === 'UNCHECKED') && 'Not checked'}
                </span>
              </div>

              {/* Revocation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span style={{ fontSize: '1rem' }}>
                  {result.result === 'VALID'   && '✅'}
                  {result.result === 'REVOKED' && '❌'}
                  {result.result !== 'VALID' && result.result !== 'REVOKED' && '⚪'}
                </span>
                <span><strong>Revocation Status:</strong>{' '}
                  {result.result === 'VALID'   && (mode === 'online' ? 'Active — not revoked' : 'Active (locally cached list)')}
                  {result.result === 'REVOKED' && 'REVOKED by issuer'}
                  {result.result !== 'VALID' && result.result !== 'REVOKED' && 'Skipped (prior check failed)'}
                </span>
              </div>

              {/* Blockchain (online only) */}
              {mode === 'online' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <span style={{ fontSize: '1rem' }}>
                    {result.blockchain?.verified ? '✅' : '⚪'}
                  </span>
                  <span><strong>Blockchain Anchor:</strong>{' '}
                    {result.blockchain?.verified
                      ? `Block #${result.blockchain.blockNumber} — ${result.blockchain.network}`
                      : 'Not anchored on ledger'}
                  </span>
                </div>
              )}
            </div>

            {/* Technical metadata */}
            <div style={{ marginTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem', display: 'grid', gap: '0.3rem', fontSize: '0.8rem', opacity: 0.9 }}>
              <p style={{ margin: 0 }}><strong>Algorithm:</strong> {result.algorithm || (mode === 'offline' ? 'SHA256-RSA2048' : '—')}</p>
              <p style={{ margin: 0 }}><strong>Verification Mode:</strong> {result.verificationMode || (mode === 'offline' ? 'OFFLINE' : 'ONLINE')}</p>
              <p style={{ margin: 0 }}><strong>Verified At:</strong> {result.verifiedAt ? new Date(result.verifiedAt).toLocaleString('en-IN', { hour12: false }) : new Date().toLocaleString('en-IN', { hour12: false })}</p>
              {keySource && <p style={{ margin: 0 }}><strong>Public Key Source:</strong> {keySource}</p>}
            </div>
          </div>

          {/* ── Blockchain Anchor Section (VALID only) ─────────────────── */}
          {result.result === 'VALID' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '1rem', textAlign: 'left', width: '100%' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>⛓ Blockchain Anchor</p>

              {mode === 'offline' ? (
                <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>Blockchain status not checked — switch to Online Verify to confirm hash anchoring.</p>
              ) : result.blockchain?.verified ? (
                <div style={{ textAlign: 'left', display: 'inline-block' }}>
                  <p><strong>✅ Hash anchored on-chain</strong></p>
                  <p style={{ fontSize: '0.85rem' }}>
                    <strong>Transaction ID:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                      {result.blockchain.txId}
                    </span>
                    <button
                      onClick={async () => {
                        try { await navigator.clipboard.writeText(result.blockchain.txId); setBcCopied(true); setTimeout(() => setBcCopied(false), 1500); } catch {}
                      }}
                      style={{ marginLeft: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '3px', color: 'inherit', fontSize: '0.7rem', padding: '1px 6px', cursor: 'pointer' }}
                    >
                      {bcCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Block Number:</strong> {result.blockchain.blockNumber}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Anchored At:</strong> {result.blockchain.anchoredAt ? new Date(result.blockchain.anchoredAt).toLocaleString('en-IN', { hour12: false }) : '—'}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Network:</strong> {result.blockchain.network}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Status:</strong> {result.blockchain.status}</p>
                  <Link to="/blockchain-explorer" style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.82rem', opacity: 0.9 }}>
                    View in Blockchain Explorer →
                  </Link>
                </div>
              ) : (
                <div>
                  <p><strong>⚠️ Not anchored</strong></p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>This certificate's hash was not found on the blockchain ledger. It may have been issued before blockchain anchoring was enabled.</p>
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { verifyCertificate, getPublicKey, getRevokedList, getCertificateByCertNumber } from '../api/client';
import { verifyOffline } from '../utils/offlineCrypto';
import { getCachedPublicKey, setCachedPublicKey } from '../utils/keyCache';
import { cacheRevokedList, isCertRevokedLocally, getLastSyncTime } from '../utils/revocationCache';
import { decodeQrFromCertificateFile } from '../utils/qrDecoder';

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
        student_name: cert.student_name,
        student_email: cert.student_email,
        course: cert.course,
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
            result: 'REVOKED',
            reason: 'This certificate appears in the last synced revocation list.',
            certificate: verifyResult.certificate,
          });
        } else if (revokedStatus === null) {
          setResult({
            ...verifyResult,
            message: verifyResult.message + ' (revocation status unknown - sync the revocation list to check)',
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
            {result.result === 'VALID' && 'VALID'}
            {result.result === 'TAMPERED' && 'TAMPERED'}
            {result.result === 'REVOKED' && 'REVOKED'}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Verifier;

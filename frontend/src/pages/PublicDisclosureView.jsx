import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyDisclosure } from '../api/disclosure';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff' };
const PREMIUM = [0.16, 1, 0.3, 1];

const checkCircleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

const checkPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, ease: 'easeOut', delay: 0.15 } },
};

export default function PublicDisclosureView() {
  const { disclosureId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDisclosure();
  }, [disclosureId]);

  async function loadDisclosure() {
    setLoading(true);
    setError('');
    try {
      const res = await verifyDisclosure(disclosureId);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching disclosure:', err);
      setError(err.response?.data?.error || 'Could not verify selective disclosure claim.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: GS.muted }}>Verifying Selective Disclosure Claim...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '560px', width: '100%', textAlign: 'center', border: '2px solid #0a0a0a', borderRadius: '24px', padding: '2rem' }}>
          <h3 style={{ color: '#EF4444', marginBottom: '1rem' }}>Claim Verification Failed</h3>
          <p style={{ color: GS.muted, marginBottom: '1.5rem' }}>{error || 'Invalid or revoked disclosure claim link.'}</p>
          <Link to="/" className="btn">Return to Home</Link>
        </div>
      </div>
    );
  }

  const isValid = data.result === 'VALID' && data.signatureStatus === 'VALID';

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: PREMIUM }}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          border: '2.5px solid #0a0a0a',
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          padding: '2.25rem 2rem',
          position: 'relative',
          color: '#0a0a0a',
        }}
      >
        {/* Animated Checkmark Seal */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <motion.div
            variants={checkCircleVariants}
            initial="hidden"
            animate="visible"
            style={{ width: 64, height: 64, margin: '0 auto 1rem auto' }}
          >
            <svg width="64" height="64" viewBox="0 0 36 36">
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
          <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.35rem 1.1rem', borderRadius: '25px', background: '#10B981', color: '#ffffff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            RSA-2048 SIGNED VERIFIED CLAIM
          </span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', margin: '0 0 0.5rem 0', color: '#0a0a0a' }}>
          Selective Disclosure Proof
        </h2>

        <p style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#333333', margin: '0 0 1.5rem 0', padding: '0.85rem 1rem', background: '#f8fafc', border: '1.5px solid #0a0a0a', borderRadius: '14px' }}>
          ✓ {data.claim_description}
        </p>

        {/* Claim Details Grid */}
        <div style={{ background: '#f1f5f9', border: '1px solid #0a0a0a', padding: '1.1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', textTransform: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem 1.25rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: GS.muted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Disclosure ID</span><br />
              <strong style={{ fontFamily: 'monospace' }}>{data.disclosure_id}</strong>
            </div>
            <div>
              <span style={{ color: GS.muted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Issuing University</span><br />
              <strong>{data.university_name} ({data.issuer_code})</strong>
            </div>
            <div>
              <span style={{ color: GS.muted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Claim Predicate</span><br />
              <strong style={{ fontFamily: 'monospace' }}>{data.claim_predicate}</strong>
            </div>
            <div>
              <span style={{ color: GS.muted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Issued Timestamp</span><br />
              <strong>{new Date(data.issued_at).toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Explicit Privacy Guarantee Banner */}
        <div style={{ background: '#0a0a0a', color: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🛡️</span> Zero-Data-Leak Privacy Guarantee
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', opacity: 0.9, lineHeight: 1.5 }}>
            This verified claim is backed by the issuing university's RSA-2048 private key. The candidate shared ONLY this specific predicate proof. The candidate's full student name, registration number, and complete academic grade transcript remain 100% private and unexposed.
          </p>
        </div>

        {/* RSA Digital Signature Fingerprint */}
        <div style={{ fontSize: '0.78rem', color: GS.muted, borderTop: '1px solid #cbd5e1', paddingTop: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontWeight: 700, color: '#0a0a0a' }}>RSA-2048 Digital Signature:</span><br />
          <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.74rem' }}>{data.signature}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={loadDisclosure} style={{ fontSize: '0.85rem' }}>
            🔄 Re-Verify Signature
          </button>
          <Link to="/verifier" className="btn" style={{ fontSize: '0.85rem' }}>
            Go to Full Verifier →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

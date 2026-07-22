import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{minHeight: '100vh', background: '#eef1f5'}}>
      <div style={{background: '#0f2540', padding: '3rem 1.5rem', textAlign: 'center'}}>
        <div style={{width: '56px', height: '56px', borderRadius: '50%', background: '#ffffff', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px'}}>🎓</div>
        <h1 style={{color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 'normal', marginBottom: '0.5rem'}}>
          CredentialVault
        </h1>
        <p style={{color: '#c9a227', fontSize: '0.85rem', letterSpacing: '1px'}}>
          OFFICE OF THE REGISTRAR
        </p>
      </div>

      <div style={{maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center'}}>
        <p style={{color: '#3d4a5c', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: '1.6'}}>
          Offline-first, privacy-preserving digital credential verification.
          No internet or central authority required at verification time — trust is
          established purely through cryptographic proof.
        </p>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem'}}>
          <div className="card" style={{margin: 0, textAlign: 'left'}}>
            <h3>For Universities</h3>
            <p style={{color: '#7a8699', fontSize: '0.9rem', marginBottom: '1rem'}}>
              Issue tamper-proof, digitally signed certificates with QR codes.
            </p>
            <Link to="/university-login" className="btn-primary" style={{display: 'inline-block', textDecoration: 'none'}}>
              University Sign In
            </Link>
          </div>

          <div className="card" style={{margin: 0, textAlign: 'left'}}>
            <h3>For Students</h3>
            <p style={{color: '#7a8699', fontSize: '0.9rem', marginBottom: '1rem'}}>
              View and share your certificates with a scannable QR code.
            </p>
            <Link to="/student-login" className="btn-primary" style={{display: 'inline-block', textDecoration: 'none'}}>
              Student Sign In
            </Link>
          </div>

          <div className="card" style={{margin: 0, textAlign: 'left'}}>
            <h3>For Verifiers</h3>
            <p style={{color: '#7a8699', fontSize: '0.9rem', marginBottom: '1rem'}}>
              Instantly verify any certificate — even completely offline.
            </p>
            <Link to="/verify" className="btn-primary" style={{display: 'inline-block', textDecoration: 'none'}}>
              Verify a Certificate
            </Link>
          </div>

          <div className="card" style={{margin: 0, textAlign: 'left'}}>
            <h3>⛓ Blockchain Explorer</h3>
            <p style={{color: '#7a8699', fontSize: '0.9rem', marginBottom: '1rem'}}>
              View anchored certificate hashes, transaction IDs, and block records on the ledger.
            </p>
            <Link to="/blockchain-explorer" className="btn-primary" style={{display: 'inline-block', textDecoration: 'none'}}>
              Open Explorer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

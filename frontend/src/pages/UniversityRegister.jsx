import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/client';
import AuthBackgroundDecorations from '../components/AuthBackgroundDecorations';

function UniversityRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role: 'UNIVERSITY' };
      const res = await registerUser(payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/university');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-container">
      <AuthBackgroundDecorations />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">🎓</div>
          <div className="auth-brand-title">CredentialVault</div>
          <div className="auth-brand-subtitle">University Registration</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>University Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Institutional Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p>Already have a university account? <Link to="/university-login">Login</Link></p>
        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

export default UniversityRegister;

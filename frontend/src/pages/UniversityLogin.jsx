import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/client';
import AuthBackgroundDecorations from '../components/AuthBackgroundDecorations';

function UniversityLogin() {
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
      const res = await loginUser({ email, password });
      if (res.data.user.role !== 'UNIVERSITY') {
        setError('This is a student account. Please go to the Student Portal to sign in.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/university');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <AuthBackgroundDecorations />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">🎓</div>
          <div className="auth-brand-title">CredentialVault</div>
          <div className="auth-brand-subtitle">University Portal</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Institutional email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p>Don't have a university account? <Link to="/university-register">Register</Link></p>
        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

export default UniversityLogin;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/client';
import AuthBackgroundDecorations from '../components/AuthBackgroundDecorations';

function StudentLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { password };
      if (identifier.includes('@')) { payload.email = identifier.trim(); }
      else { payload.register_number = identifier.trim(); }
      const res = await loginUser(payload);
      if (res.data.user.role !== 'STUDENT') {
        setError('This is a university account. Please go to the University Portal to sign in.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/student');
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
          <div className="auth-brand-subtitle">Student Portal</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Student email or register number</label>
          <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p>Don't have a student account? <Link to="/student-register">Register</Link></p>
        <p style={{ marginTop: '1rem' }}><Link to="/" className="btn-back-home-oval">← Back to Home</Link></p>
      </div>
    </div>
  );
}

export default StudentLogin;

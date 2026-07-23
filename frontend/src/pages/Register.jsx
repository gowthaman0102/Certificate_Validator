import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/client';
import AuthBackgroundDecorations from '../components/AuthBackgroundDecorations';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'STUDENT') payload.register_number = registerNumber.trim();
      const res = await registerUser(payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'UNIVERSITY') navigate('/university');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  }

  const loginPath = role === 'UNIVERSITY' ? '/university-login' : '/student-login';

  return (
    <div className="auth-container">
      <AuthBackgroundDecorations />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">🎓</div>
          <div className="auth-brand-title">CredentialVault</div>
          <div className="auth-brand-subtitle">Create an Account</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {role === 'STUDENT' && (
            <>
              <label>Register Number</label>
              <input type="text" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} required />
            </>
          )}
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <label>I am a</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="STUDENT">Student</option>
            <option value="UNIVERSITY">University</option>
          </select>
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p>Already have an account? <Link to={loginPath}>Login</Link></p>
        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

export default Register;

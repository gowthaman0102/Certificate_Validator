import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser } from "../api/client";
import AuthBackgroundDecorations from "../components/AuthBackgroundDecorations";
import { RevealOnScroll, RevealItem } from "../components/motion";

function UniversityRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name, email, password, role: "UNIVERSITY" };
      const res = await registerUser(payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/university");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <AuthBackgroundDecorations />
      <div className={`auth-card ${shake ? "shake" : ""}`}>
        <RevealOnScroll delay={0} duration={0.5}>
          <div className="auth-brand">
            <div className="auth-brand-badge">🎓</div>
            <div className="auth-brand-title">CredentialVault</div>
            <div className="auth-brand-subtitle">University Registration</div>
          </div>
        </RevealOnScroll>

        {error && (
          <motion.div
            className="error-msg"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <RevealItem delay={0.06}>
            <label>University Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              required
            />
          </RevealItem>

          <RevealItem delay={0.12}>
            <label>Institutional Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </RevealItem>

          <RevealItem delay={0.18}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </RevealItem>

          <RevealItem delay={0.24}>
            <button
              type="submit"
              disabled={loading}
              style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {loading ? (
                <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              ) : (
                "Register"
              )}
            </button>
          </RevealItem>
        </form>

        <RevealItem delay={0.30}>
          <p>Already have a university account? <Link to="/university-login">Login</Link></p>
          <p style={{ marginTop: "1rem" }}>
            <Link to="/" className="btn-back-home-oval">← Back to Home</Link>
          </p>
        </RevealItem>
      </div>
    </div>
  );
}

export default UniversityRegister;

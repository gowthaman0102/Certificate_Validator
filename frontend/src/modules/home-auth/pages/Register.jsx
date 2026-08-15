import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "../../../shared/api/client";
import AuthBackgroundDecorations from "../../../shared/components/AuthBackgroundDecorations";
import { RevealOnScroll, RevealItem } from "../../../shared/motion/index";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
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
      const payload = { name, email, password, role };
      if (role === "STUDENT") payload.register_number = registerNumber.trim();
      const res = await registerUser(payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "UNIVERSITY") navigate("/university");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  const loginPath = role === "UNIVERSITY" ? "/university-login" : "/student-login";

  return (
    <div className="auth-container">
      <AuthBackgroundDecorations />
      <div className={`auth-card ${shake ? "shake" : ""}`}>
        <RevealOnScroll delay={0} duration={0.5}>
          <div className="auth-brand">
            <div className="auth-brand-badge">🎓</div>
            <div className="auth-brand-title">CredentialVault</div>
            <div className="auth-brand-subtitle">Create an Account</div>
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

        <form onSubmit={handleSubmit}>
          <RevealItem delay={0.06}>
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </RevealItem>

          <RevealItem delay={0.12}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </RevealItem>

          <AnimatePresence mode="wait">
            {role === "STUDENT" && (
              <motion.div
                key="reg-num"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <label>Register Number</label>
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <RevealItem delay={0.18}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </RevealItem>

          <RevealItem delay={0.24}>
            <label>I am a</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="UNIVERSITY">University</option>
            </select>
          </RevealItem>

          <RevealItem delay={0.30}>
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

        <RevealItem delay={0.36}>
          <p>Already have an account? <Link to={loginPath}>Login</Link></p>
          <p style={{ marginTop: "1rem" }}>
            <Link to="/" className="btn-back-home-oval">← Back to Home</Link>
          </p>
        </RevealItem>
      </div>
    </div>
  );
}

export default Register;

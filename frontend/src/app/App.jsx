import { lazy, Suspense, createContext, useContext, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home                  from '../modules/home-auth/pages/Home';
import UniversityLogin       from '../modules/university/pages/UniversityLogin';
import StudentLogin          from '../modules/student/pages/StudentLogin';
import UniversityRegister    from '../modules/university/pages/UniversityRegister';
import StudentRegister       from '../modules/student/pages/StudentRegister';
import UniversityDashboard   from '../modules/university/pages/UniversityDashboard';
import StudentDashboard      from '../modules/student/pages/StudentDashboard';
import Verifier              from '../modules/verifier/pages/Verifier';
import WalletDashboard       from '../modules/skill-passport-wallet/pages/WalletDashboard';
import AuditLog              from '../modules/audit-log/pages/AuditLog';
import UniversityAnalytics   from '../modules/university/pages/UniversityAnalytics';
import StudentAnalytics      from '../modules/student/pages/StudentAnalytics';
import VerificationAnalytics from '../modules/verifier/pages/VerificationAnalytics';
import BlockchainExplorer    from '../modules/blockchain-explorer/pages/BlockchainExplorer';
import DigitalSkillPassport  from '../modules/skill-passport-wallet/pages/DigitalSkillPassport';
import PublicSkillPassport   from '../modules/skill-passport-wallet/pages/PublicSkillPassport';
import TemplateManager       from '../modules/certificate-templates/pages/TemplateManager';
import PublicDisclosureView  from '../modules/skill-passport-wallet/pages/PublicDisclosureView';

import GuidedTourModal       from '../shared/components/GuidedTourModal';

const FloatingAIButton = lazy(() => import('../modules/ai-assistant/components/FloatingAIButton'));

/* ── Global Loading Context ────────────────────────────────────────
   Any component can call useLoading().start() / .stop() to trigger
   the top-of-page progress bar during backend calls.
   ──────────────────────────────────────────────────────────────── */
export const LoadingContext = createContext({ start: () => {}, stop: () => {} });
export const useLoading = () => useContext(LoadingContext);

/* ── Page transition variants ──────────────────────────────────────
   Premium ease: cubic-bezier(0.16, 1, 0.3, 1)
   Duration: 250ms entrance, 200ms exit.
   Only animates opacity + translateY (60fps safe).
   ──────────────────────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
};

/* ── PageWrapper ───────────────────────────────────────────────────
   Wraps every routed page in a motion.div that AnimatePresence
   transitions between.
   ──────────────────────────────────────────────────────────────── */
function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Top-of-page Progress Bar ──────────────────────────────────────
   2px, var(--color-ink) black. Triggered by LoadingContext.
   Animates scaleX 0→1, then fades out on completion.
   ──────────────────────────────────────────────────────────────── */
function ProgressBar({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="progress-bar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            zIndex: 9999,
            pointerEvents: 'none',
            transformOrigin: 'left center',
            background: 'var(--color-ink)',
          }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.92, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
        />
      )}
    </AnimatePresence>
  );
}

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (err) {
    return true;
  }
}

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={requiredRole === 'UNIVERSITY' ? '/university-login' : '/student-login'} replace />;
  }

  if (requiredRole && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role && user.role !== requiredRole) {
        return <Navigate to={user.role === 'UNIVERSITY' ? '/university' : '/student'} replace />;
      }
    } catch {}
  }

  return children;
}

/* ── Animated Routes ───────────────────────────────────────────────
   Must be a child of BrowserRouter so useLocation() works.
   Keying Routes on location.key ensures React treats every navigation
   (even returning to Home) as a fresh route mount so entrance sequences
   replay cleanly.
   ──────────────────────────────────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.key}>
        <Route path="/"                          element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/university-login"          element={<PageWrapper><UniversityLogin /></PageWrapper>} />
        <Route path="/student-login"             element={<PageWrapper><StudentLogin /></PageWrapper>} />
        <Route path="/register"                  element={<PageWrapper><StudentRegister /></PageWrapper>} />
        <Route path="/student-register"          element={<PageWrapper><StudentRegister /></PageWrapper>} />
        <Route path="/university-register"       element={<PageWrapper><UniversityRegister /></PageWrapper>} />
        <Route path="/university"                element={<ProtectedRoute requiredRole="UNIVERSITY"><PageWrapper><UniversityDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/university/templates"      element={<ProtectedRoute requiredRole="UNIVERSITY"><PageWrapper><TemplateManager /></PageWrapper></ProtectedRoute>} />
        <Route path="/student"                   element={<ProtectedRoute requiredRole="STUDENT"><PageWrapper><StudentDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/student-dashboard"         element={<ProtectedRoute requiredRole="STUDENT"><PageWrapper><StudentDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/passport"                  element={<Navigate to="/wallet" replace />} />
        <Route path="/skill-passport"            element={<ProtectedRoute requiredRole="STUDENT"><PageWrapper><DigitalSkillPassport /></PageWrapper></ProtectedRoute>} />
        <Route path="/student/profile/:id"       element={<PageWrapper><PublicSkillPassport /></PageWrapper>} />
        <Route path="/verify"                    element={<PageWrapper><Verifier /></PageWrapper>} />
        <Route path="/wallet"                    element={<ProtectedRoute requiredRole="STUDENT"><PageWrapper><WalletDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/audit"                     element={<ProtectedRoute requiredRole="UNIVERSITY"><PageWrapper><AuditLog /></PageWrapper></ProtectedRoute>} />
        <Route path="/analytics/university"      element={<ProtectedRoute requiredRole="UNIVERSITY"><PageWrapper><UniversityAnalytics /></PageWrapper></ProtectedRoute>} />
        <Route path="/analytics/student"         element={<ProtectedRoute requiredRole="STUDENT"><PageWrapper><StudentAnalytics /></PageWrapper></ProtectedRoute>} />
        <Route path="/analytics/verification"    element={<ProtectedRoute requiredRole="UNIVERSITY"><PageWrapper><VerificationAnalytics /></PageWrapper></ProtectedRoute>} />
        <Route path="/blockchain-explorer"       element={<PageWrapper><BlockchainExplorer /></PageWrapper>} />
        <Route path="/disclosure/:disclosureId"  element={<PageWrapper><PublicDisclosureView /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

/* ── Root App ──────────────────────────────────────────────────── */
function App() {
  const [loading, setLoading] = useState(false);

  const start = useCallback(() => setLoading(true), []);
  const stop  = useCallback(() => setLoading(false), []);

  return (
    <LoadingContext.Provider value={{ start, stop }}>
      <BrowserRouter>
        <ProgressBar visible={loading} />

        <GuidedTourModal />
        <AnimatedRoutes />
        <Suspense fallback={null}>
          <FloatingAIButton />
        </Suspense>
      </BrowserRouter>
    </LoadingContext.Provider>
  );
}

export default App;

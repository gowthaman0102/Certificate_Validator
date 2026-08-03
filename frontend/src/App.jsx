import { lazy, Suspense, createContext, useContext, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home                  from './pages/Home';
import UniversityLogin       from './pages/UniversityLogin';
import StudentLogin          from './pages/StudentLogin';
import UniversityRegister    from './pages/UniversityRegister';
import StudentRegister       from './pages/StudentRegister';
import UniversityDashboard   from './pages/UniversityDashboard';
import StudentDashboard      from './pages/StudentDashboard';
import Verifier              from './pages/Verifier';
import WalletDashboard       from './pages/WalletDashboard';
import AuditLog              from './pages/AuditLog';
import UniversityAnalytics   from './pages/UniversityAnalytics';
import StudentAnalytics      from './pages/StudentAnalytics';
import VerificationAnalytics from './pages/VerificationAnalytics';
import BlockchainExplorer    from './pages/BlockchainExplorer';
import DigitalSkillPassport  from './pages/DigitalSkillPassport';
import PublicSkillPassport   from './pages/PublicSkillPassport';
import TemplateManager       from './pages/TemplateManager';
import PublicDisclosureView  from './pages/PublicDisclosureView';
import OfflineIndicator      from './components/OfflineIndicator';
import GuidedTourModal       from './components/GuidedTourModal';

const FloatingAIButton = lazy(() => import('./components/AIChat/FloatingAIButton'));

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
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
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
        <Route path="/university"                element={<PageWrapper><UniversityDashboard /></PageWrapper>} />
        <Route path="/university/templates"      element={<PageWrapper><TemplateManager /></PageWrapper>} />
        <Route path="/student"                   element={<PageWrapper><StudentDashboard /></PageWrapper>} />
        <Route path="/student-dashboard"         element={<PageWrapper><StudentDashboard /></PageWrapper>} />
        <Route path="/passport"                  element={<Navigate to="/wallet" replace />} />
        <Route path="/student/profile/:id"       element={<PageWrapper><PublicSkillPassport /></PageWrapper>} />
        <Route path="/verify"                    element={<PageWrapper><Verifier /></PageWrapper>} />
        <Route path="/wallet"                    element={<PageWrapper><WalletDashboard /></PageWrapper>} />
        <Route path="/audit"                     element={<PageWrapper><AuditLog /></PageWrapper>} />
        <Route path="/analytics/university"      element={<PageWrapper><UniversityAnalytics /></PageWrapper>} />
        <Route path="/analytics/student"         element={<PageWrapper><StudentAnalytics /></PageWrapper>} />
        <Route path="/analytics/verification"    element={<PageWrapper><VerificationAnalytics /></PageWrapper>} />
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
        <OfflineIndicator />
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

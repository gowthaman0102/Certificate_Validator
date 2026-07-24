import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UniversityLogin from './pages/UniversityLogin';
import StudentLogin from './pages/StudentLogin';
import UniversityRegister from './pages/UniversityRegister';
import StudentRegister from './pages/StudentRegister';
import UniversityDashboard from './pages/UniversityDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Verifier from './pages/Verifier';
import WalletDashboard from './pages/WalletDashboard';
import AuditLog from './pages/AuditLog';
import UniversityAnalytics  from './pages/UniversityAnalytics';
import StudentAnalytics     from './pages/StudentAnalytics';
import VerificationAnalytics from './pages/VerificationAnalytics';
import BlockchainExplorer   from './pages/BlockchainExplorer';
import DigitalSkillPassport from './pages/DigitalSkillPassport';
import PublicSkillPassport  from './pages/PublicSkillPassport';
import TemplateManager     from './pages/TemplateManager';

const FloatingAIButton = lazy(() => import('./components/AIChat/FloatingAIButton'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/university-login" element={<UniversityLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/university-register" element={<UniversityRegister />} />
        <Route path="/university" element={<UniversityDashboard />} />
        <Route path="/university/templates" element={<TemplateManager />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/passport" element={<DigitalSkillPassport />} />
        <Route path="/student/profile/:id" element={<PublicSkillPassport />} />
        <Route path="/verify" element={<Verifier />} />
        <Route path="/wallet" element={<WalletDashboard />} />
        <Route path="/audit"  element={<AuditLog />} />
        <Route path="/analytics/university"   element={<UniversityAnalytics />} />
        <Route path="/analytics/student"      element={<StudentAnalytics />} />
        <Route path="/analytics/verification" element={<VerificationAnalytics />} />
        <Route path="/blockchain-explorer"     element={<BlockchainExplorer />} />
      </Routes>
      <Suspense fallback={null}>
        <FloatingAIButton />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UniversityLogin from './pages/UniversityLogin';
import StudentLogin from './pages/StudentLogin';
import Register from './pages/Register';
import UniversityDashboard from './pages/UniversityDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Verifier from './pages/Verifier';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/university-login" element={<UniversityLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/university" element={<UniversityDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/verify" element={<Verifier />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './components/StudentDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import AdminDashboard from './components/AdminDashboard';
import JobListings from './pages/JobListings';
import './App.css';
import StudentProfile from './profiles/StudentProfile';
import JobStatus from './pages/JobStatus';
import JobDetails from './pages/jobDetails';
import SelectionDashboard from './components/SelectionDashboard';
import RoundManagement from './pages/RoundManagement';
import CompanyProfile from './profiles/CompanyProfile';
import JobPosting from './pages/JobPosting';
import CompanyStudentProfile from './profiles/CompanyStudentProfile';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/student-profile" element={<StudentProfile />} />
            <Route path="/job-status/:jobId" element={<JobStatus />} />
            <Route path="/job-details/:jobId" element={<JobDetails />} />
            <Route path="/selection-dashboard/:jobId" element={<SelectionDashboard />} />
            <Route path="/round-management/:jobId/:roundNo" element={<RoundManagement />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/post-job" element={<JobPosting />} />
            <Route path="/company/student-profile/:studentId" element={<CompanyStudentProfile />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

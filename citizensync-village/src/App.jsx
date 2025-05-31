import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IssuesList from './pages/IssuesList';
import ReportIssue from './pages/ReportIssue';
import Notifications from './pages/Notifications';
import Announcements from './pages/Announcements';
import Login from './pages/Login';
import Home from './pages/Home';
import Navbar from './components/Navbar';

// Protected Route Component
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.aadhaar) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/issues/current" element={
          <ProtectedRoute>
            <IssuesList status="Open" />
          </ProtectedRoute>
        } />
        <Route path="/issues/solved" element={
          <ProtectedRoute>
            <IssuesList status="Solved" />
          </ProtectedRoute>
        } />
        <Route path="/issues" element={
          <ProtectedRoute>
            <IssuesList status="Open" />
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute>
            <ReportIssue />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<div>About Page (Placeholder)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import type { RootState } from './store';
import { fetchCurrentUser } from './store/authSlice';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DeveloperDashboard from './pages/DeveloperDashboard';
import GitHubAnalytics from './pages/GitHubAnalytics';
import LeetCodeAnalytics from './pages/LeetCodeAnalytics';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CareerCoach from './pages/CareerCoach';
import RecruiterDashboard from './pages/RecruiterDashboard';

// Base layout for dashboard pages
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:pl-64 focus:outline-none">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is logged in on app load
    if (localStorage.getItem('token')) {
      dispatch(fetchCurrentUser() as any);
    }
  }, [dispatch]);

  if (isLoading && !isAuthenticated) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e2d',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }} 
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><Landing /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />
        
        {/* Protected Developer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['developer', 'admin']} />}>
          <Route path="/dashboard" element={<DashboardLayout><DeveloperDashboard /></DashboardLayout>} />
          <Route path="/github" element={<DashboardLayout><GitHubAnalytics /></DashboardLayout>} />
          <Route path="/leetcode" element={<DashboardLayout><LeetCodeAnalytics /></DashboardLayout>} />
          <Route path="/resume" element={<DashboardLayout><ResumeAnalyzer /></DashboardLayout>} />
          <Route path="/career" element={<DashboardLayout><CareerCoach /></DashboardLayout>} />
        </Route>

        {/* Protected Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
          <Route path="/recruiter/search" element={<DashboardLayout><RecruiterDashboard /></DashboardLayout>} />
          <Route path="/recruiter/compare" element={<DashboardLayout><div className="text-white">Compare Candidates</div></DashboardLayout>} />
        </Route>

        {/* Settings (All authenticated users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<DashboardLayout><div className="text-white">Settings</div></DashboardLayout>} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<div className="p-8 text-center text-white">404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

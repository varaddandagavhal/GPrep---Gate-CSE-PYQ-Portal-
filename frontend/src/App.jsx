import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/stores.js';
import { authAPI } from './services/api.js';

import LandingPage from './pages/LandingPage.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import { StudentDashboard } from './pages/StudentDashboard.jsx';
import { PracticePage } from './pages/PracticePage.jsx';
import { TestPage } from './pages/TestPage.jsx';
import { ResultsPage } from './pages/ResultsPage.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminUsersPage } from './pages/AdminUsersPage.jsx';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function App() {
  const { setUser } = useAuthStore();
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch {
        // not authenticated
      } finally {
        setAuthLoaded(true);
      }
    };
    checkAuth();
  }, [setUser]);

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">GatePrep</h1>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/history" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/practice" element={<ProtectedRoute requiredRole="student"><PracticePage /></ProtectedRoute>} />
        <Route path="/student/test/:testId" element={<ProtectedRoute requiredRole="student"><TestPage /></ProtectedRoute>} />
        <Route path="/student/results/:testId" element={<ProtectedRoute requiredRole="student"><ResultsPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><ProfilePage /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/questions" element={<ProtectedRoute requiredRole="admin"><AdminQuestionsPage /></ProtectedRoute>} />

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

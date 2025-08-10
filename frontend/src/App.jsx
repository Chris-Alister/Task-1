import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isAuthenticated, isAdmin, isTeacher, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        {isAdmin && (
          <Route path="/admin/*" element={<AdminDashboard />} />
        )}
        {isTeacher && (
          <Route path="/teacher/*" element={<TeacherDashboard />} />
        )}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={isAdmin ? "/admin" : isTeacher ? "/teacher" : "/login"} 
              replace 
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App; 
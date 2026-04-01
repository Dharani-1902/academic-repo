import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

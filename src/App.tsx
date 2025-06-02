import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import EmployeeLogin from './pages/employee/EmployeeLogin';
import EmployeePanel from './pages/employee/EmployeePanel';
import FeedbackForm from './pages/customer/FeedbackForm';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser, userRole } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route 
          path="admin/*" 
          element={
            <ProtectedRoute isAllowed={userRole === 'admin'} redirectPath="/admin/login">
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="employee/login" element={<EmployeeLogin />} />
        <Route 
          path="employee/*" 
          element={
            <ProtectedRoute isAllowed={userRole === 'employee'} redirectPath="/employee/login">
              <EmployeePanel />
            </ProtectedRoute>
          } 
        />
        <Route path="feedback/:code" element={<FeedbackForm />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
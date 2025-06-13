import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileManagement from './ProfileManagement';
import EmployeeManagement from './EmployeeManagement';

const AdminLayout = () => {
  const { userRole } = useAuth();

  if (userRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Routes>
        <Route path="/" element={<ProfileManagement />} />
        <Route path="/employees" element={<EmployeeManagement />} />
      </Routes>
    </div>
  );
};

export default AdminLayout;
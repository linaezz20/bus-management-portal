import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProducerDashboard from './ProducerDashboard';

const ProducerLayout = () => {
  const { userRole } = useAuth();

  if (userRole !== 'PRODUCER') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="producer-layout">
      <Routes>
        <Route path="/" element={<ProducerDashboard />} />
      </Routes>
    </div>
  );
};

export default ProducerLayout; 
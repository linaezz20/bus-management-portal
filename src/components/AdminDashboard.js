 import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { FiLogOut, FiUsers, FiUserPlus, FiMap, FiHome, FiSettings } from 'react-icons/fi';
import StatusBar from './StatusBar';
import GPSModal from './GPSModal';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const [showGpsModal, setShowGpsModal] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {showGpsModal && <GPSModal onClose={() => setShowGpsModal(false)} />}

      <nav className="admin-nav">
        <div className="nav-header">
          <h1>Tableau de Bord Administrateur</h1>
          <div className="user-info">
            <span>Connecté en tant qu'administrateur</span>
          </div>
        </div>
        <div className="nav-links">
          <button
            className="nav-link"
            onClick={() => navigate('/admin/dashboard')}
            title="Accueil"
          >
            <FiHome className="icon" /> Tableau de bord
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/admin/dashboard/employees')}
            title="Gestion des employés"
          >
            <FiUsers className="icon" /> Employés
          </button>

          <button
            className="nav-link"
            onClick={() => navigate('/admin/dashboard/profiles')}
            title="Gestion des profils"
          >
            <FiSettings className="icon" /> Profils
          </button>
          <button
            className="nav-link"
            onClick={() => setShowGpsModal(true)}
            title="Suivi GPS"
          >
            <FiMap className="icon" /> GPS
          </button>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <FiLogOut className="icon" /> Déconnexion
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <StatusBar
          lastUpdated={new Date()}
          onRefresh={() => window.location.reload()}
        />
        <Outlet /> {/* Pour les sous-routes */}
      </div>
    </div>
  );
};

export default AdminDashboard;
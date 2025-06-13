import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome, FiMap } from 'react-icons/fi'; // Ajout de FiMap
import StatusBar from './StatusBar';
import PresenceTable from './PresenceTable';
import { fetchEmployeesBySegment, fetchScans } from '../utils/api';
import './ProducerDashboard.css';
import dayjs from 'dayjs';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import GPSModal from './GPSModal'; // Import du composant GPSModal

const ProducerDashboard = ({ onLogout, userInfo }) => {
  const [employees, setEmployees] = useState([]);
  const [scans, setScans] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(dayjs().format('YYYY-[W]WW'));
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showGpsModal, setShowGpsModal] = useState(false); // Nouvel état pour le modal GPS

  const navigate = useNavigate();

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  useEffect(() => {
    if (!userInfo?.segment) return;

    const loadData = async () => {
      try {
        const [employeesData, scansData] = await Promise.all([
          fetchEmployeesBySegment(userInfo.segment),
          fetchScans()
        ]);
        setEmployees(employeesData);
        setScans(scansData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userInfo?.segment]);

  const handleRefresh = async () => {
    try {
      const [employeesData, scansData] = await Promise.all([
        fetchEmployeesBySegment(userInfo.segment),
        fetchScans()
      ]);
      setEmployees(employeesData);
      setScans(scansData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    }
  };

  const handleWeekChange = (week) => setSelectedWeek(week);
  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const filteredEmployees = employees.filter(emp =>
    Object.values(emp).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="producer-dashboard">
      {showEmployeeDetails && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setShowEmployeeDetails(false)}
        />
      )}

      {/* Ajout du GPSModal */}
      {showGpsModal && <GPSModal onClose={() => setShowGpsModal(false)} />}

      <nav className="producer-nav">
        <div className="nav-header">
          <h1>Tableau de Bord Chef de Segment</h1>
          <div className="user-info-container">
            <div className="user-info">
              <span className="user-name">{userInfo?.name || 'Producteur'}</span>
              <span className="user-segment">Segment: {userInfo?.segment || 'Non défini'}</span>
            </div>
            <div className="date-controls">
              <input
                type="week"
                value={selectedWeek}
                onChange={(e) => handleWeekChange(e.target.value)}
                className="week-input"
              />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={dayjs().format('YYYY-MM-DD')}
                className="date-input"
              />
            </div>
          </div>
        </div>

        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/producer')}>
            <FiHome className="icon" /> Accueil
          </button>
          {/* Ajout du bouton GPS */}
          <button
            className="nav-link"
            onClick={() => setShowGpsModal(true)}
            title="Suivi GPS"
          >
            <FiMap className="icon" /> GPS
          </button>
          <button className="logout-button" onClick={onLogout}>
            <FiLogOut className="icon" /> Déconnexion
          </button>
        </div>
      </nav>

      <div className="producer-content">
        <StatusBar
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          hideStatusText={true}
        />

        <PresenceTable
          employees={filteredEmployees}
          scans={scans}
          selectedWeek={selectedWeek}
          selectedDate={selectedDate}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          showExport={false}
          onViewDetails={handleViewDetails}
          userInfo={userInfo}
          showSegmentFilter={false} // Désactive le filtre de segment
        />
      </div>
    </div>
  );
};

export default ProducerDashboard;
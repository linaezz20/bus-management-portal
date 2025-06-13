import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FiDownload } from 'react-icons/fi';
import './ExportButton.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const ExportButton = ({ employeeId, segment }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('excel');
  const [periodType, setPeriodType] = useState('week'); // 'week' ou 'day'
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedWeek, setSelectedWeek] = useState(dayjs().format('YYYY-[W]WW'));
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
 const handleExport = async () => {
   setIsLoading(true);
   try {

     let params = `format=${format}&lastScanOnly=true`; // Ajout de ce paramètre

          if (periodType === 'day') {
            params += `&period=day&date=${selectedDate}`;
          } else {
            const [year, week] = selectedWeek.split('-W');
            params += `&period=week&year=${year}&weekNumber=${week}`;
          }

     if (segment) {
       params += `&segment=${encodeURIComponent(segment)}`;
     }

     let url;
     if (employeeId) {
       url = `${API_URL}/api/employees/${employeeId}/export?${params}`;
     } else {
       url = `${API_URL}/api/employees/export?${params}`;
     }

     const response = await fetch(url, {
       headers: getAuthHeaders(),
     });

     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.message || 'Erreur lors de l\'export');
     }
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;

      let filename;
      if (employeeId) {
        filename = `presence-employe-${employeeId}-${periodType === 'day' ? selectedDate : selectedWeek}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      } else {
        filename = `presences-${periodType === 'day' ? selectedDate : selectedWeek}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      a.remove();
    } catch (error) {
        console.error("Erreur lors de l'export:", error);
        alert("Erreur lors de l'export: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="export-dropdown">
      <button
        onClick={handleExport}
        disabled={isLoading}
        className="export-button"
      >
        {isLoading ? 'Export en cours...' : <><FiDownload /> Exporter</>}
      </button>

      <div className="export-options">
        <div className="export-option">
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div className="export-option">
          <label>Type:</label>
          <select value={periodType} onChange={(e) => setPeriodType(e.target.value)}>
            <option value="day">Par Jour</option>
            <option value="week">Par Semaine</option>
          </select>
        </div>

        {periodType === 'day' && (
          <div className="export-option">
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        {periodType === 'week' && (
          <div className="export-option">
            <label>Semaine:</label>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportButton;
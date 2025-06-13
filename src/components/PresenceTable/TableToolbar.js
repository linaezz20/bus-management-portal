import React from 'react';
import { FiDownload } from 'react-icons/fi';

const TableToolbar = ({ selectedWeek, onExport, children }) => {
  // Convertir le format "YYYY-WWW" en "YYYY-WW"
  const formattedWeek = selectedWeek
    ? selectedWeek.replace('W', '')
    : '';

  return (
    <div className="table-toolbar">
      <div className="toolbar-left">
        <h2>Suivi des présences - Semaine {formattedWeek}</h2>
        {children}
      </div>
      <button className="export-btn" onClick={onExport}>
        <FiDownload className="icon" /> Exporter
      </button>
    </div>
  );
};

export default TableToolbar; 
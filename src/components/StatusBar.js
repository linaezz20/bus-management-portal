import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const StatusBar = ({ lastUpdated, onRefresh, hideStatusText }) => {
  return (
    <div className="status-bar">

      <div className="last-updated">
        Dernière actualisation: {lastUpdated?.toLocaleTimeString() || 'En attente...'}
      </div>
      <button onClick={onRefresh} className="refresh-button">
        <FiRefreshCw className="icon" /> Actualiser
      </button>
    </div>
  );
};

export default StatusBar;
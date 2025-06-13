import React from 'react';
import { FiX } from 'react-icons/fi';

const EmployeeDetailsModal = ({ employee, onClose }) => {
  if (!employee) return null;

  return (


    <div className="modal-overlay">
    <button
              className="close-button"
              onClick={onClose}
              aria-label="Fermer"
            >
              <FiX size={24} />
            </button>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
        </button>
        <h2>Détails de l'employé</h2>

        <div className="details-grid">
         <div className="detail-item">
               <strong>Email: </strong>
              <span className="detail-value">{employee.email || 'Non renseigné'}</span>
          </div>
          <div className="detail-item">
            <strong>Badge NFC:</strong> {employee.nfcToken}
          </div>
          <div className="detail-item">
            <strong>Segment:</strong> {employee.segment}
          </div>
          <div className="detail-item">
            <strong>Section:</strong> {employee.plantSection}
          </div>
          <div className="detail-item">
            <strong>Site:</strong> {employee.site}
          </div>
          <div className="detail-item">
            <strong>Circuit:</strong> {employee.circuit}
          </div>
          <div className="detail-item">
            <strong>Station:</strong> {employee.station}
          </div>
          <div className="detail-item">
            <strong>Prestataire:</strong> {employee.prestataire}
          </div>
          <div className="detail-item">
            <strong>Importé par:</strong> {employee.importedBy}
          </div>
          <div className="detail-item">
            <strong>Date d'import:</strong> {employee.importDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
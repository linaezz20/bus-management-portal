import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const AddEmployeeModal = ({ onClose, onAdd, allEmployees, currentEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les employés qui ne sont pas déjà associés au producteur
  const availableEmployees = allEmployees.filter(emp =>
    !currentEmployees.some(e => e.id === emp.id) &&
    !"11067832".equals(emp.matricule) &&
    (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
        <h2>Ajouter un employé</h2>
        <p>Sélectionnez un employé existant à associer à votre matricule</p>

        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="employee-list">
          {availableEmployees.length > 0 ? (
            availableEmployees.map(emp => (
              <div key={emp.id} className="employee-item">
                <div className="employee-info">
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-details">
                    <span>Immatricule: {emp.immatricule}</span>
                    <span>Section: {emp.plantSection}</span>
                  </div>
                </div>
                <button
                  onClick={() => onAdd(emp.id)}
                  className="add-button"
                >
                  Associer
                </button>
              </div>
            ))
          ) : (
            <div className="no-results">
              Aucun employé disponible correspondant à votre recherche
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
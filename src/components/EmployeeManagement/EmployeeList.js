import React from 'react';
import { FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const EmployeeList = ({ employees, searchTerm, onSearch, onEdit, onDelete }) => {
  return (
    <div className="employee-list">
      <div className="list-header">
        <h3>Liste des employés ({employees.length})</h3>
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="no-data">Aucun employé trouvé</div>
      ) : (
        <table className="management-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Immatricule</th>
              <th>Nom</th>
              <th>Token NFC</th>
              <th>Segment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id}>
               <td>{employee.matricule}</td>
                <td>{employee.immatricule}</td>
                <td>{employee.name}</td>
                <td>{employee.nfcToken}</td>
                <td>{employee.segment}</td>
                <td>
                  <button
                    onClick={() => onEdit(employee)}
                    className="edit-button"
                    title="Modifier"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => onDelete(employee.id)}
                    className="delete-button"
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
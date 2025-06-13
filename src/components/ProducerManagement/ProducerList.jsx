import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import './ProducerManagement.css';

const ProducerList = ({ producers, segments, onUpdateSegment, onDelete }) => {
  return (
    <div className="producers-list">
      <h3>Liste des Producteurs</h3>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Matricule</th>
            <th>Segment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {producers.map(producer => (
            <tr key={producer.id}>
              <td>{producer.name}</td>
              <td>{producer.email}</td>
              <td>{producer.matricule}</td>
              <td>
                <select
                  value={producer.segment}
                  onChange={(e) => onUpdateSegment(producer.id, e.target.value)}
                >
                  {segments.map((segment, index) => (
                    <option key={index} value={segment}>
                      {segment}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(producer.id)}
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProducerList; 
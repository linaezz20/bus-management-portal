import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProducerEmployee } from '../utils/api';

const ProducerEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    nfcToken: '',
    immatricule: '11023451',
    matricule: "",
    tel: '',
    segment: '',
    plantSection: '',
    site: '',
    circuit: '',
    station: '',
    prestataire: '',
    lundi: '',
    mardi: '',
    mercredi: '',
    jeudi: '',
    vendredi: '',
    samedi: 'Repos',
    dimanche: 'Repos'
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addProducerEmployee(formData);
      navigate('/producer');
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="producer-form">
      <h2>Ajouter un Employé</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Immatricule</label>
          <input
            type="text"
            value={formData.matricule}
            readOnly
            className="read-only"
          />
        </div>

        <div className="form-group">
          <label>Nom Complet *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Ajouter les autres champs nécessaires */}

        <button type="submit" className="submit-btn">
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default ProducerEmployeeForm;
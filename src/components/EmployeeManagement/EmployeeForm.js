 import React from 'react';
import { FiSave, FiEdit2, FiX } from 'react-icons/fi';
import './EmployeeForm.css';

const EmployeeForm = ({
  formData,
  onChange,
  onSubmit,
  onReset,
  isEditing,
  segments,
  shifts,
  loading
}) => {
  const renderShiftSelect = (dayField) => (
     <select
            name={dayField}
            value={formData[dayField]}
            onChange={onChange}
            className="shift-select"
        >
            <option value="">-- Sélectionner un shift --</option>
            <option value="Repos">Repos</option> {/* Option déjà présente */}
            {shifts.map(shift => (
                <option
                    key={shift.id}
                    value={`${shift.startTime}_${shift.endTime}`}
                >
                    {shift.name} ({shift.startTime} - {shift.endTime})
                </option>
            ))}
        </select>
  );

  return (
    <div className="employee-form">
      <h3>{isEditing ? 'Modifier Employé' : 'Ajouter un Employé'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
        <div className="form-group">
                    <label>Matricule*</label>
                    <input
                      type="text"
                      name="matricule"
                      value={formData.matricule || ''}
                      onChange={onChange}
                      required
                      pattern="[0-9]{8}"
                      title="Le Matricule doit contenir exactement 8 chiffres"
                    />
                  </div>
<div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Immatricule*</label>
            <input
              type="text"
              name="immatricule"
              value={formData.immatricule}
              onChange={onChange}
              required

            />
          </div>

          <div className="form-group">
            <label>Token NFC*</label>
            <input
              type="text"
              name="nfcToken"
              value={formData.nfcToken}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nom complet*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="tel"
              value={formData.tel}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label>Segment*</label>
            <select
              name="segment"
              value={formData.segment}
              onChange={onChange}
              className="segment-select"
              required
            >
              <option value="">-- Sélectionner un segment --</option>
              {segments.map((segment, index) => (
                <option key={index} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Section</label>
            <input
              type="text"
              name="plantSection"
              value={formData.plantSection}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label>Site</label>
            <input
              type="text"
              name="site"
              value={formData.site}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label>Circuit</label>
            <input
              type="text"
              name="circuit"
              value={formData.circuit}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label>Station</label>
            <input
              type="text"
              name="station"
              value={formData.station}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label>Prestataire</label>
            <input
              type="text"
              name="prestataire"
              value={formData.prestataire}
              onChange={onChange}
            />
          </div>
        </div>

        <h4>Horaires:</h4>
        <div className="schedule-grid">
          <div className="form-group">
            <label>Samedi</label>
            {renderShiftSelect('samedi')}
          </div>

          <div className="form-group">
            <label>Dimanche</label>
            {renderShiftSelect('dimanche')}
          </div>

          <div className="form-group">
            <label>Lundi</label>
            {renderShiftSelect('lundi')}
          </div>

          <div className="form-group">
            <label>Mardi</label>
            {renderShiftSelect('mardi')}
          </div>

          <div className="form-group">
            <label>Mercredi</label>
            {renderShiftSelect('mercredi')}
          </div>

          <div className="form-group">
            <label>Jeudi</label>
            {renderShiftSelect('jeudi')}
          </div>

          <div className="form-group">
            <label>Vendredi</label>
            {renderShiftSelect('vendredi')}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`submit-button ${isEditing ? 'edit-mode' : ''}`}
            disabled={loading}
          >
            {loading ? (
              'En cours...'
            ) : isEditing ? (
              <>
                <FiEdit2 /> Modifier
              </>
            ) : (
              <>
                <FiSave /> Enregistrer
              </>
            )}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={onReset}
            disabled={loading}
          >
            <FiX /> Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
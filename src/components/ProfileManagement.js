import React, { useState, useEffect } from 'react';
import {
  FiUserPlus, FiSave, FiX, FiEdit, FiTrash2,
  FiAlertCircle, FiPlus, FiCheck, FiEye, FiEyeOff
} from 'react-icons/fi';
import './ProfileManagement.css';
import { fetchProducers, fetchSegments, addSegment, deleteSegment } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const PasswordInput = ({ value, onChange, required, disabled, placeholder, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-input-container">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
};


const ProfileManagement = () => {
  const [producers, setProducers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingEmail, setEditingEmail] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PRODUCER',
    segment: ''
  });

  const [newSegmentName, setNewSegmentName] = useState('');
  const [showSegmentForm, setShowSegmentForm] = useState(false);
  const [availableSegments, setAvailableSegments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const [producersData, segmentsData] = await Promise.all([
        fetchProducers().catch(e => {
          console.error("Chef de Segment fetch error:", e);
          return [];
        }),
        fetchSegments().catch(e => {
          console.error("Segment fetch error:", e);
          return [];
        })
      ]);

      setProducers(producersData);
      setSegments(segmentsData);
      updateAvailableSegments(producersData, segmentsData);
    } catch (err) {
      setError(err.message || "Échec du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const updateAvailableSegments = (producers, segments) => {
    const assignedSegments = new Set(
      producers.map(p => p.segment?.name || p.segment).filter(Boolean)
    );
    const available = segments.filter(
      segment => !assignedSegments.has(segment.name || segment)
    );
    setAvailableSegments(available);
  };

  const handleDeleteSegment = async (segmentName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le segment "${segmentName}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Vérifier si le segment est attribué
      const isAssigned = producers.some(p =>
        (p.segment?.name || p.segment) === segmentName
      );

      if (isAssigned) {
        throw new Error("Ce segment est attribué à un chef de segment et ne peut pas être supprimé");
      }

      await deleteSegment(segmentName);

      setSegments(segments.filter(s => s !== segmentName));
      setAvailableSegments(availableSegments.filter(s => s !== segmentName));

      if (formData.segment === segmentName) {
        setFormData(prev => ({ ...prev, segment: '' }));
      }

      setSuccessMessage(`Segment "${segmentName}" supprimé avec succès`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSegment = async () => {
    if (!newSegmentName.trim()) {
      setError("Le nom du segment ne peut pas être vide");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);

      const segmentExists = segments.some(
        segment => segment.toLowerCase() === newSegmentName.toLowerCase()
      );

      if (segmentExists) {
        throw new Error("Ce segment existe déjà");
      }

      const addedSegment = await addSegment(newSegmentName);

      setSegments(prev => [...prev, addedSegment.name || addedSegment]);
      setAvailableSegments(prev => [...prev, addedSegment.name || addedSegment]);
      setNewSegmentName('');
      setShowSegmentForm(false);
      setSuccessMessage(`Segment "${newSegmentName}" ajouté avec succès`);
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(err.message || "Erreur lors de l'ajout du segment");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'PRODUCER',
      segment: ''
    });
    setEditingEmail(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          setError(null);
          setLoading(true);
          setSuccessMessage(null);

          // Validation des champs obligatoires
          if (!formData.name || !formData.email || (!editingEmail && !formData.password) || !formData.segment) {
              throw new Error("Tous les champs marqués d'un * sont obligatoires");
          }

          // Vérification format email
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
              throw new Error("Veuillez entrer une adresse email valide");
          }

          // Préparation des données
          const payload = {
              name: formData.name,
              email: editingEmail || formData.email,
              role: "PRODUCER",
              segmentName: formData.segment,
              ...(formData.password && { password: formData.password })
          };

          // Vérification segment attribué (création seulement)
          if (!editingEmail) {
              const isSegmentTaken = producers.some(p =>
                  (p.segment?.name || p.segment) === formData.segment
              );
              if (isSegmentTaken) {
                  throw new Error("Ce segment est déjà attribué à un autre chef de segment");
              }
          }

          // Envoi requête
          const response = await fetch(
              `${API_URL}/api/producers${editingEmail ? `/by-email/${encodeURIComponent(editingEmail)}` : ''}`,
              {
                  method: editingEmail ? 'PUT' : 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify(payload)
              }
          );

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Erreur lors de la requête');
          }

          // Envoi email de réinitialisation pour les nouvelles créations
          if (!editingEmail) {
              try {
                  await fetch(`${API_URL}/api/auth/reset-password`, {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify({ email: formData.email })
                  });
              } catch (emailError) {
                  console.error("Erreur envoi email:", emailError);
              }
          }

          // Affichage alerte normale
          if (editingEmail) {
              alert("Chef de segment mis à jour avec succès");
          } else {
              alert(`Chef de segment créé avec succès.\nUn email de réinitialisation a été envoyé à ${formData.email}`);
          }

          // Rechargement et réinitialisation
          await loadData();
          resetForm();

      } catch (err) {
          setError(err.message);
          alert(`Erreur: ${err.message}`);
      } finally {
          setLoading(false);
      }
  };  const handleDelete = async (email) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce Chef de Segment ?')) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/api/producers/by-email/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await loadData();
      setSuccessMessage('Chef de Segment supprimé avec succès');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producer) => {
    setFormData({
      name: producer.name,
      email: producer.email,
      password: '',
      role: producer.role || "PRODUCER",
      segment: producer.segment?.name || producer.segment || '',
    });
    setEditingEmail(producer.email);
    setError(null);
    setSuccessMessage(null);
  };

  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  return (
    <div className="profile-management">
      {error && (
        <div className="alert-message error">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}><FiX /></button>
        </div>
      )}

      {successMessage && (
        <div className="alert-message success">
          <FiCheck />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}><FiX /></button>
        </div>
      )}

      {isAdmin ? (
        <>
          {/* Section Gestion des Segments */}
          <div className="segment-management-section">
            <h3>Gestion des Segments</h3>

            <div className="segments-list">
              <h4>Segments disponibles ({segments.length})</h4>
              {segments.length === 0 ? (
                <p>Aucun segment disponible</p>
              ) : (
                <ul>
                  {segments.map((segment, index) => {
                    const isAssigned = producers.some(p =>
                      (p.segment?.name || p.segment) === (segment.name || segment)
                    );
                    return (
                      <li key={index} className={isAssigned ? 'assigned' : ''}>
                        {segment.name || segment}
                        {isAssigned && <span className="assigned-badge">Attribué</span>}
                        {!isAssigned && (
                          <button
                            onClick={() => handleDeleteSegment(segment.name || segment)}
                            className="delete-segment-btn"
                            disabled={loading}
                            title={`Supprimer ${segment.name || segment}`}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="add-segment-form">
              <input
                type="text"
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                placeholder="Nouveau segment"
                disabled={loading}
              />
              <button
                type="button"
                className="save-segment-btn"
                onClick={handleAddSegment}
                disabled={!newSegmentName.trim() || loading}
              >
                <FiPlus /> Ajouter
              </button>
            </div>
          </div>

          {/* Section Gestion des Chefs de Segment */}
          <div className="profile-form">
            <h3>{editingEmail ? 'Modifier Chef de Segment' : 'Ajouter un Chef de Segment'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom complet*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingEmail || loading}
                />
              </div>

              <div className="form-group">
                <label>Mot de passe{!editingEmail && '*'}</label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange(e)}
                  required={!editingEmail}
                  disabled={loading}
                  placeholder={editingEmail ? "Laisser vide pour ne pas modifier" : ""}
                />
              </div>

              <div className="form-group">
                <label>Segment*</label>
                <select
                  name="segment"
                  value={formData.segment}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Sélectionnez un segment</option>
                  {availableSegments.map((segment, index) => (
                    <option key={index} value={segment.name || segment}>
                      {segment.name || segment}
                    </option>
                  ))}
                </select>
                {formData.segment && producers.some(p =>
                  (p.segment?.name || p.segment) === formData.segment &&
                  p.email !== editingEmail
                ) && (
                  <p className="segment-warning">
                    Ce segment est déjà attribué à un autre chef de segment
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    'En cours...'
                  ) : editingEmail ? (
                    <><FiSave /> Enregistrer</>
                  ) : (
                    <><FiUserPlus /> Ajouter</>
                  )}
                </button>
                {editingEmail && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    <FiX /> Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="profiles-list">
            <h3>Liste des Chefs de Segment ({producers.length})</h3>
            {loading ? (
              <div className="loading">Chargement en cours...</div>
            ) : producers.length === 0 ? (
              <div className="no-data">Aucun chef de segment trouvé</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Segment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {producers.map(producer => (
                    <tr key={producer.email}>
                      <td>{producer.name}</td>
                      <td>{producer.email}</td>
                      <td>{producer.segment?.name || producer.segment || 'Non défini'}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(producer)}
                          className="edit-btn"
                          disabled={loading}
                        >
                          <FiEdit /> Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(producer.email)}
                          className="delete-btn"
                          disabled={loading}
                        >
                          <FiTrash2 /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="no-access">
          <FiAlertCircle />
          <p>Vous n'avez pas les droits d'accès nécessaires pour gérer les Chefs de Segment.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
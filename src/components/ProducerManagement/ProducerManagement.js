import React, { useState, useEffect } from 'react';
import ProducerForm from './ProducerForm';
import ProducerList from './ProducerList';
import './ProducerManagement.css';

const ProducerManagement = () => {
  const [producers, setProducers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simuler des données pour le test
      const mockProducers = [
        { id: 1, name: 'Producteur 1', email: 'prod1@example.com', matricule: '12345', segment: 'Segment A' },
        { id: 2, name: 'Producteur 2', email: 'prod2@example.com', matricule: '67890', segment: 'Segment B' }
      ];

      const mockSegments = ['Segment A', 'Segment B', 'Segment C'];

      setProducers(mockProducers);
      setSegments(mockSegments);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducer = async (newProducer) => {
    try {
      setError(null);
      setSuccessMessage('');

      // Validation des champs
      if (!newProducer.name || !newProducer.email || !newProducer.password || !newProducer.matricule || !newProducer.segment) {
        throw new Error('Tous les champs sont obligatoires');
      }

      // Simuler l'ajout d'un producteur
      const producerToAdd = {
        id: producers.length + 1,
        ...newProducer
      };

      setProducers([...producers, producerToAdd]);
      setSuccessMessage('Chef de Segment ajouté avec succès');

      // Masquer le message après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Erreur d'ajout:", err);
      setError(err.message);
    }
  };

  const handleUpdateSegment = async (producerId, newSegment) => {
    try {
      setError(null);
      setProducers(producers.map(p =>
        p.id === producerId ? { ...p, segment: newSegment } : p
      ));
    } catch (err) {
      console.error("Erreur de mise à jour:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (producerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce Chef de Segment?')) {
      return;
    }

    try {
      setError(null);
      setProducers(producers.filter(p => p.id !== producerId));
      setSuccessMessage('Chef de Segment supprimé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Erreur de suppression:", err);
      setError(err.message);
    }
  };

  return (
    <div className="producer-management">
      <h2>Gestion des Producteurs</h2>

      {error && <div className="alert error">{error}</div>}
      {successMessage && <div className="alert success">{successMessage}</div>}

      <ProducerForm 
        onAddProducer={handleAddProducer}
        segments={segments}
      />

      <ProducerList
        producers={producers}
        segments={segments}
        onUpdateSegment={handleUpdateSegment}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProducerManagement; 
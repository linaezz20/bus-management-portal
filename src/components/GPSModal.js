import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { FiX, FiUser, FiPhone, FiTruck, FiClock, FiUsers } from 'react-icons/fi';

const createBusIcon = () => {
  return new L.DivIcon({
    html: '🚌',
    iconSize: [40, 40],
    className: 'bus-icon'
  });
};

const GPSModal = ({ onClose }) => {
  const [position, setPosition] = useState(null); // Initialisé à null
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [busDetails, setBusDetails] = useState({
    bus: "--",
    capacity: "--",
    driver: "--",
    tel: "--",
    agency: "--",

    nbrTransportedEmployees: "--"
  });

  // Détermine l'URL de l'API en fonction de l'environnement
  const API_URL = window.location.hostname === 'localhost'
    ? 'https://gps-application-latest.onrender.com/api/gps/bus-details'
    : 'https://gps-application-latest.onrender.com/api/gps/bus-details';

  const fetchBusData = async () => {
    try {
      const response = await axios.get(API_URL);
      if (response.data) {
        const { coordinates, details } = response.data;

        // Convertit les virgules en points pour les nombres si nécessaire
        const latitude = typeof coordinates.latitude === 'string'
          ? parseFloat(coordinates.latitude.replace(',', '.'))
          : coordinates.latitude;
        const longitude = typeof coordinates.longitude === 'string'
          ? parseFloat(coordinates.longitude.replace(',', '.'))
          : coordinates.longitude;

        setPosition([latitude, longitude]);
        setLastUpdate(new Date().toLocaleTimeString());

        setBusDetails({
          bus: details.bus || "--",
          capacity: details.capacity || 0,
          driver: details.driver || "--",
          tel: details.tel || "--",
          agency: details.agency || "--",

          nbrTransportedEmployees: details.nbrTransportedEmployees || 0
        });
      }
    } catch (error) {
      console.error("Erreur de connexion GPS:", error);
      // En cas d'erreur, on garde les anciennes valeurs pour éviter le basculement
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Charge les données immédiatement
    fetchBusData();

    // Puis met à jour toutes les 10 secondes
    const interval = setInterval(fetchBusData, 10000);

    // Nettoyage de l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, []);

  // Affiche un loader tant que la position n'est pas chargée
  if (!position) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            border: '4px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            borderTop: '4px solid white',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          Chargement de la position initiale...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95%',
        maxWidth: '1200px',
        height: '95vh',
        maxHeight: '800px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <FiX />
        </button>

        <MapContainer
          center={position}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          key={JSON.stringify(position)} // Force le re-render quand la position change
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          <Marker position={position} icon={createBusIcon()}>
            <Popup style={{ borderRadius: '10px', padding: '15px' }}>
              <div style={{ minWidth: '250px' }}>
                <h3 style={{
                  marginTop: 0,
                  color: '#2c3e50',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '10px'
                }}>
                  Détails du Bus
                </h3>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <FiTruck style={{ marginRight: '10px', color: '#3498db' }} />
                    <span><strong>Numéro:</strong> {busDetails.bus}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <FiUsers style={{ marginRight: '10px', color: '#3498db' }} />
                    <span><strong>Capacité:</strong> {busDetails.capacity} ({busDetails.nbrTransportedEmployees} occupés)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <FiUser style={{ marginRight: '10px', color: '#3498db' }} />
                    <span><strong>Chauffeur:</strong> {busDetails.driver}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <FiPhone style={{ marginRight: '10px', color: '#3498db' }} />
                    <span><strong>Téléphone:</strong> {busDetails.tel}</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong>Agence:</strong> {busDetails.agency}
                  </div>


                </div>

                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FiClock style={{ marginRight: '10px', color: '#7f8c8d' }} />
                    <small>Dernière mise à jour: {lastUpdate}</small>
                  </div>
                  <small>Position: {position[0].toFixed(6)}, {position[1].toFixed(6)}</small>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {isLoading && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              borderTop: '2px solid white',
              width: '16px',
              height: '16px',
              animation: 'spin 1s linear infinite',
              marginRight: '10px'
            }}></div>
            Mise à jour en cours...
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .bus-icon {
            text-align: center;
            font-size: 24px;
            line-height: 40px;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 10px !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default GPSModal;

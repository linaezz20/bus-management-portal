import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList';
import { fetchEmployees, addEmployee, updateEmployee, deleteEmployee, fetchSegments } from '../../utils/api';
import './EmployeeManagement.css';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import EmployeeForm from './EmployeeForm';

const EmployeeManagement = () => {
  const [successMessage, setSuccessMessage] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [segments, setSegments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nfcToken: "",
    matricule: "",
    immatricule: "",
    tel: "",
    segment: "",
    plantSection: "",
    site: "",
    circuit: "",
    station: "",
    prestataire: "",
    lundi: "",
    mardi: "",
    mercredi: "",
    jeudi: "",
    vendredi: "",
    samedi: "Repos",
    dimanche: "Repos",
    importedBy: "Admin"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [employeesData, segmentsData, shiftsData] = await Promise.all([
        fetchEmployees(),
        fetchSegments(),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/employees/shifts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }).then(res => res.json())
      ]);

      setEmployees(employeesData);
      setSegments(segmentsData);
      setShifts(shiftsData);
    } catch (err) {
      setError(err.message || "Failed to load data");
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
      name: "",
      nfcToken: "",
      matricule: "",
      immatricule: "",
      tel: "",
      segment: "",
      plantSection: "",
      site: "",
      circuit: "",
      station: "",
      prestataire: "",
      lundi: "",
      mardi: "",
      mercredi: "",
      jeudi: "",
      vendredi: "",
      samedi: "Repos",
      dimanche: "Repos",
      importedBy: "Admin"
    });
    setEditingEmployeeId(null);
  };

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      nfcToken: employee.nfcToken,
      immatricule: employee.immatricule || "",
      email: employee.email || "", // Added email field
      matricule: employee.matricule || "",
      tel: employee.tel || "",
      segment: employee.segment || "",
      plantSection: employee.plantSection || "",
      site: employee.site || "",
      circuit: employee.circuit || "",
      station: employee.station || "",
      prestataire: employee.prestataire || "",
      lundi: employee.lundi || "",
      mardi: employee.mardi || "",
      mercredi: employee.mercredi || "",
      jeudi: employee.jeudi || "",
      vendredi: employee.vendredi || "",
      samedi: employee.samedi || "Repos",
      dimanche: employee.dimanche || "Repos",
      importedBy: employee.importedBy || "Admin"
    });
    setEditingEmployeeId(employee.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      let result;
      if (editingEmployeeId) {
        result = await updateEmployee(editingEmployeeId, formData);
      } else {
        result = await addEmployee(formData);
      }

      if (result.error) {
        if (result.type === 'NFC_CONFLICT') {
          setError(result.message);
          setFormData(prev => ({ ...prev, nfcToken: "" }));
        } else {
          setError(result.message || "Erreur lors de l'enregistrement");
        }
      } else {
        if (editingEmployeeId) {
          setEmployees(employees.map(emp =>
            emp.id === editingEmployeeId ? result : emp
          ));
        } else {
          setEmployees([...employees, result]);
        }
        resetForm();
        setSuccessMessage("Employé enregistré avec succès");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;

    try {
      setLoading(true);
      setError(null);

      await deleteEmployee(id);
      setEmployees(employees.filter(emp => emp.id !== id));
      setSuccessMessage("Employé supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    Object.values(emp).some(
      val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="management-container">
      {error && (
        <div className="alert alert-danger">
          <FiAlertCircle /> {error}
          <button
            type="button"
            className="close-btn"
            onClick={() => setError(null)}
          >
            <FiX />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <EmployeeForm
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
        isEditing={!!editingEmployeeId}
        segments={segments}
        shifts={shifts}
        loading={loading}
      />

      <EmployeeList
        employees={filteredEmployees}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default EmployeeManagement;
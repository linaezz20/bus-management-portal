"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate, Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import ResetPasswordPage from "./components/ResetPasswordPage"
import ForgotPasswordPage from "./components/ForgotPasswordPage"

import * as XLSX from "xlsx"
import { FiMap, FiUserPlus, FiUsers, FiLogOut, FiHome } from "react-icons/fi"
import dayjs from "dayjs"
import "./App.css"
import StatusBar from "./components/StatusBar"
import GPSModal from "./components/GPSModal"
import WeekSelector from "./components/WeekSelector"
import PresenceTable from "./components/PresenceTable"
import EmployeeManagement from "./components/EmployeeManagement"
import LoginPage from "./components/LoginPage"
import ProducerDashboard from "./components/ProducerDashboard"
import EmployeeDetailsModal from "./components/EmployeeDetailsModal"
import ProfileManagement from "./components/ProfileManagement"
import {
  fetchEmployees,
  fetchEmployeesBySegment,
  fetchScans,
  addEmployee,
  deleteEmployee,
  fetchSegments,
} from "./utils/api"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [employees, setEmployees] = useState([])
  const [scans, setScans] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [apiStatus, setApiStatus] = useState("loading")
  const [showGpsModal, setShowGpsModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(dayjs().format("YYYY-[W]WW"))
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState(null)
  const [userSegment, setUserSegment] = useState(null)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [segments, setSegments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()

  // ... (gardez toutes vos fonctions existantes)

  const exportToExcel = () => {
    const formattedWeek = selectedWeek.replace("W", "-")
    const dataForExport = employees.map((emp) => ({
      Matricule: emp.matricule,
      Nom: emp.name,
      Téléphone: emp.tel,
      Samedi: emp.samedi || "N/A",
      Dimanche: emp.dimanche || "N/A",
      Lundi: emp.lundi || "N/A",
      Mardi: emp.mardi || "N/A",
      Mercredi: emp.mercredi || "N/A",
      Jeudi: emp.jeudi || "N/A",
      Vendredi: emp.vendredi || "N/A",
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataForExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Présences")
    XLSX.writeFile(workbook, `Presences_Semaine_${formattedWeek}.xlsx`)
  }

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee)
    setShowEmployeeDetails(true)
  }

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken")
      const role = localStorage.getItem("userRole")
      const segment = localStorage.getItem("userSegment")
      const userData = localStorage.getItem("userInfo")

      if (token && role) {
        setIsAuthenticated(true)
        setUserRole(role)
        if (segment) setUserSegment(segment)
        if (userData) setUserInfo(JSON.parse(userData))
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        setApiStatus("loading")
        const segmentsData = await fetchSegments()
        setSegments(segmentsData)

        let employeesData = []
        if (userRole === "PRODUCER" || userRole === "SEGMENT_LEADER") {
          if (userSegment) {
            employeesData = await fetchEmployeesBySegment(userSegment)
          }
        } else {
          if (employees.length === 0) {
            employeesData = await fetchEmployees()
          } else {
            employeesData = employees
          }
        }

        const scansData = await fetchScans()

        setEmployees(employeesData || [])
        setScans(scansData || [])
        setLastUpdated(new Date())
        setApiStatus("connected")
      } catch (error) {
        console.error("Erreur de chargement des données:", error)
        setApiStatus("error")
      }
    }

    loadData()
    const interval = setInterval(loadData, 300000)
    return () => clearInterval(interval)
  }, [isAuthenticated, userRole, userSegment])

  const handleLogin = (role, segment = null, userData = null) => {
    setIsAuthenticated(true)
    setUserRole(role)
    setUserInfo(userData)
    if (segment) {
      setUserSegment(segment)
      localStorage.setItem("userSegment", segment)
    }
    localStorage.setItem("authToken", "dummy-token")
    localStorage.setItem("userRole", role)
    if (userData) {
      localStorage.setItem("userInfo", JSON.stringify(userData))
    }

    if (role === "ADMIN") {
      navigate("/dashboard")
    } else if (role === "PRODUCER" || role === "SEGMENT_LEADER") {
      navigate("/producer")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userSegment")
    localStorage.removeItem("userInfo")
    setIsAuthenticated(false)
    setUserRole(null)
    setUserSegment(null)
    setUserInfo(null)
    navigate("/login")
  }

  const handleWeekChange = (week) => setSelectedWeek(week)
  const handleDateChange = (e) => setSelectedDate(e.target.value)

  const filteredEmployees = employees.filter((emp) =>
    Object.values(emp).some((val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const AdminLayout = () => (
    <div className="app-container">
      {showGpsModal && <GPSModal onClose={() => setShowGpsModal(false)} />}
      {showEmployeeDetails && (
        <EmployeeDetailsModal employee={selectedEmployee} onClose={() => setShowEmployeeDetails(false)} />
      )}
      <nav className="app-nav">
        <div className="nav-header">
          <h1>Gestion des Présences NFC</h1>
          <div className="date-controls">
            <WeekSelector selectedWeek={selectedWeek} onChange={handleWeekChange} />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={dayjs().format("YYYY-MM-DD")}
              className="date-input"
            />
          </div>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">
            <FiHome className="icon" /> Tableau de bord
          </Link>
          <Link to="/dashboard/employees" className="nav-link">
            <FiUsers className="icon" /> Employés
          </Link>
          <Link to="/dashboard/profiles" className="nav-link">
            <FiUserPlus className="icon" /> Profils
          </Link>
          <button className="gps-button" onClick={() => setShowGpsModal(true)}>
            <FiMap className="icon" /> GPS
          </button>
          <button className="nav-link logout-button" onClick={handleLogout}>
            <FiLogOut className="icon" /> Déconnexion
          </button>
        </div>
      </nav>
      <div className="app-content">
        <StatusBar
          apiStatus={apiStatus}
          lastUpdated={lastUpdated}
          onRefresh={async () => {
            await fetchEmployees().then(setEmployees)
            await fetchScans().then(setScans)
            setLastUpdated(new Date())
          }}
        />
        <Outlet />
      </div>
    </div>
  )

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return children ? children : <Outlet />
  }

  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>
  }

  return (
    <>
      {/* SUPPRIMÉ: basename="/bus-management-portal" */}
      <Routes>
        {/* Routes publiques - SANS authentification */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate
                to={
                  userRole === "ADMIN"
                    ? "/dashboard"
                    : userRole === "PRODUCER"
                      ? "/producer"
                      : userRole === "SEGMENT_LEADER"
                        ? "/segment-leader"
                        : "/login"
                }
                replace
              />
            )
          }
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Routes protégées - AVEC authentification */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={userRole === "ADMIN" ? <AdminLayout /> : <Navigate to="/login" replace />}>
            <Route
              index
              element={
                <PresenceTable
                  employees={filteredEmployees}
                  scans={scans}
                  selectedWeek={selectedWeek}
                  selectedDate={selectedDate}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  onViewDetails={handleViewDetails}
                  userInfo={userInfo}
                />
              }
            />
            <Route
              path="employees"
              element={
                <EmployeeManagement
                  employees={employees}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  onAddEmployee={addEmployee}
                  onDeleteEmployee={deleteEmployee}
                  onEmployeesUpdate={setEmployees}
                />
              }
            />
            <Route path="profiles" element={<ProfileManagement segments={segments} />} />
          </Route>

          <Route
            path="/producer"
            element={
              userRole === "PRODUCER" || userRole === "SEGMENT_LEADER" ? (
                <ProducerDashboard onLogout={handleLogout} userInfo={userInfo} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App

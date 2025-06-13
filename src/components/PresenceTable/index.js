"use client"

import { useState, useEffect } from "react"
import { FiInfo } from "react-icons/fi"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import isBetween from "dayjs/plugin/isBetween"
import weekOfYear from "dayjs/plugin/weekOfYear"
import "./PresenceTable.css"
import ExportButton from "../ExportButton"

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)
dayjs.extend(weekOfYear)

// Helper function to check employee status for a specific day
const checkEmployeeStatusForDay = (employee, scans, date) => {
  if (!scans || !date || !employee) {
    return {
      status: "unknown",
      message: "Inconnu",
      color: "#6c757d",
      isValid: false,
    }
  }

  const tz = "Africa/Tunis"
  const localDate = dayjs(date).tz(tz)
  const dayOfWeek = localDate.day()

  // Get employee scans for this day
  const employeeScans = scans
    .filter(scan => {
      if (scan.nfcToken !== employee.nfcToken) return false
      const scanDate = dayjs(scan.timestamp).tz(tz)
      return scanDate.isSame(localDate, 'day')
    })
    .sort((a, b) => dayjs(a.timestamp).diff(dayjs(b.timestamp)))

  const lastScan = employeeScans[employeeScans.length - 1]

  // Get schedule for this day
  let schedule = ""
  switch (dayOfWeek) {
    case 0: schedule = employee.dimanche; break
    case 1: schedule = employee.lundi; break
    case 2: schedule = employee.mardi; break
    case 3: schedule = employee.mercredi; break
    case 4: schedule = employee.jeudi; break
    case 5: schedule = employee.vendredi; break
    case 6: schedule = employee.samedi; break
    default:
      return {
        status: "unknown",
        message: "Jour invalide",
        color: "#6c757d",
        isValid: false,
      }
  }

  // Day off case
  if (schedule === "Repos" || !schedule) {
    return {
      status: "dayoff",
      message: "Repos",
      color: "#ffc107",
      isValid: false,
      schedule: schedule,
    }
  }

  // Check schedule format
  if (!schedule.includes("_")) {
    return {
      status: "unknown",
      message: "Horaire invalide",
      color: "#6c757d",
      isValid: false,
      schedule: schedule,
    }
  }

  // Extract start time
  const [start] = schedule.split('_')
  const [startHour, startMinute] = start.split(":").map(Number)

  // Create shift start date
  const shiftStart = dayjs(localDate)
    .set('hour', startHour)
    .set('minute', startMinute)
    .tz(tz)

  // Validation window (2h before → start time)
  const validationWindowStart = shiftStart.subtract(2, 'hour')
  const validationWindowEnd = shiftStart

  // No scan → absent
  if (!lastScan) {
    return {
      status: "absent",
      message: "Absent",
      color: "#dc3545",
      isValid: false,
      schedule: schedule,
    }
  }

  // Convert scan to Tunis local time
  const scanTime = dayjs(lastScan.timestamp).tz(tz)
  const formattedScanTime = scanTime.format("HH:mm")

  // Check if scan is in validation window
  const isValidScan = scanTime.isBetween(
    validationWindowStart,
    validationWindowEnd,
    null,
    "[]"
  )

  if (!isValidScan) {
    return {
      status: "invalid",
      message: "Hors plage",
      color: "#dc3545",
      isValid: false,
      schedule: schedule,
      scanTime: formattedScanTime,
    }
  }

  // Everything valid → present
  return {
    status: "present",
    message: "Présent",
    color: "#28a745",
    isValid: true,
    schedule: schedule,
    scanTime: formattedScanTime,
  }
}

const PresenceTable = ({
  employees = [],
  scans = [],
  selectedWeek,
  selectedDate,
  searchTerm,
  onSearch,
  onViewDetails,
  userInfo,
  showSegmentFilter = true,
}) => {
  const [viewMode, setViewMode] = useState("day")
  const [selectedShift, setSelectedShift] = useState("")
  const [shifts, setShifts] = useState([])
  const [loadingShifts, setLoadingShifts] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState("")
  const [segments, setSegments] = useState([])

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/employees/shifts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        )
        const data = await response.json()
        setShifts(data)
      } catch (error) {
        console.error("Error fetching shifts:", error)
      } finally {
        setLoadingShifts(false)
      }
    }

    const fetchSegments = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/segments`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        )
        const data = await response.json()
        setSegments(data)
      } catch (error) {
        console.error("Error fetching segments:", error)
      }
    }

    fetchShifts()
    fetchSegments()
  }, [])

  // Get field name for a day of week (0-6, Sunday is 0)
  const getDayField = (dayOfWeek) => {
    switch (dayOfWeek) {
      case 0: return "dimanche"
      case 1: return "lundi"
      case 2: return "mardi"
      case 3: return "mercredi"
      case 4: return "jeudi"
      case 5: return "vendredi"
      case 6: return "samedi"
      default: return ""
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    // Filter by search term
    const matchesSearch = Object.values(emp).some(
      (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Filter by shift if selected
    if (selectedShift && selectedShift !== "all") {
      const dayField = getDayField(dayjs(selectedDate).day())
      const empShift = emp[dayField]
      if (selectedShift === "Repos") return matchesSearch && empShift === "Repos"
      return matchesSearch && empShift === selectedShift
    }

    // Filter by segment if selected
    if (selectedSegment && selectedSegment !== "all") {
      return matchesSearch && emp.segment === selectedSegment
    }

    return matchesSearch
  })

  // Get dates for the selected week
  const getWeekDates = () => {
    const [year, week] = selectedWeek.split("-W").map(Number)
    const startOfWeek = dayjs().year(year).week(week).startOf('week')
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, 'day').format('YYYY-MM-DD')
    )
  }

  const renderDayCell = (employee, dayName, date) => {
    const dayField = getDayField(dayjs(date).day());
    const schedule = employee[dayField];
    const status = checkEmployeeStatusForDay(employee, scans, date);

    if (schedule === "Repos") {
      return (
        <td
          style={{
            backgroundColor: "#ffc107",
            color: "black",
            textAlign: "center",
            fontWeight: "bold",
          }}
          title={`Repos - ${dayName}`}
        >
          REPOS
        </td>
      );
    }

    return (
      <td
        style={{
          backgroundColor: status.color,
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
        }}
        title={`${status.message} - ${dayName} (${schedule})`}
      >
        {status.message}
        {status.scanTime && (
          <div style={{ fontSize: "0.7em", marginTop: "3px" }}>
            ✓ {status.scanTime}
          </div>
        )}
        <div style={{ fontSize: "0.7em", marginTop: "3px" }}>
          {schedule}
        </div>
      </td>
    );
  };

  const renderDayView = (employee) => {
    const status = checkEmployeeStatusForDay(employee, scans, selectedDate)
    const dayField = getDayField(dayjs(selectedDate).day())
    const schedule = employee[dayField] || "N/A"

    return (
      <td
        style={{
          backgroundColor: status.color,
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
        }}
        title={`${status.message} - ${schedule}`}
      >
        {schedule === "Repos" ? "REPOS" : status.isValid ? "PRÉSENT" : "ABSENT"}
        <div style={{ fontSize: "0.8em", marginTop: "5px" }}>{schedule}</div>
        {status.scanTime && (
          <div style={{ fontSize: "0.7em", marginTop: "3px" }}>
            Scan: {status.scanTime}
          </div>
        )}
      </td>
    )
  }

  return (
    <div className="data-table-container">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <h2>
            Suivi des présences -
            {viewMode === "day"
              ? ` Jour ${dayjs(selectedDate).format("DD/MM/YYYY")} (${["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][dayjs(selectedDate).day()]})`
              : ` Semaine ${selectedWeek.replace("W", "")}`}
          </h2>
          <div className="view-controls">
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="view-mode-select">
              <option value="day">Par Jour</option>
              <option value="week">Par Semaine</option>
            </select>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Rechercher par matricule, nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {(showSegmentFilter && segments.length > 0) && (
          <div className="filter-controls">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="segment-filter"
            >
              <option value="all">Tous les segments</option>
              {segments.map((segment, index) => (
                <option key={index} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="toolbar-right">
          {!loadingShifts && (
            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="shift-select">
              <option value="all">Tous les shifts</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={`${shift.startTime}_${shift.endTime}`}>
                  {shift.startTime}-{shift.endTime}
                </option>
              ))}
              <option value="Repos">Repos</option>
            </select>
          )}
          <ExportButton segment={userInfo?.segment} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="transport-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Immatricule</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Segment</th>

              {viewMode === "week" && (
                <>
                  <th>Dimanche</th>
                  <th>Lundi</th>
                  <th>Mardi</th>
                  <th>Mercredi</th>
                  <th>Jeudi</th>
                  <th>Vendredi</th>
                  <th>Samedi</th>
                </>
              )}
              {viewMode === "day" && <th>Présence</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => {
              const weekDates = viewMode === "week" ? getWeekDates() : []
              return (
                <tr key={employee.id}>
                  <td>{employee.matricule}</td>
                  <td>{employee.immatricule}</td>
                  <td>{employee.name}</td>
                  <td>{employee.tel}</td>
                  <td>{employee.segment}</td>

                  {viewMode === "week" && (
                    <>
                      {renderDayCell(employee, "Dimanche", weekDates[0])}
                      {renderDayCell(employee, "Lundi", weekDates[1])}
                      {renderDayCell(employee, "Mardi", weekDates[2])}
                      {renderDayCell(employee, "Mercredi", weekDates[3])}
                      {renderDayCell(employee, "Jeudi", weekDates[4])}
                      {renderDayCell(employee, "Vendredi", weekDates[5])}
                      {renderDayCell(employee, "Samedi", weekDates[6])}
                    </>
                  )}

                  {viewMode === "day" && renderDayView(employee)}

                  <td className="actions-cell">
                    <button className="details-button" onClick={() => onViewDetails(employee)} title="Détails">
                      <FiInfo size={20} />
                    </button>
                    <ExportButton
                      employeeId={employee.id}
                      segment={userInfo?.segment}
                      employees={filteredEmployees}
                      scans={scans}
                      selectedDate={selectedDate}
                      selectedWeek={selectedWeek}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PresenceTable
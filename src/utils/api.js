// Configuration de base
const API_URL = process.env.REACT_APP_API_URL || "https://nfc-application-latest-4.onrender.com"

// Headers d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    return { "Content-Type": "application/json" }
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

// ========== PRODUCTEURS ==========

export const fetchProducers = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/producers-with-segments`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken")
        window.location.href = "/login"
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching producers:", error)
    throw error
  }
}

export const addProducer = async (producerData) => {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Vous devez être connecté pour ajouter un chef de segment")
    }

    const userRole = localStorage.getItem("userRole")
    if (userRole !== "ADMIN") {
      throw new Error("Seuls les administrateurs peuvent ajouter des chefs de segments")
    }

    const response = await fetch(`${API_URL}/api/profiles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...producerData,
        role: "PRODUCER",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erreur lors de l'ajout du chef de segment" }))
      throw new Error(errorData.message || "Erreur lors de l'ajout du chef de segment")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur détaillée:", error)
    throw error
  }
}

export const updateProducer = async (email, producerData) => {
  try {
    const response = await fetch(`${API_URL}/api/profiles/by-email/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(producerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la mise à jour du chef de segment")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const deleteProducer = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/profiles/by-email/${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la suppression du chef de segment")
    }

    return true
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// ========== PROFILS ==========

export const fetchProfiles = async () => {
  try {
    const response = await fetch(`${API_URL}/api/profiles`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors du chargement des profils")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const addProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/api/profiles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de l'ajout du profil")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const updateProfile = async (id, profileData) => {
  try {
    const response = await fetch(`${API_URL}/api/profiles/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la mise à jour du profil")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const deleteProfile = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/profiles/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la suppression du profil")
    }
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchProfileById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement du profil")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const updateProfileSegment = async (id, segment) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}/update-segment`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ segment }),
    })
    if (!response.ok) throw new Error("Erreur lors de la mise à jour du segment")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// ========== PRÉSENCES ==========

export const fetchWeekPresences = async (year, weekNumber) => {
  try {
    const response = await fetch(`${API_URL}/api/presences/week/${year}/${weekNumber}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des présences de la semaine")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchPresencesByWeekString = async (weekString) => {
  try {
    const response = await fetch(`${API_URL}/api/presences/week/${weekString}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des présences de la semaine")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchPresencesByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(`${API_URL}/api/presences/dateRange?startDate=${startDate}&endDate=${endDate}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des présences")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchPresences = async (date) => {
  try {
    const response = await fetch(`${API_URL}/api/presences/date/${date}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des présences")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchEmployeePresences = async (employeeId) => {
  try {
    const response = await fetch(`${API_URL}/api/presences/employee/${employeeId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des présences")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// ========== AUTH ==========

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Email ou mot de passe incorrect")
    }

    const data = await response.json()

    if (data.token) {
      localStorage.setItem("authToken", data.token)
      if (data.role) localStorage.setItem("userRole", data.role)
      if (data.segment) localStorage.setItem("userSegment", data.segment)
    }

    return data
  } catch (error) {
    console.error("Erreur de connexion:", error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem("authToken")
  localStorage.removeItem("userRole")
  localStorage.removeItem("userSegment")
  localStorage.removeItem("userInfo")
}

// ========== EMPLOYÉS ==========

export const fetchEmployees = async () => {
  try {
    const response = await fetch(`${API_URL}/api/employees`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des employés")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchEmployeesBySegment = async (segment) => {
  try {
    if (typeof segment !== "string") {
      console.error("Segment should be a string, got:", segment)
      throw new Error("Invalid segment parameter")
    }

    const response = await fetch(`${API_URL}/api/employees/segment/${encodeURIComponent(segment)}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des employés par segment")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const addEmployee = async (employeeData) => {
  try {
    const response = await fetch(`${API_URL}/api/employees`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status !== 409) {
        console.error("API Error:", errorData)
      }
      return { error: true, ...errorData }
    }
    return await response.json()
  } catch (error) {
    console.error("Network Error:", error)
    return { error: true, message: error.message }
  }
}

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await fetch(`${API_URL}/api/employees/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        error: true,
        type: data.error || "UNKNOWN_ERROR",
        message: data.message || "Erreur lors de la mise à jour",
      }
    }

    return data
  } catch (error) {
    return {
      error: true,
      message: "Erreur réseau",
    }
  }
}

export const deleteEmployee = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/employees/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors de la suppression de l'employé")
    return true
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchEmployeesWithManagers = async () => {
  try {
    const response = await fetch(`${API_URL}/api/employees/with-managers`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des employés")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const fetchEmployeesWithLeaders = async () => {
  try {
    const response = await fetch(`${API_URL}/api/employees/with-leaders`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des employés avec chefs")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// ========== EXPORT ==========

export const exportEmployeesData = async (format, periodType, period, segment = null, employeesData = null) => {
  try {
    let url = `${API_URL}/api/employees/export?format=${format}&period=${periodType}&${periodType === "day" ? "date" : "year"}=${encodeURIComponent(period)}`

    if (periodType === "week") {
      const [year, week] = period.split("-W")
      url = `${API_URL}/api/employees/export?format=${format}&period=week&year=${year}&weekNumber=${week}`
    }

    if (segment) {
      url += `&segment=${encodeURIComponent(segment)}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erreur lors de l'export")
    }

    return await response.blob()
  } catch (error) {
    console.error("Erreur détaillée d'export:", error)
    throw new Error(`Échec de l'export: ${error.message}`)
  }
}

export const exportEmployeeData = async (employeeId, format, period, date = null, year = null, weekNumber = null) => {
  try {
    let url = `${API_URL}/api/employees/${employeeId}/export?format=${format}&period=${period}`

    if (period === "day" && date) {
      url += `&date=${date}`
    } else if (period === "week" && year && weekNumber) {
      url += `&year=${year}&weekNumber=${weekNumber}`
    }

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de l'export")
    }

    return await response.blob()
  } catch (error) {
    console.error("Erreur d'export:", error)
    throw error
  }
}

// ========== NFC ==========

export const fetchScans = async () => {
  try {
    const response = await fetch(`${API_URL}/api/mqtt/scans`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des scans")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const validateNfc = async (nfcToken) => {
  try {
    const response = await fetch(`${API_URL}/api/nfc/validate/${nfcToken}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors de la validation du token NFC")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// ========== SEGMENTS ==========

export const fetchSegments = async () => {
  try {
    const response = await fetch(`${API_URL}/api/segments`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des segments")
    const data = await response.json()
    return Array.isArray(data) ? data : data.segments || []
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const addSegment = async (segmentName) => {
  try {
    const response = await fetch(`${API_URL}/api/segments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: segmentName }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de l'ajout du segment")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur API:", error)
    throw error
  }
}

export const deleteSegment = async (segmentName) => {
  try {
    const response = await fetch(`${API_URL}/api/segments/${encodeURIComponent(segmentName)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la suppression du segment")
    }

    return true
  } catch (error) {
    console.error("Erreur API:", error)
    throw error
  }
}

// ========== SHIFTS ==========

export const fetchShifts = async () => {
  try {
    const response = await fetch(`${API_URL}/api/employees/shifts`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des shifts")
    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

export const addShift = async (shiftData) => {
  try {
    const response = await fetch(`${API_URL}/api/employees/shifts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(shiftData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erreur lors de l'ajout du shift")
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur:", error)
    throw error
  }
}

// ========== ÉTAT DE L'API ==========

export const checkApiStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/api/mqtt/test`)
    return response.ok
  } catch (error) {
    console.error("Erreur:", error)
    return false
  }
}

// ========== REQUÊTE GÉNÉRIQUE ==========

const apiRequest = async (endpoint, method = "GET", body = null) => {
  const config = {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : null,
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur API")
    }

    return await response.json()
  } catch (error) {
    console.error(`Erreur API (${endpoint}):`, error)
    throw error
  }
}

// Export par défaut avec toutes les fonctions
const api = {
  // Auth
  login,
  logout,

  // Employees
  fetchEmployees,
  fetchEmployeesBySegment,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  fetchEmployeesWithManagers,
  fetchEmployeesWithLeaders,

  // Export
  exportEmployeesData,
  exportEmployeeData,

  // NFC & Scans
  fetchScans,
  validateNfc,

  // Segments
  fetchSegments,
  addSegment,
  deleteSegment,

  // Shifts
  fetchShifts,
  addShift,

  // Profiles
  fetchProfiles,
  fetchProfileById,
  addProfile,
  updateProfile,
  updateProfileSegment,
  deleteProfile,

  // Producers
  fetchProducers,
  addProducer,
  updateProducer,
  deleteProducer,

  // Presences
  fetchPresences,
  fetchEmployeePresences,
  fetchWeekPresences,
  fetchPresencesByWeekString,
  fetchPresencesByDateRange,

  // Utils
  checkApiStatus,
  apiRequest,
}

export default api

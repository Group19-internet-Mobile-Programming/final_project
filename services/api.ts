import { getApiBaseUrl, findWorkingConnection } from "@/utils/apiConfig"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Dynamic API URL - will be set by findWorkingApiUrl()
let DYNAMIC_API_BASE_URL: string | null = null

/**
 * Find and cache the working API URL
 */
export const findWorkingApiUrl = async (): Promise<string> => {
  if (DYNAMIC_API_BASE_URL) {
    return DYNAMIC_API_BASE_URL
  }

  console.log("🔍 Finding working API URL...")
  const workingUrl = await findWorkingConnection()

  if (workingUrl) {
    DYNAMIC_API_BASE_URL = workingUrl
    console.log(`✅ Using API URL: ${workingUrl}`)
    return workingUrl
  }

  // Fallback to default
  const fallbackUrl = getApiBaseUrl()
  console.log(`⚠️ Using fallback API URL: ${fallbackUrl}`)
  DYNAMIC_API_BASE_URL = fallbackUrl
  return fallbackUrl
}

/**
 * Get the current API base URL (with automatic discovery)
 */
const getWorkingApiBaseUrl = async (): Promise<string> => {
  return await findWorkingApiUrl()
}

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const API_BASE_URL = await getWorkingApiBaseUrl()
  const token = await getAuthToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid token
      await AsyncStorage.removeItem("authToken")
      throw new Error("Not authenticated")
    }
    const error = await response.json().catch(() => ({ detail: "Network error" }))
    throw new Error(error.detail || "API request failed")
  }

  return response.json()
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("authToken")
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

// Auth API
export const loginUser = async (email: string, password: string) => {
  const API_BASE_URL = await getWorkingApiBaseUrl()

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error("Invalid credentials")
  }

  const data = await response.json()

  // Store the token
  if (data.access_token) {
    await AsyncStorage.setItem("authToken", data.access_token)
  }

  return data
}

export const registerUser = async (email: string, password: string, name: string) => {
  const API_BASE_URL = await getWorkingApiBaseUrl()

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  })

  if (!response.ok) {
    throw new Error("Registration failed")
  }

  const data = await response.json()

  // Store the token
  if (data.access_token) {
    await AsyncStorage.setItem("authToken", data.access_token)
  }

  return data
}

// Fixed Diagnostics API - Use React Native compatible file upload
export const analyzeDashboardImage = async (imageFile: any) => {
  const API_BASE_URL = await getWorkingApiBaseUrl()
  const token = await getAuthToken()

  if (!token) {
    throw new Error("Not authenticated")
  }

  console.log("Creating FormData for dashboard image...")

  // Create FormData with React Native compatible format
  const formData = new FormData()
  formData.append("file", {
    uri: imageFile.uri || imageFile,
    type: imageFile.type || "image/jpeg",
    name: imageFile.name || "dashboard.jpg",
  } as any)

  console.log(`Uploading to: ${API_BASE_URL}/diagnostics/analyze-dashboard`)

  try {
    const response = await fetch(`${API_BASE_URL}/diagnostics/analyze-dashboard`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem("authToken")
        throw new Error("Not authenticated")
      }
      const errorText = await response.text()
      console.error(`Dashboard analysis failed: ${response.status} - ${errorText}`)
      throw new Error(errorText || "Failed to analyze dashboard image")
    }

    const result = await response.json()
    console.log("Dashboard analysis successful:", result)
    return result
  } catch (error) {
    console.error("Network error during dashboard analysis:", error)
    throw new Error("Network request failed - check your connection")
  }
}

export const analyzeEngineSound = async (audioFile: any) => {
  const API_BASE_URL = await getWorkingApiBaseUrl()
  const token = await getAuthToken()

  if (!token) {
    throw new Error("Not authenticated")
  }

  console.log("Creating FormData for engine sound...")

  // Create FormData with React Native compatible format
  const formData = new FormData()
  formData.append("file", {
    uri: audioFile.uri || audioFile,
    type: audioFile.type || "audio/m4a",
    name: audioFile.name || "engine_sound.m4a",
  } as any)

  console.log(`Uploading to: ${API_BASE_URL}/diagnostics/analyze-sound`)

  try {
    const response = await fetch(`${API_BASE_URL}/diagnostics/analyze-sound`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem("authToken")
        throw new Error("Not authenticated")
      }
      const errorText = await response.text()
      console.error(`Sound analysis failed: ${response.status} - ${errorText}`)
      throw new Error(errorText || "Failed to analyze engine sound")
    }

    const result = await response.json()
    console.log("Sound analysis successful:", result)
    return result
  } catch (error) {
    console.error("Network error during sound analysis:", error)
    throw new Error("Network request failed - check your connection")
  }
}

export const fetchDiagnosticHistory = async () => {
  return apiCall("/diagnostics/")
}

export const fetchDiagnosticById = async (id: number) => {
  return apiCall(`/diagnostics/${id}`)
}

// Mechanics API
export const searchMechanics = async (params: {
  q?: string
  specialty?: string
  location?: string
  min_rating?: number
  verified_only?: boolean
}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString())
    }
  })

  return apiCall(`/mechanics/search?${searchParams.toString()}`)
}

export const fetchMechanics = async () => {
  return apiCall("/mechanics/")
}

export const fetchMechanicById = async (id: number) => {
  return apiCall(`/mechanics/${id}`)
}

export const getMechanicContactInfo = async (id: number) => {
  return apiCall(`/mechanics/${id}/contact-info`)
}

export const registerAsMechanic = async (mechanicData: {
  business_name: string
  specialization: string
  experience_years: number
  phone: string
  address: string
}) => {
  return apiCall("/mechanics/register", {
    method: "POST",
    body: JSON.stringify(mechanicData),
  })
}

// Feedback API
export const createFeedback = async (feedbackData: {
  rating: number
  message?: string
  mechanic_id?: number
  diagnostic_id?: number
}) => {
  return apiCall("/feedback/", {
    method: "POST",
    body: JSON.stringify(feedbackData),
  })
}

export const fetchMechanicFeedback = async (mechanicId: number) => {
  return apiCall(`/feedback/?mechanic_id=${mechanicId}`)
}

export const fetchMyFeedback = async () => {
  return apiCall("/feedback/my")
}

export const fetchFeedbackStats = async (mechanicId: number) => {
  return apiCall(`/feedback/stats/mechanic/${mechanicId}`)
}

// Notifications API
export const fetchNotifications = async () => {
  return apiCall("/notifications/")
}

export const markNotificationRead = async (notificationId: number) => {
  return apiCall(`/notifications/${notificationId}/read`, {
    method: "PUT",
  })
}

export const markAllNotificationsRead = async () => {
  return apiCall("/notifications/mark-all-read", {
    method: "PUT",
  })
}

export const getUnreadCount = async () => {
  return apiCall("/notifications/unread-count")
}

// WebSocket for real-time notifications
export const connectToNotifications = async (token: string) => {
  const API_BASE_URL = await getWorkingApiBaseUrl()
  const wsUrl = `${API_BASE_URL.replace("http", "ws")}/notifications/ws/${token}`
  return new WebSocket(wsUrl)
}

// Logout function
export const logout = async () => {
  await AsyncStorage.removeItem("authToken")
}

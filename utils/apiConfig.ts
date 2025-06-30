import { Platform } from "react-native"

// Cloud backend URL - UPDATE THIS after Render deployment
const CLOUD_BACKEND_URL = "https://your-app-name.onrender.com/api"

// Timeouts (increased for mobile networks)
const HEALTH_CHECK_TIMEOUT = 30000 // 30 seconds for mobile networks
const API_TIMEOUT = 60000 // 60 seconds for mobile API calls

/**
 * Returns the API base URL with /api path
 */
export const getApiBaseUrl = (): string => {
  // Always try cloud backend first if it's configured
  if (CLOUD_BACKEND_URL !== "https://your-app-name.onrender.com/api") {
    return CLOUD_BACKEND_URL
  }

  // For development - try multiple possible local URLs
  if (Platform.OS === "android") {
    // For Android emulator - try localhost first, then 10.0.2.2
    return "http://localhost:8000/api"
  }

  if (Platform.OS === "ios") {
    // For iOS simulator during development
    return "http://localhost:8000/api"
  }

  // Default fallback
  return "http://localhost:8000/api"
}

/**
 * Returns the base URL without the /api path
 */
export const getBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl()
  return apiUrl.replace("/api", "")
}

/**
 * Tests if a connection to the given URL is possible
 */
export const testConnection = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

    console.log(`Testing connection to ${url}/health...`)

    const response = await fetch(`${url}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    clearTimeout(timeoutId)
    const isOk = response.ok
    console.log(`Connection test result for ${url}: ${isOk ? "SUCCESS" : "FAILED"}`)
    return isOk
  } catch (error) {
    console.error(`Connection test failed for ${url}:`, error)
    return false
  }
}

/**
 * Tests multiple possible backend URLs and returns the first one that works
 */
export const findWorkingConnection = async (): Promise<string | null> => {
  const possibleUrls: string[] = []

  // Try cloud backend first (this is what we want for mobile)
  if (CLOUD_BACKEND_URL !== "https://your-app-name.onrender.com/api") {
    possibleUrls.push(CLOUD_BACKEND_URL)
  }

  // Try multiple local development URLs
  if (Platform.OS === "android") {
    possibleUrls.push("http://localhost:8000/api")
    possibleUrls.push("http://10.0.2.2:8000/api")
    possibleUrls.push("http://127.0.0.1:8000/api")
    possibleUrls.push("http://192.168.1.100:8000/api") // Replace with your actual IP
  } else if (Platform.OS === "ios") {
    possibleUrls.push("http://localhost:8000/api")
    possibleUrls.push("http://127.0.0.1:8000/api")
    possibleUrls.push("http://192.168.1.100:8000/api") // Replace with your actual IP
  }

  console.log(`Testing ${possibleUrls.length} possible backend URLs...`)

  for (const url of possibleUrls) {
    try {
      const isConnected = await testConnection(url)
      if (isConnected) {
        console.log(`✅ Found working backend: ${url}`)
        return url
      }
    } catch (error) {
      console.log(`❌ Failed to connect to ${url}: ${error}`)
    }
  }

  console.error("❌ Could not connect to any backend URL")
  return null
}

/**
 * Makes a fetch request with timeout (optimized for mobile)
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT,
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.log(`Request timeout after ${timeout}ms for ${url}`)
    controller.abort()
  }, timeout)

  try {
    console.log(`Making request to: ${url}`)
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)
    console.log(`Request completed: ${url} - Status: ${response.status}`)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`Request failed: ${url} - Error:`, error)
    throw error
  }
}

/**
 * Returns environment information for debugging
 */
export const getEnvironmentInfo = (): string => {
  return `Platform: ${Platform.OS}
API URL: ${getApiBaseUrl()}
Base URL: ${getBaseUrl()}
Cloud Backend: ${CLOUD_BACKEND_URL}

Status: ${CLOUD_BACKEND_URL !== "https://your-app-name.onrender.com/api" ? "✅ Using Cloud Backend" : "⚠️ Using Local Development"}

Note: This is a mobile app. Cloud backend allows access from any device.`
}

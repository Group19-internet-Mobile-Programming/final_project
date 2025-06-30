/**
 * Utility to test network connectivity to the backend server
 */

import { Platform } from "react-native"
import { fetchWithTimeout } from "./apiConfig"

export interface ConnectionTestResult {
  success: boolean
  message: string
  details: any
  workingUrl?: string
}

type TestResult = {
  success: boolean
  message: string
  details?: any
}

// Test connection to a specific backend URL
export const testSingleConnection = async (baseUrl: string): Promise<ConnectionTestResult> => {
  try {
    console.log(`Testing connection to ${baseUrl}...`)

    // First try the health endpoint
    const healthUrl = `${baseUrl}/health`
    const response = await fetchWithTimeout(
      healthUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      5000,
    ) // 5 second timeout

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: `Successfully connected to ${baseUrl}`,
        details: data,
        workingUrl: baseUrl,
      }
    } else {
      return {
        success: false,
        message: `Server responded with status ${response.status}`,
        details: { status: response.status, statusText: response.statusText },
      }
    }
  } catch (error: any) {
    console.error(`Connection test failed for ${baseUrl}:`, error)
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      details: { error: error.name, message: error.message },
    }
  }
}

/**
 * Test multiple backend URLs and return the first working one
 */
export const testBackendConnection = async (): Promise<ConnectionTestResult> => {
  // Get possible URLs based on platform
  const possibleUrls = getPossibleBackendUrls()

  console.log("Testing backend connections...")
  console.log("Possible URLs:", possibleUrls)

  for (const url of possibleUrls) {
    const result = await testSingleConnection(url)
    if (result.success) {
      return result
    }
  }

  return {
    success: false,
    message: "Could not connect to any backend URL",
    details: {
      testedUrls: possibleUrls,
      platform: Platform.OS,
      suggestions: [
        "Make sure your backend server is running",
        "Check if the backend is accessible at http://localhost:8000",
        "Verify your machine's IP address",
        "Check firewall settings",
      ],
    },
  }
}

/**
 * Get possible backend URLs based on platform
 */
export const getPossibleBackendUrls = (): string[] => {
  const urls: string[] = []

  if (Platform.OS === "web") {
    // Web platform - try localhost
    urls.push("http://localhost:8000/api")
    urls.push("http://127.0.0.1:8000/api")
  } else if (Platform.OS === "android") {
    // Android emulator - try special IP first
    urls.push("http://10.0.2.2:8000/api")
    // Also try localhost (might work in some cases)
    urls.push("http://localhost:8000/api")
    urls.push("http://127.0.0.1:8000/api")
  } else if (Platform.OS === "ios") {
    // iOS simulator - localhost should work
    urls.push("http://localhost:8000/api")
    urls.push("http://127.0.0.1:8000/api")
  }

  // For physical devices, we need the actual machine IP
  // You'll need to update this with your actual IP
  const machineIPs = [
    "192.168.1.100", // Common router IP range
    "192.168.0.100", // Another common range
    "192.168.114.97", // Your current IP
    "10.0.0.100", // Another possible range
  ]

  // Add machine IPs for physical device testing
  machineIPs.forEach((ip) => {
    urls.push(`http://${ip}:8000/api`)
  })

  return urls
}

/**
 * Get current machine IP address (you need to update this manually)
 */
export const getCurrentMachineIP = async (): Promise<string | null> => {
  // This is a placeholder - you need to find your actual IP
  // Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IP

  // For now, return the IP you provided earlier
  return "192.168.114.97"
}

/**
 * Test if backend is reachable and return detailed diagnostics
 */
export const runDiagnostics = async (): Promise<any> => {
  const diagnostics = {
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    recommendations: [] as string[],
  }

  const urls = getPossibleBackendUrls()

  for (const url of urls) {
    const startTime = Date.now()
    const result = await testSingleConnection(url)
    const endTime = Date.now()

    diagnostics.tests.push({
      url,
      success: result.success,
      responseTime: endTime - startTime,
      error: result.success ? null : result.message,
      details: result.details,
    })
  }

  // Add recommendations based on results
  const successfulTests = diagnostics.tests.filter((t) => t.success)

  if (successfulTests.length === 0) {
    diagnostics.recommendations.push(
      "No backend connections successful",
      "Check if backend server is running on port 8000",
      "Verify backend is accessible at http://localhost:8000",
      "Check firewall and network settings",
    )
  } else {
    diagnostics.recommendations.push(
      `Found ${successfulTests.length} working connection(s)`,
      `Recommended URL: ${successfulTests[0].url}`,
    )
  }

  return diagnostics
}

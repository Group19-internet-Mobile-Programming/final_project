"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"
import { getApiBaseUrl } from "@/utils/apiConfig"

// Use the API URL from our configuration utility
const API_BASE_URL = getApiBaseUrl()

const secureStoreWeb = {
  getItemAsync: (key: string) => {
    return Promise.resolve(localStorage.getItem(key))
  },
  setItemAsync: (key: string, value: string) => {
    localStorage.setItem(key, value)
    return Promise.resolve()
  },
  deleteItemAsync: (key: string) => {
    localStorage.removeItem(key)
    return Promise.resolve()
  },
}

const secureStore = Platform.OS === "web" ? secureStoreWeb : SecureStore

type MechanicInfo = {
  business_name?: string
  phone?: string
  specialization?: string
  experience_years?: number
  address?: string
}

type User = {
  id: number
  email: string
  name: string
  role: "user" | "mechanic"
  is_active: boolean
  created_at: string
}

type AuthError = {
  detail?: string
  message?: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isOffline: boolean // Add this line
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: "user" | "mechanic") => Promise<void>
  signOut: () => Promise<void>
  updateMechanicInfo: (info: MechanicInfo) => Promise<void>
  mechanic: {
    uploadCertificate: (certificateUri: string) => Promise<void>
    isVerified: boolean
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMechanicVerified, setIsMechanicVerified] = useState(false)
  const [isOffline, setIsOffline] = useState(false) // Add this line

  // Add network detection logic
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const response = await fetch("https://www.google.com", {
          method: "HEAD",
          signal: AbortSignal.timeout(3000),
        })
        setIsOffline(!response.ok)
      } catch {
        setIsOffline(true)
      }
    }

    checkNetworkStatus()
    const interval = setInterval(checkNetworkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleAuthError = (error: unknown): string => {
    if (error instanceof Error) {
      // Handle AbortError specifically
      if (error.name === "AbortError") {
        return "Request timed out. Please check your connection and try again."
      }
      return error.message
    }

    // Handle API error responses
    if (typeof error === "object" && error !== null) {
      const authError = error as AuthError
      return authError.detail || authError.message || "An unknown error occurred"
    }

    return "An unknown error occurred"
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      console.log(`Attempting to sign in to ${API_BASE_URL}/auth/login`)

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use default message
          errorMessage = `Login failed with status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      await secureStore.setItemAsync("token", data.access_token)
      await secureStore.setItemAsync("user", JSON.stringify(data.user))

      setToken(data.access_token)
      setUser(data.user)
    } catch (error: unknown) {
      console.error("Error signing in", error)
      throw new Error(handleAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: "user" | "mechanic") => {
    setIsLoading(true)
    try {
      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      console.log(`Attempting to register at ${API_BASE_URL}/auth/register`)

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = "Registration failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If JSON parsing fails, use default message
          errorMessage = `Registration failed with status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      await secureStore.setItemAsync("token", data.access_token)
      await secureStore.setItemAsync("user", JSON.stringify(data.user))

      setToken(data.access_token)
      setUser(data.user)
    } catch (error: unknown) {
      console.error("Error signing up", error)
      throw new Error(handleAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const updateMechanicInfo = async (info: MechanicInfo) => {
    if (!user || user.role !== "mechanic" || !token) {
      throw new Error("User must be authenticated as a mechanic")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(info),
      })

      if (!response.ok) {
        let errorMessage = "Failed to update mechanic info"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          errorMessage = `Update failed with status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      // Optionally update local user state if the response includes updated user data
      const responseData = await response.json()
      if (responseData.user) {
        setUser(responseData.user)
        await secureStore.setItemAsync("user", JSON.stringify(responseData.user))
      }
    } catch (error: unknown) {
      console.error("Error updating mechanic info", error)
      throw new Error(handleAuthError(error))
    }
  }

  const signOut = async () => {
    try {
      await secureStore.deleteItemAsync("token")
      await secureStore.deleteItemAsync("user")
      setUser(null)
      setToken(null)
      setIsMechanicVerified(false)
    } catch (error: unknown) {
      console.error("Error signing out", error)
      throw new Error(handleAuthError(error))
    }
  }

  const uploadCertificate = async (certificateUri: string) => {
    if (!token) {
      throw new Error("Not authenticated")
    }

    try {
      const formData = new FormData()

      // Handle different platforms for file upload
      if (Platform.OS === "web") {
        // For web, certificateUri might be a File object or blob URL
        const response = await fetch(certificateUri)
        const blob = await response.blob()
        formData.append("file", blob, "certificate.jpg")
      } else {
        // For mobile platforms
        formData.append("file", {
          uri: certificateUri,
          type: "image/jpeg",
          name: "certificate.jpg",
        } as any)
      }

      const response = await fetch(`${API_BASE_URL}/mechanics/upload-certificate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = "Failed to upload certificate"
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          errorMessage = `Upload failed with status ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      setIsMechanicVerified(true)

      // Update user verification status if returned
      if (responseData.user) {
        setUser(responseData.user)
        await secureStore.setItemAsync("user", JSON.stringify(responseData.user))
      }
    } catch (error: unknown) {
      console.error("Error uploading certificate", error)
      throw new Error(handleAuthError(error))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isOffline, // Add this line
        signIn,
        signUp,
        signOut,
        updateMechanicInfo,
        mechanic: {
          uploadCertificate,
          isVerified: isMechanicVerified,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

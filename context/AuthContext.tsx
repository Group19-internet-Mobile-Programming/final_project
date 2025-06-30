"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getApiBaseUrl, fetchWithTimeout, findWorkingConnection } from "@/utils/apiConfig"
import * as SQLite from "expo-sqlite"
import NetInfo from "@react-native-community/netinfo"

// Will be determined dynamically
let API_BASE_URL = getApiBaseUrl()

// Initialize database with new API
let db: SQLite.SQLiteDatabase | null = null

const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("carfirstaid.db")

    // Create users table for offline authentication
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        last_synced TEXT
      );
    `)

    console.log("Users table created successfully")
  } catch (error) {
    console.error("Error creating users table:", error)
  }
}

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

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isOffline: boolean
  isInitialized: boolean
  apiUrl: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMechanicVerified, setIsMechanicVerified] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [apiUrl, setApiUrl] = useState(API_BASE_URL)

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log(`Network state changed: ${state.isConnected ? "ONLINE" : "OFFLINE"}`)
      setIsOffline(!state.isConnected)
    })

    return () => unsubscribe()
  }, [])

  // Find a working API URL
  useEffect(() => {
    const findApi = async () => {
      try {
        console.log("Looking for working API connection...")
        const workingUrl = await findWorkingConnection()
        if (workingUrl) {
          API_BASE_URL = workingUrl
          setApiUrl(workingUrl)
          console.log(`✅ Using API URL: ${workingUrl}`)
        } else {
          console.log("⚠️ No working API connection found, using default")
          setApiUrl(API_BASE_URL)
        }
      } catch (error) {
        console.error("Error finding working API URL:", error)
        setApiUrl(API_BASE_URL)
      }
    }

    findApi()
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Initialize database first
        await initDatabase()

        const storedToken = await AsyncStorage.getItem("authToken")
        const userJSON = await AsyncStorage.getItem("user")

        if (storedToken && userJSON) {
          console.log("Loading stored user session...")
          setToken(storedToken)
          setUser(JSON.parse(userJSON))
        }
      } catch (error) {
        console.error("Failed to load user from storage", error)
      } finally {
        setIsInitialized(true)
      }
    }

    loadUser()
  }, [])

  // Check if user exists in local database
  const checkLocalUser = async (email: string, password: string): Promise<User | null> => {
    try {
      if (!db) {
        await initDatabase()
      }

      const result = (await db!.getFirstAsync("SELECT * FROM users WHERE email = ? AND password = ?", [
        email,
        password,
      ])) as any

      if (result) {
        return {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
          is_active: !!result.is_active,
          created_at: result.created_at,
        }
      }
      return null
    } catch (error) {
      console.error("Error checking local user:", error)
      return null
    }
  }

  // Save user to local database
  const saveLocalUser = async (user: User, password: string): Promise<void> => {
    try {
      if (!db) {
        await initDatabase()
      }

      await db!.runAsync(
        `INSERT OR REPLACE INTO users 
         (id, email, name, password, role, is_active, created_at, last_synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.name,
          password,
          user.role,
          user.is_active ? 1 : 0,
          user.created_at,
          new Date().toISOString(),
        ],
      )

      console.log("User saved locally")
    } catch (error) {
      console.error("Error saving local user:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    console.log(`Starting sign in process for: ${email}`)

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()
      console.log(`Network status: ${netInfo.isConnected ? "CONNECTED" : "DISCONNECTED"}`)

      // If offline, try local authentication
      if (!netInfo.isConnected) {
        console.log("Device is offline, trying local authentication")
        const localUser = await checkLocalUser(email, password)

        if (localUser) {
          console.log("Local authentication successful")
          setUser(localUser)

          // Generate a temporary offline token
          const offlineToken = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
          setToken(offlineToken)

          await AsyncStorage.setItem("authToken", offlineToken)
          await AsyncStorage.setItem("user", JSON.stringify(localUser))

          return
        } else {
          throw new Error("Cannot authenticate while offline. No matching local account found.")
        }
      }

      // Online authentication
      const loginUrl = `${apiUrl}/auth/login`
      console.log(`Attempting online sign in to: ${loginUrl}`)

      const response = await fetchWithTimeout(
        loginUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
        30000,
      ) // 30 second timeout for login

      if (!response.ok) {
        const errorText = await response.text()
        let errorDetail = "Login failed"

        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText)
          errorDetail = errorJson.detail || errorDetail
        } catch (e) {
          // If not JSON, use the text directly
          errorDetail = errorText || errorDetail
        }

        console.error(`Login failed with status ${response.status}: ${errorDetail}`)
        throw new Error(errorDetail)
      }

      const data = await response.json()
      console.log("Login successful, saving user data...")

      // Save to secure storage
      await AsyncStorage.setItem("authToken", data.access_token)
      await AsyncStorage.setItem("user", JSON.stringify(data.user))

      // Also save to local database for offline access
      await saveLocalUser(data.user, password)

      setToken(data.access_token)
      setUser(data.user)
      console.log("Sign in completed successfully")
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, role: "user" | "mechanic") => {
    setIsLoading(true)
    console.log(`Starting sign up process for: ${email}`)

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        throw new Error("Cannot register while offline. Please connect to the internet and try again.")
      }

      const registerUrl = `${apiUrl}/auth/register`
      console.log(`Attempting to register at: ${registerUrl}`)

      const response = await fetchWithTimeout(
        registerUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name, role }),
        },
        30000,
      ) // 30 second timeout for registration

      if (!response.ok) {
        const errorText = await response.text()
        let errorDetail = "Registration failed"

        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorText)
          errorDetail = errorJson.detail || errorDetail
        } catch (e) {
          // If not JSON, use the text directly
          errorDetail = errorText || errorDetail
        }

        console.error(`Registration failed with status ${response.status}: ${errorDetail}`)
        throw new Error(errorDetail)
      }

      const data = await response.json()
      console.log("Registration successful, saving user data...")

      // Save to secure storage
      await AsyncStorage.setItem("authToken", data.access_token)
      await AsyncStorage.setItem("user", JSON.stringify(data.user))

      // Also save to local database for offline access
      await saveLocalUser(data.user, password)

      setToken(data.access_token)
      setUser(data.user)
      console.log("Sign up completed successfully")
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateMechanicInfo = async (info: MechanicInfo) => {
    if (!user || user.role !== "mechanic" || !token) return

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        throw new Error("Cannot update profile while offline. Please connect to the internet and try again.")
      }

      const response = await fetchWithTimeout(`${apiUrl}/mechanics/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(info),
      })

      if (!response.ok) {
        throw new Error("Failed to update mechanic info")
      }
    } catch (error) {
      console.error("Error updating mechanic info", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out user...")
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("user")
      setUser(null)
      setToken(null)
      console.log("Sign out completed")
    } catch (error) {
      console.error("Error signing out", error)
      throw error
    }
  }

  const uploadCertificate = async (certificateUri: string) => {
    if (!token) throw new Error("Not authenticated")

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        throw new Error("Cannot upload certificate while offline. Please connect to the internet and try again.")
      }

      const formData = new FormData()
      formData.append("file", {
        uri: certificateUri,
        type: "image/jpeg",
        name: "certificate.jpg",
      } as any)

      const response = await fetchWithTimeout(`${apiUrl}/mechanics/upload-certificate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload certificate")
      }

      setIsMechanicVerified(true)
    } catch (error) {
      console.error("Error uploading certificate", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isOffline,
        isInitialized,
        apiUrl,
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

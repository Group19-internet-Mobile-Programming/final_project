"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import React from "react"

// Types for your existing diagnostic system
export type VideoLink = {
  title: string
  url: string
}

export type DiagnosticResult = {
  issue: string
  confidence: number
  description: string
  recommendation: string
  severity: "low" | "medium" | "high"
  videoLinks?: VideoLink[]
}

export type Diagnostic = {
  id: string
  type: "engine" | "dashboard"
  title: string
  date: string
  status: "pending" | "completed"
  result?: DiagnosticResult
}

// Extended types for vehicle diagnostics
export interface DiagnosticCode {
  id: string
  code: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  timestamp: Date
  isActive: boolean
  category: string
}

export interface VehicleData {
  speed: number
  rpm: number
  engineTemp: number
  fuelLevel: number
  batteryVoltage: number
  oilPressure: number
  timestamp: Date
}

// Combined context type
export type DiagnosticsContextType = {
  // Original diagnostic history functionality
  history: Diagnostic[]
  addDiagnostic: (diagnostic: Diagnostic) => void
  getDiagnosticById: (id: string) => Diagnostic | null

  // Extended vehicle diagnostics functionality
  diagnosticCodes: DiagnosticCode[]
  activeCodes: DiagnosticCode[]
  vehicleData: VehicleData | null
  isConnected: boolean
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"

  // Actions
  addDiagnosticCode: (code: Omit<DiagnosticCode, "id" | "timestamp">) => void
  clearDiagnosticCode: (id: string) => void
  clearAllCodes: () => void
  updateVehicleData: (data: Partial<VehicleData>) => void
  connect: () => Promise<boolean>
  disconnect: () => void

  // Loading states
  isLoading: boolean
  error: string | null
}

// Create context
const DiagnosticsContext = createContext<DiagnosticsContextType | undefined>(undefined)

// Provider component
export function DiagnosticsProvider({ children }: { children: ReactNode }) {
  // Original diagnostic history state
  const [history, setHistory] = useState<Diagnostic[]>([])

  // Extended vehicle diagnostics state
  const [diagnosticCodes, setDiagnosticCodes] = useState<DiagnosticCode[]>([])
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed values
  const activeCodes = diagnosticCodes.filter((code) => code.isActive)

  // Initialize with sample data
  useEffect(() => {
    setHistory([
      {
        id: "1",
        type: "engine",
        title: "Engine Sound Analysis",
        date: "2023-09-15T14:48:00.000Z",
        status: "completed",
        result: {
          issue: "Timing Belt Noise",
          confidence: 92,
          description:
            "The audio analysis detected sounds consistent with a worn timing belt or tensioner. This can lead to engine performance issues if not addressed.",
          recommendation:
            "Have your timing belt and tensioner inspected and replaced if necessary. This is a critical maintenance item.",
          severity: "medium",
          videoLinks: [
            {
              title: "How to Diagnose Timing Belt Noise",
              url: "https://www.youtube.com/watch?v=example1",
            },
          ],
        },
      },
      {
        id: "2",
        type: "dashboard",
        title: "Dashboard Light Check",
        date: "2023-09-10T10:30:00.000Z",
        status: "completed",
        result: {
          issue: "Check Engine Light",
          confidence: 98,
          description:
            "The check engine light indicates an issue with your engine or emissions system that needs attention.",
          recommendation:
            "Connect an OBD-II scanner to retrieve the specific error code. Common causes include oxygen sensor failure, loose gas cap, or catalytic converter issues.",
          severity: "medium",
          videoLinks: [
            {
              title: "Understanding Check Engine Light",
              url: "https://www.youtube.com/watch?v=example2",
            },
          ],
        },
      },
    ])
  }, [])

  // Original functions
  const addDiagnostic = (diagnostic: Diagnostic) => {
    setHistory((prev) => [diagnostic, ...prev])
  }

  const getDiagnosticById = (id: string) => {
    return history.find((item) => item.id === id) || null
  }

  // Extended functions
  const addDiagnosticCode = (code: Omit<DiagnosticCode, "id" | "timestamp">) => {
    const newCode: DiagnosticCode = {
      ...code,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    setDiagnosticCodes((prev) => [...prev, newCode])
  }

  const clearDiagnosticCode = (id: string) => {
    setDiagnosticCodes((prev) => prev.map((code) => (code.id === id ? { ...code, isActive: false } : code)))
  }

  const clearAllCodes = () => {
    setDiagnosticCodes((prev) => prev.map((code) => ({ ...code, isActive: false })))
  }

  const updateVehicleData = (data: Partial<VehicleData>) => {
    setVehicleData(
      (prev) =>
        ({
          ...prev,
          ...data,
          timestamp: new Date(),
        }) as VehicleData,
    )
  }

  const connect = async (): Promise<boolean> => {
    setIsLoading(true)
    setConnectionStatus("connecting")
    setError(null)

    try {
      // Simulate connection process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate connection success (80% success rate for demo)
      const success = Math.random() > 0.2

      if (success) {
        setIsConnected(true)
        setConnectionStatus("connected")

        // Initialize with sample data
        updateVehicleData({
          speed: 0,
          rpm: 800,
          engineTemp: 90,
          fuelLevel: 75,
          batteryVoltage: 12.6,
          oilPressure: 35,
        })

        // Add sample diagnostic code if none exist
        if (diagnosticCodes.length === 0) {
          addDiagnosticCode({
            code: "P0301",
            description: "Cylinder 1 Misfire Detected",
            severity: "medium",
            isActive: true,
            category: "Engine",
          })
        }

        return true
      } else {
        throw new Error("Failed to connect to vehicle")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
      setConnectionStatus("error")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setConnectionStatus("disconnected")
    setVehicleData(null)
    setError(null)
  }

  // Simulate real-time data updates when connected
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      updateVehicleData({
        speed: Math.max(0, (vehicleData?.speed || 0) + (Math.random() - 0.5) * 10),
        rpm: Math.max(600, (vehicleData?.rpm || 800) + (Math.random() - 0.5) * 200),
        engineTemp: Math.max(70, Math.min(120, (vehicleData?.engineTemp || 90) + (Math.random() - 0.5) * 5)),
        fuelLevel: Math.max(0, Math.min(100, (vehicleData?.fuelLevel || 75) - Math.random() * 0.1)),
        batteryVoltage: Math.max(11, Math.min(14, (vehicleData?.batteryVoltage || 12.6) + (Math.random() - 0.5) * 0.2)),
        oilPressure: Math.max(20, Math.min(60, (vehicleData?.oilPressure || 35) + (Math.random() - 0.5) * 5)),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected, vehicleData])

  const value: DiagnosticsContextType = {
    // Original functionality
    history,
    addDiagnostic,
    getDiagnosticById,

    // Extended functionality
    diagnosticCodes,
    activeCodes,
    vehicleData,
    isConnected,
    connectionStatus,
    addDiagnosticCode,
    clearDiagnosticCode,
    clearAllCodes,
    updateVehicleData,
    connect,
    disconnect,
    isLoading,
    error,
  }

  return <DiagnosticsContext.Provider value={value}>{children}</DiagnosticsContext.Provider>
}

// Custom hooks for backward compatibility
export function useDiagnosticsContext() {
  const context = useContext(DiagnosticsContext)
  if (context === undefined) {
    throw new Error("useDiagnosticsContext must be used within a DiagnosticsProvider")
  }
  return context
}

export function useDiagnostics() {
  return useDiagnosticsContext()
}

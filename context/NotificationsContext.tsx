"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import React from "react"

// Original notification type
export type Notification = {
  id: string
  title: string
  message: string
  type: "engine_result" | "dashboard_result" | "mechanic_message" | "info" | "warning" | "error" | "success"
  read: boolean
  date: string
  linkId?: string
  // Extended properties
  priority?: "low" | "medium" | "high"
  category?: "diagnostic" | "maintenance" | "system" | "reminder"
  actionRequired?: boolean
  expiresAt?: Date
}

export type NotificationsContextType = {
  // Original functionality
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearAll: () => void

  // Extended functionality
  unreadNotifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void
  removeNotification: (id: string) => void
  markAllAsRead: () => void

  // Settings
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
  pushNotificationsEnabled: boolean
  setPushNotificationsEnabled: (enabled: boolean) => void
}

// Create context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

// Provider component
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false)

  // Computed values
  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const unreadCount = unreadNotifications.length

  // Initialize with sample data
  useEffect(() => {
    setNotifications([
      {
        id: "1",
        title: "Diagnostic Complete",
        message: "Your engine sound analysis is complete. Tap to view the results.",
        type: "engine_result",
        read: false,
        date: "2023-09-15T14:48:00.000Z",
        linkId: "1",
        priority: "medium",
        category: "diagnostic",
      },
      {
        id: "2",
        title: "Mechanic Response",
        message: "John's Auto Repair has sent you a message regarding your diagnostic result.",
        type: "mechanic_message",
        read: true,
        date: "2023-09-14T10:30:00.000Z",
        linkId: "1",
        priority: "low",
        category: "system",
      },
      {
        id: "3",
        title: "Dashboard Light Analysis",
        message: "Your dashboard light analysis is complete. Tap to view the results.",
        type: "dashboard_result",
        read: false,
        date: "2023-09-10T10:30:00.000Z",
        linkId: "2",
        priority: "medium",
        category: "diagnostic",
      },
    ])
  }, [])

  // Original functions
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Extended functions
  const addNotification = (notification: Omit<Notification, "id" | "date" | "read">) => {
    if (!notificationsEnabled) return

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Auto-remove expired notifications
    if (newNotification.expiresAt) {
      const timeToExpire = newNotification.expiresAt.getTime() - Date.now()
      if (timeToExpire > 0) {
        setTimeout(() => {
          removeNotification(newNotification.id)
        }, timeToExpire)
      }
    }
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Auto-cleanup expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNotifications((prev) => prev.filter((notification) => !notification.expiresAt || notification.expiresAt > now))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const value: NotificationsContextType = {
    // Original functionality
    notifications,
    unreadCount,
    markAsRead,
    clearAll,

    // Extended functionality
    unreadNotifications,
    addNotification,
    removeNotification,
    markAllAsRead,
    notificationsEnabled,
    setNotificationsEnabled,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

// Custom hooks for backward compatibility
export function useNotificationsContext() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotificationsContext must be used within a NotificationsProvider")
  }
  return context
}

export function useNotifications() {
  return useNotificationsContext()
}

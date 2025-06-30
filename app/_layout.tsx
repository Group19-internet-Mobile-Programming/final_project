"use client"

import { useEffect, useState } from "react"
import { Stack } from "expo-router"
import { View, Text, ActivityIndicator } from "react-native"
import * as SplashScreen from "expo-splash-screen"

import { AuthProvider, useAuth } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { DiagnosticsProvider } from "@/context/DiagnosticsContext"
import { NotificationsProvider } from "@/context/NotificationsContext"
import React from "react"

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

function AppContent() {
  const { isInitialized } = useAuth()

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ fontSize: 18, color: "#333", marginTop: 20 }}>Initializing Car First Aid...</Text>
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(mechanic)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="connection-test"
        options={{
          title: "Connection Test",
          headerShown: true,
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Skip font loading to avoid errors
        console.log("App preparing...")

        // Simulate loading time
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (e) {
        console.warn("Error preparing app:", e)
      } finally {
        // Mark app as ready
        setAppIsReady(true)
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ fontSize: 18, color: "#333", marginTop: 20 }}>Loading Car First Aid...</Text>
      </View>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <DiagnosticsProvider>
          <NotificationsProvider>
            <AppContent />
          </NotificationsProvider>
        </DiagnosticsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

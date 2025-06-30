"use client"
import { Tabs } from "expo-router"
import { Camera, Home, User, History, MessageSquare } from "lucide-react-native"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import NotificationBell from "@/components/NotificationBell"
import React from "react"

export default function TabLayout() {
  const { colors, theme } = useTheme()
  const { user } = useAuth()

  const isUser = !user || user.role === "user"

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme === "light" ? "#1a237e" : colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme === "light" ? "#e3f2fd" : colors.background,
        },
        headerTitleStyle: {
          fontFamily: "Poppins-Medium",
          color: colors.text,
        },
        headerRight: () => <NotificationBell count={0} />,
        headerRightContainerStyle: {
          paddingRight: 16,
        },
        tabBarStyle: {
          backgroundColor: theme === "light" ? "#ffffff" : colors.background,
          borderTopColor: theme === "light" ? "#e3f2fd" : colors.border,
          height: 70,
          paddingBottom: 86,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontFamily: "Poppins-Regular",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="diagnose"
        options={{
          title: "Diagnose",
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="mechanics/index"
        options={{
          title: "Mechanics",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          // Hide the tab for non-users instead of conditional rendering
          // tabBarButton: isUser ? undefined : () => null,
        }}
      />

      <Tabs.Screen
        name="history/index"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}

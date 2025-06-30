"use client"
import { TouchableOpacity, View, Text, StyleSheet } from "react-native"
import { Bell } from "lucide-react-native"
import { useTheme } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import React from "react"

interface NotificationBellProps {
  count?: number
}

export default function NotificationBell({ count = 0 }: NotificationBellProps) {
  const { colors, theme } = useTheme()
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      padding: 8,
    },
    badge: {
      position: "absolute",
      right: 4,
      top: 4,
      backgroundColor: colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    badgeText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Poppins-Medium",
    },
  })

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.push("/notifications")}>
      <Bell size={24} color={theme === "light" ? "#1a237e" : colors.primary} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

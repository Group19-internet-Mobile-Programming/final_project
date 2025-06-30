"use client"
import { Stack } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import React from "react"

export default function AuthLayout() {
  const { colors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: "Poppins-Medium",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  )
}

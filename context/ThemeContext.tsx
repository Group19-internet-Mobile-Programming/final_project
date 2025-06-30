"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ColorValue, useColorScheme } from "react-native"

type Theme = {
  colors: {
    success: ColorValue | undefined
    error: any
    secondary: any
    tabIconDefault: ColorValue | undefined
    primary: string
    background: string
    card: string
    text: string
    border: string
    notification: string
  }
  dark: boolean
}

type ThemeContextType = {
  theme: Theme
  colors: Theme["colors"]
  toggleTheme: () => void
  isDark: boolean
}

const lightTheme: Theme = {
  colors: {
    primary: "#FFC700",
    background: "#FFFFFF",
    card: "#F2F2F7",
    text: "#000000",
    border: "#C6C6C8",
    notification: "#FF3B30",
    error: undefined,
    secondary: undefined,
    tabIconDefault: undefined
  },
  dark: false,
}

const darkTheme: Theme = {
  colors: {
    primary: "#FFC700",
    background: "#000000",
    card: "#1C1C1E",
    text: "#FFFFFF",
    border: "#38383A",
    notification: "#FF453A",
    error: undefined,
    secondary: undefined,
    tabIconDefault: undefined
  },
  dark: true,
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemColorScheme === "dark")

  useEffect(() => {
    setIsDark(systemColorScheme === "dark")
  }, [systemColorScheme])

  const theme = isDark ? darkTheme : lightTheme

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

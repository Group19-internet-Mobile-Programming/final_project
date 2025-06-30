"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import React from "react"

export default function RegisterScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"user" | "mechanic">("user")
  const [isLoading, setIsLoading] = useState(false)

  const auth = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  // Safety check
  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const { signUp } = auth

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      await signUp(email, password, name, role)
      if (role === "mechanic") {
        router.replace("/(mechanic)/verification")
      } else {
        router.replace("/(tabs)")
      }
    } catch (error) {
      // Fix: Proper error handling for TypeScript
      const errorMessage = error instanceof Error ? error.message : "An error occurred during registration"

      // Handle specific error types
      if (errorMessage.includes("email")) {
        Alert.alert(
          "Registration Failed",
          "This email is already registered. Please use a different email or try signing in.",
        )
      } else if (errorMessage.includes("password")) {
        Alert.alert("Registration Failed", "Password requirements not met. Please choose a stronger password.")
      } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
        Alert.alert("Connection Error", "Please check your internet connection and try again.")
      } else {
        Alert.alert("Registration Failed", errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 30,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      fontSize: 16,
      backgroundColor: colors.card,
      color: colors.text,
    },
    roleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    roleButton: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      borderWidth: 2,
      marginHorizontal: 5,
      alignItems: "center",
    },
    activeRole: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "20",
    },
    inactiveRole: {
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    roleText: {
      fontSize: 16,
      fontWeight: "600",
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    linkButton: {
      marginTop: 20,
      alignItems: "center",
    },
    linkText: {
      color: colors.primary,
      fontSize: 16,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={colors.text + "80"}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.text + "80"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        placeholderTextColor={colors.text + "80"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "user" ? styles.activeRole : styles.inactiveRole]}
          onPress={() => setRole("user")}
        >
          <Text style={[styles.roleText, { color: role === "user" ? colors.primary : colors.text }]}>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "mechanic" ? styles.activeRole : styles.inactiveRole]}
          onPress={() => setRole("mechanic")}
        >
          <Text style={[styles.roleText, { color: role === "mechanic" ? colors.primary : colors.text }]}>Mechanic</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/(auth)/Login")}>
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  )
}

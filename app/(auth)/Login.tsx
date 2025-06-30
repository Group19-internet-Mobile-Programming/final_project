"use client"

import { useState } from "react"
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native"
import { useRouter, Link } from "expo-router"
import { Lock, Mail } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import React from "react"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { signIn, isLoading } = useAuth()
  const { colors } = useTheme()

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setError("")
      await signIn(email, password)
      router.replace("/(tabs)")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      Alert.alert("Login Failed", errorMessage)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 10,
      borderRadius: 60,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      textAlign: "center",
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    form: {
      paddingHorizontal: 24,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontFamily: "Poppins-Regular",
    },
    errorText: {
      color: colors.error,
      marginBottom: 16,
      fontFamily: "Poppins-Regular",
      textAlign: "center",
    },
    buttonContainer: {
      marginTop: 10,
      overflow: "hidden",
      borderRadius: 12,
    },
    button: {
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      color: colors.secondary,
      fontSize: 16,
      fontFamily: "Poppins-Bold",
    },
    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
    },
    signupText: {
      color: colors.text,
      fontFamily: "Poppins-Regular",
    },
    signupLink: {
      color: colors.primary,
      fontFamily: "Poppins-Medium",
      marginLeft: 4,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/images/logo.jpg")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Car First Aid</Text>
          <Text style={styles.subtitle}>Sign in to diagnose your car issues with AI</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.tabIconDefault}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={["#FFD700", "#FFC000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={styles.buttonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <Link href="/Register" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

"use client"
import { StyleSheet, Text, View, TouchableOpacity } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import { CheckCircle } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"

export default function VerificationSuccessScreen() {
  const { colors } = useTheme()
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 24,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(50, 215, 75, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    message: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginBottom: 40,
      lineHeight: 24,
    },
    button: {
      overflow: "hidden",
      borderRadius: 12,
      width: "100%",
    },
    buttonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.secondary,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <CheckCircle size={60} color={colors.success} />
      </View>

      <Text style={styles.title}>Verification Submitted!</Text>
      <Text style={styles.message}>
        Your mechanic certification has been submitted for review. We'll notify you when your account is verified,
        typically within 1-2 business days.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <LinearGradient
          colors={["#FFD700", "#FFC000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

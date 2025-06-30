"use client"

import { useState } from "react"
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { AlertTriangle } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"

export default function ManualDiagnosisScreen() {
  const [description, setDescription] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const { colors, theme } = useTheme()

  const analyzeProblem = async () => {
    if (!description || !symptoms) {
      alert("Please fill in all fields")
      return
    }

    setDiagnosing(true)

    // In a real app, you would send this to your AI model
    // Mocking the diagnosis process
    setTimeout(() => {
      setDiagnosisResult({
        issue: "Potential Transmission Problem",
        description:
          "Based on the symptoms described, your vehicle may be experiencing transmission-related issues. The combination of shifting difficulties and unusual noises suggests potential wear in the transmission system.",
        severity: "Medium",
        recommendations: [
          "Check transmission fluid level and condition",
          "Inspect for transmission fluid leaks",
          "Have a professional perform a transmission diagnostic scan",
          "Consider a transmission fluid flush if not done recently",
        ],
        videoLinks: [
          {
            title: "How to Check Transmission Fluid",
            url: "https://www.youtube.com/watch?v=example1",
          },
          {
            title: "Common Transmission Problems",
            url: "https://www.youtube.com/watch?v=example2",
          },
        ],
      })
      setDiagnosing(false)
    }, 3000)
  }

  const resetDiagnosis = () => {
    setDescription("")
    setSymptoms("")
    setDiagnosisResult(null)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "light" ? "#f0f8ff" : colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
    },
    content: {
      flex: 1,
      padding: 24,
    },
    inputContainer: {
      marginTop: 20,
    },
    label: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme === "light" ? "#ffffff" : colors.card,
      borderRadius: 12,
      padding: 16,
      color: colors.text,
      fontFamily: "Poppins-Regular",
      marginBottom: 20,
      height: 120,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: theme === "light" ? "#e3f2fd" : colors.border,
    },
    symptomsInput: {
      height: 80,
    },
    analyzeButton: {
      marginTop: 20,
      overflow: "hidden",
      borderRadius: 12,
    },
    analyzeGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    analyzeButtonText: {
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: theme === "light" ? "#000" : colors.secondary,
    },
    resultContainer: {
      backgroundColor: theme === "light" ? "#ffffff" : colors.card,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    resultTitle: {
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    resultDescription: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      marginBottom: 16,
      lineHeight: 22,
    },
    severityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    severityLabel: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginRight: 8,
    },
    severityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#FFC107",
    },
    severityText: {
      fontSize: 12,
      fontFamily: "Poppins-Medium",
      color: "#000",
    },
    recommendationsTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    recommendation: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    recommendationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 8,
      marginRight: 8,
    },
    recommendationText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      lineHeight: 22,
    },
    videoLinksTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    videoLink: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme === "light" ? "#f0f8ff" : colors.background,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
    },
    videoLinkText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
      marginLeft: 8,
    },
    resetButton: {
      marginTop: 24,
      alignSelf: "center",
    },
    resetButtonText: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.error,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
  })

  if (diagnosing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your problem...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manual Diagnosis</Text>
        <Text style={styles.subtitle}>Describe your car problems in detail</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Problem Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the problem in detail..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Symptoms</Text>
            <TextInput
              style={[styles.input, styles.symptomsInput]}
              placeholder="List any noticeable symptoms..."
              placeholderTextColor={colors.tabIconDefault}
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
            />

            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeProblem}>
              <LinearGradient
                colors={["#FFD700", "#FFC000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeGradient}
              >
                <Text style={styles.analyzeButtonText}>Analyze Problem</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {diagnosisResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>{diagnosisResult.issue}</Text>

              <Text style={styles.resultDescription}>{diagnosisResult.description}</Text>

              <View style={styles.severityContainer}>
                <Text style={styles.severityLabel}>Severity:</Text>
                <View style={styles.severityBadge}>
                  <Text style={styles.severityText}>{diagnosisResult.severity}</Text>
                </View>
              </View>

              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {diagnosisResult.recommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.recommendation}>
                  <View style={styles.recommendationDot} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}

              <Text style={styles.videoLinksTitle}>Helpful Videos:</Text>
              {diagnosisResult.videoLinks.map((link: any, index: number) => (
                <TouchableOpacity key={index} style={styles.videoLink}>
                  <AlertTriangle size={20} color={colors.primary} />
                  <Text style={styles.videoLinkText}>{link.title}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.resetButton} onPress={resetDiagnosis}>
                <Text style={styles.resetButtonText}>Start a New Diagnosis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

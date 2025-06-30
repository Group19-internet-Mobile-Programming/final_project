"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { getApiBaseUrl, findWorkingConnection, testConnection, getEnvironmentInfo } from "@/utils/apiConfig"

export default function ConnectionTestScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [workingUrl, setWorkingUrl] = useState<string | null>(null)
  const { colors } = useTheme()

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCurrentConnection = async () => {
    setIsLoading(true)
    setResults([])

    const currentUrl = getApiBaseUrl()
    addResult(`Testing current API URL: ${currentUrl}`)

    try {
      const isWorking = await testConnection(currentUrl)
      if (isWorking) {
        addResult(`✅ SUCCESS: ${currentUrl} is working!`)
        setWorkingUrl(currentUrl)
      } else {
        addResult(`❌ FAILED: ${currentUrl} is not responding`)
        setWorkingUrl(null)
      }
    } catch (error) {
      addResult(`❌ ERROR: ${error}`)
      setWorkingUrl(null)
    }

    setIsLoading(false)
  }

  const findWorkingUrl = async () => {
    setIsLoading(true)
    setResults([])

    addResult("🔍 Searching for working backend URL...")

    try {
      const foundUrl = await findWorkingConnection()
      if (foundUrl) {
        addResult(`✅ FOUND: ${foundUrl} is working!`)
        setWorkingUrl(foundUrl)
      } else {
        addResult("❌ NO WORKING URL FOUND")
        addResult("💡 Try starting your backend server:")
        addResult("   cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        setWorkingUrl(null)
      }
    } catch (error) {
      addResult(`❌ ERROR: ${error}`)
      setWorkingUrl(null)
    }

    setIsLoading(false)
  }

  const showEnvironmentInfo = () => {
    setResults([])
    const info = getEnvironmentInfo()
    info.split("\n").forEach((line) => addResult(line))
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      paddingTop: 40,
      paddingBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.tabIconDefault,
      marginBottom: 20,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: "center",
    },
    buttonText: {
      color: colors.secondary,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
    },
    resultsContainer: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
    },
    resultsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    resultText: {
      fontSize: 12,
      color: colors.text,
      marginBottom: 5,
      fontFamily: "monospace",
    },
    workingUrlContainer: {
      backgroundColor: colors.success + "20",
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
    },
    workingUrlText: {
      color: colors.success,
      fontSize: 14,
      fontWeight: "600",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    loadingText: {
      marginLeft: 10,
      color: colors.text,
      fontSize: 16,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connection Test</Text>
        <Text style={styles.subtitle}>Test connectivity to your Car First Aid API backend</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={testCurrentConnection} disabled={isLoading}>
        <Text style={styles.buttonText}>Test Current Connection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={findWorkingUrl} disabled={isLoading}>
        <Text style={styles.buttonText}>Find Working Backend</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={showEnvironmentInfo}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Show Environment Info</Text>
      </TouchableOpacity>

      {workingUrl && (
        <View style={styles.workingUrlContainer}>
          <Text style={styles.workingUrlText}>✅ Working URL: {workingUrl}</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Testing connections...</Text>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        <ScrollView>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

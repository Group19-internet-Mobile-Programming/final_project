"use client"

import { useState, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from "react-native"
import { Camera, Upload } from "lucide-react-native"
import { useTheme } from "@/context/ThemeContext"
import { CameraView } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import { analyzeDashboardImage } from "@/services/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

type VideoLink = {
  title: string
  url: string
}

export default function DiagnoseScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [showCamera, setShowCamera] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [facing, setFacing] = useState<"back" | "front">("back")
  const cameraRef = useRef<any>(null)
  const { colors } = useTheme()
  const router = useRouter()

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync()
      setImage(photo.uri)
      setShowCamera(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error taking picture"
      console.error("Error taking picture:", errorMessage)
      Alert.alert("Error", "Failed to take picture")
    }
  }

  const pickImage = async () => {
    try {
      // Fixed: Using the correct API for expo-image-picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Fixed deprecated API
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error picking image"
      console.error("Error picking image:", errorMessage)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const analyzeDashboard = async () => {
    if (!image) return

    setDiagnosing(true)

    try {
      // Check authentication
      const token = await AsyncStorage.getItem("authToken")
      if (!token) {
        Alert.alert("Authentication Required", "Please log in to analyze images")
        router.push("/(auth)/Login")
        return
      }

      // Create file object with React Native compatible format
      const fileObject = {
        uri: image,
        type: "image/jpeg",
        name: "dashboard.jpg",
      }

      // Use direct analysis endpoint
      const result = await analyzeDashboardImage(fileObject)

      Alert.alert(
        "Analysis Complete",
        `Analysis Result: ${result.result.issue}\nConfidence: ${result.result.confidence.toFixed(1)}%`,
        [
          {
            text: "View History",
            onPress: () => router.push("/(tabs)/history"),
          },
          { text: "OK" },
        ],
      )

      // Reset form
      setImage(null)
      setDiagnosisResult(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("Error analyzing dashboard:", errorMessage)

      if (errorMessage.includes("Not authenticated")) {
        Alert.alert("Authentication Error", "Please log in again")
        router.push("/(auth)/Login")
      } else {
        Alert.alert("Analysis Failed", "Failed to analyze the image. Please try again.")
      }
    } finally {
      setDiagnosing(false)
    }
  }

  const resetDiagnosis = () => {
    setImage(null)
    setDiagnosisResult(null)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    uploadSection: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    placeholder: {
      width: 280,
      height: 200,
      borderRadius: 16,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    uploadIcon: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 50,
      backgroundColor: "rgba(255, 215, 0, 0.1)",
    },
    uploadText: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      maxWidth: 200,
      marginBottom: 20,
    },
    imagePreview: {
      width: 280,
      height: 200,
      borderRadius: 16,
      marginBottom: 20,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
      marginBottom: 20,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      width: "45%",
    },
    buttonText: {
      textAlign: "center",
      fontFamily: "Poppins-Medium",
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: colors.secondary,
    },
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
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
      color: colors.secondary,
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
    // Camera styles - Fixed structure
    cameraContainer: {
      flex: 1,
      backgroundColor: "#000",
    },
    camera: {
      flex: 1,
    },
    cameraOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
    },
    cameraControls: {
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    cameraButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "rgba(255,255,255,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    captureButtonInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: "#fff",
    },
    cancelText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Poppins-Medium",
    },
    permissionTitle: {
      fontSize: 20,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    permissionText: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.text,
      textAlign: "center",
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    permissionButtonText: {
      color: colors.secondary,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
    },
  })

  // Check camera permissions
  if (!permission) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to take photos of dashboard warning lights for analysis.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (diagnosing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Uploading and analyzing dashboard image...</Text>
      </View>
    )
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Diagnosis</Text>
        <Text style={styles.subtitle}>Snap a photo of your dashboard warning lights</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.uploadSection}>
            {!image ? (
              <View style={styles.placeholder}>
                <View style={styles.uploadIcon}>
                  <Upload size={32} color={colors.primary} />
                </View>
                <Text style={styles.uploadText}>Take or upload a clear photo of your dashboard warning lights</Text>
              </View>
            ) : (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
          </View>

          {!image && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => setShowCamera(true)}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImage}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {image && (
            <View>
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeDashboard}>
                <LinearGradient
                  colors={["#FFD700", "#FFC000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.analyzeGradient}
                >
                  <Text style={styles.analyzeButtonText}>Analyze Dashboard Light</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { marginTop: 12 }]}
                onPress={resetDiagnosis}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

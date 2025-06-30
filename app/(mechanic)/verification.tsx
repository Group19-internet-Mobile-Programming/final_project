"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "expo-router"
import { Upload, CheckCircle, FileText } from "lucide-react-native"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"

export default function MechanicVerificationScreen() {
  const [certificateUri, setCertificateUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { colors } = useTheme()
  const { mechanic } = useAuth()
  const router = useRouter()

  // Handle navigation when mechanic is verified
  useEffect(() => {
    if (mechanic.isVerified && router.canGoBack()) {
      router.replace("/(tabs)")
    }
  }, [mechanic.isVerified, router])

  const pickDocument = async () => {
    try {
      // Request media library permissions if needed
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant access to your photo library to upload a certificate.")
        return
      }

      // Fixed: Using MediaTypeOptions instead of MediaType
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Reduced quality for faster upload
        allowsMultipleSelection: false,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCertificateUri(result.assets[0].uri)
        console.log("Selected certificate:", result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking document:", error)
    
      Alert.alert("Error", `Failed to select image:`)
    }
  }

  const handleUpload = async () => {
    if (!certificateUri) {
      Alert.alert("Error", "Please select a certificate image first")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      console.log("Starting certificate upload...")

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Create form data for the image upload
      const formData = new FormData()

      // Get file name from URI
      const uriParts = certificateUri.split("/")
      const fileName = uriParts[uriParts.length - 1] || "certificate.jpg"

      // Append the image to form data
      formData.append("file", {
        uri: certificateUri,
        type: "image/jpeg",
        name: fileName,
      } as any)

      // For now, use the mock upload from AuthContext
      // In production, this would call your FastAPI backend
      await mechanic.uploadCertificate(certificateUri)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Small delay to show 100% progress
      setTimeout(() => {
        Alert.alert(
          "Upload Successful",
          "Your certificate has been uploaded successfully. You will be notified once it's verified.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ],
        )
      }, 500)
    } catch (error) {
      console.error("Error uploading certificate:", error)
      Alert.alert("Upload Failed", `There was a problem uploading your certificate:`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const retakePhoto = () => {
    setCertificateUri(null)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
    },
    header: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginBottom: 16,
    },
    uploadSection: {
      marginTop: 20,
    },
    uploadTitle: {
      fontSize: 18,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginBottom: 16,
    },
    uploadContainer: {
      height: 200,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.card,
      marginBottom: 20,
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
      marginHorizontal: 32,
    },
    certificatePreview: {
      width: "100%",
      height: 200,
      borderRadius: 16,
      marginBottom: 20,
    },
    imageActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    retakeButton: {
      flex: 1,
      marginRight: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    retakeButtonText: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    requirementSection: {
      marginTop: 20,
      marginBottom: 30,
    },
    requirementTitle: {
      fontSize: 18,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginBottom: 16,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    checkIcon: {
      marginRight: 10,
      marginTop: 2,
    },
    requirementText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.text,
    },
    uploadButton: {
      marginTop: 20,
      overflow: "hidden",
      borderRadius: 12,
    },
    uploadGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    uploadButtonText: {
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: colors.secondary,
    },
    noteText: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 16,
    },
    progressContainer: {
      marginTop: 20,
      alignItems: "center",
    },
    progressBar: {
      width: 200,
      height: 4,
      backgroundColor: "rgba(0,0,0,0.1)",
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      marginTop: 10,
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      textAlign: "center",
    },
  })

  if (uploading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Uploading your certificate...</Text>
        {uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
        )}
      </View>
    )
  }

  // Don't render anything if mechanic is verified (navigation will handle it)
  if (mechanic.isVerified) {
    return null
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FileText size={60} color={colors.primary} />
          <Text style={styles.title}>Mechanic Verification</Text>
          <Text style={styles.subtitle}>Please upload your mechanic certification to get verified</Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>Upload Certification</Text>

          {!certificateUri ? (
            <TouchableOpacity style={styles.uploadContainer} onPress={pickDocument}>
              <View style={styles.uploadIcon}>
                <Upload size={32} color={colors.primary} />
              </View>
              <Text style={styles.uploadText}>Tap to upload a photo of your mechanic certification or license</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Image source={{ uri: certificateUri }} style={styles.certificatePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                  <Text style={styles.retakeButtonText}>Choose Different Image</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {certificateUri && (
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <LinearGradient
                colors={["#FFD700", "#FFC000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.uploadGradient}
              >
                <Text style={styles.uploadButtonText}>Submit for Verification</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.requirementSection}>
          <Text style={styles.requirementTitle}>Requirements</Text>

          <View style={styles.requirementItem}>
            <CheckCircle size={18} color={colors.success} style={styles.checkIcon} />
            <Text style={styles.requirementText}>Valid professional mechanic certification or license</Text>
          </View>

          <View style={styles.requirementItem}>
            <CheckCircle size={18} color={colors.success} style={styles.checkIcon} />
            <Text style={styles.requirementText}>
              Clear, readable image showing your name and certification details
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <CheckCircle size={18} color={colors.success} style={styles.checkIcon} />
            <Text style={styles.requirementText}>
              Proof of current employment at an auto repair shop (optional, but recommended)
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <CheckCircle size={18} color={colors.success} style={styles.checkIcon} />
            <Text style={styles.requirementText}>Any specialized training certificates (optional)</Text>
          </View>

          <Text style={styles.noteText}>
            Your certification will be reviewed by our team. This process usually takes 1-2 business days.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

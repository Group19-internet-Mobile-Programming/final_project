"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { Mic, Square, Play, Pause, Upload } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Audio } from "expo-av"
import * as DocumentPicker from "expo-document-picker"
import { useRouter } from "expo-router"
import { analyzeEngineSound } from "@/services/api"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function EngineSoundScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { colors, theme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (permission.status !== "granted") {
        Alert.alert("Permission required", "Please grant microphone permission to record audio")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      setRecording(recording)
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording", err)
      Alert.alert("Error", "Failed to start recording")
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    setIsRecording(false)
    await recording.stopAndUnloadAsync()
    const uri = recording.getURI()
    setRecordingUri(uri)
    setRecording(null)
  }

  const playRecording = async () => {
    if (!recordingUri) return

    try {
      if (sound) {
        await sound.unloadAsync()
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri })
      setSound(newSound)
      setIsPlaying(true)

      await newSound.playAsync()
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false)
        }
      })
    } catch (error) {
      console.error("Error playing sound", error)
      Alert.alert("Error", "Failed to play recording")
    }
  }

  const stopPlaying = async () => {
    if (sound) {
      await sound.stopAsync()
      setIsPlaying(false)
    }
  }

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRecordingUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking audio file", error)
      Alert.alert("Error", "Failed to pick audio file")
    }
  }

  const analyzeRecording = async () => {
    if (!recordingUri) {
      Alert.alert("No Recording", "Please record or upload an audio file first")
      return
    }

    setIsUploading(true)

    try {
      // Check authentication
      const token = await AsyncStorage.getItem("authToken")
      if (!token) {
        Alert.alert("Authentication Required", "Please log in to analyze recordings")
        router.push("/(auth)/Login")
        return
      }

      // Create file object with React Native compatible format
      const fileObject = {
        uri: recordingUri,
        type: "audio/m4a",
        name: "engine_sound.m4a",
      }

      // Use direct analysis endpoint
      const result = await analyzeEngineSound(fileObject)

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
      setRecordingUri(null)
      if (sound) {
        await sound.unloadAsync()
        setSound(null)
      }
    } catch (error) {
      console.error("Error analyzing recording:", error)

      if (error instanceof Error && error.message.includes("Not authenticated")) {
        Alert.alert("Authentication Error", "Please log in again")
        router.push("/(auth)/Login")
      } else {
        Alert.alert("Analysis Failed", "Failed to analyze the recording. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetRecording = () => {
    setRecordingUri(null)
    setIsPlaying(false)
    if (sound) {
      sound.unloadAsync()
      setSound(null)
    }
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
    recordingContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    recordButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    recordButtonRecording: {
      backgroundColor: colors.success,
    },
    recordButtonText: {
      marginTop: 8,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    playbackContainer: {
      backgroundColor: theme === "light" ? "#ffffff" : colors.card,
      borderRadius: 16,
      padding: 20,
      marginVertical: 20,
      alignItems: "center",
    },
    playbackTitle: {
      fontSize: 18,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 16,
    },
    playbackControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    playButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 10,
    },
    actionButtons: {
      marginTop: 20,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginBottom: 12,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      marginLeft: 8,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
    },
    primaryButtonText: {
      color: colors.secondary,
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    analyzeButtonText: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: theme === "light" ? "#000" : colors.secondary,
      marginLeft: 8,
    },
  })

  if (isUploading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.recordButtonText, { marginTop: 20 }]}>Uploading and analyzing...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Engine Sound Diagnosis</Text>
        <Text style={styles.subtitle}>Record or upload your engine sound for AI analysis</Text>
      </View>

      <View style={styles.content}>
        {!recordingUri ? (
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonRecording]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square size={32} color="white" /> : <Mic size={32} color="white" />}
            </TouchableOpacity>
            <Text style={styles.recordButtonText}>{isRecording ? "Stop Recording" : "Start Recording"}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickAudioFile}>
                <Upload size={20} color={colors.text} />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Upload Audio File</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.recordingContainer}>
            <View style={styles.playbackContainer}>
              <Text style={styles.playbackTitle}>Recording Ready</Text>

              <View style={styles.playbackControls}>
                <TouchableOpacity style={styles.playButton} onPress={isPlaying ? stopPlaying : playRecording}>
                  {isPlaying ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={resetRecording}>
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Record Again</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.analyzeButton} onPress={analyzeRecording}>
                  <LinearGradient
                    colors={["#FFD700", "#FFC000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.analyzeGradient}
                  >
                    <Mic size={20} color={theme === "light" ? "#000" : colors.secondary} />
                    <Text style={styles.analyzeButtonText}>Analyze Engine Sound</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

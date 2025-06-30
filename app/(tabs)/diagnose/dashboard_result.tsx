import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Image, Alert } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"

interface VideoLink {
  title: string
  url: string
  thumbnail?: string
  channel?: string
  description?: string
}

interface DiagnosticResult {
  issue: string
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  description: string
  causes: string[]
  recommendations: string[]
  repair_steps: string[]
  urgency: number
  video_links: VideoLink[]
}

export default function DashboardResultScreen() {
  const params = useLocalSearchParams()

  // Parse the result from params
  let result: DiagnosticResult | null = null
  try {
    if (params.result && typeof params.result === "string") {
      result = JSON.parse(params.result)
    }
  } catch (error) {
    console.error("Failed to parse result:", error)
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.light.error} />
          <Text style={styles.errorTitle}>No Results Available</Text>
          <Text style={styles.errorText}>Unable to load diagnostic results. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "#4CAF50"
      case "medium":
        return "#FF9800"
      case "high":
        return "#FF5722"
      case "critical":
        return "#F44336"
      default:
        return "#9E9E9E"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "checkmark-circle"
      case "medium":
        return "warning"
      case "high":
        return "alert"
      case "critical":
        return "alert-circle"
      default:
        return "information-circle"
    }
  }

  const openVideo = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert("Error", "Unable to open video link")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open video link")
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard Analysis</Text>
      </View>

      {/* Main Issue Card */}
      <View style={styles.card}>
        <View style={styles.issueHeader}>
          <Ionicons name={getSeverityIcon(result.severity)} size={32} color={getSeverityColor(result.severity)} />
          <View style={styles.issueInfo}>
            <Text style={styles.issueTitle}>{result.issue}</Text>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>Confidence: {result.confidence.toFixed(1)}%</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(result.severity) }]}>
                <Text style={styles.severityText}>{result.severity.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.description}>{result.description}</Text>
      </View>

      {/* Urgency Indicator */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Urgency Level</Text>
        <View style={styles.urgencyContainer}>
          <View style={styles.urgencyScale}>
            {[...Array(10)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.urgencyDot,
                  {
                    backgroundColor: index < result.urgency ? getSeverityColor(result.severity) : "#E0E0E0",
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.urgencyText}>
            {result.urgency}/10 - {result.urgency <= 3 ? "Low" : result.urgency <= 6 ? "Medium" : "High"} Priority
          </Text>
        </View>
      </View>

      {/* Possible Causes */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Possible Causes</Text>
        {result.causes.map((cause, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="ellipse" size={8} color={Colors.light.primary} />
            <Text style={styles.listText}>{cause}</Text>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Immediate Actions</Text>
        {result.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="checkmark" size={16} color="#4CAF50" />
            <Text style={styles.listText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* Repair Steps */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Repair Steps</Text>
        {result.repair_steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Video Tutorials */}
      {result.video_links && result.video_links.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Video Tutorials</Text>
          {result.video_links.map((video, index) => (
            <TouchableOpacity key={index} style={styles.videoCard} onPress={() => openVideo(video.url)}>
              <Image
                source={{ uri: video.thumbnail || "/placeholder.svg?height=90&width=160" }}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                {video.channel && <Text style={styles.videoChannel}>{video.channel}</Text>}
                {video.description && (
                  <Text style={styles.videoDescription} numberOfLines={2}>
                    {video.description}
                  </Text>
                )}
              </View>
              <Ionicons name="play-circle" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/mechanics")}>
          <Ionicons name="people" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Find Mechanic</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/diagnose")}>
          <Ionicons name="refresh" size={20} color={Colors.light.primary} />
          <Text style={styles.secondaryButtonText}>New Diagnosis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  issueInfo: {
    flex: 1,
    marginLeft: 15,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 5,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confidenceText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 15,
  },
  urgencyContainer: {
    alignItems: "center",
  },
  urgencyScale: {
    flexDirection: "row",
    marginBottom: 10,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  urgencyText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  listText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 10,
    flex: 1,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
  videoCard: {
    flexDirection: "row",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 6,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  videoChannel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: "center",
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
})

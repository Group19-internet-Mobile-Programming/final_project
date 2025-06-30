"use client"
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ImageBackground } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { Camera, Mic, MessageSquare, AlertTriangle } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import React from "react"

export default function HomeScreen() {
  const { colors } = useTheme()
  const { user } = useAuth()
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    greeting: {
      fontSize: 16,
      color: colors.text,
      fontFamily: "Poppins-Regular",
      marginBottom: 4,
    },
    userName: {
      fontSize: 24,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 8,
    },
    banner: {
      marginTop: 20,
      marginHorizontal: 24,
      borderRadius: 16,
      overflow: "hidden",
      height: 180,
    },
    bannerImage: {
      width: "100%",
      height: "100%",
    },
    bannerContent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 20,
      justifyContent: "center",
    },
    bannerTitle: {
      fontSize: 24,
      fontFamily: "Poppins-Bold",
      color: "#fff",
      marginBottom: 8,
    },
    bannerText: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: "#fff",
      marginBottom: 16,
      maxWidth: "80%",
    },
    bannerButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    bannerButtonText: {
      color: colors.secondary,
      fontFamily: "Poppins-Medium",
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginBottom: 16,
      marginTop: 24,
      paddingHorizontal: 24,
    },
    diagnosisOptions: {
      paddingHorizontal: 16,
    },
    optionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    optionCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      margin: 8,
      alignItems: "center",
      justifyContent: "center",
      height: 200,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    optionIcon: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 50,
      backgroundColor: "rgba(255, 215, 0, 0.1)",
    },
    optionTitle: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      textAlign: "center",
    },
    optionDescription: {
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 4,
    },
    mechanicSection: {
      paddingHorizontal: 24,
      marginTop: 24,
      marginBottom: 40,
    },
    mechanicCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    mechanicImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
    },
    mechanicInfo: {
      flex: 1,
    },
    mechanicName: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginBottom: 4,
    },
    mechanicSpecialty: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      marginBottom: 8,
    },
    mechanicStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    rating: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingText: {
      fontSize: 12,
      fontFamily: "Poppins-Regular",
      color: colors.primary,
      marginLeft: 2,
    },
    mechanicContact: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginTop: 8,
    },
    mechanicContactText: {
      color: colors.secondary,
      fontFamily: "Poppins-Medium",
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
        </View>

        <View style={styles.banner}>
          <ImageBackground
            source={{ uri: "https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg" }}
            style={styles.bannerImage}
          >
            <LinearGradient colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.4)"]} style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Car Issues?</Text>
              <Text style={styles.bannerText}>Get instant AI-powered diagnosis for your vehicle problems</Text>
              <TouchableOpacity style={styles.bannerButton} onPress={() => router.push("/(tabs)/diagnose")}>
                <Text style={styles.bannerButtonText}>Diagnose Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </View>

        <Text style={styles.sectionTitle}>How would you like to diagnose?</Text>

        <View style={styles.diagnosisOptions}>
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionCard} onPress={() => router.push("/(tabs)/diagnose")}>
              <View style={styles.optionIcon}>
                <Camera size={32} color={colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Dashboard Light</Text>
              <Text style={styles.optionDescription}>Snap a photo of your dashboard warning</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => router.push("/(tabs)/diagnose/sound")}>
              <View style={styles.optionIcon}>
                <Mic size={32} color={colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Engine Sound</Text>
              <Text style={styles.optionDescription}>Record unusual engine sounds</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionCard} onPress={() => router.push("/(tabs)/mechanics")}>
              <View style={styles.optionIcon}>
                <MessageSquare size={32} color={colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Contact a Mechanic</Text>
              <Text style={styles.optionDescription}>Connect with certified mechanics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => router.push("./(tabs)/diagnose/manual")}>
              <View style={styles.optionIcon}>
                <AlertTriangle size={32} color={colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Manual Input</Text>
              <Text style={styles.optionDescription}>Describe your car problems</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top Rated Mechanics</Text>

        <View style={styles.mechanicSection}>
          <TouchableOpacity style={styles.mechanicCard}>
            <Image
              source={{ uri: "https://images.pexels.com/photos/8993561/pexels-photo-8993561.jpeg" }}
              style={styles.mechanicImage}
            />
            <View style={styles.mechanicInfo}>
              <Text style={styles.mechanicName}>John Smith</Text>
              <Text style={styles.mechanicSpecialty}>Engine Specialist • 10 yrs exp</Text>
              <View style={styles.mechanicStats}>
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>★★★★★ 4.8</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.mechanicContact}>
                <Text style={styles.mechanicContactText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

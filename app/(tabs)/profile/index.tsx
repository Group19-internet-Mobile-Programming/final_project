"use client"

import React from "react"
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert, TextInput } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"

type MechanicInfo = {
  address?: string
  phone?: string
  specialization?: string
  experience?: string
}

type User = {
  name?: string
  email?: string
  role?: string
  mechanicInfo?: MechanicInfo
}

// Ensure the AuthContext user type matches this User type

import { useRouter } from "expo-router"
import {
  LogOut,
  Moon,
  Sun,
  Settings,
  User as UserIcon,
  Shield,
  Star,
  Bell,
  HelpCircle,
  MapPin,
  Phone,
} from "lucide-react-native"

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth() as { user: User; signOut: () => Promise<void> }
  const { colors, theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [editMode, setEditMode] = React.useState(false)
  const [mechanicInfo, setMechanicInfo] = React.useState({
    address: user?.mechanicInfo?.address || "",
    phone: user?.mechanicInfo?.phone || "",
    specialization: user?.mechanicInfo?.specialization || "",
    experience: user?.mechanicInfo?.experience || "",
  })

  const handleSaveInfo = async () => {
    // TODO: Implement updateMechanicInfo in AuthContext if needed
    Alert.alert("Error", "Update mechanic info is not implemented.")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace("/Login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const confirmSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: handleSignOut, style: "destructive" },
    ])
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "light" ? "#f0f8ff" : colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 24,
      alignItems: "center",
      backgroundColor: theme === "light" ? "#e3f2fd" : colors.card,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    name: {
      fontSize: 24,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      textAlign: "center",
    },
    email: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      marginTop: 4,
      textAlign: "center",
    },
    role: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
      marginTop: 8,
      textAlign: "center",
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginBottom: 16,
    },
    optionCard: {
      backgroundColor: theme === "light" ? "#ffffff" : colors.card,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme === "light" ? "#e3f2fd" : colors.border,
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme === "light" ? "#e3f2fd" : "rgba(255, 215, 0, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.text,
    },
    input: {
      backgroundColor: theme === "light" ? "#f5f5f5" : colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      color: colors.text,
      fontFamily: "Poppins-Regular",
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 16,
    },
    saveButtonText: {
      color: theme === "light" ? "#000" : colors.secondary,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
    },
    editButton: {
      position: "absolute",
      right: 24,
      top: 24,
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
    },
    editButtonText: {
      color: theme === "light" ? "#000" : colors.secondary,
      fontFamily: "Poppins-Medium",
    },
    signOutButton: {
      backgroundColor: "rgba(255, 59, 48, 0.1)",
      padding: 16,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      marginBottom: 40,
    },
    signOutText: {
      color: colors.error,
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      marginLeft: 8,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{ uri: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{user?.name || "Guest User"}</Text>
          <Text style={styles.email}>{user?.email || "guest@example.com"}</Text>
          <Text style={styles.role}>{user?.role === "mechanic" ? "Mechanic" : "Car Owner"}</Text>

          {user?.role === "mechanic" && (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
              <Text style={styles.editButtonText}>{editMode ? "Cancel" : "Edit Info"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {user?.role === "mechanic" && editMode ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mechanic Information</Text>
            <View style={styles.optionCard}>
              <TextInput
                style={styles.input}
                placeholder="Business Address"
                value={mechanicInfo.address}
                onChangeText={(text) => setMechanicInfo((prev) => ({ ...prev, address: text }))}
                placeholderTextColor={colors.tabIconDefault}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={mechanicInfo.phone}
                onChangeText={(text) => setMechanicInfo((prev) => ({ ...prev, phone: text }))}
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Specialization"
                value={mechanicInfo.specialization}
                onChangeText={(text) => setMechanicInfo((prev) => ({ ...prev, specialization: text }))}
                placeholderTextColor={colors.tabIconDefault}
              />
              <TextInput
                style={styles.input}
                placeholder="Years of Experience"
                value={mechanicInfo.experience}
                onChangeText={(text) => setMechanicInfo((prev) => ({ ...prev, experience: text }))}
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveInfo}>
                <Text style={styles.saveButtonText}>Save Information</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {user?.role === "mechanic" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Information</Text>
                <View style={styles.optionCard}>
                  <View style={styles.option}>
                    <View style={styles.optionIcon}>
                      <MapPin size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>{mechanicInfo.address || "Add business address"}</Text>
                  </View>
                  <View style={styles.option}>
                    <View style={styles.optionIcon}>
                      <Phone size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>{mechanicInfo.phone || "Add phone number"}</Text>
                  </View>
                  <View style={[styles.option, styles.lastOption]}>
                    <View style={styles.optionIcon}>
                      <Star size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>
                      {mechanicInfo.specialization
                        ? `${mechanicInfo.specialization} • ${mechanicInfo.experience} years exp.`
                        : "Add specialization and experience"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.optionCard}>
                <TouchableOpacity style={styles.option}>
                  <View style={styles.optionIcon}>
                    <UserIcon size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.optionText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                  <View style={styles.optionIcon}>
                    <Bell size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.optionText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.option, styles.lastOption]}>
                  <View style={styles.optionIcon}>
                    <Shield size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.optionText}>Privacy & Security</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.optionCard}>
                <TouchableOpacity style={styles.option} onPress={toggleTheme}>
                  <View style={styles.optionIcon}>
                    {theme === "dark" ? (
                      <Moon size={20} color={colors.primary} />
                    ) : (
                      <Sun size={20} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.optionText}>Dark Mode</Text>
                  <Text style={[styles.optionText, { textAlign: "right" }]}>{theme === "dark" ? "On" : "Off"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                  <View style={styles.optionIcon}>
                    <Settings size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.optionText}>App Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.option, styles.lastOption]}>
                  <View style={styles.optionIcon}>
                    <HelpCircle size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.optionText}>Help & Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={confirmSignOut}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfileScreen

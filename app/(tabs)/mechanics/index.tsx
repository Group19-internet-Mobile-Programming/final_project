"use client"

import { useState } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { Search, Star, MapPin, MessageSquare, CheckCircle } from "lucide-react-native"
import { useRouter } from "expo-router"
import React from "react"

type Mechanic = {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  location: string
  avatar: string
  verified: boolean
}

const mockMechanics: Mechanic[] = [
  {
    id: "1",
    name: "John Smith",
    specialty: "Engine Specialist",
    experience: "10 yrs exp",
    rating: 4.8,
    location: "Downtown Auto Shop",
    avatar: "https://images.pexels.com/photos/8993561/pexels-photo-8993561.jpeg",
    verified: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    specialty: "Electrical Systems",
    experience: "8 yrs exp",
    rating: 4.6,
    location: "Westside Garage",
    avatar: "https://images.pexels.com/photos/8993296/pexels-photo-8993296.jpeg",
    verified: true,
  },
  {
    id: "3",
    name: "Mike Robinson",
    specialty: "Transmission Expert",
    experience: "12 yrs exp",
    rating: 4.9,
    location: "Premium Auto Repairs",
    avatar: "https://images.pexels.com/photos/6692038/pexels-photo-6692038.jpeg",
    verified: true,
  },
  {
    id: "4",
    name: "Emily Chen",
    specialty: "Diagnostic Technician",
    experience: "6 yrs exp",
    rating: 4.5,
    location: "Tech Auto Solutions",
    avatar: "https://images.pexels.com/photos/8993541/pexels-photo-8993541.jpeg",
    verified: true,
  },
  {
    id: "5",
    name: "David Wilson",
    specialty: "Brake Systems",
    experience: "9 yrs exp",
    rating: 4.7,
    location: "Eastside Auto Care",
    avatar: "https://images.pexels.com/photos/8945288/pexels-photo-8945288.jpeg",
    verified: true,
  },
]

export default function MechanicsScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [mechanics, setMechanics] = useState(mockMechanics)

  const filteredMechanics = searchQuery
    ? mechanics.filter(
        (mechanic) =>
          mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mechanic.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mechanic.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mechanics

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
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 12,
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: "Poppins-Regular",
      height: 48,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    mechanicCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    mechanicHeader: {
      flexDirection: "row",
      padding: 16,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginRight: 16,
    },
    mechanicInfo: {
      flex: 1,
      justifyContent: "center",
    },
    mechanicName: {
      fontSize: 18,
      fontFamily: "Poppins-Bold",
      color: colors.text,
      marginBottom: 2,
    },
    mechanicSpecialty: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
    },
    mechanicExperience: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.primary,
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    rating: {
      fontSize: 14,
      fontFamily: "Poppins-Medium",
      color: colors.text,
      marginLeft: 4,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    location: {
      fontSize: 14,
      fontFamily: "Poppins-Regular",
      color: colors.tabIconDefault,
      marginLeft: 8,
      flex: 1,
    },
    buttonsContainer: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cardButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    buttonText: {
      marginLeft: 8,
      fontFamily: "Poppins-Medium",
      fontSize: 14,
      color: colors.text,
    },
    verifiedBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: colors.success,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    verifiedText: {
      color: "#fff",
      fontSize: 10,
      fontFamily: "Poppins-Medium",
      marginLeft: 4,
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Poppins-Medium",
      color: colors.tabIconDefault,
      textAlign: "center",
      marginTop: 16,
    },
  })

  const renderMechanicItem = ({ item }: { item: Mechanic }) => (
    <View style={styles.mechanicCard}>
      {item.verified && (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={12} color="#fff" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      <View style={styles.mechanicHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.mechanicInfo}>
          <Text style={styles.mechanicName}>{item.name}</Text>
          <Text style={styles.mechanicSpecialty}>{item.specialty}</Text>
          <Text style={styles.mechanicExperience}>{item.experience}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.primary} fill={colors.primary} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <MapPin size={16} color={colors.tabIconDefault} />
        <Text style={styles.location}>{item.location}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push({ pathname: "/(tabs)/mechanics", params: { id: item.id } })}
        >
          <Search size={18} color={colors.text} />
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push({ pathname: "/(tabs)/mechanics", params: { id: item.id } })}
        >
          <MessageSquare size={18} color={colors.primary} />
          <Text style={[styles.buttonText, { color: colors.primary }]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Mechanic</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, specialty or location"
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {filteredMechanics.length > 0 ? (
        <FlatList
          data={filteredMechanics}
          keyExtractor={(item) => item.id}
          renderItem={renderMechanicItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Search size={48} color={colors.tabIconDefault} />
          <Text style={styles.emptyText}>No mechanics found matching "{searchQuery}"</Text>
        </View>
      )}
    </View>
  )
}

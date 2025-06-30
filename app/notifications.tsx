"use client"
import { View, Text, FlatList, StyleSheet, Pressable, useColorScheme } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Bell, ChevronRight, AlertCircle, CheckCircle, Info, MessageCircle } from "lucide-react-native"
import { useNotificationsContext } from "@/context/NotificationsContext"
import type { Notification } from "@/context/NotificationsContext"
import type Colors from "@/constants/Colors"
import { useTheme } from "@/context/ThemeContext"
import React from "react"

export default function NotificationsScreen() {
  const router = useRouter()
  const { notifications, markAsRead, clearAll } = useNotificationsContext()
  const { colors } = useTheme()
  const colorScheme = useColorScheme()

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "engine_result":
      case "dashboard_result":
        return <CheckCircle size={24} color={colors.primary} />
      case "mechanic_message":
        return <MessageCircle size={24} color={colors.primary} />
      case "error":
        return <AlertCircle size={24} color="#ef4444" />
      case "warning":
        return <AlertCircle size={24} color="#f59e0b" />
      case "success":
        return <CheckCircle size={24} color="#10b981" />
      case "info":
      default:
        return <Info size={24} color={colors.primary} />
    }
  }

  const getNotificationBorderColor = (type: Notification["type"], isRead: boolean) => {
    if (isRead) return colors.border

    switch (type) {
      case "error":
        return "#ef4444"
      case "warning":
        return "#f59e0b"
      case "success":
        return "#10b981"
      case "engine_result":
      case "dashboard_result":
      case "mechanic_message":
      case "info":
      default:
        return colors.primary
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleNotificationPress = (item: Notification) => {
    markAsRead(item.id)

    // Navigate based on notification type
    if (item.type === "engine_result" && item.linkId) {
      router.push({ pathname: "/(tabs)/diagnose/engine_result", params: { id: item.linkId } })
    } else if (item.type === "dashboard_result" && item.linkId) {
      router.push({ pathname: "/(tabs)/diagnose/dashboard_result", params: { id: item.linkId } })
    } else if (item.type === "mechanic_message" && item.linkId) {
      router.push({ pathname: "/mechanics", params: { id: item.linkId } })
    }
    // For other notification types (error, warning, success, info), just mark as read
  }

  const renderItem = ({ item }: { item: Notification }) => (
    <Pressable
      style={[
        styles(colors).notificationItem,
        !item.read && styles(colors).notificationItemUnread,
        {
          borderColor: getNotificationBorderColor(item.type, item.read),
          borderWidth: item.read ? 1 : 2,
        },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles(colors).notificationItemIcon}>{getNotificationIcon(item.type)}</View>
      <View style={styles(colors).notificationItemContent}>
        <View style={styles(colors).notificationHeader}>
          <Text style={styles(colors).notificationItemTitle}>{item.title}</Text>
          {item.priority === "high" && (
            <View style={styles(colors).priorityBadge}>
              <Text style={styles(colors).priorityBadgeText}>!</Text>
            </View>
          )}
        </View>
        <Text style={styles(colors).notificationItemMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles(colors).notificationFooter}>
          <Text style={styles(colors).notificationItemDate}>{formatDate(item.date)}</Text>
          {item.category && (
            <Text style={styles(colors).categoryText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          )}
        </View>
      </View>
      {!item.read && <View style={styles(colors).unreadDot} />}
      <ChevronRight size={20} color={colors.tabIconDefault} />
    </Pressable>
  )

  const renderHeader = () => (
    <View style={styles(colors).headerActions}>
      {notifications.length > 0 && (
        <Pressable style={styles(colors).clearButton} onPress={clearAll}>
          <Text style={styles(colors).clearButtonText}>Clear All</Text>
        </Pressable>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles(colors).container}>
      <LinearGradient
        colors={colorScheme === "dark" ? [colors.primary, colors.secondary] : [colors.primary, "#0f1a6b"]}
        style={styles(colors).header}
      >
        <View style={styles(colors).headerContent}>
          <Text style={styles(colors).headerTitle}>Notifications</Text>
          <View style={styles(colors).headerBadge}>
            <Text style={styles(colors).headerBadgeText}>{notifications.filter((n) => !n.read).length}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles(colors).content}>
        {notifications.length > 0 ? (
          <>
            {renderHeader()}
            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles(colors).list}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={styles(colors).emptyState}>
            <Bell size={48} color={colors.tabIconDefault} />
            <Text style={styles(colors).emptyStateTitle}>No notifications</Text>
            <Text style={styles(colors).emptyStateText}>
              You'll receive notifications here when your diagnostics are complete or when mechanics respond
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      height: 100,
      paddingHorizontal: 16,
      paddingBottom: 16,
      justifyContent: "flex-end",
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "white",
    },
    headerBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: "center",
    },
    headerBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      padding: 16,
    },
    headerActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 16,
    },
    clearButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    clearButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
    list: {
      paddingBottom: 24,
    },
    notificationItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    notificationItemUnread: {
      backgroundColor: colors.background,
    },
    notificationItemIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    notificationItemContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    notificationItemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    priorityBadge: {
      backgroundColor: "#ef4444",
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    priorityBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
    notificationItemMessage: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.8,
      marginBottom: 8,
      lineHeight: 20,
    },
    notificationFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    notificationItemDate: {
      fontSize: 12,
      color: colors.tabIconDefault,
    },
    categoryText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "500",
    },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginRight: 10,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.tabIconDefault,
      textAlign: "center",
      lineHeight: 22,
    },
  })

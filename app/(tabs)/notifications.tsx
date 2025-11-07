import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState, useMemo } from 'react'
import { apiGet, apiPut, handleApiError } from '../../lib/utils/api'
import { formatTimeAgo } from '../../lib/utils/date'
import { Notification } from '../../types'
import Toast from 'react-native-toast-message'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  Search, 
  CheckCheck,
  Clock
} from 'lucide-react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { useColorScheme } from 'react-native'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { ErrorState } from '../../components/ui/ErrorState'

type NotificationFilter = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'

export default function NotificationsScreen() {
  const { user } = useAuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const iconColor = isDark ? '#9CA3AF' : '#374151'
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      const data = await apiGet<{ notifications: Notification[] }>('/api/notifications')
      // Sort by createdAt descending (newest first)
      const sortedNotifications = (data.notifications || []).sort((a: Notification, b: Notification) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setNotifications(sortedNotifications)
      setError(null)
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Failed to load notifications')
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      setUpdating(notificationId)
      await apiPut(`/api/notifications/${notificationId}/read`, {})

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error: any) {
      handleApiError(error, 'Failed to mark notification as read')
    } finally {
      setUpdating(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true)
      await apiPut('/api/notifications/read-all', {})

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'All notifications marked as read',
      })
    } catch (error: any) {
      handleApiError(error, 'Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setLoading(false)
    }
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    fetchNotifications()
  }

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'unread' && !notification.read) ||
        (filter !== 'unread' && notification.type === filter)
      
      return matchesSearch && matchesFilter
    })
  }, [notifications, searchQuery, filter])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      info: notifications.filter((n) => n.type === 'info').length,
      success: notifications.filter((n) => n.type === 'success').length,
      warning: notifications.filter((n) => n.type === 'warning').length,
      error: notifications.filter((n) => n.type === 'error').length,
    }
  }, [notifications])


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={iconColor} />
      case 'warning':
        return <AlertCircle size={20} color={iconColor} />
      case 'error':
        return <XCircle size={20} color={iconColor} />
      case 'info':
      default:
        return <Info size={20} color={iconColor} />
    }
  }

  const getNotificationColors = (type: string) => {
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-200 dark:bg-gray-700',
    }
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <ScrollView className="flex-1">
          <View className="p-6">
            <SkeletonLoader height={40} borderRadius={8} className="mb-6" />
            <SkeletonLoader height={50} borderRadius={8} className="mb-4" />
            <SkeletonLoader height={50} borderRadius={8} className="mb-6" />
            <SkeletonLoader height={150} borderRadius={12} className="mb-4" />
            <SkeletonLoader height={150} borderRadius={12} className="mb-4" />
            <SkeletonLoader height={150} borderRadius={12} />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View className="flex-1">
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null)
              fetchNotifications()
            }}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-6">
          {/* Mark All Read Button */}
          {stats.unread > 0 && (
            <View className="mb-4 flex-row justify-end">
              <TouchableOpacity
                onPress={markAllAsRead}
                disabled={markingAll}
                className="px-3 py-1.5 bg-gray-700 dark:bg-gray-600 rounded-lg flex-row items-center gap-2 border border-gray-600 dark:border-gray-500"
              >
                {markingAll ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CheckCheck size={16} color="#fff" />
                    <Text className="text-white text-sm font-semibold">Mark all read</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Search Bar */}
          <View className="mb-4">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <Search size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="Search notifications..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {(['all', 'unread', 'info', 'success', 'warning', 'error'] as NotificationFilter[]).map((filterType) => (
              <TouchableOpacity
                key={filterType}
                onPress={() => setFilter(filterType)}
                className={`
                  px-4 py-2 rounded-lg border
                  ${filter === filterType
                    ? 'bg-gray-700 dark:bg-gray-600 border-gray-700 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <Text
                  className={`
                    text-sm font-semibold capitalize
                    ${filter === filterType
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {filterType === 'all' ? 'All' : filterType}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="items-center justify-center py-16"
            >
              <View className="items-center mb-4">
                <Bell size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || filter !== 'all'
                  ? 'No notifications found'
                  : 'No notifications yet'}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'You\'ll see notifications here when you receive updates'}
              </Text>
            </Animated.View>
          ) : (
            <View className="gap-3">
              {filteredNotifications.map((notification, index) => {
                const colors = getNotificationColors(notification.type)
                return (
                  <Animated.View
                    key={notification.id}
                    entering={FadeInRight.delay(index * 50).duration(400)}
                  >
                    <View
                      className={`
                        bg-white dark:bg-gray-800 p-4 rounded-xl border
                        ${notification.read 
                          ? 'border-gray-200 dark:border-gray-700' 
                          : `${colors.border} border-l-4`
                        }
                        shadow-sm
                      `}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          if (!notification.read) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        <View className="flex-row items-start gap-3">
                          <View className={`p-2 rounded-lg ${colors.iconBg}`}>
                            {getNotificationIcon(notification.type)}
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-start justify-between mb-1">
                              <Text className={`
                                text-base font-semibold flex-1
                                ${notification.read
                                  ? 'text-gray-700 dark:text-gray-300'
                                  : 'text-gray-900 dark:text-white'
                                }
                              `}>
                                {notification.title}
                              </Text>
                              {!notification.read && (
                                <View className="bg-gray-600 dark:bg-gray-400 rounded-full w-2 h-2 ml-2 mt-1" />
                              )}
                            </View>
                            <Text className={`
                              text-sm mb-2
                              ${notification.read
                                ? 'text-gray-600 dark:text-gray-400'
                                : 'text-gray-700 dark:text-gray-300'
                              }
                            `}>
                              {notification.message}
                            </Text>
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center gap-1">
                                <Clock size={12} color={iconColor} />
                                <Text className="text-xs text-gray-500 dark:text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      {!notification.read && (
                        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <TouchableOpacity
                            onPress={() => markAsRead(notification.id)}
                            disabled={updating === notification.id}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg items-center"
                          >
                            {updating === notification.id ? (
                              <ActivityIndicator size="small" color={iconColor} />
                            ) : (
                              <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Mark as read
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

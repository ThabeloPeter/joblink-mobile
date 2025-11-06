import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-6">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </Text>

          {/* Stats Cards */}
          <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</Text>
            </View>
            <View className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Pending</Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</Text>
            </View>
            <View className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400">In Progress</Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</Text>
            </View>
            <View className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Completed</Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</Text>
            </View>
          </View>

          <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quick Actions
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Your mobile app is ready for development. Start building features!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


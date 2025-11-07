import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../lib/utils/auth'

export default function ProfileScreen() {
  const { user } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    useAuthStore.getState().setUser(null)
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <View className="flex-1 p-6" style={{ paddingTop: 20, paddingBottom: 100 }}>

        <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.email || 'N/A'}
          </Text>
        </View>

        <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {user?.role || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-red-500 py-3 rounded-lg items-center"
          onPress={handleSignOut}
        >
          <Text className="text-white font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}


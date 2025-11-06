import { View, Text, TouchableOpacity } from 'react-native'
import { Link, Stack } from 'expo-router'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          This screen doesn't exist.
        </Text>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity className="bg-gray-900 dark:bg-gray-100 px-6 py-3 rounded-lg">
            <Text className="text-white dark:text-gray-900 font-semibold">
              Go to home screen
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  )
}


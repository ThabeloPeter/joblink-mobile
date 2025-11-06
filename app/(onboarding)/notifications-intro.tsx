import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, { FadeInRight, FadeInLeft } from 'react-native-reanimated'
import { Bell, ArrowRight, ArrowLeft } from 'lucide-react-native'

export default function NotificationsIntroScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="flex-1 px-6 py-8">
        <Animated.View
          entering={FadeInRight.duration(600)}
          className="items-center mb-8"
        >
          <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-6">
            <Bell size={48} color="#374151" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Stay Notified
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6">
            Receive real-time push notifications for new job assignments, status updates, and important messages. Never miss an important update.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInLeft.delay(300).duration(600)}
          className="flex-1 justify-end pb-8"
        >
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-lg items-center flex-row justify-center"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="#374151" />
              <Text className="text-gray-900 dark:text-white font-semibold ml-2">
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gray-900 dark:bg-gray-100 py-4 rounded-lg items-center flex-row justify-center"
              onPress={() => router.push('/(onboarding)/complete-jobs-intro')}
            >
              <Text className="text-white dark:text-gray-900 font-semibold mr-2">
                Next
              </Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}


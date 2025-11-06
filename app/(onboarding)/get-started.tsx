import { View, Text, TouchableOpacity, ScrollView, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated'
import { CheckCircle, ArrowRight } from 'lucide-react-native'
import { setOnboardingComplete } from '../../lib/utils/onboarding'
import { useAuthStore } from '../../store/authStore'
import { getCurrentUser } from '../../lib/utils/auth'

export default function GetStartedScreen() {
  const { setUser } = useAuthStore()
  const colorScheme = useColorScheme()
  const arrowColor = colorScheme === 'dark' ? '#111827' : '#ffffff'

  const handleGetStarted = async () => {
    await setOnboardingComplete()
    
    // Check if user is already logged in
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      router.replace('/(tabs)')
    } else {
      router.replace('/(auth)/login')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="flex-1 px-6 py-8">
        <Animated.View
          entering={FadeIn.duration(600)}
          className="items-center mb-8"
        >
          <View className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full items-center justify-center mb-6">
            <CheckCircle size={48} color="#10b981" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            You're All Set!
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6 mb-8">
            You're ready to start managing your job cards. Sign in to get started with JobLink.
          </Text>

          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="w-full gap-3"
          >
            <View className="flex-row items-center mb-2">
              <CheckCircle size={20} color="#10b981" />
              <Text className="text-gray-700 dark:text-gray-300 ml-3">
                Manage job cards on-the-go
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <CheckCircle size={20} color="#10b981" />
              <Text className="text-gray-700 dark:text-gray-300 ml-3">
                Receive real-time notifications
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <CheckCircle size={20} color="#10b981" />
              <Text className="text-gray-700 dark:text-gray-300 ml-3">
                Complete jobs with photos
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="flex-1 justify-end pb-8"
        >
          <TouchableOpacity
            className="bg-gray-900 dark:bg-gray-100 py-4 rounded-lg items-center flex-row justify-center"
            onPress={handleGetStarted}
          >
            <Text className="text-white dark:text-gray-900 font-semibold text-lg mr-2">
              Start Using JobLink
            </Text>
            <ArrowRight size={20} color={arrowColor} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}


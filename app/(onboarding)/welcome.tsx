import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeIn.duration(600)}
          className="items-center mb-12"
        >
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          className="items-center mb-8"
        >
          <Text className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Welcome to JobLink
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
            Manage your job cards on-the-go and stay connected with your work
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          className="w-full"
        >
          <TouchableOpacity
            className="bg-gray-900 dark:bg-gray-100 py-4 rounded-lg items-center"
            onPress={() => router.push('/(onboarding)/job-cards-intro')}
          >
            <Text className="text-white dark:text-gray-900 font-semibold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}


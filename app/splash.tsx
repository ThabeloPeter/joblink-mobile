import { View, Image, StyleSheet } from 'react-native'
import { useEffect } from 'react'
import { router } from 'expo-router'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { hasSeenOnboarding } from '../lib/utils/onboarding'
import { useAuthStore } from '../store/authStore'
import { getCurrentUser } from '../lib/utils/auth'

export default function SplashScreen() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    async function initialize() {
      // Show splash for at least 2 seconds
      const minSplashTime = new Promise((resolve) => setTimeout(resolve, 2000))

      // Check onboarding and auth in parallel
      const [hasSeenOnboardingScreen, currentUser] = await Promise.all([
        hasSeenOnboarding(),
        getCurrentUser(),
      ])

      // Wait for minimum splash time
      await minSplashTime

      setUser(currentUser)
      setLoading(false)

      // Navigate based on onboarding and auth status
      if (!hasSeenOnboardingScreen) {
        router.replace('/(onboarding)/welcome')
      } else if (currentUser) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }

    initialize()
  }, [])

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
      <Animated.View
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
        className="items-center justify-center"
      >
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
  },
})


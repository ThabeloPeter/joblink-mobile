import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_KEY = '@joblink:has_seen_onboarding'

/**
 * Check if the user has completed onboarding
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY)
    return value === 'true'
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * Mark onboarding as complete
 */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
  } catch (error) {
    console.error('Error setting onboarding status:', error)
  }
}

/**
 * Reset onboarding (useful for testing)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY)
  } catch (error) {
    console.error('Error resetting onboarding status:', error)
  }
}


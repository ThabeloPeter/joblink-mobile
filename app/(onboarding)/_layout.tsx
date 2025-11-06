import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="job-cards-intro" />
      <Stack.Screen name="notifications-intro" />
      <Stack.Screen name="complete-jobs-intro" />
      <Stack.Screen name="get-started" />
    </Stack>
  )
}


import { Redirect } from 'expo-router'

export default function Index() {
  // Redirect to splash screen which handles onboarding and auth flow
  return <Redirect href="/splash" />
}


import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase/client'
import { useAuthStore } from '../../store/authStore'
import { getCurrentUser } from '../../lib/utils/auth'
import Toast from 'react-native-toast-message'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const user = await getCurrentUser()
      if (user) {
        setUser(user)
        router.replace('/(tabs)')
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-8">
          Sign in to continue to JobLink
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="w-full bg-gray-900 dark:bg-gray-100 py-3 rounded-lg items-center justify-center mb-4"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white dark:text-gray-900 font-semibold">
              Sign In
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}


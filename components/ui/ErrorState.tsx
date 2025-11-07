import { View, Text, TouchableOpacity } from 'react-native'
import { AlertCircle, RotateCw } from 'lucide-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useColorScheme } from 'react-native'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const iconColor = isDark ? '#EF4444' : '#DC2626'

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="items-center justify-center py-12 px-6"
    >
      <View className="items-center mb-4">
        <AlertCircle size={48} color={iconColor} />
      </View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-indigo-600 dark:bg-indigo-700 px-6 py-3 rounded-lg flex-row items-center gap-2"
        >
          <RotateCw size={18} color="#fff" />
          <Text className="text-white font-semibold">{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}


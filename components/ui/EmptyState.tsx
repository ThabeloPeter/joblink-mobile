import { View, Text } from 'react-native'
import { LucideIcon } from 'lucide-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useColorScheme } from 'react-native'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const iconColor = isDark ? '#4B5563' : '#9CA3AF'

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="items-center justify-center py-16 px-6"
    >
      <View className="items-center mb-4">
        <Icon size={64} color={iconColor} />
      </View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
        {message}
      </Text>
      {action && <View className="mt-2">{action}</View>}
    </Animated.View>
  )
}



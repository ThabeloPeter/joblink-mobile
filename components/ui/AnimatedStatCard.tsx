import { View, Text, TouchableOpacity } from 'react-native'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { useEffect, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react-native'

interface AnimatedStatCardProps {
  title: string
  value: number | string | ReactNode
  icon?: LucideIcon
  iconColor?: string
  backgroundColor?: string
  textColor?: string
  delay?: number
  onPress?: () => void
  gradient?: boolean
  pulse?: boolean
  className?: string
  valueClassName?: string
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  backgroundColor = 'bg-gray-100 dark:bg-gray-800',
  textColor = 'text-gray-900 dark:text-white',
  delay = 0,
  onPress,
  gradient = false,
  pulse = false,
  className = '',
  valueClassName = '',
}: AnimatedStatCardProps) {
  // Default to grey icon if not provided
  const defaultIconColor = iconColor || '#6B7280'
  const scale = useSharedValue(1)

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 10 }),
          withSpring(1, { damping: 10 })
        ),
        -1,
        true
      )
    }
  }, [pulse])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  const CardContent = (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={animatedStyle}
      className={`
        ${backgroundColor}
        p-4 rounded-xl border border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      <View className="flex-row items-start justify-between mb-2">
        {Icon && (
          <View className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
            <Icon size={20} color={defaultIconColor} />
          </View>
        )}
      </View>
      <Text className={`text-sm font-medium ${textColor} opacity-80 mb-1`}>
        {title}
      </Text>
      {typeof value === 'number' || typeof value === 'string' ? (
        <Text className={`text-2xl font-bold ${textColor} ${valueClassName}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      ) : (
        <View className={valueClassName}>
          {value}
        </View>
      )}
    </Animated.View>
  )

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {CardContent}
      </TouchableOpacity>
    )
  }

  return CardContent
}


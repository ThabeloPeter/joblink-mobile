import { View, Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useEffect } from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  height?: number
  color?: string
  backgroundColor?: string
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressBar({
  progress,
  height = 8,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0)

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 50,
    })
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    }
  })

  return (
    <View className={className}>
      {showLabel && label && (
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: color,
              borderRadius: height / 2,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  )
}


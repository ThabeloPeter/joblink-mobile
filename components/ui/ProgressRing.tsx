import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { Text } from 'react-native'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  showLabel = true,
  label,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const animatedProgress = useSharedValue(0)

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 50,
    })
  }, [progress])

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference
    return {
      strokeDashoffset: withTiming(strokeDashoffset, { duration: 1000 }),
    }
  })

  return (
    <View className={`items-center justify-center ${className}`}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
      {showLabel && (
        <View className="absolute items-center justify-center" style={{ width: size, height: size }}>
          {label ? (
            <Text className="text-xs text-gray-600 dark:text-gray-400 text-center px-2">
              {label}
            </Text>
          ) : (
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      )}
    </View>
  )
}


import { useEffect, useState } from 'react'
import { Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
}

export function AnimatedCounter({
  value,
  duration = 1000,
  className = '',
  formatter,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const animatedValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration })
  }, [value, duration])

  useAnimatedReaction(
    () => animatedValue.value,
    (current) => {
      runOnJS(setDisplayValue)(Math.round(current))
    }
  )

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value === 0 ? 0.5 : 1,
    }
  })

  return (
    <Animated.Text
      style={animatedStyle}
      className={className}
    >
      {formatter ? formatter(displayValue) : displayValue.toLocaleString()}
    </Animated.Text>
  )
}


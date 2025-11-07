import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function JobCardsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <View className="flex-1 items-center justify-center p-6" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <Text className="text-gray-600 dark:text-gray-400 text-center">
          Job cards list will be implemented here
        </Text>
      </View>
    </SafeAreaView>
  )
}


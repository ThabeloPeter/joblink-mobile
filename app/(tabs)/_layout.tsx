import { Tabs } from 'expo-router'
import { Home, ClipboardList, Bell, User, Building2 } from 'lucide-react-native'
import { useAuthStore } from '../../store/authStore'
import { View, useColorScheme } from 'react-native'
import { FloatingTabBar } from '../../components/navigation/FloatingTabBar'

export default function TabsLayout() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#FFFFFF' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: () => null, // Hide default tab bar
          tabBarStyle: {
            position: 'absolute',
            height: 0,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            opacity: 0,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      {isAdmin ? (
        <Tabs.Screen
          name="companies"
          options={{
            title: 'Companies',
            tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="job-cards"
          options={{
            title: 'Job Cards',
            tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hide job-cards tab for admin */}
      {isAdmin && (
        <Tabs.Screen
          name="job-cards"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      )}
      </Tabs>
      <FloatingTabBar />
    </View>
  )
}


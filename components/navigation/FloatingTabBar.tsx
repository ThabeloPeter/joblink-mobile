import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { Home, ClipboardList, Bell, User, Building2 } from 'lucide-react-native'
import { useAuthStore } from '../../store/authStore'
import { useColorScheme } from 'react-native'

export function FloatingTabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isAdmin = user?.role === 'admin'

  const tabs = [
    {
      name: 'index',
      path: '/(tabs)/',
      matchPaths: ['/(tabs)/', '/(tabs)', '/'],
      icon: Home,
      label: 'Dashboard',
    },
    ...(isAdmin
      ? [
          {
            name: 'companies',
            path: '/(tabs)/companies',
            matchPaths: ['/companies'],
            icon: Building2,
            label: 'Companies',
          },
        ]
      : [
          {
            name: 'job-cards',
            path: '/(tabs)/job-cards',
            matchPaths: ['/job-cards'],
            icon: ClipboardList,
            label: 'Job Cards',
          },
        ]),
    {
      name: 'notifications',
      path: '/(tabs)/notifications',
      matchPaths: ['/notifications'],
      icon: Bell,
      label: 'Notifications',
    },
    {
      name: 'profile',
      path: '/(tabs)/profile',
      matchPaths: ['/profile'],
      icon: User,
      label: 'Profile',
    },
  ]

  const isActive = (tab: typeof tabs[0]) => {
    if (!pathname) return false
    // Special handling for dashboard/index
    if (tab.name === 'index') {
      return tab.matchPaths.some(match => pathname === match) || 
             (!pathname.includes('/companies') && 
              !pathname.includes('/notifications') && 
              !pathname.includes('/profile') && 
              !pathname.includes('/job-cards'))
    }
    return tab.matchPaths.some(match => pathname.includes(match))
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      ]}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = isActive(tab)
        const iconColor = active
          ? isDark
            ? '#FFFFFF'
            : '#000000'
          : isDark
          ? '#9CA3AF'
          : '#666666'

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.path as any)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                active && {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                },
              ]}
            >
              <Icon size={24} color={iconColor} />
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

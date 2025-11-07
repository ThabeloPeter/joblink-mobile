import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import { apiGet, handleApiError } from '../../lib/utils/api'
import { formatTimeAgo } from '../../lib/utils/date'
import { JobCard, Company, Notification } from '../../types'
import { router } from 'expo-router'
import { ArrowRight, Search, Bell, Clock, AlertCircle, CheckCircle, Users, TrendingUp, Activity, Server, Building2, Briefcase, CheckCircle2, AlertTriangle, FileText } from 'lucide-react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { AnimatedCounter } from '../../components/ui/AnimatedCounter'
import { AnimatedStatCard } from '../../components/ui/AnimatedStatCard'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { StatusBadge } from '../../components/ui/StatusBadge'

interface DashboardStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

interface AdminStats {
  totalCompanies: number
  pendingCompanies: number
  approvedCompanies: number
  rejectedCompanies: number
  totalUsers: number
  totalProviders: number
  activeJobCards: number
  completedThisMonth: number
}

interface PendingCompany {
  id: string
  name: string
  email: string
  status: 'pending'
  createdAt: string
}

interface ActivityItem {
  id: string
  type: 'company_registered' | 'company_approved' | 'job_completed' | 'job_created' | 'user_registered'
  message: string
  timestamp: string
  companyName?: string
  jobCardTitle?: string
}

interface ProviderStats {
  total: number
  active: number
  inactive: number
  newThisMonth: number
}

interface PerformanceMetrics {
  completionRate: number
  averageCompletionTime: number
  topCompanies: { name: string; completed: number }[]
}

interface UserStats {
  total: number
  admins: number
  companies: number
  providers: number
  newThisMonth: number
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  // Icon colors that adapt to dark mode
  const iconColor = isDark ? '#9CA3AF' : '#374151'
  const arrowColor = isDark ? '#9CA3AF' : '#374151'
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalCompanies: 0,
    pendingCompanies: 0,
    approvedCompanies: 0,
    rejectedCompanies: 0,
    totalUsers: 0,
    totalProviders: 0,
    activeJobCards: 0,
    completedThisMonth: 0,
  })
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([])
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [providerStats, setProviderStats] = useState<ProviderStats>({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  })
  const [urgentJobCards, setUrgentJobCards] = useState<JobCard[]>([])
  const [recentJobCards, setRecentJobCards] = useState<JobCard[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    completionRate: 0,
    averageCompletionTime: 0,
    topCompanies: [],
  })
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    companies: 0,
    providers: 0,
    newThisMonth: 0,
  })
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJobCards = async () => {
    try {
      if (user?.role !== 'provider') {
        setLoading(false)
        setRefreshing(false)
        return
      }

      const data = await apiGet<{ jobCards: JobCard[] }>('/api/provider/job-cards')
      const jobCards: JobCard[] = data.jobCards || []

      // Calculate statistics
      const total = jobCards.length
      const pending = jobCards.filter((card) => card.status === 'pending').length
      const inProgress = jobCards.filter((card) => card.status === 'in_progress' || card.status === 'accepted').length
      const completed = jobCards.filter((card) => card.status === 'completed').length

      setStats({ total, pending, inProgress, completed })
      setError(null)
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Failed to load dashboard data')
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchAdminStats = async () => {
    try {
      // Only fetch admin stats for admins
      if (user?.role !== 'admin') {
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Fetch companies
      const companiesData = await apiGet<{ companies: Company[] }>('/api/admin/companies')
      const companies: Company[] = companiesData.companies || []

      // Calculate company statistics
      const totalCompanies = companies.length
      const pendingCompaniesCount = companies.filter((c) => c.status === 'pending').length
      const approvedCompanies = companies.filter((c) => c.status === 'approved').length
      const rejectedCompanies = companies.filter((c) => c.status === 'rejected').length
      
      // Get pending companies for display
      const pendingCompaniesList: PendingCompany[] = companies
        .filter((c) => c.status === 'pending')
        .map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          status: 'pending' as const,
          createdAt: c.createdAt,
        }))
      setPendingCompanies(pendingCompaniesList)

      // Fetch job cards for admin stats
      let activeJobCards = 0
      let completedThisMonth = 0
      let allJobCards: JobCard[] = []
      try {
        const jobCardsData = await apiGet<{ jobCards: JobCard[] }>('/api/admin/job-cards')
        allJobCards = jobCardsData.jobCards || []
        
        // Active job cards (in_progress, accepted, pending)
        activeJobCards = allJobCards.filter(
          (card) => card.status === 'in_progress' || card.status === 'accepted' || card.status === 'pending'
        ).length
        
        // Completed this month
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        completedThisMonth = allJobCards.filter((card) => {
          if (card.status !== 'completed' || !card.completedAt) return false
          const completedDate = new Date(card.completedAt)
          return completedDate >= firstDayOfMonth
        }).length
      } catch (err) {
        console.log('Job cards stats endpoint not available')
      }

      // Fetch users stats (if endpoint exists)
      let totalUsers = 0
      let totalProviders = 0
      try {
        const usersData = await apiGet<{ totalUsers?: number; totalProviders?: number }>('/api/admin/users')
        totalUsers = usersData.totalUsers || 0
        totalProviders = usersData.totalProviders || 0
      } catch (err) {
        console.log('Users stats endpoint not available')
      }

      setAdminStats({
        totalCompanies,
        pendingCompanies: pendingCompaniesCount,
        approvedCompanies,
        rejectedCompanies,
        totalUsers,
        totalProviders,
        activeJobCards,
        completedThisMonth,
      })

      // Fetch additional data in parallel
      await Promise.all([
        fetchNotifications(),
        fetchActivity(companies, allJobCards),
        fetchProviderStats(),
        fetchUrgentJobCards(allJobCards),
        fetchRecentJobCards(allJobCards),
        fetchPerformanceMetrics(allJobCards),
        fetchUserStats(),
        checkSystemStatus(),
      ])

      setError(null)
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Failed to load dashboard data')
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const data = await apiGet<{ notifications: Notification[] }>('/api/notifications')
      setRecentNotifications((data.notifications || []).slice(0, 5))
    } catch (err) {
      console.log('Notifications endpoint not available')
    }
  }

  const fetchActivity = async (companies: Company[], jobCards: JobCard[]) => {
    try {
      const data = await apiGet<{ activities: ActivityItem[] }>('/api/admin/activity')
      setRecentActivity((data.activities || []).slice(0, 10))
    } catch (err) {
      // Generate activity from existing data if endpoint doesn't exist
      generateActivityFromData(companies, jobCards)
    }
  }

  const generateActivityFromData = (companies: Company[], jobCards: JobCard[]) => {
    const activities: ActivityItem[] = []
    // Generate activity from pending companies
    companies.filter((c) => c.status === 'pending').forEach((company) => {
      activities.push({
        id: `activity-${company.id}`,
        type: 'company_registered',
        message: `${company.name} registered and is pending approval`,
        timestamp: company.createdAt,
        companyName: company.name,
      })
    })
    // Generate activity from recent job completions
    jobCards
      .filter((card) => card.status === 'completed' && card.completedAt)
      .sort((a, b) => {
        const aDate = new Date(a.completedAt!).getTime()
        const bDate = new Date(b.completedAt!).getTime()
        return bDate - aDate
      })
      .slice(0, 5)
      .forEach((card) => {
        activities.push({
          id: `activity-job-${card.id}`,
          type: 'job_completed',
          message: `Job "${card.title}" completed by ${card.provider || 'provider'}`,
          timestamp: card.completedAt!,
          jobCardTitle: card.title,
        })
      })
    setRecentActivity(activities.slice(0, 10))
  }

  const fetchProviderStats = async () => {
    try {
      const data = await apiGet<{ providers: any[] }>('/api/admin/providers')
      const providers = data.providers || []
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      setProviderStats({
        total: providers.length,
        active: providers.filter((p: any) => p.status === 'active').length,
        inactive: providers.filter((p: any) => p.status === 'inactive').length,
        newThisMonth: providers.filter((p: any) => {
          const created = new Date(p.createdAt || p.created_at)
          return created >= firstDayOfMonth
        }).length,
      })
    } catch (err) {
      console.log('Provider stats endpoint not available')
    }
  }

  const fetchUrgentJobCards = async (allJobCards: JobCard[]) => {
    try {
      const urgent = allJobCards
        .filter((card) => {
          if (card.priority === 'high') return true
          if (card.dueDate) {
            const dueDate = new Date(card.dueDate)
            const now = new Date()
            const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            return daysUntilDue <= 2 && daysUntilDue >= 0
          }
          return false
        })
        .sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1
          if (a.priority !== 'high' && b.priority === 'high') return 1
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }
          return 0
        })
        .slice(0, 5)
      setUrgentJobCards(urgent)
    } catch (err) {
      console.log('Error processing urgent job cards')
    }
  }

  const fetchRecentJobCards = async (allJobCards: JobCard[]) => {
    try {
      const recent = allJobCards
        .filter((card) => card.status === 'completed' || card.status === 'in_progress')
        .sort((a, b) => {
          const aDate = a.status === 'completed' && a.completedAt 
            ? new Date(a.completedAt).getTime() 
            : new Date(a.createdAt).getTime()
          const bDate = b.status === 'completed' && b.completedAt 
            ? new Date(b.completedAt).getTime() 
            : new Date(b.createdAt).getTime()
          return bDate - aDate
        })
        .slice(0, 5)
      setRecentJobCards(recent)
    } catch (err) {
      console.log('Error processing recent job cards')
    }
  }

  const fetchPerformanceMetrics = async (allJobCards: JobCard[]) => {
    try {
      const completed = allJobCards.filter((c) => c.status === 'completed')
      const total = allJobCards.length
      const completionRate = total > 0 ? (completed.length / total) * 100 : 0

      // Calculate average completion time
      let totalDays = 0
      let completedWithDates = 0
      completed.forEach((card) => {
        if (card.completedAt && card.createdAt) {
          const created = new Date(card.createdAt)
          const completed = new Date(card.completedAt)
          const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          totalDays += days
          completedWithDates++
        }
      })
      const averageCompletionTime = completedWithDates > 0 ? totalDays / completedWithDates : 0

      // Top companies by completion
      const companyCompletions: { [key: string]: { name: string; completed: number } } = {}
      completed.forEach((card) => {
        const companyId = card.companyId
        if (companyId) {
          if (!companyCompletions[companyId]) {
            companyCompletions[companyId] = { name: card.company || 'Unknown', completed: 0 }
          }
          companyCompletions[companyId].completed++
        }
      })
      const topCompanies = Object.values(companyCompletions)
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 3)

      setPerformanceMetrics({
        completionRate: Math.round(completionRate),
        averageCompletionTime: Math.round(averageCompletionTime),
        topCompanies,
      })
    } catch (err) {
      console.log('Error calculating performance metrics')
    }
  }

  const fetchUserStats = async () => {
    try {
      const data = await apiGet<{ users: any[] }>('/api/admin/users')
      const users = data.users || []
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      setUserStats({
        total: users.length,
        admins: users.filter((u: any) => u.role === 'admin').length,
        companies: users.filter((u: any) => u.role === 'company').length,
        providers: users.filter((u: any) => u.role === 'provider').length,
        newThisMonth: users.filter((u: any) => {
          const created = new Date(u.createdAt || u.created_at)
          return created >= firstDayOfMonth
        }).length,
      })
    } catch (err) {
      console.log('User stats endpoint not available')
    }
  }

  const checkSystemStatus = async () => {
    try {
      await apiGet('/api/health')
      setSystemStatus('online')
    } catch (err) {
      setSystemStatus('online') // Assume online if health check fails
    }
  }

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchAdminStats()
      } else if (user.role === 'provider') {
        fetchJobCards()
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    if (user?.role === 'admin') {
      fetchAdminStats()
    } else if (user?.role === 'provider') {
      fetchJobCards()
    }
  }

  // Show different content based on user role
  const renderDashboardContent = () => {
    if (!user) {
      return (
        <View className="items-center justify-center py-12">
          <Text className="text-gray-600 dark:text-gray-400">Please log in to view dashboard</Text>
        </View>
      )
    }

    // Admin - mobile app features
    if (user.role === 'admin') {
      if (loading && !refreshing) {
        return (
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-1 min-w-[150px]">
                <SkeletonLoader height={100} borderRadius={12} />
              </View>
              <View className="flex-1 min-w-[150px]">
                <SkeletonLoader height={100} borderRadius={12} />
              </View>
              <View className="flex-1 min-w-[150px]">
                <SkeletonLoader height={100} borderRadius={12} />
              </View>
              <View className="flex-1 min-w-[150px]">
                <SkeletonLoader height={100} borderRadius={12} />
              </View>
            </View>
            <SkeletonLoader height={200} borderRadius={12} />
            <SkeletonLoader height={150} borderRadius={12} />
          </View>
        )
      }

      if (error) {
        return (
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null)
              fetchAdminStats()
            }}
          />
        )
      }


      return (
        <>
          {/* Search Bar */}
          <View className="mb-6">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <Search size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="Search companies, job cards, users..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* System Status */}
          <View className="flex-row items-center justify-end mb-4">
            <View className="flex-row items-center gap-2">
              <Server size={14} color={systemStatus === 'online' ? '#14b8a6' : '#f43f5e'} />
              <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {systemStatus}
              </Text>
            </View>
          </View>

          {/* Main Stats Cards */}
          <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-1 min-w-[150px]">
              <AnimatedStatCard
                title="Total Companies"
                value={<AnimatedCounter value={adminStats.totalCompanies} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={Building2}
                backgroundColor="bg-gray-100 dark:bg-gray-800"
                textColor="text-gray-900 dark:text-white"
                delay={0}
                valueClassName="text-gray-900 dark:text-white"
              />
            </View>
            <View className="flex-1 min-w-[150px]">
              <AnimatedStatCard
                title="Pending Approvals"
                value={<AnimatedCounter value={adminStats.pendingCompanies} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={AlertTriangle}
                backgroundColor="bg-gray-100 dark:bg-gray-800"
                textColor="text-gray-900 dark:text-white"
                delay={100}
                pulse={adminStats.pendingCompanies > 0}
                valueClassName="text-gray-900 dark:text-white"
              />
            </View>
            <View className="flex-1 min-w-[150px]">
              <AnimatedStatCard
                title="Active Job Cards"
                value={<AnimatedCounter value={adminStats.activeJobCards} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={Briefcase}
                backgroundColor="bg-gray-100 dark:bg-gray-800"
                textColor="text-gray-900 dark:text-white"
                delay={200}
                valueClassName="text-gray-900 dark:text-white"
              />
            </View>
            <View className="flex-1 min-w-[150px]">
              <AnimatedStatCard
                title="Completed This Month"
                value={<AnimatedCounter value={adminStats.completedThisMonth} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={CheckCircle2}
                backgroundColor="bg-gray-100 dark:bg-gray-800"
                textColor="text-gray-900 dark:text-white"
                delay={300}
                valueClassName="text-gray-900 dark:text-white"
              />
            </View>
          </View>

          {/* Provider Statistics */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
          >
            <View className="flex-row items-center gap-2 mb-3">
              <Users size={18} color={iconColor} />
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Provider Statistics
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              <Animated.View
                entering={FadeInRight.delay(400).duration(400)}
                className="flex-1 min-w-[100px]"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">Total</Text>
                <AnimatedCounter 
                  value={providerStats.total} 
                  className="text-lg font-bold text-gray-900 dark:text-white"
                />
              </Animated.View>
              <Animated.View
                entering={FadeInRight.delay(500).duration(400)}
                className="flex-1 min-w-[100px]"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">Active</Text>
                <AnimatedCounter 
                  value={providerStats.active} 
                  className="text-lg font-bold text-gray-900 dark:text-white"
                />
              </Animated.View>
              <Animated.View
                entering={FadeInRight.delay(600).duration(400)}
                className="flex-1 min-w-[100px]"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">Inactive</Text>
                <AnimatedCounter 
                  value={providerStats.inactive} 
                  className="text-lg font-bold text-gray-600 dark:text-gray-400"
                />
              </Animated.View>
              <Animated.View
                entering={FadeInRight.delay(700).duration(400)}
                className="flex-1 min-w-[100px]"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">New This Month</Text>
                <AnimatedCounter 
                  value={providerStats.newThisMonth} 
                  className="text-lg font-bold text-gray-900 dark:text-white"
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Recent Logs Preview */}
          {recentNotifications.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(600)}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
            >
              <TouchableOpacity
                className="flex-row items-center justify-between mb-3"
                onPress={() => router.push('/(tabs)/notifications')}
              >
                <View className="flex-row items-center gap-2">
                  <FileText size={18} color={iconColor} />
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    Recent Logs
                  </Text>
                </View>
                <ArrowRight size={16} color={arrowColor} />
              </TouchableOpacity>
              <View className="gap-2">
                {recentNotifications.slice(0, 3).map((notification) => (
                  <View
                    key={notification.id}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Urgent/Priority Items */}
          {urgentJobCards.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <AlertCircle size={18} color={iconColor} />
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Urgent Items
                </Text>
                <View className="bg-gray-700 dark:bg-gray-600 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-white font-bold">
                    {urgentJobCards.length}
                  </Text>
                </View>
              </View>
              <View className="gap-2">
                {urgentJobCards.slice(0, 3).map((card, idx) => (
                  <Animated.View
                    key={card.id}
                    entering={FadeInRight.delay(600 + idx * 100).duration(400)}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-sm font-medium text-gray-900 dark:text-white">
                            {card.title}
                          </Text>
                          <View className="bg-gray-600 dark:bg-gray-500 rounded-full w-2 h-2" />
                        </View>
                        <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {card.company} • {card.priority} priority
                        </Text>
                        {card.dueDate && (
                          <View className="flex-row items-center gap-1 mt-1">
                            <Clock size={12} color={iconColor} />
                            <Text className="text-xs text-gray-600 dark:text-gray-400">
                              Due: {new Date(card.dueDate).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Recent Activity Feed */}
          {recentActivity.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(600).duration(600)}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Activity size={18} color={iconColor} />
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </Text>
              </View>
              <View className="gap-2">
                {recentActivity.slice(0, 5).map((activity, idx) => (
                  <Animated.View
                    key={activity.id}
                    entering={FadeInRight.delay(700 + idx * 100).duration(400)}
                    className="flex-row items-start gap-3 bg-white dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <View className="mt-0.5">
                      {activity.type === 'company_registered' && <Users size={16} color={iconColor} />}
                      {activity.type === 'company_approved' && <CheckCircle size={16} color={iconColor} />}
                      {activity.type === 'job_completed' && <CheckCircle size={16} color={iconColor} />}
                      {activity.type === 'job_created' && <Clock size={16} color={iconColor} />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-900 dark:text-white">
                        {activity.message}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Recent Job Cards */}
          {recentJobCards.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(700).duration(600)}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
            >
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Recent Job Cards
              </Text>
              <View className="gap-2">
                {recentJobCards.slice(0, 3).map((card, idx) => (
                  <Animated.View
                    key={card.id}
                    entering={FadeInRight.delay(800 + idx * 100).duration(400)}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {card.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-xs text-gray-600 dark:text-gray-400">
                        {card.company}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-500">•</Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {card.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Performance Metrics */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(600)}
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
          >
            <View className="flex-row items-center gap-2 mb-4">
              <TrendingUp size={18} color={iconColor} />
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Performance Metrics
              </Text>
            </View>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</Text>
                  <ProgressBar
                    progress={performanceMetrics.completionRate}
                    height={12}
                    color={isDark ? '#6B7280' : '#4B5563'}
                    backgroundColor={isDark ? '#374151' : '#e5e7eb'}
                    showLabel={true}
                    label="Completion Rate"
                  />
                </View>
                <View className="ml-4">
                  <ProgressRing
                    progress={performanceMetrics.completionRate}
                    size={80}
                    color={isDark ? '#6B7280' : '#4B5563'}
                    backgroundColor={isDark ? '#374151' : '#e5e7eb'}
                  />
                </View>
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <Text className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Time</Text>
                <View className="flex-row items-center gap-1">
                  <AnimatedCounter 
                    value={performanceMetrics.averageCompletionTime} 
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  />
                  <Text className="text-lg font-bold text-gray-900 dark:text-white"> days</Text>
                </View>
              </View>
              {performanceMetrics.topCompanies.length > 0 && (
                <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-semibold">Top Companies</Text>
                  {performanceMetrics.topCompanies.map((company, idx) => (
                    <Animated.View
                      key={idx}
                      entering={FadeInRight.delay(500 + idx * 100).duration(400)}
                      className="flex-row justify-between items-center py-2"
                    >
                      <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">{company.name}</Text>
                      <View className="flex-row items-center gap-2">
                        <View style={{ width: 60 }}>
                          <ProgressBar
                            progress={(company.completed / (performanceMetrics.topCompanies[0]?.completed || 1)) * 100}
                            height={6}
                            color={isDark ? '#6B7280' : '#4B5563'}
                            backgroundColor={isDark ? '#374151' : '#e5e7eb'}
                          />
                        </View>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right">
                          {company.completed}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>

          {/* User Management Stats */}
          {userStats.total > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
            >
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                User Management
              </Text>
              <View className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Total Users</Text>
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    {userStats.total}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Admins</Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {userStats.admins}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Companies</Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {userStats.companies}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Providers</Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {userStats.providers}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">New This Month</Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {userStats.newThisMonth}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Pending Company Approvals Section */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Pending Company Approvals
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Review and approve company registrations
                </Text>
              </View>
            </View>

            {pendingCompanies.length === 0 ? (
              <View className="py-4">
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  No pending company approvals
                </Text>
              </View>
            ) : (
              <View className="gap-3 mb-4">
                {pendingCompanies.slice(0, 3).map((company) => (
                  <View
                    key={company.id}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                      {company.name}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">{company.email}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-end"
              onPress={() => router.push('/(tabs)/companies')}
            >
              <Text className="text-gray-900 dark:text-white font-medium mr-2">
                View All Pending Approvals
              </Text>
              <ArrowRight size={16} color={arrowColor} />
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
          >
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </Text>
            <View className="gap-2">
              <TouchableOpacity
                className="bg-gray-700 dark:bg-gray-600 p-3 rounded-lg border border-gray-600 dark:border-gray-500"
                onPress={() => router.push('/(tabs)/companies')}
              >
                <Text className="text-white font-medium text-center">View All Companies</Text>
              </TouchableOpacity>
              {adminStats.pendingCompanies > 0 && (
                <TouchableOpacity
                  className="bg-gray-600 dark:bg-gray-700 p-3 rounded-lg border border-gray-500 dark:border-gray-600"
                  onPress={() => router.push('/(tabs)/companies')}
                >
                  <Text className="text-white font-medium text-center">
                    Review {adminStats.pendingCompanies} Pending Approvals
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Quick Stats Section */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Total Companies</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {adminStats.totalCompanies}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Active Job Cards</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {adminStats.activeJobCards}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Completed This Month</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {adminStats.completedThisMonth}
                </Text>
              </View>
            </View>
          </Animated.View>
        </>
      )
    }

    // Company - web-only features
    if (user.role === 'company') {
      return (
        <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Company Dashboard
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            Company features are available on the web application. Use the web app to create and assign job cards to providers.
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-500">
            Logged in as: {user.email}
          </Text>
        </View>
      )
    }

    // Provider - mobile app features
    if (loading && !refreshing) {
      return (
        <View className="gap-4">
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[150px]">
              <SkeletonLoader height={100} borderRadius={12} />
            </View>
            <View className="flex-1 min-w-[150px]">
              <SkeletonLoader height={100} borderRadius={12} />
            </View>
            <View className="flex-1 min-w-[150px]">
              <SkeletonLoader height={100} borderRadius={12} />
            </View>
            <View className="flex-1 min-w-[150px]">
              <SkeletonLoader height={100} borderRadius={12} />
            </View>
          </View>
          <SkeletonLoader height={200} borderRadius={12} />
        </View>
      )
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null)
            fetchJobCards()
          }}
        />
      )
    }

    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    const inProgressRate = stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0

    return (
      <>
        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[150px]">
            <AnimatedStatCard
              title="Total Jobs"
              value={<AnimatedCounter value={stats.total} className="text-2xl font-bold text-gray-900 dark:text-white" />}
              icon={Briefcase}
              backgroundColor="bg-gray-100 dark:bg-gray-800"
              textColor="text-gray-900 dark:text-white"
              delay={0}
              valueClassName="text-gray-900 dark:text-white"
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <AnimatedStatCard
              title="Pending"
              value={<AnimatedCounter value={stats.pending} className="text-2xl font-bold text-gray-900 dark:text-white" />}
              icon={Clock}
              backgroundColor="bg-gray-100 dark:bg-gray-800"
              textColor="text-gray-900 dark:text-white"
              delay={100}
              pulse={stats.pending > 0}
              valueClassName="text-gray-900 dark:text-white"
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <AnimatedStatCard
              title="In Progress"
              value={<AnimatedCounter value={stats.inProgress} className="text-2xl font-bold text-gray-900 dark:text-white" />}
              icon={Activity}
              backgroundColor="bg-gray-100 dark:bg-gray-800"
              textColor="text-gray-900 dark:text-white"
              delay={200}
              valueClassName="text-gray-900 dark:text-white"
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <AnimatedStatCard
              title="Completed"
              value={<AnimatedCounter value={stats.completed} className="text-2xl font-bold text-gray-900 dark:text-white" />}
              icon={CheckCircle2}
              backgroundColor="bg-gray-100 dark:bg-gray-800"
              textColor="text-gray-900 dark:text-white"
              delay={300}
              valueClassName="text-gray-900 dark:text-white"
            />
          </View>
        </View>

        {/* Progress Overview */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6"
        >
          <View className="flex-row items-center gap-2 mb-4">
            <TrendingUp size={18} color={iconColor} />
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Progress Overview
            </Text>
          </View>
          <View className="gap-4">
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</Text>
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  {Math.round(completionRate)}%
                </Text>
              </View>
                  <ProgressBar
                    progress={completionRate}
                    height={12}
                    color={isDark ? '#6B7280' : '#4B5563'}
                    backgroundColor={isDark ? '#374151' : '#e5e7eb'}
                  />
                </View>
                <View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600 dark:text-gray-400">In Progress</Text>
                    <Text className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.round(inProgressRate)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={inProgressRate}
                    height={12}
                    color={isDark ? '#6B7280' : '#4B5563'}
                    backgroundColor={isDark ? '#374151' : '#e5e7eb'}
                  />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Quick Actions
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            View and manage your job cards from the Job Cards tab. Pull down to refresh your statistics.
          </Text>
        </Animated.View>
      </>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        refreshControl={
          user?.role === 'provider' || user?.role === 'admin' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View className="p-6">
          {renderDashboardContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


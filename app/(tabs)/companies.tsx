import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState, useMemo } from 'react'
import { apiGet, apiPut, handleApiError } from '../../lib/utils/api'
import { formatTimeAgo } from '../../lib/utils/date'
import { Company } from '../../types'
import Toast from 'react-native-toast-message'
import { CheckCircle, XCircle, Clock, Search, Building2, Calendar, Mail } from 'lucide-react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { useColorScheme } from 'react-native'
import { AnimatedCounter } from '../../components/ui/AnimatedCounter'
import { AnimatedStatCard } from '../../components/ui/AnimatedStatCard'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { CompanyDetailModal } from '../../components/modals/CompanyDetailModal'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { StatusBadge } from '../../components/ui/StatusBadge'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function CompaniesScreen() {
  const { user } = useAuthStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const iconColor = isDark ? '#9CA3AF' : '#374151'
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      const data = await apiGet<{ companies: Company[] }>('/api/admin/companies')
      setCompanies(data.companies || [])
      setError(null)
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Failed to load companies')
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateCompanyStatus = async (companyId: string, status: 'approved' | 'rejected') => {
    try {
      setUpdating(companyId)
      await apiPut(`/api/admin/companies/${companyId}`, { status })

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Company ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      })

      // Refresh companies list
      await fetchCompanies()
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Failed to update company')
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      })
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCompanies()
    } else {
      setLoading(false)
    }
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    fetchCompanies()
  }

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [companies, searchQuery, statusFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: companies.length,
      pending: companies.filter((c) => c.status === 'pending').length,
      approved: companies.filter((c) => c.status === 'approved').length,
      rejected: companies.filter((c) => c.status === 'rejected').length,
    }
  }, [companies])


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-300 dark:border-gray-600',
          icon: '#6B7280',
        }
      case 'rejected':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-300 dark:border-gray-600',
          icon: '#6B7280',
        }
      case 'pending':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-300 dark:border-gray-600',
          icon: '#6B7280',
        }
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-700',
          icon: '#6B7280',
        }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} color={iconColor} />
      case 'rejected':
        return <XCircle size={18} color={iconColor} />
      case 'pending':
        return <Clock size={18} color={iconColor} />
      default:
        return null
    }
  }

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            This page is only available for administrators.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <ScrollView className="flex-1">
          <View className="p-6">
            <SkeletonLoader height={40} borderRadius={8} className="mb-6" />
            <View className="flex-row gap-4 mb-6">
              <SkeletonLoader height={100} borderRadius={12} className="flex-1" />
              <SkeletonLoader height={100} borderRadius={12} className="flex-1" />
              <SkeletonLoader height={100} borderRadius={12} className="flex-1" />
              <SkeletonLoader height={100} borderRadius={12} className="flex-1" />
            </View>
            <SkeletonLoader height={200} borderRadius={12} className="mb-4" />
            <SkeletonLoader height={200} borderRadius={12} />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-6">

          {/* Statistics Cards */}
          <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-1 min-w-[150px]">
              <AnimatedStatCard
                title="Total Companies"
                value={<AnimatedCounter value={stats.total} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={Building2}
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
                title="Approved"
                value={<AnimatedCounter value={stats.approved} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={CheckCircle}
                backgroundColor="bg-gray-100 dark:bg-gray-800"
                textColor="text-gray-900 dark:text-white"
                delay={200}
                valueClassName="text-gray-900 dark:text-white"
              />
            </View>
            <View className="flex-1 min-w-[150px]">
              <AnimatedStatCard
                title="Rejected"
                value={<AnimatedCounter value={stats.rejected} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                icon={XCircle}
                backgroundColor="bg-gray-100 dark:bg-gray-800"
                textColor="text-gray-900 dark:text-white"
                delay={300}
                valueClassName="text-gray-900 dark:text-white"
              />
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <Search size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="Search companies by name or email..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Status Filter Tabs */}
          <View className="flex-row gap-2 mb-6">
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setStatusFilter(filter)}
                className={`
                  flex-1 py-2 px-4 rounded-lg border
                  ${statusFilter === filter
                    ? 'bg-gray-700 dark:bg-gray-600 border-gray-700 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <Text
                  className={`
                    text-sm font-semibold text-center capitalize
                    ${statusFilter === filter
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {filter === 'all' ? 'All' : filter}
                  {filter !== 'all' && (
                    <Text className="text-xs opacity-80">
                      {' '}({filter === 'pending' ? stats.pending : filter === 'approved' ? stats.approved : stats.rejected})
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Companies List */}
          {filteredCompanies.length === 0 ? (
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="items-center justify-center py-16"
            >
              <View className="items-center mb-4">
                <Building2 size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'No companies found'
                  : 'No companies yet'}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Companies will appear here once they register'}
              </Text>
            </Animated.View>
          ) : (
            <View className="gap-4">
              {filteredCompanies.map((company, index) => {
                const statusColors = getStatusColor(company.status)
                return (
                  <Animated.View
                    key={company.id}
                    entering={FadeInRight.delay(index * 50).duration(400)}
                    className={`
                      bg-white dark:bg-gray-800 p-4 rounded-xl border
                      ${statusColors.border}
                      shadow-sm
                    `}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedCompany(company)
                        setModalVisible(true)
                      }}
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 mr-3">
                          <View className="flex-row items-center gap-2 mb-2">
                            <View className={`p-2 rounded-lg ${statusColors.bg}`}>
                              <Building2 size={20} color={statusColors.icon} />
                            </View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                              {company.name}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2 mb-2 ml-12">
                            <Mail size={14} color={iconColor} />
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                              {company.email}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2 ml-12">
                            <Calendar size={14} color={iconColor} />
                            <Text className="text-xs text-gray-500 dark:text-gray-500">
                              Registered {formatTimeAgo(company.createdAt)}
                            </Text>
                          </View>
                        </View>
                        <View className={`
                          px-3 py-1.5 rounded-full flex-row items-center gap-2
                          ${statusColors.bg} ${statusColors.border} border
                        `}>
                          {getStatusIcon(company.status)}
                          <Text className={`text-xs font-semibold ${statusColors.text} capitalize`}>
                            {company.status}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {company.status === 'pending' && (
                      <View className="flex-row gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <TouchableOpacity
                          className="flex-1 bg-gray-700 dark:bg-gray-600 py-3 rounded-lg items-center flex-row justify-center gap-2 border border-gray-600 dark:border-gray-500"
                          onPress={() => updateCompanyStatus(company.id, 'approved')}
                          disabled={updating === company.id}
                        >
                          {updating === company.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <CheckCircle size={18} color="#fff" />
                              <Text className="text-white font-semibold">Approve</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 bg-gray-600 dark:bg-gray-700 py-3 rounded-lg items-center flex-row justify-center gap-2 border border-gray-500 dark:border-gray-600"
                          onPress={() => updateCompanyStatus(company.id, 'rejected')}
                          disabled={updating === company.id}
                        >
                          {updating === company.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <XCircle size={18} color="#fff" />
                              <Text className="text-white font-semibold">Reject</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {company.status !== 'pending' && company.updatedAt && (
                      <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Text className="text-xs text-gray-500 dark:text-gray-500">
                          {company.status === 'approved' ? 'Approved' : 'Rejected'} {formatTimeAgo(company.updatedAt)}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Company Detail Modal */}
      <CompanyDetailModal
        visible={modalVisible}
        company={selectedCompany}
        onClose={() => {
          setModalVisible(false)
          setSelectedCompany(null)
        }}
        onStatusUpdate={() => {
          fetchCompanies()
        }}
      />
    </SafeAreaView>
  )
}

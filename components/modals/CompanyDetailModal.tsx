import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Company, Provider, JobCard } from '../../types'
import { useState, useEffect } from 'react'
import { getAuthToken } from '../../lib/utils/auth'
import Constants from 'expo-constants'
import Toast from 'react-native-toast-message'
import { 
  X, 
  Building2, 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Briefcase,
  ArrowRight,
  Phone
} from 'lucide-react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { useColorScheme } from 'react-native'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { AnimatedStatCard } from '../ui/AnimatedStatCard'
import { SkeletonLoader } from '../ui/SkeletonLoader'

interface CompanyDetailModalProps {
  visible: boolean
  company: Company | null
  onClose: () => void
  onStatusUpdate?: () => void
}

export function CompanyDetailModal({ visible, company, onClose, onStatusUpdate }: CompanyDetailModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const iconColor = isDark ? '#9CA3AF' : '#374151'
  
  const [providers, setProviders] = useState<Provider[]>([])
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (visible && company) {
      fetchCompanyDetails()
    } else {
      // Reset data when modal closes
      setProviders([])
      setJobCards([])
    }
  }, [visible, company])

  const fetchCompanyDetails = async () => {
    if (!company) return
    
    try {
      setLoading(true)
      const token = await getAuthToken()
      if (!token) return

      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
      
      // Try to fetch from company-specific endpoints first, then fallback to fetching all and filtering
      let fetchedProviders: Provider[] = []
      let fetchedJobCards: JobCard[] = []
      let providersFetched = false
      let jobCardsFetched = false
      
      // Try company-specific providers endpoint
      try {
        const providersResponse = await fetch(`${apiUrl}/api/admin/companies/${company.id}/providers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (providersResponse.ok) {
          const providersData = await providersResponse.json()
          fetchedProviders = providersData.providers || []
          providersFetched = true
        }
      } catch (error) {
        // Company-specific endpoint doesn't exist, will fetch all and filter
        console.log('Company-specific providers endpoint not available')
      }

      // Try company-specific job cards endpoint
      try {
        const jobCardsResponse = await fetch(`${apiUrl}/api/admin/companies/${company.id}/job-cards`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (jobCardsResponse.ok) {
          const jobCardsData = await jobCardsResponse.json()
          fetchedJobCards = jobCardsData.jobCards || []
          jobCardsFetched = true
        }
      } catch (error) {
        // Company-specific endpoint doesn't exist, will fetch all and filter
        console.log('Company-specific job cards endpoint not available')
      }

      // If company-specific endpoints didn't work, fetch all and filter by company ID
      if (!providersFetched) {
        try {
          const allProvidersResponse = await fetch(`${apiUrl}/api/admin/providers`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (allProvidersResponse.ok) {
            const allProvidersData = await allProvidersResponse.json()
            const allProviders: Provider[] = allProvidersData.providers || []
            // Filter providers by company ID
            fetchedProviders = allProviders.filter((p) => p.companyId === company.id)
          }
        } catch (error) {
          console.log('Providers endpoint not available')
        }
      }

      if (!jobCardsFetched) {
        try {
          const allJobCardsResponse = await fetch(`${apiUrl}/api/admin/job-cards`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (allJobCardsResponse.ok) {
            const allJobCardsData = await allJobCardsResponse.json()
            const allJobCards: JobCard[] = allJobCardsData.jobCards || []
            // Filter job cards by company ID
            fetchedJobCards = allJobCards.filter((jc) => jc.companyId === company.id)
          }
        } catch (error) {
          console.log('Job cards endpoint not available')
        }
      }

      setProviders(fetchedProviders)
      setJobCards(fetchedJobCards)
    } catch (error: any) {
      console.error('Error fetching company details:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchCompanyDetails()
  }

  const updateCompanyStatus = async (status: 'approved' | 'rejected') => {
    if (!company) return
    
    try {
      setUpdating(true)
      const token = await getAuthToken()
      if (!token) return

      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update: ${response.status}`)
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Company ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      })

      if (onStatusUpdate) {
        onStatusUpdate()
      }
    } catch (error: any) {
      console.error('Error updating company:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update company',
      })
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      icon: iconColor,
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color={iconColor} />
      case 'rejected':
        return <XCircle size={20} color={iconColor} />
      case 'pending':
        return <Clock size={20} color={iconColor} />
      default:
        return null
    }
  }

  if (!company) return null

  const statusColors = getStatusColor(company.status)
  const jobCardStats = {
    total: jobCards.length,
    pending: jobCards.filter((j) => j.status === 'pending').length,
    inProgress: jobCards.filter((j) => j.status === 'in_progress' || j.status === 'accepted').length,
    completed: jobCards.filter((j) => j.status === 'completed').length,
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center gap-3 flex-1">
            <View className={`p-2 rounded-lg ${statusColors.bg}`}>
              <Building2 size={24} color={statusColors.icon} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                {getStatusIcon(company.status)}
                <Text className={`text-sm font-medium ${statusColors.text} capitalize`}>
                  {company.status}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <X size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="p-6">
            {/* Company Information */}
            <Animated.View
              entering={FadeInDown.delay(0).duration(400)}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6"
            >
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Information
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Mail size={20} color={iconColor} />
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-500 mb-1">Email</Text>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {company.email}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <Calendar size={20} color={iconColor} />
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 dark:text-gray-500 mb-1">Registered</Text>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(company.createdAt)}
                    </Text>
                  </View>
                </View>
                {company.updatedAt && (
                  <View className="flex-row items-center gap-3">
                    <Calendar size={20} color={iconColor} />
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        {company.status === 'approved' ? 'Approved' : 'Rejected'} On
                      </Text>
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(company.updatedAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Statistics */}
            <View className="flex-row flex-wrap gap-4 mb-6">
              <View className="flex-1 min-w-[150px]">
                <AnimatedStatCard
                  title="Providers"
                  value={<AnimatedCounter value={providers.length} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                  icon={Users}
                  backgroundColor="bg-gray-100 dark:bg-gray-800"
                  textColor="text-gray-900 dark:text-white"
                  delay={100}
                  valueClassName="text-gray-900 dark:text-white"
                />
              </View>
              <View className="flex-1 min-w-[150px]">
                <AnimatedStatCard
                  title="Job Cards"
                  value={<AnimatedCounter value={jobCardStats.total} className="text-2xl font-bold text-gray-900 dark:text-white" />}
                  icon={Briefcase}
                  backgroundColor="bg-gray-100 dark:bg-gray-800"
                  textColor="text-gray-900 dark:text-white"
                  delay={200}
                  valueClassName="text-gray-900 dark:text-white"
                />
              </View>
            </View>

            {/* Job Card Statistics */}
            {jobCardStats.total > 0 && (
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6"
              >
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Job Card Statistics
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-1 min-w-[100px]">
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</Text>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                      {jobCardStats.pending}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[100px]">
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">In Progress</Text>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                      {jobCardStats.inProgress}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[100px]">
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</Text>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                      {jobCardStats.completed}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Providers List */}
            {loading ? (
              <View className="gap-4">
                <SkeletonLoader height={200} borderRadius={12} />
              </View>
            ) : providers.length > 0 ? (
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    Service Providers ({providers.length})
                  </Text>
                </View>
                <View className="gap-3">
                  {providers.slice(0, 5).map((provider, index) => (
                    <Animated.View
                      key={provider.id}
                      entering={FadeInRight.delay(500 + index * 50).duration(300)}
                      className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {provider.name}
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <Mail size={12} color={iconColor} />
                            <Text className="text-xs text-gray-600 dark:text-gray-400">
                              {provider.email}
                            </Text>
                          </View>
                          {provider.phone && (
                            <View className="flex-row items-center gap-2 mt-1">
                              <Phone size={12} color={iconColor} />
                              <Text className="text-xs text-gray-600 dark:text-gray-400">
                                {provider.phone}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {provider.status}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                  {providers.length > 5 && (
                    <Text className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
                      +{providers.length - 5} more providers
                    </Text>
                  )}
                </View>
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6"
              >
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Service Providers
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  No providers assigned to this company yet.
                </Text>
              </Animated.View>
            )}

            {/* Action Buttons for Pending Companies */}
            {company.status === 'pending' && (
              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                className="gap-3"
              >
                <TouchableOpacity
                  className="bg-gray-700 dark:bg-gray-600 py-4 rounded-xl items-center flex-row justify-center gap-2 border border-gray-600 dark:border-gray-500"
                  onPress={() => updateCompanyStatus('approved')}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={20} color="#fff" />
                      <Text className="text-white font-semibold text-lg">Approve Company</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-600 dark:bg-gray-700 py-4 rounded-xl items-center flex-row justify-center gap-2 border border-gray-500 dark:border-gray-600"
                  onPress={() => updateCompanyStatus('rejected')}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <XCircle size={20} color="#fff" />
                      <Text className="text-white font-semibold text-lg">Reject Company</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut, handleApiError, handleApiSuccess } from '../utils/api'
import { Notification } from '../../types'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await apiGet<{ notifications: Notification[] }>('/api/notifications')
      // Sort by createdAt descending (newest first)
      const sorted = (data.notifications || []).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      return sorted
    },
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiPut(`/api/notifications/${notificationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      handleApiError(error, 'Failed to mark notification as read')
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return apiPut('/api/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      handleApiSuccess('All notifications marked as read')
    },
    onError: (error) => {
      handleApiError(error, 'Failed to mark all as read')
    },
  })
}



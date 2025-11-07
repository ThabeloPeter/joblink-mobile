import { useState, useCallback } from 'react'
import { apiRequest, handleApiError, ApiClientError } from '../utils/api'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: ApiClientError) => void
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
}

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {},
      apiOptions: UseApiOptions = {}
    ): Promise<T | null> => {
      const {
        onSuccess,
        onError,
        showErrorToast = true,
        showSuccessToast = false,
        successMessage,
      } = apiOptions

      setLoading(true)
      setError(null)

      try {
        const data = await apiRequest<T>(endpoint, options)
        
        if (showSuccessToast && successMessage) {
          // Import here to avoid circular dependency
          const Toast = require('react-native-toast-message').default
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: successMessage,
          })
        }

        if (onSuccess) {
          onSuccess(data)
        }

        return data
      } catch (err) {
        const apiError = err instanceof ApiClientError ? err : new ApiClientError('An error occurred')
        setError(apiError.message)

        if (showErrorToast) {
          handleApiError(apiError)
        }

        if (onError) {
          onError(apiError)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { execute, loading, error }
}



import Constants from 'expo-constants'
import { getAuthToken } from './auth'
import Toast from 'react-native-toast-message'

export const getApiUrl = () => {
  return Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
}

export interface ApiError {
  message: string
  status?: number
}

export class ApiClientError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
    this.name = 'ApiClientError'
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new ApiClientError('Not authenticated', 401)
    }

    const apiUrl = getApiUrl()
    const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiClientError(
        errorData.message || `Request failed: ${response.statusText}`,
        response.status
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    )
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

export function handleApiError(error: unknown, defaultMessage = 'An error occurred') {
  const message = error instanceof ApiClientError 
    ? error.message 
    : error instanceof Error 
    ? error.message 
    : defaultMessage

  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  })

  console.error('API Error:', error)
  return message
}

export function handleApiSuccess(message: string) {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
  })
}



import { supabase } from '../supabase/client'
import { User } from '../../types'

export async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch user profile from your API
  const token = await getAuthToken()
  if (!token) return null

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.user as User
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  return null
}

export async function signOut() {
  await supabase.auth.signOut()
}


// User Types
export interface User {
  id: string
  email: string
  role: 'admin' | 'company' | 'provider'
  companyId?: string
  name?: string
  phone?: string
}

// Job Card Types
export interface JobCard {
  id: string
  title: string
  description: string
  company: string
  companyId: string
  provider?: string
  providerId?: string
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  location: string
  dueDate: string
  createdAt: string
  completedAt?: string | null
  auditedAt?: string | null
  completionNotes?: string | null
  completionImages?: string[] | null
}

// Provider Types
export interface Provider {
  id: string
  name: string
  email: string
  phone?: string
  status: 'active' | 'inactive'
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  jobCardId?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}


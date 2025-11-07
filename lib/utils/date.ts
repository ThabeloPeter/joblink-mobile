import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string | Date, formatStr: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (formatStr === 'relative') {
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }

  if (formatStr === 'long') {
    return format(dateObj, 'MMMM d, yyyy')
  }

  return format(dateObj, 'MMM d, yyyy')
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return format(date, 'MMM d, yyyy')
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'MMMM d, yyyy h:mm a')
}

export function formatDateLong(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'MMMM d, yyyy')
}

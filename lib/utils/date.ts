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


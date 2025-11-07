import { View, Text } from 'react-native'
import { CheckCircle, XCircle, Clock, AlertCircle, Info } from 'lucide-react-native'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'compact'
  showIcon?: boolean
  className?: string
}

export function StatusBadge({ status, variant = 'default', showIcon = true, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalized = status.toLowerCase()
    
    switch (normalized) {
      case 'approved':
      case 'success':
      case 'completed':
      case 'active':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
          iconColor: '#10b981',
        }
      case 'rejected':
      case 'error':
      case 'declined':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800',
          icon: XCircle,
          iconColor: '#ef4444',
        }
      case 'pending':
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800',
          icon: Clock,
          iconColor: '#eab308',
        }
      case 'in_progress':
      case 'accepted':
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Info,
          iconColor: '#3b82f6',
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          icon: Info,
          iconColor: '#6b7280',
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon
  const padding = variant === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5'
  const iconSize = variant === 'compact' ? 14 : 18

  return (
    <View
      className={`
        ${padding} rounded-full flex-row items-center gap-2 border
        ${config.bg} ${config.border} ${config.text}
        ${className}
      `}
    >
      {showIcon && <Icon size={iconSize} color={config.iconColor} />}
      <Text className={`text-xs font-semibold capitalize ${config.text}`}>
        {status.replace('_', ' ')}
      </Text>
    </View>
  )
}



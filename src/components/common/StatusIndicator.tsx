import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { CheckStatus } from '@/types/structural'

interface StatusIndicatorProps {
  status: CheckStatus
  label?: string
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config = {
    pass: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', text: 'Pass' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Warning' },
    fail: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', text: 'Fail' },
  }[status]

  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
      <Icon size={14} className={config.color} />
      <span className={`text-xs font-medium ${config.color}`}>{label ?? config.text}</span>
    </div>
  )
}

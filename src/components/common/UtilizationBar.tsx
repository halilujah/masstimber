import { clsx } from 'clsx'

interface UtilizationBarProps {
  ratio: number  // 0.0 to 1.0+
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function UtilizationBar({ ratio, showLabel = true, size = 'md', className }: UtilizationBarProps) {
  const percent = Math.min(ratio * 100, 120)
  const displayPercent = (ratio * 100).toFixed(0)
  const color = ratio > 1.0 ? 'bg-red-500' : ratio > 0.8 ? 'bg-amber-500' : 'bg-green-500'
  const bgColor = ratio > 1.0 ? 'bg-red-100' : ratio > 0.8 ? 'bg-amber-100' : 'bg-green-100'

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx('flex-1 rounded-full overflow-hidden', bgColor, size === 'sm' ? 'h-2' : 'h-3')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className={clsx(
          'font-mono font-medium min-w-[3rem] text-right',
          size === 'sm' ? 'text-xs' : 'text-sm',
          ratio > 1.0 ? 'text-red-600' : ratio > 0.8 ? 'text-amber-600' : 'text-green-600'
        )}>
          {displayPercent}%
        </span>
      )}
    </div>
  )
}

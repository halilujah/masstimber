import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-md shadow-sm border border-slate-200', padding && 'p-4', className)}>
      {children}
    </div>
  )
}

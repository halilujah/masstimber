import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 },
  md: { paddingLeft: 16, paddingRight: 16, height: 32, borderRadius: 4 },
  lg: { paddingLeft: 20, paddingRight: 20, height: 36, borderRadius: 4 },
}

export function Button({ variant = 'primary', size = 'md', className, style, children, ...props }: ButtonProps) {
  return (
    <button
      style={{ ...sizeStyles[size], ...style }}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-amber-600 text-white hover:bg-amber-700': variant === 'primary',
          'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200': variant === 'secondary',
          'text-slate-600 hover:bg-slate-50': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        {
          'text-[11px]': size === 'sm',
          'text-xs': size === 'md',
          'text-sm': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

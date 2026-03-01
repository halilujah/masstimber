import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  suffix?: string
  error?: string
}

export function Input({ label, suffix, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-0.5">
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-medium text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={clsx(
            'w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-400',
            'focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500',
            error && 'border-red-400 focus:ring-red-500/30 focus:border-red-500',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

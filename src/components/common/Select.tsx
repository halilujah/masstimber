import { clsx } from 'clsx'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Select({ label, options, value, onChange, className }: SelectProps) {
  return (
    <div className="space-y-0.5">
      {label && (
        <label className="block text-[11px] font-medium text-slate-500">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          'w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-800 bg-white',
          'focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500',
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

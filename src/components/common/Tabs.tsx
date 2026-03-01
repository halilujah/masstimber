import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={clsx('flex gap-1.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{ paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 }}
          className={clsx(
            'text-[11px] font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-white text-slate-800 border border-slate-300 shadow-sm'
              : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

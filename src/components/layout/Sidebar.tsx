import {
  LayoutDashboard,
  PenTool,
  Weight,
  Shield,
  Zap,
  Library,
  Link,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleId } from '@/types/project'

interface SidebarProps {
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const modules: { id: ModuleId; label: string; icon: LucideIcon; group?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'geometry', label: 'Geometry', icon: PenTool, group: 'Design' },
  { id: 'loads', label: 'Loads', icon: Weight },
  { id: 'structural', label: 'Structural', icon: Shield },
  { id: 'optimization', label: 'Optimization', icon: Zap, group: 'Analysis' },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'connections', label: 'Connections', icon: Link, group: 'Detail' },
  { id: 'cost', label: 'Cost', icon: DollarSign },
  { id: 'reporting', label: 'Reports', icon: FileText },
]

export function Sidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }: SidebarProps) {
  let lastGroup = ''

  return (
    <aside className={`h-full bg-slate-900 text-slate-300 flex flex-col transition-all duration-200 ${collapsed ? 'w-14' : 'w-[220px]'} select-none shrink-0`}>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 h-12 border-b border-slate-800 shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
        <div className="w-7 h-7 bg-amber-600 rounded flex items-center justify-center font-bold text-white text-[11px] shrink-0">
          MT
        </div>
        {!collapsed && (
          <div className="leading-none">
            <span className="font-semibold text-white text-[13px]">Mass Timber</span>
            <span className="block text-[9px] text-slate-500 tracking-wide">SUITE v1.0</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-1.5 overflow-y-auto">
        {modules.map(({ id, label, icon: Icon, group }) => {
          const isActive = activeModule === id
          const showGroup = group && group !== lastGroup && !collapsed
          if (group) lastGroup = group

          return (
            <div key={id}>
              {showGroup && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">{group}</span>
                </div>
              )}
              <button
                onClick={() => onModuleChange(id)}
                className={`w-full flex items-center gap-2.5 h-8 text-[12px] transition-colors ${
                  collapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive
                    ? 'bg-slate-800 text-white border-l-2 border-amber-500'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon size={15} className={`shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                {!collapsed && <span>{label}</span>}
              </button>
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center h-9 border-t border-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}

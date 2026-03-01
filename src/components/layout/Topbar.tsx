import { Sun, Download, Settings } from 'lucide-react'
import type { UIMode } from '@/types/project'

interface TopbarProps {
  projectName: string;
  uiMode: UIMode;
  onModeToggle: () => void;
  onExport?: () => void;
}

export function Topbar({ projectName, uiMode, onModeToggle, onExport }: TopbarProps) {
  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2.5">
        <h2 className="font-medium text-slate-800 text-sm">{projectName}</h2>
        <span className="text-slate-300">|</span>
        <span className="text-[11px] text-slate-400">Concept Design</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onModeToggle}
          style={{ paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 }}
          className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
            uiMode === 'engineer'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {uiMode === 'engineer' ? <Settings size={12} /> : <Sun size={12} />}
          {uiMode === 'engineer' ? 'Engineer' : 'Feasibility'}
        </button>

        <button
          onClick={onExport}
          style={{ paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 }}
          className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          <Download size={12} />
          Export
        </button>
      </div>
    </header>
  )
}

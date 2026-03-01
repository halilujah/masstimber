import { useState, lazy, Suspense } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useProjectStore } from '@/stores/projectStore'
import type { ModuleId } from '@/types/project'

const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'))
const GeometryModule = lazy(() => import('@/components/modules/geometry/GeometryModule'))
const LoadModule = lazy(() => import('@/components/modules/loads/LoadModule'))
const StructuralModule = lazy(() => import('@/components/modules/structural/StructuralModule'))
const OptimizationModule = lazy(() => import('@/components/modules/optimization/OptimizationModule'))
const LibraryModule = lazy(() => import('@/components/modules/library/LibraryModule'))
const ConnectionModule = lazy(() => import('@/components/modules/connections/ConnectionModule'))
const CostModule = lazy(() => import('@/components/modules/cost/CostModule'))
const ReportModule = lazy(() => import('@/components/modules/reporting/ReportModule'))

const moduleComponents: Record<ModuleId, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: Dashboard,
  geometry: GeometryModule,
  loads: LoadModule,
  structural: StructuralModule,
  optimization: OptimizationModule,
  library: LibraryModule,
  connections: ConnectionModule,
  cost: CostModule,
  reporting: ReportModule,
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-slate-400 text-sm">Loading module...</div>
    </div>
  )
}

export function AppShell() {
  const { activeModule, setActiveModule, name, uiMode, toggleUIMode } = useProjectStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const ActiveComponent = moduleComponents[activeModule]

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0 p-2.5 pl-0">
        <div className="flex-1 flex flex-col min-h-0 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
          <Topbar
            projectName={name}
            uiMode={uiMode}
            onModeToggle={toggleUIMode}
            onExport={() => setActiveModule('reporting')}
          />
          <Suspense fallback={<LoadingFallback />}>
            <ActiveComponent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

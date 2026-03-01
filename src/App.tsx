import { AppShell } from '@/components/layout/AppShell'
import { ToastContainer } from '@/components/common/ToastContainer'
import { useCalculation } from '@/hooks/useCalculation'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  useCalculation()
  useKeyboardShortcuts()

  return (
    <>
      <AppShell />
      <ToastContainer />
    </>
  )
}

export default App

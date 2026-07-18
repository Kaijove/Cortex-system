import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMasterPolling } from '@/hooks/useMasterPolling'

function App() {
  // Drives every tick-based store (system, tools, automation, analytics) from
  // one ordered timer — see useMasterPolling.ts for why this replaced four
  // independent ones.
  useMasterPolling()

  return <DashboardLayout />
}

export default App

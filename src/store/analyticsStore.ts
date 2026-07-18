import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnalyticsSample } from '@/types/analytics'
import { useSystemStore } from './systemStore'
import { useNetworkSuiteStore } from './networkSuiteStore'

const SAMPLE_INTERVAL_MS = 60_000
const MAX_SAMPLES = 4320

interface AnalyticsState {
  history: AnalyticsSample[]
  lastSampleAt: number
  installedAt: number
  maybeSample: () => void
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      history: [],
      lastSampleAt: 0,
      installedAt: Date.now(),

      maybeSample: () => {
        const now = Date.now()
        if (now - get().lastSampleAt < SAMPLE_INTERVAL_MS) return

        const system = useSystemStore.getState()
        const netSuite = useNetworkSuiteStore.getState()
        const diskAvg =
          system.disk.partitions.reduce((sum, p) => sum + (p.usedGB / p.totalGB) * 100, 0) / Math.max(1, system.disk.partitions.length)

        const sample: AnalyticsSample = {
          t: now,
          cpu: system.cpu.usage,
          ram: (system.ram.usedGB / system.ram.totalGB) * 100,
          disk: diskAvg,
          network: netSuite.quality.healthScore,
          security: system.security.score,
          health: system.healthScore.value,
          temperature: system.cpu.temperatureC,
        }

        set((s) => ({
          history: [...s.history, sample].slice(-MAX_SAMPLES),
          lastSampleAt: now,
        }))
      },
    }),
    {
      name: 'system-monitor-dashboard-analytics-history',
      partialize: (s) => ({ history: s.history, installedAt: s.installedAt }),
    },
  ),
)

export function getAvailableSpanMs(history: AnalyticsSample[]): number {
  if (history.length < 2) return 0
  return history[history.length - 1].t - history[0].t
}

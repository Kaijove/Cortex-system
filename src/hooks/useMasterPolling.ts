import { useEffect, useRef } from 'react'
import { useSystemStore } from '@/store/systemStore'
import { useToolsStore } from '@/store/toolsStore'
import { useAutomationStore } from '@/store/automationStore'
import { useAnalyticsStore } from '@/store/analyticsStore'

/**
 * Drives every tick-based store from a single timer, in guaranteed order:
 * systemStore (source of truth for CPU/RAM/disk/network/processes) always
 * finishes updating *before* toolsStore/automationStore/analyticsStore read
 * it — those three derive from systemStore's state, so reading it mid-update
 * (which could happen with 4 independent setInterval callbacks racing each
 * other) meant they could silently work from the previous tick's numbers.
 * One timer instead of four also means one wakeup per interval instead of
 * four, which matters for a dashboard meant to sit open for hours.
 */
export function useMasterPolling() {
  const refreshRateMs = useSystemStore((s) => s.refreshRateMs)
  const isPaused = useSystemStore((s) => s.isPaused)
  const inFlightRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function runTick() {
      if (inFlightRef.current || cancelled || isPaused) return
      inFlightRef.current = true
      try {
        await useSystemStore.getState().tick()
        if (cancelled) return
        useToolsStore.getState().tick()
        useAutomationStore.getState().tick()
        useAnalyticsStore.getState().maybeSample()
      } finally {
        inFlightRef.current = false
      }
    }

    const id = setInterval(runTick, refreshRateMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [refreshRateMs, isPaused])
}

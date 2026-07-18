import { useEffect } from 'react'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useSystemStore } from '@/store/systemStore'

export function useNetworkSuitePolling() {
  const refreshRateMs = useSystemStore((s) => s.refreshRateMs)
  const isPaused = useSystemStore((s) => s.isPaused)

  useEffect(() => {
    const { refreshOverview, pollConnectionQuality, pollServices, pollRegions } = useNetworkSuiteStore.getState()
    refreshOverview()
    pollConnectionQuality()
    pollServices()
    pollRegions()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused) useNetworkSuiteStore.getState().ingestBandwidthTick()
    }, refreshRateMs)
    return () => clearInterval(id)
  }, [refreshRateMs, isPaused])

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused) useNetworkSuiteStore.getState().pollConnectionQuality()
    }, 10000)
    return () => clearInterval(id)
  }, [isPaused])

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused) useNetworkSuiteStore.getState().pollServices()
    }, 45000)
    return () => clearInterval(id)
  }, [isPaused])

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused) useNetworkSuiteStore.getState().pollRegions()
    }, 30000)
    return () => clearInterval(id)
  }, [isPaused])
}

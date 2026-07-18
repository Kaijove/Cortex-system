import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AlertItem,
  CpuStats,
  DiskStats,
  GpuStats,
  HealthScore,
  Insight,
  LogEntry,
  NetworkStats,
  Prediction,
  ProcessInfo,
  RamStats,
  SecurityCenterState,
  SystemInfo,
} from '@/types/system'
import {
  createInitialCpuStats,
  createInitialDiskStats,
  createInitialGpuStats,
  createInitialNetworkStats,
  createInitialRamStats,
  createMockProcesses,
  createMockSystemInfo,
  generateLogEntry,
  stepCpuStats,
  stepDiskStats,
  stepGpuStats,
  stepNetworkStats,
  stepProcesses,
  stepRamStats,
} from '@/lib/mockData'
import { isTauri } from '@/lib/platform'
import { fetchRealSnapshot } from '@/lib/realSystemApi'
import {
  mapRealCpu,
  mapRealDisk,
  mapRealNetwork,
  mapRealProcesses,
  mapRealRam,
  mapRealSystemInfo,
} from '@/lib/realDataAdapter'
import {
  computeHealthScore,
  computeInsights,
  computePredictions,
  computeSecurityState,
  maybeGenerateAlert,
} from '@/lib/insightsEngine'

export type WidgetId =
  | 'cpu'
  | 'ram'
  | 'disk'
  | 'network'
  | 'processes'
  | 'terminal'
  | 'logs'
  | 'sysinfo'
  | 'insights'
  | 'health'
  | 'security'
  | 'predictions'
  | 'netOverview'
  | 'netBandwidth'
  | 'netQuality'
  | 'speedTest'
  | 'netMap'
  | 'apiStatus'
  | 'netEvents'
  | 'gpuMonitor'
  | 'sensors'
  | 'fileExplorer'
  | 'docker'
  | 'vms'
  | 'packages'
  | 'storageAnalyzer'
  | 'snapshots'
  | 'exportCenter'
  | 'quickActions'
  | 'notes'
  | 'calendar'
  | 'clipboard'
  | 'ruleEngine'
  | 'scheduler'
  | 'serviceUptime'
  | 'eventStream'
  | 'healthCenter'
  | 'maintenance'
  | 'incidentCenter'
  | 'automationAnalytics'
  | 'analyticsOverview'
  | 'historicalAnalysis'
  | 'advancedCharts'
  | 'activityHeatmap'
  | 'trendAnalysis'
  | 'correlations'
  | 'performanceTimeline'
  | 'analyticsReport'
  | 'dataExplorer'
  | 'executiveDashboard'
  | 'aiAnalyticsSummary'

const DEFAULT_VISIBLE_WIDGETS: Record<WidgetId, boolean> = {
  cpu: true,
  ram: true,
  disk: true,
  network: true,
  processes: true,
  terminal: true,
  logs: true,
  sysinfo: true,
  insights: true,
  health: true,
  security: true,
  predictions: true,
  netOverview: true,
  netBandwidth: true,
  netQuality: true,
  speedTest: true,
  netMap: true,
  apiStatus: true,
  netEvents: true,
  gpuMonitor: true,
  sensors: true,
  fileExplorer: true,
  docker: true,
  vms: true,
  packages: true,
  storageAnalyzer: true,
  snapshots: true,
  exportCenter: true,
  quickActions: true,
  notes: true,
  calendar: true,
  clipboard: true,
  ruleEngine: true,
  scheduler: true,
  serviceUptime: true,
  eventStream: true,
  healthCenter: true,
  maintenance: true,
  incidentCenter: true,
  automationAnalytics: true,
  analyticsOverview: true,
  historicalAnalysis: true,
  advancedCharts: true,
  activityHeatmap: true,
  trendAnalysis: true,
  correlations: true,
  performanceTimeline: true,
  analyticsReport: true,
  dataExplorer: true,
  executiveDashboard: true,
  aiAnalyticsSummary: true,
}

const MAX_LOGS = 200
const MAX_ALERTS = 100

interface SystemState {
  cpu: CpuStats
  ram: RamStats
  disk: DiskStats
  network: NetworkStats
  processes: ProcessInfo[]
  systemInfo: SystemInfo
  gpu: GpuStats
  logs: LogEntry[]
  logsPaused: boolean
  refreshRateMs: number
  isPaused: boolean
  /** True once we've confirmed we're reading live OS metrics rather than the simulation. */
  isLive: boolean
  visibleWidgets: Record<WidgetId, boolean>

  // Module 1 — AI System Insights, Smart Alerts, Security Center, Predictions
  insights: Insight[]
  healthScore: HealthScore
  alerts: AlertItem[]
  security: SecurityCenterState
  predictions: Prediction[]

  /** Advances every metric by one tick — real OS data inside Tauri, simulated otherwise. */
  tick: () => Promise<void>
  setRefreshRate: (ms: number) => void
  togglePaused: () => void
  toggleLogsPaused: () => void
  clearLogs: () => void
  toggleWidget: (id: WidgetId) => void
  resetLayout: () => void
  dismissAlert: (id: string) => void
  togglePinAlert: (id: string) => void
  markAllAlertsRead: () => void
  clearAlerts: () => void
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      cpu: createInitialCpuStats(),
      ram: createInitialRamStats(),
      disk: createInitialDiskStats(),
      network: createInitialNetworkStats(),
      processes: createMockProcesses(),
      systemInfo: createMockSystemInfo(),
      gpu: createInitialGpuStats(),
      logs: [],
      logsPaused: false,
      refreshRateMs: 1000,
      isPaused: false,
      isLive: false,
      visibleWidgets: DEFAULT_VISIBLE_WIDGETS,

      insights: [],
      healthScore: { value: 100, status: 'excellent', explanation: 'Iniciant anàlisi...', breakdown: [] },
      alerts: [],
      security: { score: 100, categories: [] },
      predictions: [],

      tick: async () => {
        const state = get()
        if (state.isPaused) return

        // GPU has no cross-platform local API without vendor SDKs (NVML/ADL), so it
        // stays simulated even in "live" mode — the header badge reflects CPU/RAM/etc only.
        const gpu = stepGpuStats(state.gpu)
        const logs =
          !state.logsPaused && Math.random() < 0.45
            ? [...state.logs, generateLogEntry()].slice(-MAX_LOGS)
            : state.logs

        const applyDerived = (
          cpu: CpuStats,
          ram: RamStats,
          disk: DiskStats,
          network: NetworkStats,
          processes: ProcessInfo[],
          isLive: boolean,
        ) => {
          const insights = computeInsights(cpu, ram, disk, network, processes)
          const healthScore = computeHealthScore(cpu, ram, disk, network)
          const security = computeSecurityState(processes, isLive)
          const predictions = computePredictions(cpu, ram, disk, network, state.refreshRateMs)
          const newAlert = maybeGenerateAlert(cpu, ram, disk, network, state.cpu.usage)
          const alerts = newAlert ? [newAlert, ...state.alerts].slice(0, MAX_ALERTS) : state.alerts
          return { insights, healthScore, security, predictions, alerts }
        }

        if (isTauri()) {
          try {
            const snapshot = await fetchRealSnapshot()
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const cpu = mapRealCpu(snapshot, state.cpu, state.refreshRateMs)
            const ram = mapRealRam(snapshot, state.ram)
            const disk = mapRealDisk(snapshot, state.disk, state.refreshRateMs)
            const network = mapRealNetwork(snapshot, state.network, state.refreshRateMs)
            const processes = mapRealProcesses(snapshot)
            const derived = applyDerived(cpu, ram, disk, network, processes, true)
            set({
              cpu,
              ram,
              disk,
              network,
              processes,
              systemInfo: mapRealSystemInfo(snapshot, timezone),
              gpu,
              logs,
              isLive: true,
              ...derived,
            })
            return
          } catch (err) {
            // Falls through to the simulation below if the Rust command isn't reachable yet.
            console.error('Failed to read real system metrics, falling back to simulation:', err)
          }
        }

        const cpu = stepCpuStats(state.cpu)
        const ram = stepRamStats(state.ram)
        const disk = stepDiskStats(state.disk)
        const network = stepNetworkStats(state.network)
        const processes = stepProcesses(state.processes)
        const derived = applyDerived(cpu, ram, disk, network, processes, false)
        set({
          cpu,
          ram,
          disk,
          network,
          processes,
          systemInfo: {
            ...state.systemInfo,
            uptimeSeconds: state.systemInfo.uptimeSeconds + state.refreshRateMs / 1000,
          },
          gpu,
          logs,
          isLive: false,
          ...derived,
        })
      },

      setRefreshRate: (ms) => set({ refreshRateMs: ms }),
      togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
      toggleLogsPaused: () => set((state) => ({ logsPaused: !state.logsPaused })),
      clearLogs: () => set({ logs: [] }),
      toggleWidget: (id) =>
        set((state) => ({ visibleWidgets: { ...state.visibleWidgets, [id]: !state.visibleWidgets[id] } })),
      resetLayout: () => set({ visibleWidgets: DEFAULT_VISIBLE_WIDGETS, refreshRateMs: 1000 }),
      dismissAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
      togglePinAlert: (id) =>
        set((state) => ({ alerts: state.alerts.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)) })),
      markAllAlertsRead: () => set((state) => ({ alerts: state.alerts.map((a) => ({ ...a, read: true })) })),
      clearAlerts: () => set((state) => ({ alerts: state.alerts.filter((a) => a.pinned) })),
    }),
    {
      name: 'system-monitor-dashboard-settings',
      // Only persist user preferences — never the live metric snapshots.
      partialize: (state) => ({
        visibleWidgets: state.visibleWidgets,
        refreshRateMs: state.refreshRateMs,
      }),
    },
  ),
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AutomationRule,
  Incident,
  MaintenanceTask,
  MaintenanceTaskType,
  MonitoredService,
  NotificationPrefs,
  RuleAction,
  RuleCondition,
  RuleExecution,
  ScheduledTask,
  ScheduledTaskType,
  ScheduleFrequency,
  StreamEvent,
} from '@/types/automation'
import { useSystemStore } from './systemStore'
import { useNetworkSuiteStore } from './networkSuiteStore'
import { useToolsStore } from './toolsStore'
import { nowLabel } from '@/lib/utils'

const FREQUENCY_MS: Record<ScheduleFrequency, number> = {
  every5min: 5 * 60 * 1000,
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
}

const MAINTENANCE_LABELS: Record<MaintenanceTaskType, string> = {
  cache: 'Neteja de cache',
  logRotation: 'Rotació de logs',
  tempFiles: 'Neteja de temporals',
  packageUpdates: "Actualització de paquets",
  backupCheck: "Verificació de còpies de seguretat",
  diskOptimize: 'Optimització de disc',
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Web Audio unavailable — silently skip, not critical.
  }
}

function pushAlert(title: string, message: string, priority: 'info' | 'success' | 'warning' | 'critical') {
  useSystemStore.setState((s) => ({
    alerts: [
      { id: `auto-alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title, message, priority, timestamp: nowLabel(), pinned: false, read: false },
      ...s.alerts,
    ].slice(0, 100),
  }))
}

function pushLog(message: string, severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS') {
  useSystemStore.setState((s) => ({
    logs: [...s.logs, { id: Date.now() + Math.random(), timestamp: nowLabel(), severity, message }].slice(-200),
  }))
}

function defaultServices(): MonitoredService[] {
  return [
    { id: 'database', name: 'Base de dades', state: 'healthy', uptimePercent: 99.97, monthlyUptimePercent: 99.92, currentStreakLabel: '4d 12h', incidents: [], isReal: false },
    { id: 'auth', name: 'Autenticació', state: 'healthy', uptimePercent: 99.99, monthlyUptimePercent: 99.98, currentStreakLabel: '12d 3h', incidents: [], isReal: false },
    { id: 'api', name: 'API interna', state: 'healthy', uptimePercent: 99.9, monthlyUptimePercent: 99.85, currentStreakLabel: '2d 8h', incidents: [{ timestamp: '2026-07-10 03:12', description: 'Latència elevada durant 6 min' }], isReal: false },
    { id: 'firewall', name: 'Tallafocs', state: 'healthy', uptimePercent: 100, monthlyUptimePercent: 99.99, currentStreakLabel: '30d', incidents: [], isReal: false },
  ]
}

interface AutomationState {
  rules: AutomationRule[]
  executions: RuleExecution[]
  scheduledTasks: ScheduledTask[]
  services: MonitoredService[]
  streamEvents: StreamEvent[]
  streamPaused: boolean
  maintenanceTasks: MaintenanceTask[]
  incidents: Incident[]
  notificationPrefs: NotificationPrefs
  stabilityHistory: { time: string; value: number }[]
  healthHistory: { time: string; value: number }[]
  _prevDockerStatuses: Record<string, string>

  tick: () => void
  addRule: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'lastTriggeredAt' | 'triggerCount'>) => void
  toggleRule: (id: string) => void
  deleteRule: (id: string) => void

  addScheduledTask: (name: string, type: ScheduledTaskType, frequency: ScheduleFrequency) => void
  toggleScheduledTask: (id: string) => void
  deleteScheduledTask: (id: string) => void
  runTaskNow: (id: string) => void

  runMaintenanceTask: (type: MaintenanceTaskType) => void

  updateIncidentStatus: (id: string, status: Incident['status']) => void

  toggleStreamPaused: () => void
  setNotificationPrefs: (patch: Partial<NotificationPrefs>) => void
  requestDesktopPermission: () => void
}

function runScheduledTaskAction(type: ScheduledTaskType) {
  switch (type) {
    case 'snapshot':
      useToolsStore.getState().takeSnapshot('Snapshot programat')
      break
    case 'speedtest':
      useNetworkSuiteStore.getState().runSpeedTest()
      break
    case 'logCleanup':
      useSystemStore.getState().clearLogs()
      break
    case 'widgetRefresh':
      useSystemStore.getState().tick()
      break
    case 'report':
    case 'export':
    case 'scan':
      break
  }
}

export const useAutomationStore = create<AutomationState>()(
  persist(
    (set, get) => ({
      rules: [],
      executions: [],
      scheduledTasks: [],
      services: defaultServices(),
      streamEvents: [],
      streamPaused: false,
      maintenanceTasks: (['cache', 'logRotation', 'tempFiles', 'packageUpdates', 'backupCheck', 'diskOptimize'] as MaintenanceTaskType[]).map((type) => ({
        id: type,
        type,
        label: MAINTENANCE_LABELS[type],
        running: false,
        progressPercent: 0,
        lastRunAt: null,
      })),
      incidents: [],
      notificationPrefs: { desktopEnabled: false, inAppEnabled: true, silentMode: false, groupAlerts: true },
      stabilityHistory: [],
      healthHistory: [],
      _prevDockerStatuses: {},

      tick: () => {
        const system = useSystemStore.getState()
        const netSuite = useNetworkSuiteStore.getState()
        const tools = useToolsStore.getState()

        const diskAvg =
          system.disk.partitions.reduce((sum, p) => sum + (p.usedGB / p.totalGB) * 100, 0) / Math.max(1, system.disk.partitions.length)
        const apiOnlinePercent = netSuite.services.length
          ? (netSuite.services.filter((s) => s.status === 'online').length / netSuite.services.length) * 100
          : 100

        const metricValues: Record<string, number> = {
          cpu: system.cpu.usage,
          ram: (system.ram.usedGB / system.ram.totalGB) * 100,
          disk: diskAvg,
          temperature: system.cpu.temperatureC ?? 0,
          network: netSuite.quality.healthScore,
          security: system.security.score,
          apiStatus: apiOnlinePercent,
          time: new Date().getHours(),
        }

        const newStreamEvents: StreamEvent[] = []
        let newExecutions: RuleExecution[] = []
        const updatedRules = get().rules.map((rule) => {
          if (!rule.enabled || rule.conditions.length === 0) return rule
          const results = rule.conditions.map((c) => evalCondition(c, metricValues))
          const passed = rule.logic === 'AND' ? results.every(Boolean) : results.some(Boolean)
          if (!passed) return rule

          rule.actions.forEach((action) => runAction(action, rule.name))
          const execution: RuleExecution = {
            id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            timestamp: nowLabel(),
            actionsRun: rule.actions.map((a) => a.type),
          }
          newExecutions = [execution, ...newExecutions]
          newStreamEvents.push({
            id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: nowLabel(),
            severity: 'warning',
            category: 'automation',
            description: `Regla "${rule.name}" activada`,
            source: "Motor d'automatització",
          })
          return { ...rule, lastTriggeredAt: nowLabel(), triggerCount: rule.triggerCount + 1 }
        })

        if (metricValues.cpu > 90) {
          newStreamEvents.push({ id: `stream-cpu-${Date.now()}`, timestamp: nowLabel(), severity: 'critical', category: 'cpu', description: `Pic de CPU: ${metricValues.cpu.toFixed(0)}%`, source: 'Monitor de sistema' })
        }
        if (metricValues.ram > 85) {
          newStreamEvents.push({ id: `stream-ram-${Date.now()}`, timestamp: nowLabel(), severity: 'warning', category: 'memory', description: `Ús de memòria alt: ${metricValues.ram.toFixed(0)}%`, source: 'Monitor de sistema' })
        }

        const prevDocker = get()._prevDockerStatuses
        const nextDocker: Record<string, string> = {}
        tools.dockerContainers.forEach((c) => {
          nextDocker[c.id] = c.status
          if (prevDocker[c.id] && prevDocker[c.id] !== c.status) {
            newStreamEvents.push({ id: `stream-docker-${c.id}-${Date.now()}`, timestamp: nowLabel(), severity: 'info', category: 'docker', description: `Contenidor "${c.name}" → ${c.status}`, source: 'Docker' })
          }
        })

        netSuite.services.filter((s) => s.status === 'offline').forEach((s) => {
          newStreamEvents.push({ id: `stream-api-${s.id}-${Date.now()}`, timestamp: nowLabel(), severity: 'critical', category: 'api', description: `${s.name} no respon`, source: 'Estat de serveis' })
        })

        const now = Date.now()
        const updatedTasks = get().scheduledTasks.map((task) => {
          if (!task.enabled || task.nextRunAt > now) return task
          runScheduledTaskAction(task.type)
          return {
            ...task,
            lastRunAt: nowLabel(),
            lastRunStatus: 'success' as const,
            nextRunAt: now + FREQUENCY_MS[task.frequency],
            history: [{ timestamp: nowLabel(), status: 'success' as const }, ...task.history].slice(0, 20),
          }
        })

        const dockerHealthy = tools.dockerContainers.filter((c) => c.status === 'running').length
        const vmRunning = tools.vms.filter((v) => v.status === 'running').length
        const sshEntry = system.security.categories.find((c) => c.key === 'ssh')
        const realServiceOverlay: MonitoredService[] = [
          { id: 'docker', name: 'Docker', state: dockerHealthy > 0 ? 'healthy' : 'stopped', uptimePercent: 100, monthlyUptimePercent: 100, currentStreakLabel: `${dockerHealthy} contenidors actius`, incidents: [], isReal: true },
          { id: 'vms', name: 'Màquines virtuals', state: vmRunning > 0 ? 'running' : 'stopped', uptimePercent: 100, monthlyUptimePercent: 100, currentStreakLabel: `${vmRunning} en marxa`, incidents: [], isReal: true },
          { id: 'ssh', name: 'SSH', state: sshEntry?.status.includes('actiu') ? 'running' : 'stopped', uptimePercent: 100, monthlyUptimePercent: 100, currentStreakLabel: sshEntry?.status ?? 'N/D', incidents: [], isReal: !!sshEntry?.isReal },
          { id: 'network', name: 'Xarxa', state: netSuite.quality.healthScore > 70 ? 'healthy' : netSuite.quality.healthScore > 40 ? 'warning' : 'critical', uptimePercent: Math.max(90, netSuite.quality.healthScore), monthlyUptimePercent: Math.max(90, netSuite.quality.healthScore), currentStreakLabel: `salut ${netSuite.quality.healthScore}/100`, incidents: [], isReal: true },
        ]

        const incidents = [...get().incidents]
        if (metricValues.cpu > 95 && !incidents.some((i) => i.category === 'cpu' && i.status !== 'resolved')) {
          incidents.unshift({
            id: `incident-${Date.now()}`,
            title: 'Ús de CPU crític sostingut',
            severity: 'critical',
            status: 'open',
            category: 'cpu',
            affectedComponents: ['CPU', 'Rendiment general'],
            suggestedResolution: "Identifica el procés amb més consum a la taula de processos i tanca'l o investiga'l.",
            createdAt: nowLabel(),
            resolvedAt: null,
          })
        }

        const healthValue = system.healthScore.value
        const healthHistory = [...get().healthHistory, { time: nowLabel(), value: healthValue }].slice(-120)
        const recentHealth = healthHistory.slice(-20).map((h) => h.value)
        const variance =
          recentHealth.length > 1
            ? recentHealth.reduce((sum, v) => sum + (v - recentHealth.reduce((a, b) => a + b, 0) / recentHealth.length) ** 2, 0) / recentHealth.length
            : 0
        const stabilityScore = Math.max(0, Math.round(100 - Math.sqrt(variance) * 3))
        const stabilityHistory = [...get().stabilityHistory, { time: nowLabel(), value: stabilityScore }].slice(-60)

        set((s) => ({
          rules: updatedRules,
          executions: [...newExecutions, ...s.executions].slice(0, 100),
          scheduledTasks: updatedTasks,
          services: [...realServiceOverlay, ...defaultServices().map((d) => s.services.find((x) => x.id === d.id) ?? d)],
          streamEvents: s.streamPaused ? s.streamEvents : [...newStreamEvents, ...s.streamEvents].slice(0, 150),
          incidents: incidents.slice(0, 50),
          healthHistory,
          stabilityHistory,
          _prevDockerStatuses: nextDocker,
        }))
      },

      addRule: (rule) =>
        set((s) => ({
          rules: [...s.rules, { ...rule, id: `rule-${Date.now()}`, createdAt: nowLabel(), lastTriggeredAt: null, triggerCount: 0 }],
        })),
      toggleRule: (id) => set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
      deleteRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),

      addScheduledTask: (name, type, frequency) =>
        set((s) => ({
          scheduledTasks: [
            ...s.scheduledTasks,
            { id: `task-${Date.now()}`, name, type, frequency, enabled: true, lastRunAt: null, lastRunStatus: null, nextRunAt: Date.now() + FREQUENCY_MS[frequency], history: [] },
          ],
        })),
      toggleScheduledTask: (id) => set((s) => ({ scheduledTasks: s.scheduledTasks.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)) })),
      deleteScheduledTask: (id) => set((s) => ({ scheduledTasks: s.scheduledTasks.filter((t) => t.id !== id) })),
      runTaskNow: (id) => {
        const task = get().scheduledTasks.find((t) => t.id === id)
        if (!task) return
        runScheduledTaskAction(task.type)
        set((s) => ({
          scheduledTasks: s.scheduledTasks.map((t) =>
            t.id === id
              ? { ...t, lastRunAt: nowLabel(), lastRunStatus: 'success', nextRunAt: Date.now() + FREQUENCY_MS[t.frequency], history: [{ timestamp: nowLabel(), status: 'success' as const }, ...t.history].slice(0, 20) }
              : t,
          ),
        }))
      },

      runMaintenanceTask: (type) => {
        set((s) => ({ maintenanceTasks: s.maintenanceTasks.map((t) => (t.type === type ? { ...t, running: true, progressPercent: 0 } : t)) }))
        const id = setInterval(() => {
          set((s) => ({
            maintenanceTasks: s.maintenanceTasks.map((t) => {
              if (t.type !== type || !t.running) return t
              const next = Math.min(100, t.progressPercent + 20)
              if (next >= 100) {
                clearInterval(id)
                pushLog(`Manteniment completat: ${t.label}`, 'SUCCESS')
                return { ...t, running: false, progressPercent: 100, lastRunAt: nowLabel() }
              }
              return { ...t, progressPercent: next }
            }),
          }))
        }, 300)
      },

      updateIncidentStatus: (id, status) =>
        set((s) => ({
          incidents: s.incidents.map((i) => (i.id === id ? { ...i, status, resolvedAt: status === 'resolved' ? nowLabel() : i.resolvedAt } : i)),
        })),

      toggleStreamPaused: () => set((s) => ({ streamPaused: !s.streamPaused })),
      setNotificationPrefs: (patch) => set((s) => ({ notificationPrefs: { ...s.notificationPrefs, ...patch } })),
      requestDesktopPermission: () => {
        if ('Notification' in window) {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') get().setNotificationPrefs({ desktopEnabled: true })
          })
        }
      },
    }),
    {
      name: 'system-monitor-dashboard-automation',
      partialize: (s) => ({
        rules: s.rules,
        scheduledTasks: s.scheduledTasks,
        incidents: s.incidents,
        notificationPrefs: s.notificationPrefs,
      }),
    },
  ),
)

function evalCondition(condition: RuleCondition, values: Record<string, number>): boolean {
  const v = values[condition.metric] ?? 0
  switch (condition.operator) {
    case '>': return v > condition.value
    case '<': return v < condition.value
    case '>=': return v >= condition.value
    case '<=': return v <= condition.value
    case '==': return v === condition.value
  }
}

function runAction(action: RuleAction, ruleName: string) {
  const prefs = useAutomationStore.getState().notificationPrefs
  switch (action.type) {
    case 'alert':
      pushAlert(`Regla activada: ${ruleName}`, `Les condicions de la regla "${ruleName}" s'han complert.`, 'critical')
      break
    case 'log':
      pushLog(`Regla "${ruleName}" executada`, 'WARN')
      break
    case 'sound':
      if (!prefs.silentMode) playBeep()
      break
    case 'snapshot':
      useToolsStore.getState().takeSnapshot(`Auto: ${ruleName}`)
      break
    case 'notification':
      if (prefs.desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Regla activada: ${ruleName}`, { body: 'Consulta el dashboard per a més detalls.' })
      }
      if (prefs.inAppEnabled) pushAlert(`Regla: ${ruleName}`, 'Notificació generada per automatització.', 'info')
      break
  }
}

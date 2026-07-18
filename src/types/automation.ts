import type { TimeSeriesPoint } from './system'

export type ConditionMetric = 'cpu' | 'ram' | 'disk' | 'temperature' | 'network' | 'security' | 'apiStatus' | 'time'
export type ConditionOperator = '>' | '<' | '>=' | '<=' | '=='

export interface RuleCondition {
  id: string
  metric: ConditionMetric
  operator: ConditionOperator
  value: number
}

export type RuleActionType = 'alert' | 'log' | 'sound' | 'snapshot' | 'notification'

export interface RuleAction {
  id: string
  type: RuleActionType
}

export type LogicMode = 'AND' | 'OR'

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  logic: LogicMode
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdAt: string
  lastTriggeredAt: string | null
  triggerCount: number
}

export interface RuleExecution {
  id: string
  ruleId: string
  ruleName: string
  timestamp: string
  actionsRun: RuleActionType[]
}

export type ScheduledTaskType = 'snapshot' | 'speedtest' | 'logCleanup' | 'report' | 'export' | 'widgetRefresh' | 'scan'
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'every5min'

export interface ScheduledTask {
  id: string
  name: string
  type: ScheduledTaskType
  frequency: ScheduleFrequency
  enabled: boolean
  lastRunAt: string | null
  lastRunStatus: 'success' | 'failed' | null
  nextRunAt: number
  history: { timestamp: string; status: 'success' | 'failed' }[]
}

export type ServiceState = 'running' | 'stopped' | 'restarting' | 'healthy' | 'warning' | 'critical'

export interface MonitoredService {
  id: string
  name: string
  state: ServiceState
  uptimePercent: number
  monthlyUptimePercent: number
  currentStreakLabel: string
  incidents: { timestamp: string; description: string }[]
  isReal: boolean
}

export type StreamEventCategory = 'cpu' | 'memory' | 'firewall' | 'docker' | 'api' | 'weather' | 'security' | 'automation' | 'general'
export type StreamEventSeverity = 'info' | 'warning' | 'critical'

export interface StreamEvent {
  id: string
  timestamp: string
  severity: StreamEventSeverity
  category: StreamEventCategory
  description: string
  source: string
}

export type MaintenanceTaskType = 'cache' | 'logRotation' | 'tempFiles' | 'packageUpdates' | 'backupCheck' | 'diskOptimize'

export interface MaintenanceTask {
  id: string
  type: MaintenanceTaskType
  label: string
  running: boolean
  progressPercent: number
  lastRunAt: string | null
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'investigating' | 'resolved'

export interface Incident {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  category: string
  affectedComponents: string[]
  suggestedResolution: string
  createdAt: string
  resolvedAt: string | null
}

export interface AutomationAnalytics {
  rulesExecuted: number
  alertsTriggered: number
  incidentsPrevented: number
  avgResponseMs: number
  stabilityScore: number
  history: TimeSeriesPoint[]
}

export interface NotificationPrefs {
  desktopEnabled: boolean
  inAppEnabled: boolean
  silentMode: boolean
  groupAlerts: boolean
}

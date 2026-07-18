// -----------------------------------------------------------------------------
// Core domain types for the System Monitor Dashboard.
// These describe the shape of every metric shown in the UI. In this base
// stage the values are produced by a mock data generator (src/lib/mockData.ts)
// so the whole app works end-to-end without a real backend/agent.
// -----------------------------------------------------------------------------

export interface CpuCore {
  id: number
  usage: number // 0-100
  clockSpeedGHz: number
  temperatureC: number | null
}

export interface CpuStats {
  usage: number // overall 0-100
  cores: CpuCore[]
  temperatureC: number | null // null when the OS exposes no sensor (never fabricated)
  clockSpeedGHz: number
  threads: number
  processes: number
  history: TimeSeriesPoint[] // rolling window
  peakUsage: number
  averageUsage: number
}

export interface RamStats {
  totalGB: number
  usedGB: number
  cachedGB: number
  availableGB: number
  swapTotalGB: number
  swapUsedGB: number
  pressure: 'normal' | 'moderate' | 'high'
  history: TimeSeriesPoint[]
}

export interface DiskPartition {
  id: string
  mountPoint: string
  totalGB: number
  usedGB: number
  filesystem: string
}

export interface DiskStats {
  partitions: DiskPartition[]
  readSpeedMBs: number
  writeSpeedMBs: number
  healthPercent: number | null // S.M.A.R.T. data isn't available via sysinfo; null in real mode
  temperatureC: number | null
  history: TimeSeriesPoint[]
}

export interface NetworkStats {
  uploadMbps: number
  downloadMbps: number
  latencyMs: number | null // requires an active ping, not exposed by local OS interface stats
  packetLossPercent: number | null
  publicIp: string | null // requires an external lookup service
  privateIp: string | null
  isp: string | null
  dns: string | null
  location: string | null
  quality: 'excellent' | 'good' | 'fair' | 'poor' | null
  history: NetworkHistoryPoint[]
}

export interface TimeSeriesPoint {
  time: string // HH:mm:ss label
  value: number
}

export interface NetworkHistoryPoint {
  time: string
  upload: number
  download: number
}

export type ProcessStatus = 'running' | 'sleeping' | 'stopped' | 'zombie'

export interface ProcessInfo {
  pid: number
  name: string
  cpu: number
  ram: number // MB
  threads: number | null
  status: ProcessStatus
  owner: string
  priority: number | null
  runtime: string // HH:mm:ss
}

export type LogSeverity = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS'

export interface LogEntry {
  id: number
  timestamp: string
  severity: LogSeverity
  message: string
}

export interface GpuStats {
  name: string
  usagePercent: number
  temperatureC: number
  vramUsedGB: number
  vramTotalGB: number
  fanRpm: number
  powerDrawW: number
}

export interface SystemInfo {
  hostname: string
  os: string
  kernel: string
  user: string
  uptimeSeconds: number
  timezone: string
}

// -----------------------------------------------------------------------------
// Module 1 — AI System Insights, Smart Alerts, Security Center, Predictions.
// All of these are DERIVED from the metrics the dashboard already collects
// (real ones in Tauri, simulated ones in the browser) — nothing here reads
// from a sensor that doesn't already exist elsewhere in the app.
// -----------------------------------------------------------------------------

export type InsightSeverity = 'info' | 'good' | 'warning' | 'critical'

export type InsightCategory = 'cpu' | 'ram' | 'disk' | 'network' | 'processes' | 'temperature' | 'power' | 'general'

export interface Insight {
  id: string
  title: string
  category: InsightCategory
  severity: InsightSeverity
  timestamp: string
  explanation: string
  recommendation: string
}

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'warning' | 'critical'

export interface HealthScore {
  value: number // 0-100
  status: HealthStatus
  explanation: string
  breakdown: { label: string; score: number; weight: number }[]
}

export type AlertPriority = 'info' | 'success' | 'warning' | 'critical'

export interface AlertItem {
  id: string
  title: string
  message: string
  priority: AlertPriority
  timestamp: string
  pinned: boolean
  read: boolean
}

export type SecurityRisk = 'low' | 'medium' | 'high'

export interface SecurityCategoryStatus {
  key: string
  label: string
  status: string
  risk: SecurityRisk
  recommendation: string
  /** True when this specific field was derived from a real, locally observable
   *  signal (e.g. an sshd process actually running). False = illustrative demo
   *  value, since a real check would need elevated OS-level access this app
   *  doesn't have (firewall rules, port scans, password policy, etc). */
  isReal: boolean
}

export interface SecurityCenterState {
  score: number // 0-100
  categories: SecurityCategoryStatus[]
}

export interface Prediction {
  id: string
  metric: 'cpu' | 'ram' | 'disk' | 'network'
  label: string
  trend: 'up' | 'down' | 'stable'
  confidencePercent: number
  explanation: string
  projectedHistory: TimeSeriesPoint[] // last known points + projected future points
  projectedFromIndex: number // index in projectedHistory where projection starts
}


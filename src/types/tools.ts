import type { ProcessInfo, TimeSeriesPoint } from './system'

// -----------------------------------------------------------------------------
// Module 3 — Advanced System Tools.
// Per the brief: a simulated filesystem/Docker/VM layer is explicitly allowed
// here, and destructive actions (terminate, restart, stop) are simulated —
// this app never actually kills a real process or container. Where real data
// already exists elsewhere in the app (process list, CPU temp, health score),
// these tools read it rather than re-simulating it.
// -----------------------------------------------------------------------------

export interface ProcessDetail extends ProcessInfo {
  parentPid: number | null
  childPids: number[]
  cpuHistory: TimeSeriesPoint[]
  ramHistory: TimeSeriesPoint[]
  openFiles: string[]
  commandLine: string
}

export interface GpuHistoryStats {
  usageHistory: TimeSeriesPoint[]
  temperatureHistory: TimeSeriesPoint[]
  encoderUsagePercent: number
  decoderUsagePercent: number
}

export type SensorCategory = 'temperature' | 'fan' | 'power' | 'voltage'

export interface SensorReading {
  id: string
  label: string
  category: SensorCategory
  unit: string
  current: number
  min: number
  max: number
  avg: number
  isReal: boolean
}

export type FsNodeKind = 'folder' | 'file'

export interface FsNode {
  id: string
  name: string
  kind: FsNodeKind
  sizeBytes: number
  modified: string
  children?: FsNode[]
  favorite?: boolean
}

export type DockerContainerStatus = 'running' | 'stopped' | 'restarting'

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: DockerContainerStatus
  cpuPercent: number
  ramMB: number
  ports: string
  uptime: string
  logs: string[]
}

export interface DockerImage {
  id: string
  repository: string
  tag: string
  sizeGB: number
}

export interface DockerVolume {
  name: string
  driver: string
  sizeGB: number
}

export interface DockerNetworkInfo {
  name: string
  driver: string
  containers: number
}

export type VmStatus = 'running' | 'stopped' | 'paused'

export interface VirtualMachine {
  id: string
  name: string
  status: VmStatus
  os: string
  cpuCores: number
  ramGB: number
  storageGB: number
  network: string
  uptime: string
}

export interface PackageInfo {
  id: string
  name: string
  version: string
  latestVersion: string | null
  repository: string
  category: string
  hasUpdate: boolean
  installedOn: string
}

export interface StorageCategoryNode {
  name: string
  sizeGB: number
  children?: { name: string; sizeGB: number }[]
}

export interface Snapshot {
  id: string
  label: string
  timestamp: string
  healthScore: number
  cpuUsage: number
  ramUsedGB: number
  ramTotalGB: number
  diskUsedGB: number
  diskTotalGB: number
  downloadMbps: number
  uploadMbps: number
}

import type { TimeSeriesPoint } from './system'

// -----------------------------------------------------------------------------
// Module 2 — Professional Network Suite.
//
// Unlike the OS metrics (which need the Tauri/Rust backend for real values),
// everything here is measured directly from the webview with fetch()/timing
// APIs — that works identically in the browser preview and the desktop app,
// and it's genuinely real: actual requests over the network, actual elapsed
// time. Fields that CAN'T be measured this way (default gateway, DNS server
// list, Wi-Fi signal strength — all of which need native OS network APIs) are
// explicitly marked `isReal: false` rather than filled with a plausible guess.
// -----------------------------------------------------------------------------

export interface NetworkOverviewField {
  label: string
  value: string
  isReal: boolean
}

export interface NetworkOverview {
  publicIp: NetworkOverviewField
  isp: NetworkOverviewField
  asn: NetworkOverviewField
  country: NetworkOverviewField
  city: NetworkOverviewField
  privateIp: NetworkOverviewField
  macAddress: NetworkOverviewField
  activeInterface: NetworkOverviewField
  connectionType: NetworkOverviewField
  gateway: NetworkOverviewField
  dnsServers: NetworkOverviewField
  ipv6: NetworkOverviewField
  loading: boolean
  lastUpdated: string | null
  error: string | null
}

export interface BandwidthStats {
  currentDownMbps: number
  currentUpMbps: number
  peakDownMbps: number
  peakUpMbps: number
  avgDownMbps: number
  avgUpMbps: number
  totalDownGB: number
  totalUpGB: number
  history: { time: string; down: number; up: number }[]
}

export interface ConnectionQuality {
  httpLatencyMs: number | null
  dnsResponseMs: number | null
  jitterMs: number | null
  failedRequestPercent: number | null // proxy for "packet loss" — see UI copy
  stabilityScore: number // 0-100, derived
  healthScore: number // 0-100, derived
  samples: number[] // recent raw latency samples, for the jitter calc
}

export type SpeedTestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'done' | 'error'

export interface SpeedTestResult {
  id: string
  timestamp: string
  pingMs: number
  downloadMbps: number
  uploadMbps: number
  jitterMs: number
}

export interface SpeedTestState {
  phase: SpeedTestPhase
  progressPercent: number
  currentResult: Partial<SpeedTestResult> | null
  history: SpeedTestResult[]
  error: string | null
}

export interface RegionLatency {
  id: string
  label: string
  angle: number // degrees, position around the radial map
  latencyMs: number | null
  status: 'online' | 'offline' | 'checking'
}

export type NetworkEventCategory = 'connection' | 'dns' | 'latency' | 'packetloss' | 'speedtest' | 'vpn'
export type NetworkEventSeverity = 'info' | 'warning' | 'critical'

export interface NetworkEvent {
  id: string
  timestamp: string
  category: NetworkEventCategory
  severity: NetworkEventSeverity
  message: string
}

export type ServiceStatusState = 'online' | 'offline' | 'checking'

export interface ServiceStatus {
  id: string
  name: string
  url: string
  status: ServiceStatusState
  responseMs: number | null
  lastChecked: string | null
}

export interface NetworkHistoryTotals {
  highestDownMbps: number
  highestUpMbps: number
  avgLatencyMs: number | null
  worstFailedRequestPercent: number
  totalTransferredGB: number
  sessionStart: string
}

export type { TimeSeriesPoint }

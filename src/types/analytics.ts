export interface AnalyticsSample {
  t: number
  cpu: number
  ram: number
  disk: number
  network: number
  security: number
  health: number
  temperature: number | null
}

export type TimeRange = '1h' | '24h' | '7d' | '30d'

export const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

export interface Kpi {
  id: string
  label: string
  value: number
  previousValue: number | null
  isReal: boolean
}

export type TrendDirection = 'up' | 'down' | 'stable'

export interface MetricTrend {
  metric: string
  label: string
  direction: TrendDirection
  confidencePercent: number
  explanation: string
}

export interface Correlation {
  id: string
  labelA: string
  labelB: string
  coefficient: number
  points: { x: number; y: number }[]
  available: boolean
  unavailableReason?: string
}

export type TimelineEventKind = 'cpuPeak' | 'ramPeak' | 'security' | 'alert' | 'network' | 'snapshot' | 'maintenance'

export interface TimelineEvent {
  id: string
  timestamp: string
  epoch: number
  kind: TimelineEventKind
  label: string
}

export interface AiAnalyticsSummary {
  id: string
  text: string
}

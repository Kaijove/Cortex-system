import type { AnalyticsSample, TimeRange, TrendDirection } from '@/types/analytics'
import { TIME_RANGE_MS } from '@/types/analytics'

export function filterByRange(history: AnalyticsSample[], range: TimeRange): AnalyticsSample[] {
  const cutoff = Date.now() - TIME_RANGE_MS[range]
  return history.filter((s) => s.t >= cutoff)
}

export function describeAvailability(history: AnalyticsSample[], range: TimeRange): string {
  if (history.length < 2) return 'Encara no hi ha prou historial recollit.'
  const spanMs = history[history.length - 1].t - history[0].t
  const requestedMs = TIME_RANGE_MS[range]
  if (spanMs >= requestedMs) return 'Període complet amb dades reals.'
  const hours = spanMs / 3_600_000
  const label = hours < 1 ? `${Math.round(spanMs / 60_000)} min` : hours < 48 ? `${hours.toFixed(1)} h` : `${(hours / 24).toFixed(1)} d`
  return `Només hi ha ${label} de dades reals recollides fins ara — la resta del període encara no s'ha registrat.`
}

export function pearsonCorrelation(pairs: { x: number; y: number }[]): number {
  const n = pairs.length
  if (n < 3) return 0
  const meanX = pairs.reduce((s, p) => s + p.x, 0) / n
  const meanY = pairs.reduce((s, p) => s + p.y, 0) / n
  let num = 0
  let denX = 0
  let denY = 0
  for (const p of pairs) {
    num += (p.x - meanX) * (p.y - meanY)
    denX += (p.x - meanX) ** 2
    denY += (p.y - meanY) ** 2
  }
  const den = Math.sqrt(denX * denY)
  return den === 0 ? 0 : num / den
}

export function linearTrend(values: number[]): { slope: number; r2: number } {
  const n = values.length
  if (n < 4) return { slope: 0, r2: 0 }
  const xs = values.map((_, i) => i)
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = values.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    const predicted = slope * xs[i] + intercept
    ssRes += (values[i] - predicted) ** 2
    ssTot += (values[i] - meanY) ** 2
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot)
  return { slope, r2 }
}

export function trendDirection(slope: number, threshold = 0.02): TrendDirection {
  if (slope > threshold) return 'up'
  if (slope < -threshold) return 'down'
  return 'stable'
}

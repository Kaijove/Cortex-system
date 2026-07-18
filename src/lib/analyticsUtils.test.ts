import { describe, expect, it } from 'vitest'
import { filterByRange, linearTrend, pearsonCorrelation, trendDirection } from './analyticsUtils'
import type { AnalyticsSample } from '@/types/analytics'

describe('pearsonCorrelation', () => {
  it('returns 0 for fewer than 3 points (not enough data to mean anything)', () => {
    expect(pearsonCorrelation([{ x: 1, y: 1 }, { x: 2, y: 2 }])).toBe(0)
  })

  it('returns ~1 for a perfect positive linear relationship', () => {
    const pairs = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }, { x: 4, y: 8 }]
    expect(pearsonCorrelation(pairs)).toBeCloseTo(1, 5)
  })

  it('returns ~-1 for a perfect negative linear relationship', () => {
    const pairs = [{ x: 1, y: 8 }, { x: 2, y: 6 }, { x: 3, y: 4 }, { x: 4, y: 2 }]
    expect(pearsonCorrelation(pairs)).toBeCloseTo(-1, 5)
  })

  it('returns ~0 for constant data (no division-by-zero crash)', () => {
    const pairs = [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }]
    expect(pearsonCorrelation(pairs)).toBe(0)
  })
})

describe('linearTrend + trendDirection', () => {
  it('reports zero slope/confidence for fewer than 4 samples', () => {
    expect(linearTrend([1, 2, 3])).toEqual({ slope: 0, r2: 0 })
  })

  it('detects an upward trend', () => {
    const { slope } = linearTrend([10, 20, 30, 40, 50])
    expect(trendDirection(slope)).toBe('up')
  })

  it('detects a downward trend', () => {
    const { slope } = linearTrend([50, 40, 30, 20, 10])
    expect(trendDirection(slope)).toBe('down')
  })

  it('detects a stable/flat trend', () => {
    const { slope } = linearTrend([20, 20.1, 19.9, 20, 20.05])
    expect(trendDirection(slope)).toBe('stable')
  })

  it('r2 stays within [0,1] and is high for a near-linear series', () => {
    const { r2 } = linearTrend([10, 22, 28, 41, 49, 61])
    expect(r2).toBeLessThanOrEqual(1)
    expect(r2).toBeGreaterThan(0.9)
  })
})

describe('filterByRange', () => {
  function sample(minutesAgo: number): AnalyticsSample {
    return { t: Date.now() - minutesAgo * 60_000, cpu: 0, ram: 0, disk: 0, network: 0, security: 0, health: 0, temperature: null }
  }

  it('excludes samples older than the requested range', () => {
    const history = [sample(200), sample(90), sample(30), sample(5)]
    expect(filterByRange(history, '1h')).toHaveLength(2)
  })

  it('returns everything when the whole history fits the range', () => {
    const history = [sample(10), sample(5), sample(1)]
    expect(filterByRange(history, '24h')).toHaveLength(3)
  })
})

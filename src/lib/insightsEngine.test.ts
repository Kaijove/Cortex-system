import { describe, expect, it } from 'vitest'
import { computeHealthScore, computeInsights } from './insightsEngine'
import { createInitialCpuStats, createInitialDiskStats, createInitialNetworkStats, createInitialRamStats } from './mockData'
import type { CpuStats, DiskStats, NetworkStats, RamStats } from '@/types/system'

function baseline() {
  return {
    cpu: { ...createInitialCpuStats(4), usage: 20, temperatureC: 45 } satisfies CpuStats,
    ram: { ...createInitialRamStats(16), usedGB: 4, totalGB: 16, availableGB: 12, pressure: 'normal' } satisfies RamStats,
    disk: createInitialDiskStats() satisfies DiskStats,
    network: { ...createInitialNetworkStats(), quality: 'excellent' } satisfies NetworkStats,
  }
}

describe('computeHealthScore', () => {
  it('scores a healthy system in the "excellent" or "good" range', () => {
    const { cpu, ram, disk, network } = baseline()
    const result = computeHealthScore(cpu, ram, disk, network)
    expect(result.value).toBeGreaterThanOrEqual(75)
    expect(['excellent', 'good']).toContain(result.status)
  })

  it('penalizes high CPU usage', () => {
    const { cpu, ram, disk, network } = baseline()
    const healthy = computeHealthScore(cpu, ram, disk, network)
    const stressed = computeHealthScore({ ...cpu, usage: 98 }, ram, disk, network)
    expect(stressed.value).toBeLessThan(healthy.value)
  })

  it('drops to "critical" when everything is maxed out', () => {
    const { disk, network } = baseline()
    const cpu = { ...createInitialCpuStats(4), usage: 100, temperatureC: 95 } satisfies CpuStats
    const ram = { ...createInitialRamStats(16), usedGB: 16, totalGB: 16, availableGB: 0, pressure: 'high' } satisfies RamStats
    const result = computeHealthScore(cpu, ram, disk, { ...network, quality: 'poor' })
    expect(result.status).toBe('critical')
  })

  it('treats a missing temperature sensor as neutral, not as a fabricated bad score', () => {
    const { cpu, ram, disk, network } = baseline()
    const withSensor = computeHealthScore({ ...cpu, temperatureC: 45 }, ram, disk, network)
    const withoutSensor = computeHealthScore({ ...cpu, temperatureC: null }, ram, disk, network)
    expect(withoutSensor.value).toBeGreaterThan(withSensor.value - 10)
  })
})

describe('computeInsights', () => {
  it('reports "all good" when nothing crosses a threshold', () => {
    const { cpu, ram, disk, network } = baseline()
    const insights = computeInsights(cpu, ram, disk, network, [])
    expect(insights).toHaveLength(1)
    expect(insights[0].severity).toBe('good')
  })

  it('flags high CPU usage as a warning', () => {
    const { cpu, ram, disk, network } = baseline()
    const insights = computeInsights({ ...cpu, usage: 90 }, ram, disk, network, [])
    expect(insights.some((i) => i.category === 'cpu' && i.severity === 'warning')).toBe(true)
  })

  it('flags high memory pressure as critical', () => {
    const { cpu, ram, disk, network } = baseline()
    const insights = computeInsights(cpu, { ...ram, pressure: 'high' }, disk, network, [])
    expect(insights.some((i) => i.category === 'ram' && i.severity === 'critical')).toBe(true)
  })

  it('flags a nearly-full partition as critical', () => {
    const { cpu, ram, network } = baseline()
    const disk: DiskStats = {
      ...createInitialDiskStats(),
      partitions: [{ id: 'root', mountPoint: '/', totalGB: 100, usedGB: 96, filesystem: 'ext4' }],
    }
    const insights = computeInsights(cpu, ram, disk, network, [])
    expect(insights.some((i) => i.category === 'disk' && i.severity === 'critical')).toBe(true)
  })

  it('never reports more than 6 insights at once (UI cap)', () => {
    const cpu: CpuStats = { ...createInitialCpuStats(4), usage: 99, temperatureC: 95 }
    const ram: RamStats = { ...createInitialRamStats(16), usedGB: 16, totalGB: 16, availableGB: 0, pressure: 'high' }
    const disk: DiskStats = {
      partitions: [
        { id: 'a', mountPoint: '/', totalGB: 10, usedGB: 9.9, filesystem: 'ext4' },
        { id: 'b', mountPoint: '/home', totalGB: 10, usedGB: 9.9, filesystem: 'ext4' },
      ],
      readSpeedMBs: 10,
      writeSpeedMBs: 999,
      healthPercent: null,
      temperatureC: null,
      history: [],
    }
    const network: NetworkStats = { ...createInitialNetworkStats(), quality: 'poor', latencyMs: 500 }
    const insights = computeInsights(cpu, ram, disk, network, [])
    expect(insights.length).toBeLessThanOrEqual(6)
  })
})

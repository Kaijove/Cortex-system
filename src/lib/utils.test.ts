import { describe, expect, it } from 'vitest'
import { clamp, formatDataAuto, formatGB, formatThroughputAuto, formatUptime } from './utils'

describe('formatUptime', () => {
  it('formats minutes only when under an hour', () => {
    expect(formatUptime(125)).toBe('2m')
  })
  it('includes hours once past 3600s', () => {
    expect(formatUptime(3725)).toBe('1h 2m')
  })
  it('includes days once past 86400s', () => {
    expect(formatUptime(90061)).toBe('1d 1h 1m')
  })
  it('shows 0h between a day boundary and the next hour', () => {
    expect(formatUptime(86460)).toBe('1d 0h 1m')
  })
})

describe('formatGB', () => {
  it('defaults to one decimal', () => {
    expect(formatGB(4.567)).toBe('4.6 GB')
  })
  it('respects a custom decimal count', () => {
    expect(formatGB(4.567, 0)).toBe('5 GB')
  })
})

describe('formatThroughputAuto', () => {
  it('uses Kbps under 1 Mbps', () => {
    expect(formatThroughputAuto(0.5)).toBe('500 Kbps')
  })
  it('uses Mbps for normal values', () => {
    expect(formatThroughputAuto(42.3)).toBe('42.3 Mbps')
  })
  it('uses Gbps at or above 1000 Mbps', () => {
    expect(formatThroughputAuto(1500)).toBe('1.50 Gbps')
  })
})

describe('formatDataAuto', () => {
  it('uses MB under 1 GB', () => {
    expect(formatDataAuto(0.25)).toBe('250 MB')
  })
  it('uses GB at or above 1', () => {
    expect(formatDataAuto(2.5)).toBe('2.50 GB')
  })
})

describe('clamp', () => {
  it('passes values already in range through unchanged', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('clamps below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })
  it('clamps above the maximum', () => {
    expect(clamp(99, 0, 10)).toBe(10)
  })
})

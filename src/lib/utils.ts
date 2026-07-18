import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely, resolving conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format seconds into a "Xd Yh Zm" style uptime string. */
export function formatUptime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  return parts.join(' ')
}

/** Format bytes-like GB values with a fixed number of decimals. */
export function formatGB(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} GB`
}

export function formatMbps(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} Mbps`
}

/** Auto-switches between Kbps/Mbps/Gbps depending on magnitude. */
export function formatThroughputAuto(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`
  if (mbps < 1) return `${(mbps * 1000).toFixed(0)} Kbps`
  return `${mbps.toFixed(1)} Mbps`
}

export function formatDataAuto(gb: number): string {
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  return `${(gb * 1000).toFixed(0)} MB`
}

/** Returns a HH:mm:ss label for the current time, used as x-axis ticks. */
export function nowLabel(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

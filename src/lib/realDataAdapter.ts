import type { CpuStats, DiskStats, NetworkStats, ProcessInfo, RamStats, SystemInfo } from '@/types/system'
import type { RealSnapshot } from './realSystemApi'
import { clamp, nowLabel } from './utils'

const HISTORY_LENGTH = 60

function pushHistory<T extends { time: string }>(history: T[], point: T): T[] {
  const next = [...history, point]
  return next.length > HISTORY_LENGTH ? next.slice(next.length - HISTORY_LENGTH) : next
}

const bytesToMB = (b: number) => b / (1024 * 1024)
const bytesToMbps = (bytesPerTick: number, tickMs: number) => (bytesPerTick * 8) / 1_000_000 / (tickMs / 1000)

function formatRuntime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function mapRealCpu(snap: RealSnapshot, prev: CpuStats, tickMs: number): CpuStats {
  const cores = snap.cpu.cores.map((c) => ({
    id: c.id,
    usage: c.usage,
    clockSpeedGHz: c.clockSpeedGhz,
    temperatureC: null, // per-core sensors aren't reliably mappable; overall temp is reported instead
  }))
  const usage = snap.cpu.usage
  void tickMs
  return {
    usage,
    cores,
    temperatureC: snap.cpu.temperatureC,
    clockSpeedGHz: cores.length ? cores.reduce((s, c) => s + c.clockSpeedGHz, 0) / cores.length : 0,
    threads: snap.cpu.threads,
    processes: snap.processes.length,
    history: pushHistory(prev.history, { time: nowLabel(), value: usage }),
    peakUsage: Math.max(prev.peakUsage, usage),
    averageUsage: prev.averageUsage * 0.95 + usage * 0.05,
  }
}

export function mapRealRam(snap: RealSnapshot, prev: RamStats): RamStats {
  const { totalGb, usedGb, availableGb, swapTotalGb, swapUsedGb } = snap.ram
  const ratio = totalGb > 0 ? usedGb / totalGb : 0
  const pressure: RamStats['pressure'] = ratio > 0.85 ? 'high' : ratio > 0.65 ? 'moderate' : 'normal'
  return {
    totalGB: totalGb,
    usedGB: usedGb,
    // sysinfo doesn't split out page-cache size cross-platform; approximate as total-used-available
    cachedGB: clamp(totalGb - usedGb - availableGb, 0, totalGb),
    availableGB: availableGb,
    swapTotalGB: swapTotalGb,
    swapUsedGB: swapUsedGb,
    pressure,
    history: pushHistory(prev.history, { time: nowLabel(), value: ratio * 100 }),
  }
}

export function mapRealDisk(snap: RealSnapshot, prev: DiskStats, tickMs: number): DiskStats {
  const readSpeedMBs = bytesToMB(snap.diskIo.readBytesDelta) / (tickMs / 1000)
  const writeSpeedMBs = bytesToMB(snap.diskIo.writeBytesDelta) / (tickMs / 1000)
  return {
    partitions: snap.disk.partitions.map((p) => ({
      id: p.id,
      mountPoint: p.mountPoint,
      totalGB: p.totalGb,
      usedGB: p.usedGb,
      filesystem: p.filesystem,
    })),
    readSpeedMBs,
    writeSpeedMBs,
    healthPercent: null, // S.M.A.R.T. health isn't exposed by sysinfo
    temperatureC: null,
    history: pushHistory(prev.history, { time: nowLabel(), value: readSpeedMBs + writeSpeedMBs }),
  }
}

export function mapRealNetwork(snap: RealSnapshot, prev: NetworkStats, tickMs: number): NetworkStats {
  const totals = snap.network.interfaces.reduce(
    (acc, i) => ({
      up: acc.up + i.uploadBytesDelta,
      down: acc.down + i.downloadBytesDelta,
    }),
    { up: 0, down: 0 },
  )
  const uploadMbps = bytesToMbps(totals.up, tickMs)
  const downloadMbps = bytesToMbps(totals.down, tickMs)
  return {
    uploadMbps,
    downloadMbps,
    latencyMs: null,
    packetLossPercent: null,
    publicIp: null,
    privateIp: null,
    isp: null,
    dns: null,
    location: null,
    quality: null,
    history: pushHistory(prev.history, { time: nowLabel(), upload: uploadMbps, download: downloadMbps }),
  }
}

export function mapRealProcesses(snap: RealSnapshot): ProcessInfo[] {
  return snap.processes.map((p) => ({
    pid: p.pid,
    name: p.name,
    cpu: p.cpu,
    ram: p.ramMb,
    threads: null, // not exposed per-process cross-platform by sysinfo 0.30
    status: (['running', 'sleeping', 'stopped', 'zombie'].includes(p.status) ? p.status : 'sleeping') as ProcessInfo['status'],
    owner: p.owner,
    priority: null,
    runtime: formatRuntime(p.runTimeSeconds),
  }))
}

export function mapRealSystemInfo(snap: RealSnapshot, timezone: string): SystemInfo {
  return {
    hostname: snap.systemInfo.hostname,
    os: snap.systemInfo.os,
    kernel: snap.systemInfo.kernel,
    user: snap.processes[0]?.owner ?? 'user',
    uptimeSeconds: snap.systemInfo.uptimeSeconds,
    timezone,
  }
}

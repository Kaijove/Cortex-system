import type {
  CpuStats,
  DiskStats,
  GpuStats,
  LogEntry,
  LogSeverity,
  NetworkStats,
  ProcessInfo,
  RamStats,
  SystemInfo,
  TimeSeriesPoint,
} from '@/types/system'
import { clamp, nowLabel } from './utils'

const HISTORY_LENGTH = 60 // 60 rolling seconds, matches spec

/** Random walk helper: moves `current` towards a jittered target, clamped. */
function randomWalk(current: number, volatility: number, min = 0, max = 100): number {
  const delta = (Math.random() - 0.5) * volatility
  return clamp(current + delta, min, max)
}

function pushHistory(history: TimeSeriesPoint[], value: number): TimeSeriesPoint[] {
  const next = [...history, { time: nowLabel(), value }]
  return next.length > HISTORY_LENGTH ? next.slice(next.length - HISTORY_LENGTH) : next
}

export function createInitialCpuStats(coreCount = 8): CpuStats {
  const cores = Array.from({ length: coreCount }, (_, id) => ({
    id,
    usage: 10 + Math.random() * 30,
    clockSpeedGHz: 3.2 + Math.random() * 0.8,
    temperatureC: 40 + Math.random() * 10,
  }))
  const usage = cores.reduce((sum, c) => sum + c.usage, 0) / cores.length
  return {
    usage,
    cores,
    temperatureC: 45,
    clockSpeedGHz: 3.6,
    threads: coreCount * 2,
    processes: 210,
    history: [],
    peakUsage: usage,
    averageUsage: usage,
  }
}

export function stepCpuStats(prev: CpuStats): CpuStats {
  const cores = prev.cores.map((core) => ({
    ...core,
    usage: randomWalk(core.usage, 18),
    clockSpeedGHz: clamp(randomWalk(core.clockSpeedGHz, 0.3, 1.2, 5.0), 1.2, 5.0),
    temperatureC: clamp(randomWalk(core.temperatureC ?? 50, 2, 30, 90), 30, 90),
  }))
  const usage = cores.reduce((sum, c) => sum + c.usage, 0) / cores.length
  const temperatureC = cores.reduce((sum, c) => sum + (c.temperatureC ?? 0), 0) / cores.length
  const history = pushHistory(prev.history, usage)
  return {
    ...prev,
    cores,
    usage,
    temperatureC,
    clockSpeedGHz: cores.reduce((sum, c) => sum + c.clockSpeedGHz, 0) / cores.length,
    processes: clamp(Math.round(randomWalk(prev.processes, 6, 120, 400)), 120, 400),
    history,
    peakUsage: Math.max(prev.peakUsage, usage),
    averageUsage: (prev.averageUsage * 0.95 + usage * 0.05),
  }
}

export function createInitialRamStats(totalGB = 32): RamStats {
  const usedGB = totalGB * 0.4
  return {
    totalGB,
    usedGB,
    cachedGB: totalGB * 0.15,
    availableGB: totalGB - usedGB,
    swapTotalGB: 8,
    swapUsedGB: 0.5,
    pressure: 'normal',
    history: [],
  }
}

export function stepRamStats(prev: RamStats): RamStats {
  const usedGB = clamp(randomWalk(prev.usedGB, 1.2, prev.totalGB * 0.2, prev.totalGB * 0.92), 0, prev.totalGB)
  const cachedGB = clamp(randomWalk(prev.cachedGB, 0.5, prev.totalGB * 0.05, prev.totalGB * 0.25), 0, prev.totalGB)
  const availableGB = clamp(prev.totalGB - usedGB, 0, prev.totalGB)
  const usageRatio = usedGB / prev.totalGB
  const pressure: RamStats['pressure'] = usageRatio > 0.85 ? 'high' : usageRatio > 0.65 ? 'moderate' : 'normal'
  return {
    ...prev,
    usedGB,
    cachedGB,
    availableGB,
    swapUsedGB: clamp(randomWalk(prev.swapUsedGB, 0.2, 0, prev.swapTotalGB), 0, prev.swapTotalGB),
    pressure,
    history: pushHistory(prev.history, (usedGB / prev.totalGB) * 100),
  }
}

export function createInitialDiskStats(): DiskStats {
  return {
    partitions: [
      { id: 'root', mountPoint: '/', totalGB: 512, usedGB: 289, filesystem: 'ext4' },
      { id: 'home', mountPoint: '/home', totalGB: 1024, usedGB: 402, filesystem: 'ext4' },
      { id: 'boot', mountPoint: '/boot', totalGB: 1, usedGB: 0.3, filesystem: 'vfat' },
    ],
    readSpeedMBs: 120,
    writeSpeedMBs: 80,
    healthPercent: 97,
    temperatureC: 38,
    history: [],
  }
}

export function stepDiskStats(prev: DiskStats): DiskStats {
  const readSpeedMBs = clamp(randomWalk(prev.readSpeedMBs, 40, 0, 550), 0, 550)
  const writeSpeedMBs = clamp(randomWalk(prev.writeSpeedMBs, 30, 0, 400), 0, 400)
  return {
    ...prev,
    readSpeedMBs,
    writeSpeedMBs,
    temperatureC: clamp(randomWalk(prev.temperatureC ?? 38, 1, 28, 55), 28, 55),
    history: pushHistory(prev.history, readSpeedMBs + writeSpeedMBs),
  }
}

export function createInitialNetworkStats(): NetworkStats {
  return {
    uploadMbps: 5,
    downloadMbps: 40,
    latencyMs: 18,
    packetLossPercent: 0,
    publicIp: '203.0.113.42',
    privateIp: '192.168.1.24',
    isp: 'Fibra Simulada S.A.',
    dns: '1.1.1.1',
    location: 'Girona, Catalunya',
    quality: 'excellent',
    history: [],
  }
}

export function stepNetworkStats(prev: NetworkStats): NetworkStats {
  const uploadMbps = clamp(randomWalk(prev.uploadMbps, 6, 0, 200), 0, 200)
  const downloadMbps = clamp(randomWalk(prev.downloadMbps, 25, 0, 900), 0, 900)
  const latencyMs = clamp(randomWalk(prev.latencyMs ?? 18, 4, 5, 200), 5, 200)
  const packetLossPercent = clamp(randomWalk(prev.packetLossPercent ?? 0, 0.3, 0, 5), 0, 5)
  const quality: NetworkStats['quality'] =
    latencyMs < 30 && packetLossPercent < 0.5 ? 'excellent' : latencyMs < 80 ? 'good' : latencyMs < 150 ? 'fair' : 'poor'
  const history = [...prev.history, { time: nowLabel(), upload: uploadMbps, download: downloadMbps }]
  return {
    ...prev,
    uploadMbps,
    downloadMbps,
    latencyMs,
    packetLossPercent,
    quality,
    history: history.length > HISTORY_LENGTH ? history.slice(history.length - HISTORY_LENGTH) : history,
  }
}

const PROCESS_NAMES = [
  'chrome', 'code', 'node', 'systemd', 'dockerd', 'sshd', 'nginx', 'postgres',
  'firefox', 'spotify', 'kernel_task', 'WindowServer', 'Xorg', 'bash', 'python3',
  'containerd', 'gnome-shell', 'kwin_x11', 'pulseaudio', 'NetworkManager',
]

export function createMockProcesses(count = 40): ProcessInfo[] {
  return Array.from({ length: count }, (_, i) => {
    const name = PROCESS_NAMES[i % PROCESS_NAMES.length]
    return {
      pid: 1000 + i * 7,
      name: i < PROCESS_NAMES.length ? name : `${name}${i}`,
      cpu: Math.random() * 25,
      ram: Math.random() * 2000,
      threads: 1 + Math.floor(Math.random() * 24),
      status: (['running', 'sleeping', 'sleeping', 'sleeping', 'stopped'] as const)[
        Math.floor(Math.random() * 5)
      ],
      owner: Math.random() > 0.8 ? 'root' : 'kai',
      priority: Math.floor(Math.random() * 20) - 10,
      runtime: `${String(Math.floor(Math.random() * 5)).padStart(2, '0')}:${String(
        Math.floor(Math.random() * 60),
      ).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    }
  })
}

export function stepProcesses(prev: ProcessInfo[]): ProcessInfo[] {
  return prev.map((p) => ({
    ...p,
    cpu: clamp(randomWalk(p.cpu, 4, 0, 100), 0, 100),
    ram: clamp(randomWalk(p.ram, 40, 10, 4000), 10, 4000),
  }))
}

export function createMockSystemInfo(): SystemInfo {
  return {
    hostname: 'kai-workstation',
    os: 'Arch Linux',
    kernel: '6.9.4-arch1-1',
    user: 'kai',
    uptimeSeconds: 3 * 3600 + 42 * 60,
    timezone: 'Europe/Madrid',
  }
}

export function createInitialGpuStats(): GpuStats {
  return {
    name: 'NVIDIA RTX 4070',
    usagePercent: 15,
    temperatureC: 42,
    vramUsedGB: 2.1,
    vramTotalGB: 12,
    fanRpm: 900,
    powerDrawW: 45,
  }
}

export function stepGpuStats(prev: GpuStats): GpuStats {
  const usagePercent = clamp(randomWalk(prev.usagePercent, 15), 0, 100)
  return {
    ...prev,
    usagePercent,
    temperatureC: clamp(randomWalk(prev.temperatureC, 2, 30, 90), 30, 90),
    vramUsedGB: clamp(randomWalk(prev.vramUsedGB, 0.4, 0.5, prev.vramTotalGB * 0.95), 0, prev.vramTotalGB),
    fanRpm: clamp(randomWalk(prev.fanRpm, 80, 600, 2800), 600, 2800),
    powerDrawW: clamp(randomWalk(prev.powerDrawW, 8, 20, 220), 20, 220),
  }
}

const LOG_TEMPLATES: Array<{ severity: LogSeverity; messages: string[] }> = [
  {
    severity: 'INFO',
    messages: [
      'Servei network-manager reiniciat correctament',
      'Nova connexió SSH des de 192.168.1.14',
      'Sincronització de rellotge NTP completada',
      'Actualització de paquets disponible (12 paquets)',
      "S'ha muntat el dispositiu /dev/sdb1",
    ],
  },
  {
    severity: 'SUCCESS',
    messages: [
      'Backup automàtic completat sense errors',
      'Contenidor docker "api-gateway" iniciat',
      'Certificat TLS renovat correctament',
      'Compilació finalitzada en 4.2s',
    ],
  },
  {
    severity: 'WARN',
    messages: [
      'Ús de memòria per sobre del 80%',
      'Latència de xarxa elevada detectada',
      'Espai en disc per sota del 15% a /home',
      'Reintent de connexió a la base de dades (2/5)',
    ],
  },
  {
    severity: 'ERROR',
    messages: [
      'No s\'ha pogut resoldre el host api.example.com',
      'Procés "worker-3" finalitzat inesperadament (exit code 1)',
      'Fallada d\'autenticació SSH des de 45.33.12.9',
      'Timeout en connectar amb el servei de correu',
    ],
  },
  {
    severity: 'DEBUG',
    messages: [
      'Cache invalidada per a la clau "user:1042"',
      'GC executat: 340MB alliberats',
      "Petició HTTP GET /api/status -> 200 (14ms)",
      'Watchdog: heartbeat rebut de tots els serveis',
    ],
  },
]

let logIdCounter = 0

export function generateLogEntry(): LogEntry {
  const group = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
  const message = group.messages[Math.floor(Math.random() * group.messages.length)]
  return {
    id: logIdCounter++,
    timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    severity: group.severity,
    message,
  }
}

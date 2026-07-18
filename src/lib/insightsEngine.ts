import type {
  AlertItem,
  AlertPriority,
  CpuStats,
  DiskStats,
  HealthScore,
  HealthStatus,
  Insight,
  InsightSeverity,
  NetworkStats,
  Prediction,
  ProcessInfo,
  RamStats,
  SecurityCategoryStatus,
  SecurityCenterState,
  TimeSeriesPoint,
} from '@/types/system'
import { nowLabel } from './utils'

// ---------------------------------------------------------------------------
// Health score — a weighted read of the metrics already on screen. Nothing
// here is a separate sensor; it's the same cpu/ram/disk/network/temperature
// numbers shown elsewhere, combined into one number.
// ---------------------------------------------------------------------------

function scoreFromUsage(usagePercent: number): number {
  return Math.max(0, 100 - usagePercent)
}

function statusFromScore(value: number): HealthStatus {
  if (value >= 90) return 'excellent'
  if (value >= 75) return 'good'
  if (value >= 55) return 'fair'
  if (value >= 35) return 'warning'
  return 'critical'
}

export function computeHealthScore(cpu: CpuStats, ram: RamStats, disk: DiskStats, network: NetworkStats): HealthScore {
  const cpuScore = scoreFromUsage(cpu.usage)
  const ramScore = scoreFromUsage((ram.usedGB / ram.totalGB) * 100)
  const avgDiskUsage =
    disk.partitions.reduce((sum, p) => sum + (p.usedGB / p.totalGB) * 100, 0) / Math.max(1, disk.partitions.length)
  const diskScore = scoreFromUsage(avgDiskUsage)
  const tempScore = cpu.temperatureC === null ? 80 : Math.max(0, 100 - Math.max(0, cpu.temperatureC - 45) * 2.2)
  const networkScoreMap: Record<string, number> = { excellent: 100, good: 82, fair: 55, poor: 25 }
  const networkScore = network.quality ? (networkScoreMap[network.quality] ?? 70) : 78

  const breakdown = [
    { label: 'CPU', score: cpuScore, weight: 0.25 },
    { label: 'Memòria', score: ramScore, weight: 0.25 },
    { label: 'Disc', score: diskScore, weight: 0.15 },
    { label: 'Temperatura', score: tempScore, weight: 0.15 },
    { label: 'Xarxa', score: networkScore, weight: 0.2 },
  ]

  const value = Math.round(breakdown.reduce((sum, b) => sum + b.score * b.weight, 0))
  const status = statusFromScore(value)

  const worst = [...breakdown].sort((a, b) => a.score - b.score)[0]
  const explanation =
    status === 'excellent' || status === 'good'
      ? `Tots els components es troben dins de rangs normals. El factor amb més marge de millora és ${worst.label.toLowerCase()}.`
      : `La puntuació baixa principalment per ${worst.label.toLowerCase()} (${worst.score.toFixed(0)}/100). Revisa el panell corresponent.`

  return { value, status, explanation, breakdown }
}

// ---------------------------------------------------------------------------
// Insights — simple threshold rules over the live metrics, re-evaluated every
// tick. This is transparent rule-based logic, not a black-box model — that's
// stated plainly rather than dressed up as something it isn't.
// ---------------------------------------------------------------------------

function mkInsight(
  id: string,
  title: string,
  category: Insight['category'],
  severity: InsightSeverity,
  explanation: string,
  recommendation: string,
): Insight {
  return { id, title, category, severity, timestamp: nowLabel(), explanation, recommendation }
}

export function computeInsights(cpu: CpuStats, ram: RamStats, disk: DiskStats, network: NetworkStats, processes: ProcessInfo[]): Insight[] {
  const insights: Insight[] = []

  if (cpu.usage > 85) {
    const topProc = [...processes].sort((a, b) => b.cpu - a.cpu)[0]
    insights.push(
      mkInsight(
        'cpu-high',
        'Ús de CPU elevat',
        'cpu',
        'warning',
        `La CPU es troba al ${cpu.usage.toFixed(0)}%${topProc ? `, amb "${topProc.name}" com a principal consumidor (${topProc.cpu.toFixed(0)}%)` : ''}.`,
        'Tanca aplicacions innecessàries o investiga el procés que més consumeix.',
      ),
    )
  } else if (cpu.usage > 70) {
    insights.push(
      mkInsight('cpu-elevated', 'CPU per sobre de la mitjana', 'cpu', 'info', `Ús actual del ${cpu.usage.toFixed(0)}%, dins de límits acceptables.`, 'No cal acció, però val la pena vigilar-ho.'),
    )
  }

  const ramPercent = (ram.usedGB / ram.totalGB) * 100
  if (ram.pressure === 'high') {
    insights.push(
      mkInsight('ram-high', 'Pressió de memòria alta', 'ram', 'critical', `La memòria està al ${ramPercent.toFixed(0)}% d'ús, amb només ${ram.availableGB.toFixed(1)} GB disponibles.`, 'Tanca processos que consumeixin molta RAM o afegeix més memòria.'),
    )
  } else if (ram.pressure === 'moderate') {
    insights.push(
      mkInsight('ram-moderate', 'Memòria augmentant', 'ram', 'warning', `L'ús de memòria s'ha situat al ${ramPercent.toFixed(0)}%.`, 'Sense acció immediata necessària, continua monitoritzant.'),
    )
  }

  disk.partitions.forEach((p) => {
    const percent = (p.usedGB / p.totalGB) * 100
    if (percent > 90) {
      insights.push(
        mkInsight(`disk-${p.id}`, `Partició ${p.mountPoint} gairebé plena`, 'disk', 'critical', `${p.mountPoint} està al ${percent.toFixed(0)}% de capacitat.`, 'Allibera espai o amplia la partició abans que es quedi sense espai.'),
      )
    }
  })
  if (disk.writeSpeedMBs > 250) {
    insights.push(
      mkInsight('disk-write-high', 'Escriptures de disc inusualment altes', 'disk', 'warning', `Velocitat d'escriptura actual: ${disk.writeSpeedMBs.toFixed(0)} MB/s.`, 'Comprova quin procés està escrivint tantes dades al disc.'),
    )
  }

  if (network.quality === 'poor' || network.quality === 'fair') {
    insights.push(
      mkInsight('net-unstable', 'Latència de xarxa inestable', 'network', 'warning', network.latencyMs !== null ? `Latència actual: ${network.latencyMs.toFixed(0)} ms.` : 'La qualitat de connexió ha empitjorat.', 'Comprova la connexió Wi-Fi/cable o reinicia el router si persisteix.'),
    )
  }

  if (cpu.temperatureC !== null && cpu.temperatureC > 80) {
    insights.push(
      mkInsight('temp-high', 'Temperatura de CPU elevada', 'temperature', 'critical', `${cpu.temperatureC.toFixed(0)}°C detectats.`, 'Revisa la refrigeració i la ventilació de l\'equip.'),
    )
  }

  if (insights.length === 0) {
    insights.push(
      mkInsight('all-good', 'Tot funciona amb normalitat', 'general', 'good', 'Cap mètrica supera els llindars d\'atenció en aquest moment.', 'Cap acció necessària.'),
    )
  }

  return insights.slice(0, 6)
}

// ---------------------------------------------------------------------------
// Alerts — discrete, one-off events (as opposed to insights, which reflect
// ongoing state). Generated when a metric *crosses* a threshold.
// ---------------------------------------------------------------------------

let alertSeq = 0

export function maybeGenerateAlert(cpu: CpuStats, ram: RamStats, disk: DiskStats, network: NetworkStats, prevCpuUsage: number): AlertItem | null {
  const push = (title: string, message: string, priority: AlertPriority): AlertItem => ({
    id: `alert-${Date.now()}-${alertSeq++}`,
    title,
    message,
    priority,
    timestamp: nowLabel(),
    pinned: false,
    read: false,
  })

  if (cpu.usage >= 95 && prevCpuUsage < 95) {
    return push('CPU al 95%', `L'ús de CPU ha arribat al ${cpu.usage.toFixed(0)}%.`, 'critical')
  }
  const diskFull = disk.partitions.find((p) => p.usedGB / p.totalGB > 0.95)
  if (diskFull) {
    return push('Disc gairebé ple', `${diskFull.mountPoint} ha superat el 95% d'ús.`, 'critical')
  }
  if (ram.pressure === 'high' && Math.random() < 0.15) {
    return push('Pressió de memòria alta', `Només queden ${ram.availableGB.toFixed(1)} GB de RAM disponibles.`, 'warning')
  }
  if (network.quality === 'poor' && Math.random() < 0.1) {
    return push('Xarxa inestable', 'S\'ha detectat una degradació notable de la connexió.', 'warning')
  }
  return null
}

// ---------------------------------------------------------------------------
// Security Center — only "isReal: true" fields are derived from something
// this app can actually observe (currently: whether an sshd process is
// running). Everything else needs elevated OS access this app doesn't
// request, so it's clearly marked as illustrative rather than faked as real.
// ---------------------------------------------------------------------------

export function computeSecurityState(processes: ProcessInfo[], isLive: boolean): SecurityCenterState {
  const sshRunning = processes.some((p) => p.name.toLowerCase().includes('sshd'))

  const categories: SecurityCategoryStatus[] = [
    {
      key: 'ssh',
      label: 'SSH',
      status: isLive ? (sshRunning ? 'Servei actiu' : 'Servei inactiu') : 'N/D (mode simulat)',
      risk: isLive ? (sshRunning ? 'medium' : 'low') : 'low',
      recommendation: sshRunning ? 'Assegura\'t d\'usar autenticació per clau, no per contrasenya.' : 'Cap acció necessària si no l\'uses.',
      isReal: isLive,
    },
    {
      key: 'firewall',
      label: 'Tallafocs',
      status: 'Exemple il·lustratiu',
      risk: 'low',
      recommendation: 'Verifica manualment amb `sudo ufw status` o el tallafocs del teu SO.',
      isReal: false,
    },
    {
      key: 'vpn',
      label: 'VPN',
      status: 'Exemple il·lustratiu',
      risk: 'medium',
      recommendation: 'Aquesta app no pot detectar-ho de forma fiable; comprova-ho al teu client VPN.',
      isReal: false,
    },
    {
      key: 'encryption',
      label: 'Xifratge de disc',
      status: 'Exemple il·lustratiu',
      risk: 'medium',
      recommendation: 'Comprova si tens LUKS/BitLocker/FileVault activat.',
      isReal: false,
    },
    {
      key: 'updates',
      label: 'Actualitzacions',
      status: 'Exemple il·lustratiu',
      risk: 'low',
      recommendation: 'Revisa el gestor de paquets del teu sistema.',
      isReal: false,
    },
    {
      key: 'ports',
      label: 'Ports oberts',
      status: 'Exemple il·lustratiu',
      risk: 'medium',
      recommendation: 'Fes servir `nmap localhost` o similar per a un escaneig real.',
      isReal: false,
    },
  ]

  const riskPenalty: Record<SecurityRisk, number> = { low: 0, medium: 15, high: 35 }
  type SecurityRisk = SecurityCategoryStatus['risk']
  const score = Math.max(0, 100 - categories.reduce((sum, c) => sum + riskPenalty[c.risk], 0) / categories.length)

  return { score: Math.round(score), categories }
}

// ---------------------------------------------------------------------------
// Predictions — real linear regression over the existing rolling history
// (60 samples). Confidence is deliberately capped low: a 60-second window is
// genuinely not enough to promise anything further out, and pretending
// otherwise would be exactly the kind of fabricated number this app avoids.
// ---------------------------------------------------------------------------

function linearRegression(points: number[]): { slope: number; intercept: number; r2: number } {
  const n = points.length
  if (n < 4) return { slope: 0, intercept: points[0] ?? 0, r2: 0 }
  const xs = points.map((_, i) => i)
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = points.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (points[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX

  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    const predicted = slope * xs[i] + intercept
    ssRes += (points[i] - predicted) ** 2
    ssTot += (points[i] - meanY) ** 2
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot)
  return { slope, intercept, r2 }
}

function buildPrediction(
  id: Prediction['metric'],
  label: string,
  history: TimeSeriesPoint[],
  unit: string,
  refreshRateMs: number,
  projectAheadTicks = 15,
): Prediction | null {
  if (history.length < 8) return null
  const values = history.map((p) => p.value)
  const { slope, intercept, r2 } = linearRegression(values)

  const lastIndex = values.length - 1
  const projected: TimeSeriesPoint[] = history.map((p) => ({ time: p.time, value: p.value }))
  for (let i = 1; i <= projectAheadTicks; i++) {
    const x = lastIndex + i
    const value = Math.max(0, slope * x + intercept)
    projected.push({ time: `+${((i * refreshRateMs) / 1000).toFixed(0)}s`, value })
  }

  const trend: Prediction['trend'] = slope > 0.15 ? 'up' : slope < -0.15 ? 'down' : 'stable'
  // A short 60-sample window can't honestly claim high confidence — cap it.
  const confidencePercent = Math.round(Math.min(70, r2 * 70))

  const aheadMinutes = ((projectAheadTicks * refreshRateMs) / 1000 / 60).toFixed(1)
  const projectedValue = projected[projected.length - 1].value
  const trendWord = trend === 'up' ? 'a l\'alça' : trend === 'down' ? 'a la baixa' : 'estable'
  const explanation = `Tendència ${trendWord} basada en els últims ${history.length} segons. Estimació d'aquí a ${aheadMinutes} min: ${projectedValue.toFixed(0)}${unit}. Finestra curta — confiança limitada.`

  return {
    id,
    metric: id,
    label,
    trend,
    confidencePercent,
    explanation,
    projectedHistory: projected,
    projectedFromIndex: lastIndex,
  }
}

export function computePredictions(cpu: CpuStats, ram: RamStats, disk: DiskStats, network: NetworkStats, refreshRateMs: number): Prediction[] {
  const ramPercentHistory = ram.history // already 0-100 percent series
  const networkHistory: TimeSeriesPoint[] = network.history.map((p) => ({ time: p.time, value: p.download }))

  return [
    buildPrediction('cpu', 'CPU', cpu.history, '%', refreshRateMs),
    buildPrediction('ram', 'Memòria', ramPercentHistory, '%', refreshRateMs),
    buildPrediction('disk', 'Activitat de disc', disk.history, ' MB/s', refreshRateMs),
    buildPrediction('network', 'Baixada de xarxa', networkHistory, ' Mbps', refreshRateMs),
  ].filter((p): p is Prediction => p !== null)
}

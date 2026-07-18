import { create } from 'zustand'
import type {
  BandwidthStats,
  ConnectionQuality,
  NetworkEvent,
  NetworkHistoryTotals,
  NetworkOverview,
  RegionLatency,
  ServiceStatus,
  SpeedTestResult,
  SpeedTestState,
} from '@/types/network'
import {
  checkServiceReachable,
  fetchIpGeoInfo,
  measureDnsResponseTime,
  measureDownloadSpeedMbps,
  measureFetchLatency,
  measureUploadSpeedMbps,
} from '@/lib/networkProbes'
import { useSystemStore } from './systemStore'
import { nowLabel } from '@/lib/utils'

const HISTORY_LENGTH = 60

const REGION_TARGETS: { id: string; label: string; angle: number; url: string }[] = [
  { id: 'na', label: 'Amèrica del Nord', angle: 0, url: 'https://aws.amazon.com' },
  { id: 'eu', label: 'Europa', angle: 60, url: 'https://www.bbc.co.uk' },
  { id: 'as', label: 'Àsia', angle: 120, url: 'https://www.rakuten.co.jp' },
  { id: 'sa', label: 'Amèrica del Sud', angle: 180, url: 'https://www.mercadolibre.com.ar' },
  { id: 'oc', label: 'Oceania', angle: 240, url: 'https://www.commbank.com.au' },
  { id: 'af', label: 'Àfrica', angle: 300, url: 'https://www.standardbank.co.za' },
]

const SERVICE_TARGETS: { id: string; name: string; url: string }[] = [
  { id: 'github', name: 'GitHub', url: 'https://github.com' },
  { id: 'openai', name: 'OpenAI', url: 'https://openai.com' },
  { id: 'cloudflare', name: 'Cloudflare', url: 'https://www.cloudflare.com' },
  { id: 'google', name: 'Google', url: 'https://www.google.com' },
  { id: 'discord', name: 'Discord', url: 'https://discord.com' },
  { id: 'vercel', name: 'Vercel', url: 'https://vercel.com' },
  { id: 'netlify', name: 'Netlify', url: 'https://www.netlify.com' },
  { id: 'aws', name: 'AWS', url: 'https://aws.amazon.com' },
  { id: 'azure', name: 'Azure', url: 'https://azure.microsoft.com' },
]

function emptyOverview(): NetworkOverview {
  const f = (label: string): { label: string; value: string; isReal: boolean } => ({ label, value: 'N/D', isReal: false })
  return {
    publicIp: f('IP pública'),
    isp: f('ISP'),
    asn: f('ASN'),
    country: f('País'),
    city: f('Ciutat'),
    privateIp: f('IP privada'),
    macAddress: f('MAC'),
    activeInterface: f('Interfície'),
    connectionType: f('Tipus de connexió'),
    gateway: f('Passarel·la'),
    dnsServers: f('Servidors DNS'),
    ipv6: f('IPv6'),
    loading: false,
    lastUpdated: null,
    error: null,
  }
}

function pushEventEntry(events: NetworkEvent[], entry: Omit<NetworkEvent, 'id' | 'timestamp'>): NetworkEvent[] {
  const full: NetworkEvent = { ...entry, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: nowLabel() }
  return [full, ...events].slice(0, 100)
}

interface NetworkSuiteState {
  overview: NetworkOverview
  bandwidth: BandwidthStats
  quality: ConnectionQuality
  speedTest: SpeedTestState
  regions: RegionLatency[]
  services: ServiceStatus[]
  events: NetworkEvent[]
  history: NetworkHistoryTotals

  refreshOverview: () => Promise<void>
  ingestBandwidthTick: () => void
  pollConnectionQuality: () => Promise<void>
  pollServices: () => Promise<void>
  pollRegions: () => Promise<void>
  runSpeedTest: () => Promise<void>
}

export const useNetworkSuiteStore = create<NetworkSuiteState>((set, get) => ({
  overview: emptyOverview(),
  bandwidth: {
    currentDownMbps: 0,
    currentUpMbps: 0,
    peakDownMbps: 0,
    peakUpMbps: 0,
    avgDownMbps: 0,
    avgUpMbps: 0,
    totalDownGB: 0,
    totalUpGB: 0,
    history: [],
  },
  quality: {
    httpLatencyMs: null,
    dnsResponseMs: null,
    jitterMs: null,
    failedRequestPercent: null,
    stabilityScore: 100,
    healthScore: 100,
    samples: [],
  },
  speedTest: { phase: 'idle', progressPercent: 0, currentResult: null, history: [], error: null },
  regions: REGION_TARGETS.map((r) => ({ id: r.id, label: r.label, angle: r.angle, latencyMs: null, status: 'checking' as const })),
  services: SERVICE_TARGETS.map((s) => ({ id: s.id, name: s.name, url: s.url, status: 'checking' as const, responseMs: null, lastChecked: null })),
  events: [],
  history: { highestDownMbps: 0, highestUpMbps: 0, avgLatencyMs: null, worstFailedRequestPercent: 0, totalTransferredGB: 0, sessionStart: nowLabel() },

  refreshOverview: async () => {
    set((s) => ({ overview: { ...s.overview, loading: true, error: null } }))
    const geo = await fetchIpGeoInfo()
    const net = useSystemStore.getState().network
    const isLive = useSystemStore.getState().isLive

    set((s) => ({
      overview: {
        ...s.overview,
        loading: false,
        lastUpdated: nowLabel(),
        error: geo ? null : 'No s\'ha pogut consultar la geolocalització IP (sense connexió o servei no disponible).',
        publicIp: { label: 'IP pública', value: geo?.publicIp ?? 'N/D', isReal: !!geo },
        isp: { label: 'ISP', value: geo?.isp ?? 'N/D', isReal: !!geo },
        asn: { label: 'ASN', value: geo?.asn ?? 'N/D', isReal: !!geo },
        country: { label: 'País', value: geo?.country ?? 'N/D', isReal: !!geo },
        city: { label: 'Ciutat', value: geo?.city ?? 'N/D', isReal: !!geo },
        privateIp: { label: 'IP privada', value: net.privateIp ?? 'N/D', isReal: isLive && !!net.privateIp },
        macAddress: { label: 'MAC', value: 'N/D', isReal: false },
        activeInterface: { label: 'Interfície', value: isLive ? 'detectada pel sistema' : 'N/D', isReal: false },
        connectionType: { label: 'Tipus de connexió', value: 'Exemple il·lustratiu', isReal: false },
        gateway: { label: 'Passarel·la', value: 'Exemple il·lustratiu', isReal: false },
        dnsServers: { label: 'Servidors DNS', value: 'Exemple il·lustratiu', isReal: false },
        ipv6: { label: 'IPv6', value: geo?.ipv6 ?? 'N/D', isReal: false },
      },
    }))
  },

  ingestBandwidthTick: () => {
    const net = useSystemStore.getState().network
    set((s) => {
      const down = net.downloadMbps
      const up = net.uploadMbps
      const history = [...s.bandwidth.history, { time: nowLabel(), down, up }].slice(-HISTORY_LENGTH)
      const n = history.length
      const avgDown = history.reduce((sum, h) => sum + h.down, 0) / n
      const avgUp = history.reduce((sum, h) => sum + h.up, 0) / n
      const tickSeconds = useSystemStore.getState().refreshRateMs / 1000
      const totalDownGB = s.bandwidth.totalDownGB + (down * tickSeconds) / 8 / 1000
      const totalUpGB = s.bandwidth.totalUpGB + (up * tickSeconds) / 8 / 1000

      return {
        bandwidth: {
          currentDownMbps: down,
          currentUpMbps: up,
          peakDownMbps: Math.max(s.bandwidth.peakDownMbps, down),
          peakUpMbps: Math.max(s.bandwidth.peakUpMbps, up),
          avgDownMbps: avgDown,
          avgUpMbps: avgUp,
          totalDownGB,
          totalUpGB,
          history,
        },
        history: {
          ...s.history,
          highestDownMbps: Math.max(s.history.highestDownMbps, down),
          highestUpMbps: Math.max(s.history.highestUpMbps, up),
          totalTransferredGB: totalDownGB + totalUpGB,
        },
      }
    })
  },

  pollConnectionQuality: async () => {
    const [httpLatencyMs, dnsResponseMs] = await Promise.all([
      measureFetchLatency('https://www.cloudflare.com/cdn-cgi/trace'),
      measureDnsResponseTime('example.com'),
    ])

    set((s) => {
      const samples = [...s.quality.samples, httpLatencyMs ?? -1].slice(-10)
      const validSamples = samples.filter((v) => v >= 0)
      const jitterMs =
        validSamples.length >= 2
          ? Math.sqrt(
              validSamples.reduce((sum, v) => sum + (v - validSamples.reduce((a, b) => a + b, 0) / validSamples.length) ** 2, 0) /
                validSamples.length,
            )
          : null
      const failedRequestPercent = (samples.filter((v) => v < 0).length / samples.length) * 100
      const stabilityScore = Math.max(0, 100 - failedRequestPercent * 2 - (jitterMs ?? 0) * 0.5)
      const latencyScore = httpLatencyMs === null ? 20 : Math.max(0, 100 - httpLatencyMs / 3)
      const healthScore = Math.round(stabilityScore * 0.5 + latencyScore * 0.5)

      let events = s.events
      if (httpLatencyMs === null) {
        events = pushEventEntry(events, { category: 'packetloss', severity: 'critical', message: 'Petició de connectivitat fallida — possible tall de xarxa.' })
      } else if (httpLatencyMs > 400) {
        events = pushEventEntry(events, { category: 'latency', severity: 'warning', message: `Latència alta detectada: ${httpLatencyMs.toFixed(0)} ms.` })
      }

      return {
        quality: { httpLatencyMs, dnsResponseMs, jitterMs, failedRequestPercent, stabilityScore, healthScore, samples },
        history: {
          ...s.history,
          avgLatencyMs: validSamples.length ? validSamples.reduce((a, b) => a + b, 0) / validSamples.length : s.history.avgLatencyMs,
          worstFailedRequestPercent: Math.max(s.history.worstFailedRequestPercent, failedRequestPercent),
        },
        events,
      }
    })
  },

  pollServices: async () => {
    const results = await Promise.all(
      SERVICE_TARGETS.map(async (svc) => ({ ...svc, ...(await checkServiceReachable(svc.url)) })),
    )
    set((s) => ({
      services: results.map((r) => ({ id: r.id, name: r.name, url: r.url, status: r.status, responseMs: r.ms, lastChecked: nowLabel() })),
      events:
        results.some((r) => r.status === 'offline')
          ? pushEventEntry(s.events, {
              category: 'connection',
              severity: 'warning',
              message: `Servei(s) no accessible(s): ${results.filter((r) => r.status === 'offline').map((r) => r.name).join(', ')}.`,
            })
          : s.events,
    }))
  },

  pollRegions: async () => {
    const results = await Promise.all(
      REGION_TARGETS.map(async (r) => ({ id: r.id, latencyMs: await measureFetchLatency(r.url, 5000) })),
    )
    set((s) => ({
      regions: s.regions.map((r) => {
        const found = results.find((res) => res.id === r.id)
        return found ? { ...r, latencyMs: found.latencyMs, status: (found.latencyMs === null ? 'offline' : 'online') as RegionLatency['status'] } : r
      }),
    }))
  },

  runSpeedTest: async () => {
    set({ speedTest: { phase: 'ping', progressPercent: 0, currentResult: {}, history: get().speedTest.history, error: null } })
    const pingMs = await measureFetchLatency('https://speed.cloudflare.com/__down?bytes=1000', 5000)
    if (pingMs === null) {
      set((s) => ({ speedTest: { ...s.speedTest, phase: 'error', error: 'No s\'ha pogut contactar el servidor de prova. Comprova la connexió.' } }))
      return
    }

    set((s) => ({ speedTest: { ...s.speedTest, phase: 'download', currentResult: { pingMs } } }))
    const downloadMbps = await measureDownloadSpeedMbps(20_000_000, (pct) =>
      set((s) => ({ speedTest: { ...s.speedTest, progressPercent: pct * 0.5 } })),
    )

    set((s) => ({ speedTest: { ...s.speedTest, phase: 'upload', currentResult: { ...s.speedTest.currentResult, downloadMbps: downloadMbps ?? 0 } } }))
    const uploadMbps = await measureUploadSpeedMbps(6_000_000, (pct) =>
      set((s) => ({ speedTest: { ...s.speedTest, progressPercent: 50 + pct * 0.5 } })),
    )

    const result: SpeedTestResult = {
      id: `speedtest-${Date.now()}`,
      timestamp: nowLabel(),
      pingMs,
      downloadMbps: downloadMbps ?? 0,
      uploadMbps: uploadMbps ?? 0,
      jitterMs: get().quality.jitterMs ?? 0,
    }

    set((s) => ({
      speedTest: { phase: 'done', progressPercent: 100, currentResult: result, history: [result, ...s.speedTest.history].slice(0, 20), error: null },
      events: pushEventEntry(s.events, {
        category: 'speedtest',
        severity: 'info',
        message: `Test de velocitat completat: ${result.downloadMbps.toFixed(0)} Mbps baixada / ${result.uploadMbps.toFixed(0)} Mbps pujada.`,
      }),
    }))
  },
}))

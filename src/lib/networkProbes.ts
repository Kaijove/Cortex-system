// -----------------------------------------------------------------------------
// Real network probes. Every function here performs an actual network request
// and measures actual elapsed time — nothing is randomized or guessed.
// Failures are surfaced as null/error, never papered over with a fake number.
// -----------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 6000

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, cancel: () => clearTimeout(timer) }
}

/**
 * Measures real round-trip time to a URL using `no-cors` mode, which lets the
 * browser complete the request (and time it) even for third-party origins
 * that don't send CORS headers — we just can't read the response body/status,
 * only whether it succeeded and how long it took. That's enough to know
 * "reachable, this fast" vs "unreachable".
 */
export async function measureFetchLatency(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<number | null> {
  const { signal, cancel } = withTimeout(timeoutMs)
  const start = performance.now()
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store', signal })
    return performance.now() - start
  } catch {
    return null
  } finally {
    cancel()
  }
}

export interface IpGeoInfo {
  publicIp: string
  isp: string
  asn: string
  country: string
  city: string
  ipv6: string | null
}

/**
 * Real public-IP + geolocation lookup via ipapi.co (CORS-enabled, no key
 * needed for light use). Falls back to ipwho.is if the first one fails.
 */
export async function fetchIpGeoInfo(): Promise<IpGeoInfo | null> {
  const sources = [
    async (): Promise<IpGeoInfo> => {
      const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
      if (!res.ok) throw new Error('ipapi.co failed')
      const data = await res.json()
      return {
        publicIp: data.ip ?? 'N/D',
        isp: data.org ?? 'N/D',
        asn: data.asn ?? 'N/D',
        country: data.country_name ?? 'N/D',
        city: data.city ?? 'N/D',
        ipv6: null,
      }
    },
    async (): Promise<IpGeoInfo> => {
      const res = await fetch('https://ipwho.is/', { cache: 'no-store' })
      if (!res.ok) throw new Error('ipwho.is failed')
      const data = await res.json()
      return {
        publicIp: data.ip ?? 'N/D',
        isp: data.connection?.isp ?? 'N/D',
        asn: data.connection?.asn ? `AS${data.connection.asn}` : 'N/D',
        country: data.country ?? 'N/D',
        city: data.city ?? 'N/D',
        ipv6: null,
      }
    },
  ]

  for (const source of sources) {
    try {
      return await source()
    } catch {
      continue
    }
  }
  return null
}

/**
 * Real DNS resolution time via Google's public DNS-over-HTTPS JSON API.
 * The elapsed time genuinely includes a real name resolution round trip.
 */
export async function measureDnsResponseTime(hostname = 'example.com'): Promise<number | null> {
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT_MS)
  const start = performance.now()
  try {
    const res = await fetch(`https://dns.google/resolve?name=${hostname}`, { signal, cache: 'no-store' })
    if (!res.ok) return null
    await res.json()
    return performance.now() - start
  } catch {
    return null
  } finally {
    cancel()
  }
}

/** Cloudflare's public speed-test endpoints — the same ones speed.cloudflare.com itself uses. */
const CF_DOWN_URL = (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`
const CF_UP_URL = 'https://speed.cloudflare.com/__up'

export async function measureDownloadSpeedMbps(bytes = 15_000_000, onProgress?: (pct: number) => void): Promise<number | null> {
  const { signal, cancel } = withTimeout(20000)
  const start = performance.now()
  try {
    const res = await fetch(CF_DOWN_URL(bytes), { signal, cache: 'no-store' })
    if (!res.ok || !res.body) return null
    const reader = res.body.getReader()
    let received = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value?.length ?? 0
      onProgress?.(Math.min(100, (received / bytes) * 100))
    }
    const seconds = (performance.now() - start) / 1000
    return seconds > 0 ? (received * 8) / 1_000_000 / seconds : null
  } catch {
    return null
  } finally {
    cancel()
  }
}

export async function measureUploadSpeedMbps(bytes = 5_000_000, onProgress?: (pct: number) => void): Promise<number | null> {
  const { signal, cancel } = withTimeout(20000)
  const payload = new Uint8Array(bytes)
  const start = performance.now()
  try {
    onProgress?.(10)
    const res = await fetch(CF_UP_URL, { method: 'POST', body: payload, signal, cache: 'no-store' })
    onProgress?.(100)
    if (!res.ok) return null
    const seconds = (performance.now() - start) / 1000
    return seconds > 0 ? (bytes * 8) / 1_000_000 / seconds : null
  } catch {
    return null
  } finally {
    cancel()
  }
}

/** Checks whether a service is reachable and how long that took. */
export async function checkServiceReachable(url: string): Promise<{ status: 'online' | 'offline'; ms: number | null }> {
  const ms = await measureFetchLatency(url, 5000)
  return { status: ms === null ? 'offline' : 'online', ms }
}

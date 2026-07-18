import { Check, Copy, Globe, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useT } from '@/lib/i18n'

export function NetworkOverviewPanel() {
  const t = useT()
  const overview = useNetworkSuiteStore((s) => s.overview)
  const refreshOverview = useNetworkSuiteStore((s) => s.refreshOverview)

  const fields = [
    overview.publicIp,
    overview.isp,
    overview.asn,
    overview.country,
    overview.city,
    overview.privateIp,
    overview.activeInterface,
    overview.connectionType,
    overview.gateway,
    overview.dnsServers,
    overview.macAddress,
    overview.ipv6,
  ]

  return (
    <Card
      index={11}
      title={t('widgets.netOverview')}
      icon={<Globe size={14} />}
      headerRight={
        <button
          onClick={() => refreshOverview()}
          className="transition-colors hover:text-white"
          style={{ color: 'var(--text-lo)' }}
          title="Actualitza"
        >
          <RefreshCw size={13} className={overview.loading ? 'animate-spin' : ''} />
        </button>
      }
    >
      {overview.error && (
        <p className="mb-2 text-[10px]" style={{ color: 'var(--signal-amber)' }}>{overview.error}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {overview.loading
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-11" />)
          : fields.map((f) => <FieldRow key={f.label} label={f.label} value={f.value} isReal={f.isReal} />)}
      </div>
      {overview.lastUpdated && (
        <p className="mt-2 font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>Actualitzat: {overview.lastUpdated}</p>
      )}
    </Card>
  )
}

function FieldRow({ label, value, isReal }: { label: string; value: string; isReal: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard API unavailable — silently ignore, not critical
    }
  }

  return (
    <div className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="label-eyebrow text-[8px]">{label}</span>
        {!isReal && (
          <span className="text-[8px]" style={{ color: 'var(--text-lo)' }} title="Valor il·lustratiu">
            exemple
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-data text-[11px]" style={{ color: 'var(--text-hi)' }} title={value}>
          {value}
        </span>
        <button onClick={copy} className="shrink-0 transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }} title="Copia">
          {copied ? <Check size={11} style={{ color: 'var(--signal-emerald)' }} /> : <Copy size={11} />}
        </button>
      </div>
    </div>
  )
}

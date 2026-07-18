import { Gauge as GaugeIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { RadialGauge } from '@/components/ui/RadialGauge'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useT } from '@/lib/i18n'

export function ConnectionQualityPanel() {
  const t = useT()
  const quality = useNetworkSuiteStore((s) => s.quality)
  const color = quality.healthScore > 75 ? 'var(--signal-emerald)' : quality.healthScore > 45 ? 'var(--signal-amber)' : 'var(--signal-rose)'

  return (
    <Card index={13} title={t('widgets.netQuality')} icon={<GaugeIcon size={14} />}>
      <div className="mb-4 flex items-center gap-4">
        <RadialGauge value={quality.healthScore} size={72} strokeWidth={6} color={color} />
        <div>
          <div className="label-eyebrow text-[9px]">Salut de xarxa</div>
          <div className="font-data text-base font-semibold" style={{ color }}>{quality.healthScore}/100</div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-center">
        <Stat label="Latència HTTP" value={quality.httpLatencyMs === null ? 'N/D' : `${quality.httpLatencyMs.toFixed(0)} ms`} />
        <Stat label="Resposta DNS" value={quality.dnsResponseMs === null ? 'N/D' : `${quality.dnsResponseMs.toFixed(0)} ms`} />
        <Stat label="Jitter" value={quality.jitterMs === null ? 'N/D' : `${quality.jitterMs.toFixed(1)} ms`} />
        <Stat label="Peticions fallides" value={quality.failedRequestPercent === null ? 'N/D' : `${quality.failedRequestPercent.toFixed(0)}%`} />
      </div>

      <div className="mb-1 flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
        <span>Estabilitat</span>
        <span>{quality.stabilityScore.toFixed(0)}/100</span>
      </div>
      <ProgressBar value={quality.stabilityScore} color={color} className="h-1.5" />

      <p className="mt-2 text-[9px] leading-snug" style={{ color: 'var(--text-lo)' }}>
        Mesurat amb peticions HTTP reals, no ICMP (requeriria sòcols en cru). "Peticions fallides" és una aproximació al packet loss real.
      </p>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="font-data text-sm" style={{ color: 'var(--text-hi)' }}>{value}</div>
      <div className="label-eyebrow text-[9px]">{label}</div>
    </div>
  )
}

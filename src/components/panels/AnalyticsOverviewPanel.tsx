import { TrendingDown, TrendingUp, Minus, Gauge } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useT } from '@/lib/i18n'

function trendOf(current: number, past: number | null) {
  if (past === null) return { icon: Minus, color: 'var(--text-lo)', text: 'sense referència' }
  const delta = current - past
  if (Math.abs(delta) < 1) return { icon: Minus, color: 'var(--text-lo)', text: 'estable' }
  return delta > 0
    ? { icon: TrendingUp, color: 'var(--signal-emerald)', text: `+${delta.toFixed(1)}` }
    : { icon: TrendingDown, color: 'var(--signal-rose)', text: `${delta.toFixed(1)}` }
}

export function AnalyticsOverviewPanel() {
  const t = useT()
  const health = useSystemStore((s) => s.healthScore.value)
  const security = useSystemStore((s) => s.security.score)
  const cpu = useSystemStore((s) => s.cpu)
  const disk = useSystemStore((s) => s.disk)
  const quality = useNetworkSuiteStore((s) => s.quality.healthScore)
  const history = useAnalyticsStore((s) => s.history)

  const past = history[0] ?? null
  const diskAvg = disk.partitions.reduce((sum, p) => sum + (p.usedGB / p.totalGB) * 100, 0) / Math.max(1, disk.partitions.length)
  const resourceEfficiency = Math.round(100 - (cpu.usage + diskAvg) / 2)

  const kpis = [
    { id: 'perf', label: 'Rendiment', value: health, prev: past?.health ?? null },
    { id: 'eff', label: 'Eficiència de recursos', value: resourceEfficiency, prev: past ? Math.round(100 - (past.cpu + past.disk) / 2) : null },
    { id: 'stab', label: 'Estabilitat', value: security, prev: past?.security ?? null },
    { id: 'net', label: 'Fiabilitat de xarxa', value: quality, prev: past?.network ?? null },
    { id: 'sec', label: 'Seguretat', value: security, prev: past?.security ?? null },
    { id: 'storage', label: "Salut d'emmagatzematge", value: Math.round(100 - diskAvg), prev: past ? Math.round(100 - past.disk) : null },
  ]

  return (
    <Card index={38} title={t('widgets.analyticsOverview')} icon={<Gauge size={14} />}>
      <div className="grid grid-cols-2 gap-2">
        {kpis.map((kpi) => {
          const trend = trendOf(kpi.value, kpi.prev)
          const Icon = trend.icon
          return (
            <div key={kpi.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
              <div className="label-eyebrow mb-0.5 text-[8px]">{kpi.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-data text-lg font-semibold" style={{ color: 'var(--text-hi)' }}>{kpi.value}</span>
                <span className="flex items-center gap-0.5 font-data text-[9px]" style={{ color: trend.color }}>
                  <Icon size={9} />{trend.text}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        La comparació és contra la mostra real més antiga de l'historial (no un "període anterior" inventat) — guanya fiabilitat com més temps portis l'app oberta.
      </p>
    </Card>
  )
}

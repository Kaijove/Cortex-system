import { TrendingUp, TrendingDown, Minus, LineChart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { linearTrend, trendDirection } from '@/lib/analyticsUtils'
import type { TrendDirection } from '@/types/analytics'
import { useT } from '@/lib/i18n'

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus }
const TREND_COLOR: Record<TrendDirection, string> = { up: 'var(--signal-rose)', down: 'var(--signal-emerald)', stable: 'var(--text-lo)' }

function explain(metric: string, dir: TrendDirection): string {
  if (dir === 'stable') return `${metric} es manté estable.`
  const word = dir === 'up' ? "a l'alça" : 'a la baixa'
  return `${metric} mostra una tendència ${word} en aquest període.`
}

export function TrendAnalysisPanel() {
  const t = useT()
  const history = useAnalyticsStore((s) => s.history)
  const recent = history.slice(-60)

  const metrics: { key: 'cpu' | 'ram' | 'disk' | 'network' | 'security'; label: string }[] = [
    { key: 'cpu', label: 'CPU' },
    { key: 'ram', label: 'Memòria' },
    { key: 'disk', label: 'Disc' },
    { key: 'network', label: 'Xarxa' },
    { key: 'security', label: 'Seguretat' },
  ]

  const trends = metrics.map((m) => {
    const values = recent.map((s) => s[m.key])
    const { slope, r2 } = linearTrend(values)
    const dir = trendDirection(slope)
    return { ...m, dir, confidence: Math.round(Math.min(70, r2 * 70)) }
  })

  return (
    <Card index={42} title={t('widgets.trendAnalysis')} icon={<LineChart size={14} />}>
      {recent.length < 4 ? (
        <p className="py-3 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Recollint dades per detectar tendències...</p>
      ) : (
        <div className="space-y-1.5">
          {trends.map((t) => {
            const Icon = TREND_ICON[t.dir]
            return (
              <div key={t.key} className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
                <div className="flex items-center gap-1.5">
                  <Icon size={13} style={{ color: TREND_COLOR[t.dir] }} />
                  <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{explain(t.label, t.dir)}</span>
                </div>
                <span className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{t.confidence}% conf.</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

import { HeartPulse } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { RadialGauge } from '@/components/ui/RadialGauge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useSystemStore } from '@/store/systemStore'
import type { HealthStatus } from '@/types/system'
import { useT } from '@/lib/i18n'

const STATUS_COLOR: Record<HealthStatus, string> = {
  excellent: 'var(--signal-emerald)',
  good: 'var(--signal-cyan)',
  fair: 'var(--signal-amber)',
  warning: 'var(--signal-amber)',
  critical: 'var(--signal-rose)',
}

const STATUS_LABEL: Record<HealthStatus, string> = {
  excellent: 'Excel·lent',
  good: 'Bo',
  fair: 'Acceptable',
  warning: 'Advertència',
  critical: 'Crític',
}

export function HealthScorePanel() {
  const t = useT()
  const health = useSystemStore((s) => s.healthScore)
  const color = STATUS_COLOR[health.status]

  return (
    <Card index={7} title={t('widgets.health')} icon={<HeartPulse size={14} />}>
      <div className="mb-4 flex items-center gap-4">
        <RadialGauge value={health.value} size={84} strokeWidth={7} color={color} />
        <div>
          <div className="label-eyebrow text-[9px]">Estat general</div>
          <div className="font-data text-lg font-semibold" style={{ color }}>{STATUS_LABEL[health.status]}</div>
        </div>
      </div>

      <p className="mb-3 text-[11px] leading-relaxed" style={{ color: 'var(--text-lo)' }}>
        {health.explanation}
      </p>

      <div className="space-y-2">
        {health.breakdown.map((b) => (
          <div key={b.label}>
            <div className="mb-0.5 flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
              <span>{b.label}</span>
              <span>{b.score.toFixed(0)}</span>
            </div>
            <ProgressBar value={b.score} className="h-1" color={b.score > 60 ? 'var(--signal-emerald)' : b.score > 35 ? 'var(--signal-amber)' : 'var(--signal-rose)'} />
          </div>
        ))}
      </div>
    </Card>
  )
}

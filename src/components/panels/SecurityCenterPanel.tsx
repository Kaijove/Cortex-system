import { ShieldCheck } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import type { SecurityRisk } from '@/types/system'
import { useT } from '@/lib/i18n'

const RISK_COLOR: Record<SecurityRisk, string> = {
  low: 'var(--signal-emerald)',
  medium: 'var(--signal-amber)',
  high: 'var(--signal-rose)',
}

const RISK_TO_SCORE: Record<SecurityRisk, number> = { low: 100, medium: 60, high: 25 }

export function SecurityCenterPanel() {
  const t = useT()
  const security = useSystemStore((s) => s.security)

  const radarData = security.categories.map((c) => ({ label: c.label, score: RISK_TO_SCORE[c.risk] }))

  return (
    <Card
      index={9}
      title={t('widgets.security')}
      icon={<ShieldCheck size={14} />}
      headerRight={
        <span className="font-data text-sm" style={{ color: security.score > 70 ? 'var(--signal-emerald)' : 'var(--signal-amber)' }}>
          {security.score}/100
        </span>
      }
    >
      <div className="mb-3 h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="var(--glass-border)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <Radar dataKey="score" stroke="var(--signal-cyan)" fill="var(--signal-cyan)" fillOpacity={0.28} strokeWidth={2} isAnimationActive={false} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5">
        {security.categories.map((c) => (
          <div key={c.key} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-hi)' }}>
                {c.label}
                {!c.isReal && (
                  <span className="label-eyebrow text-[8px]" style={{ color: 'var(--text-lo)' }} title="Valor il·lustratiu: no es pot comprovar de forma fiable sense accés privilegiat al SO">
                    exemple
                  </span>
                )}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-lo)' }}>{c.status}</div>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase"
              style={{ background: `${RISK_COLOR[c.risk]}22`, color: RISK_COLOR[c.risk] }}
            >
              {c.risk}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

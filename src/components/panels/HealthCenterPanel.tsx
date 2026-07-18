import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { HeartPulse } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useAutomationStore } from '@/store/automationStore'
import { useT } from '@/lib/i18n'

function riskLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Baix', color: 'var(--signal-emerald)' }
  if (score >= 55) return { label: 'Moderat', color: 'var(--signal-amber)' }
  return { label: 'Alt', color: 'var(--signal-rose)' }
}

export function HealthCenterPanel() {
  const t = useT()
  const healthScore = useSystemStore((s) => s.healthScore)
  const security = useSystemStore((s) => s.security)
  const quality = useNetworkSuiteStore((s) => s.quality)
  const healthHistory = useAutomationStore((s) => s.healthHistory)
  const risk = riskLevel(healthScore.value)

  const combined = Math.round((healthScore.value + security.score + quality.healthScore) / 3)
  const combinedRisk = riskLevel(combined)

  return (
    <Card index={34} title={t('widgets.healthCenter')} icon={<HeartPulse size={14} />} headerRight={<span className="font-data text-sm" style={{ color: combinedRisk.color }}>{combined}/100</span>}>
      <div className="mb-3 grid grid-cols-3 gap-1.5 text-center">
        <MiniScore label="Rendiment" value={healthScore.value} />
        <MiniScore label="Seguretat" value={security.score} />
        <MiniScore label="Xarxa" value={quality.healthScore} />
      </div>

      <div className="mb-3 flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
        <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>Nivell de risc combinat</span>
        <span className="font-data text-[11px] font-semibold" style={{ color: risk.color }}>{combinedRisk.label}</span>
      </div>

      <div className="mb-2 h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={healthHistory}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--signal-emerald)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--signal-emerald)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 11, borderRadius: 8 }} />
            <Area type="monotone" dataKey="value" stroke="var(--signal-emerald)" fill="url(#healthGradient)" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] leading-snug" style={{ color: 'var(--text-lo)' }}>{healthScore.explanation}</p>
    </Card>
  )
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const risk = riskLevel(value)
  return (
    <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="font-data text-sm" style={{ color: risk.color }}>{value}</div>
      <div className="label-eyebrow text-[8px]">{label}</div>
    </div>
  )
}

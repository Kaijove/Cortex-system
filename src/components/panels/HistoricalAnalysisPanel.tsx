import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { History } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { describeAvailability, filterByRange } from '@/lib/analyticsUtils'
import type { TimeRange } from '@/types/analytics'
import { useT } from '@/lib/i18n'

const RANGES: TimeRange[] = ['1h', '24h', '7d', '30d']
const RANGE_LABELS: Record<TimeRange, string> = { '1h': '1 h', '24h': '24 h', '7d': '7 d', '30d': '30 d' }

export function HistoricalAnalysisPanel() {
  const t = useT()
  const history = useAnalyticsStore((s) => s.history)
  const [range, setRange] = useState<TimeRange>('1h')

  const filtered = useMemo(() => filterByRange(history, range), [history, range])
  const chartData = filtered.map((s) => ({
    time: new Date(s.t).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }),
    CPU: Math.round(s.cpu),
    RAM: Math.round(s.ram),
    Disc: Math.round(s.disk),
  }))

  return (
    <Card index={39} title={t('widgets.historicalAnalysis')} icon={<History size={14} />}>
      <div className="mb-2 flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="rounded-md px-2 py-1 font-data text-[10px] transition-colors"
            style={{ background: range === r ? 'var(--glass-fill-hover)' : 'transparent', color: range === r ? 'var(--signal-cyan)' : 'var(--text-lo)', border: '1px solid var(--glass-border)' }}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="histCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--signal-cyan)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--signal-cyan)" stopOpacity={0} /></linearGradient>
              <linearGradient id="histRam" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--signal-violet)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--signal-violet)" stopOpacity={0} /></linearGradient>
              <linearGradient id="histDisk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--signal-amber)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--signal-amber)" stopOpacity={0} /></linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="CPU" stroke="var(--signal-cyan)" fill="url(#histCpu)" strokeWidth={1.5} isAnimationActive={false} />
            <Area type="monotone" dataKey="RAM" stroke="var(--signal-violet)" fill="url(#histRam)" strokeWidth={1.5} isAnimationActive={false} />
            <Area type="monotone" dataKey="Disc" stroke="var(--signal-amber)" fill="url(#histDisk)" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>{describeAvailability(history, range)}</p>
    </Card>
  )
}

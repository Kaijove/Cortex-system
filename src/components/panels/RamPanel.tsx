import { MemoryStick } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatTile } from '@/components/ui/StatTile'
import { useSystemStore } from '@/store/systemStore'
import { formatGB } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const VIOLET = 'var(--signal-violet)'

const PRESSURE_COLOR: Record<string, string> = {
  normal: 'var(--signal-emerald)',
  moderate: 'var(--signal-amber)',
  high: 'var(--signal-rose)',
}

export function RamPanel() {
  const t = useT()
  const ram = useSystemStore((s) => s.ram)
  const usagePercent = (ram.usedGB / ram.totalGB) * 100
  const swapPercent = ram.swapTotalGB > 0 ? (ram.swapUsedGB / ram.swapTotalGB) * 100 : 0

  return (
    <Card
      index={1}
      title={t('widgets.ram')}
      icon={<MemoryStick size={14} />}
      headerRight={
        <span className="label-eyebrow text-[9px]" style={{ color: PRESSURE_COLOR[ram.pressure] }}>
          {ram.pressure}
        </span>
      }
    >
      <div className="mb-4 h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ram.history}>
            <defs>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VIOLET} stopOpacity={0.5} />
                <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 12, borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-lo)' }}
            />
            <Area type="monotone" dataKey="value" stroke={VIOLET} fill="url(#ramGradient)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex justify-between font-data text-xs" style={{ color: 'var(--text-lo)' }}>
          <span>Usada: {formatGB(ram.usedGB)}</span>
          <span>Total: {formatGB(ram.totalGB)}</span>
        </div>
        <ProgressBar value={usagePercent} color={VIOLET} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <StatTile label="Cache" value={formatGB(ram.cachedGB)} />
        <StatTile label="Disponible" value={formatGB(ram.availableGB)} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between font-data text-xs" style={{ color: 'var(--text-lo)' }}>
          <span>Swap</span>
          <span>{formatGB(ram.swapUsedGB)} / {formatGB(ram.swapTotalGB)}</span>
        </div>
        <ProgressBar value={swapPercent} color="var(--text-lo)" />
      </div>
    </Card>
  )
}

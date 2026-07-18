import { HardDrive } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatTile } from '@/components/ui/StatTile'
import { useSystemStore } from '@/store/systemStore'
import { formatGB } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const AMBER = 'var(--signal-amber)'

export function DiskPanel() {
  const t = useT()
  const disk = useSystemStore((s) => s.disk)

  return (
    <Card
      index={2}
      title={t('widgets.disk')}
      icon={<HardDrive size={14} />}
      headerRight={
        <span className="label-eyebrow text-[9px]" style={{ color: 'var(--signal-emerald)' }}>
          {disk.healthPercent === null ? 'N/D' : `${disk.healthPercent}% salut`}
        </span>
      }
    >
      <div className="mb-4 h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={disk.history}>
            <defs>
              <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={AMBER} stopOpacity={0.5} />
                <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 12, borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-lo)' }}
            />
            <Area type="monotone" dataKey="value" stroke={AMBER} fill="url(#diskGradient)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-center">
        <StatTile label="Lectura" value={`${disk.readSpeedMBs.toFixed(0)} MB/s`} />
        <StatTile label="Escriptura" value={`${disk.writeSpeedMBs.toFixed(0)} MB/s`} />
      </div>

      <div className="space-y-2">
        {disk.partitions.map((p) => {
          const percent = (p.usedGB / p.totalGB) * 100
          return (
            <div key={p.id}>
              <div className="mb-1 flex justify-between font-data text-[11px]" style={{ color: 'var(--text-lo)' }}>
                <span>{p.mountPoint} · {p.filesystem}</span>
                <span>{formatGB(p.usedGB, 0)} / {formatGB(p.totalGB, 0)}</span>
              </div>
              <ProgressBar value={percent} color={AMBER} className="h-1.5" />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

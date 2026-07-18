import { Cpu } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { RadialGauge } from '@/components/ui/RadialGauge'
import { StatTile } from '@/components/ui/StatTile'
import { useSystemStore } from '@/store/systemStore'
import { useT } from '@/lib/i18n'

const CYAN = 'var(--signal-cyan)'

export function CpuPanel() {
  const t = useT()
  const cpu = useSystemStore((s) => s.cpu)

  return (
    <Card
      index={0}
      title={t('widgets.cpu')}
      icon={<Cpu size={14} />}
      headerRight={<RadialGauge value={cpu.usage} size={40} strokeWidth={4} color={CYAN} />}
    >
      <div id="cpu-history-chart" className="mb-4 h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cpu.history}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CYAN} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 12, borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-lo)' }}
            />
            <Area type="monotone" dataKey="value" stroke={CYAN} fill="url(#cpuGradient)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <StatTile label="Temp" value={cpu.temperatureC === null ? 'N/D' : `${cpu.temperatureC.toFixed(0)}°C`} />
        <StatTile label="Clock" value={`${cpu.clockSpeedGHz.toFixed(2)} GHz`} />
        <StatTile label="Fils" value={`${cpu.threads}`} />
        <StatTile label="Procs" value={`${cpu.processes}`} />
        <StatTile label="Pic" value={`${cpu.peakUsage.toFixed(0)}%`} />
        <StatTile label="Mitjana" value={`${cpu.averageUsage.toFixed(0)}%`} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cpu.cores.map((core) => (
          <div key={core.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-1 flex justify-between text-[10px] font-data" style={{ color: 'var(--text-lo)' }}>
              <span>C{core.id}</span>
              <span>{core.usage.toFixed(0)}%</span>
            </div>
            <ProgressBar value={core.usage} className="h-1.5" color={CYAN} />
          </div>
        ))}
      </div>
    </Card>
  )
}


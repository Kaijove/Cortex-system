import { MonitorSpeaker } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { RadialGauge } from '@/components/ui/RadialGauge'
import { useSystemStore } from '@/store/systemStore'
import { useToolsStore } from '@/store/toolsStore'
import { useT } from '@/lib/i18n'

const EMERALD = 'var(--signal-emerald)'

export function GpuMonitorPanel() {
  const t = useT()
  const gpu = useSystemStore((s) => s.gpu)
  const usageHistory = useToolsStore((s) => s.gpuUsageHistory)

  // Encoder/decoder usage don't exist on the underlying GpuStats — derived
  // deterministically from usage so they move coherently rather than randomly.
  const encoderUsage = Math.min(100, gpu.usagePercent * 0.4)
  const decoderUsage = Math.min(100, gpu.usagePercent * 0.25)

  return (
    <Card index={18} title={t('widgets.gpuMonitor')} icon={<MonitorSpeaker size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{gpu.name}</span>}>
      <div className="mb-4 flex items-center justify-around">
        <RadialGauge value={gpu.usagePercent} size={68} strokeWidth={6} color={EMERALD} label="ÚS" />
        <RadialGauge value={(gpu.temperatureC / 100) * 100} size={68} strokeWidth={6} color="var(--signal-amber)" label="°C" />
        <RadialGauge value={(gpu.vramUsedGB / gpu.vramTotalGB) * 100} size={68} strokeWidth={6} color="var(--signal-violet)" label="VRAM" />
      </div>

      <div className="mb-3 h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={usageHistory}>
            <defs>
              <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EMERALD} stopOpacity={0.5} />
                <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 11, borderRadius: 8 }} />
            <Area type="monotone" dataKey="value" stroke={EMERALD} fill="url(#gpuGradient)" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-center">
        <Stat label="Clock" value={`${gpu.usagePercent > 0 ? (1.2 + gpu.usagePercent / 100).toFixed(2) : '0.30'} GHz`} />
        <Stat label="Potència" value={`${gpu.powerDrawW.toFixed(0)} W`} />
      </div>

      <div className="space-y-2">
        <div>
          <div className="mb-0.5 flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
            <span>Encoder</span><span>{encoderUsage.toFixed(0)}%</span>
          </div>
          <ProgressBar value={encoderUsage} className="h-1.5" color="var(--signal-cyan)" />
        </div>
        <div>
          <div className="mb-0.5 flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
            <span>Decoder</span><span>{decoderUsage.toFixed(0)}%</span>
          </div>
          <ProgressBar value={decoderUsage} className="h-1.5" color="var(--signal-violet)" />
        </div>
      </div>
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

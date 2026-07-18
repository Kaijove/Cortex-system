import { Activity } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { formatDataAuto, formatThroughputAuto } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const EMERALD = 'var(--signal-emerald)'
const CYAN = 'var(--signal-cyan)'

export function BandwidthMonitorPanel() {
  const t = useT()
  const bw = useNetworkSuiteStore((s) => s.bandwidth)

  return (
    <Card index={12} title={t('widgets.netBandwidth')} icon={<Activity size={14} />}>
      <div className="mb-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="font-data text-sm" style={{ color: EMERALD }}>↓ {formatThroughputAuto(bw.currentDownMbps)}</div>
          <div className="label-eyebrow text-[9px]">Actual</div>
        </div>
        <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="font-data text-sm" style={{ color: CYAN }}>↑ {formatThroughputAuto(bw.currentUpMbps)}</div>
          <div className="label-eyebrow text-[9px]">Actual</div>
        </div>
      </div>

      <div className="mb-3 h-20 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bw.history}>
            <defs>
              <linearGradient id="bwDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EMERALD} stopOpacity={0.5} />
                <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bwUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CYAN} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 11, borderRadius: 8 }} labelStyle={{ color: 'var(--text-lo)' }} />
            <Area type="monotone" dataKey="down" stroke={EMERALD} fill="url(#bwDown)" strokeWidth={1.5} isAnimationActive={false} />
            <Area type="monotone" dataKey="up" stroke={CYAN} fill="url(#bwUp)" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
        <Stat label="Pic ↓" value={formatThroughputAuto(bw.peakDownMbps)} />
        <Stat label="Mitjana ↓" value={formatThroughputAuto(bw.avgDownMbps)} />
        <Stat label="Total ↓" value={formatDataAuto(bw.totalDownGB)} />
        <Stat label="Pic ↑" value={formatThroughputAuto(bw.peakUpMbps)} />
        <Stat label="Mitjana ↑" value={formatThroughputAuto(bw.avgUpMbps)} />
        <Stat label="Total ↑" value={formatDataAuto(bw.totalUpGB)} />
      </div>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md py-1" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div style={{ color: 'var(--text-hi)' }}>{value}</div>
      <div className="text-[8px]">{label}</div>
    </div>
  )
}

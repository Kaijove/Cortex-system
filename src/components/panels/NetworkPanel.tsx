import { Wifi } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { formatMbps } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const EMERALD = 'var(--signal-emerald)'
const CYAN = 'var(--signal-cyan)'

const QUALITY_COLOR: Record<string, string> = {
  excellent: 'var(--signal-emerald)',
  good: 'var(--signal-cyan)',
  fair: 'var(--signal-amber)',
  poor: 'var(--signal-rose)',
  unknown: 'var(--text-lo)',
}

export function NetworkPanel() {
  const t = useT()
  const net = useSystemStore((s) => s.network)
  const quality = net.quality ?? 'unknown'

  return (
    <Card
      index={3}
      title={t('widgets.network')}
      icon={<Wifi size={14} />}
      headerRight={
        <span className="label-eyebrow text-[9px]" style={{ color: QUALITY_COLOR[quality] }}>
          {quality}
        </span>
      }
    >
      <div className="mb-4 h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={net.history}>
            <defs>
              <linearGradient id="downGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EMERALD} stopOpacity={0.5} />
                <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="upGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CYAN} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 12, borderRadius: 8 }}
              labelStyle={{ color: 'var(--text-lo)' }}
            />
            <Area type="monotone" dataKey="download" stroke={EMERALD} fill="url(#downGradient)" strokeWidth={2} isAnimationActive={false} />
            <Area type="monotone" dataKey="upload" stroke={CYAN} fill="url(#upGradient)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="font-data text-sm" style={{ color: EMERALD }}>↓ {formatMbps(net.downloadMbps)}</div>
          <div className="label-eyebrow text-[9px]">Baixada</div>
        </div>
        <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="font-data text-sm" style={{ color: CYAN }}>↑ {formatMbps(net.uploadMbps)}</div>
          <div className="label-eyebrow text-[9px]">Pujada</div>
        </div>
      </div>

      <dl className="space-y-1 font-data text-[11px]" style={{ color: 'var(--text-lo)' }}>
        <Row label="Latència" value={net.latencyMs === null ? 'N/D' : `${net.latencyMs.toFixed(0)} ms`} />
        <Row label="Pèrdua de paquets" value={net.packetLossPercent === null ? 'N/D' : `${net.packetLossPercent.toFixed(1)}%`} />
        <Row label="IP pública" value={net.publicIp ?? 'N/D'} />
        <Row label="IP privada" value={net.privateIp ?? 'N/D'} />
        <Row label="ISP" value={net.isp ?? 'N/D'} />
        <Row label="DNS" value={net.dns ?? 'N/D'} />
        <Row label="Ubicació" value={net.location ?? 'N/D'} />
      </dl>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd style={{ color: 'var(--text-hi)' }}>{value}</dd>
    </div>
  )
}

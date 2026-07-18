import { Fan, Gauge, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useSystemStore } from '@/store/systemStore'
import { useT } from '@/lib/i18n'

const SERVICES = [
  { name: 'sshd', status: 'active' },
  { name: 'nginx', status: 'active' },
  { name: 'docker', status: 'active' },
  { name: 'postgresql', status: 'active' },
  { name: 'cups', status: 'inactive' },
]

export function SystemInfoPanel() {
  const t = useT()
  const gpu = useSystemStore((s) => s.gpu)

  return (
    <Card
      index={2}
      title={t('widgets.sysinfo')}
      icon={<Gauge size={14} />}
      headerRight={<span className="label-eyebrow text-[9px]">{gpu.name}</span>}
    >
      <div className="mb-3">
        <div className="mb-1 flex justify-between font-data text-xs" style={{ color: 'var(--text-lo)' }}>
          <span>Ús GPU</span>
          <span>{gpu.usagePercent.toFixed(0)}%</span>
        </div>
        <ProgressBar value={gpu.usagePercent} color="var(--signal-emerald)" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="font-data text-sm" style={{ color: 'var(--text-hi)' }}>{gpu.temperatureC.toFixed(0)}°C</div>
          <div className="label-eyebrow text-[9px]">Temperatura</div>
        </div>
        <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="font-data text-sm" style={{ color: 'var(--text-hi)' }}>{gpu.vramUsedGB.toFixed(1)} / {gpu.vramTotalGB} GB</div>
          <div className="label-eyebrow text-[9px]">VRAM</div>
        </div>
        <div className="flex items-center justify-center gap-1 rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <Fan size={12} style={{ color: 'var(--text-lo)' }} />
          <span className="font-data text-sm" style={{ color: 'var(--text-hi)' }}>{gpu.fanRpm.toFixed(0)} RPM</span>
        </div>
        <div className="flex items-center justify-center gap-1 rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <Zap size={12} style={{ color: 'var(--signal-amber)' }} />
          <span className="font-data text-sm" style={{ color: 'var(--text-hi)' }}>{gpu.powerDrawW.toFixed(0)} W</span>
        </div>
      </div>

      <div className="label-eyebrow mb-1.5 text-[9px]">Serveis en execució</div>
      <ul className="space-y-1">
        {SERVICES.map((s) => (
          <li key={s.name} className="flex items-center justify-between font-data text-[11px]">
            <span style={{ color: 'var(--text-hi)' }}>{s.name}</span>
            <span style={{ color: s.status === 'active' ? 'var(--signal-emerald)' : 'var(--text-lo)' }}>{s.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

import { Activity } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAutomationStore } from '@/store/automationStore'
import type { ServiceState } from '@/types/automation'
import { useT } from '@/lib/i18n'

const STATE_COLOR: Record<ServiceState, string> = {
  running: 'var(--signal-emerald)', healthy: 'var(--signal-emerald)', stopped: 'var(--text-lo)', restarting: 'var(--signal-amber)', warning: 'var(--signal-amber)', critical: 'var(--signal-rose)',
}

export function ServiceUptimePanel() {
  const t = useT()
  const services = useAutomationStore((s) => s.services)
  const avgUptime = services.reduce((sum, s) => sum + s.uptimePercent, 0) / Math.max(1, services.length)

  return (
    <Card index={32} title={t('widgets.serviceUptime')} icon={<Activity size={14} />} headerRight={<span className="font-data text-sm" style={{ color: 'var(--signal-emerald)' }}>{avgUptime.toFixed(2)}%</span>}>
      <div className="space-y-1.5">
        {services.map((svc) => (
          <div key={svc.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-0.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATE_COLOR[svc.state], boxShadow: `0 0 6px ${STATE_COLOR[svc.state]}` }} />
                <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{svc.name}</span>
                {!svc.isReal && <span className="text-[8px]" style={{ color: 'var(--text-lo)' }}>exemple</span>}
              </div>
              <span className="label-eyebrow text-[8px]" style={{ color: STATE_COLOR[svc.state] }}>{svc.state}</span>
            </div>
            <div className="flex justify-between font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
              <span>{svc.currentStreakLabel}</span>
              <span>{svc.uptimePercent.toFixed(2)}% (mes: {svc.monthlyUptimePercent.toFixed(2)}%)</span>
            </div>
            {svc.incidents.length > 0 && (
              <div className="mt-1 font-data text-[8px]" style={{ color: 'var(--signal-amber)' }}>
                {svc.incidents[0].timestamp} · {svc.incidents[0].description}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

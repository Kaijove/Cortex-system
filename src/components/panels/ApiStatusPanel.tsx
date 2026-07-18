import { ServerCog } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import type { ServiceStatusState } from '@/types/network'
import { useT } from '@/lib/i18n'

const STATUS_COLOR: Record<ServiceStatusState, string> = {
  online: 'var(--signal-emerald)',
  offline: 'var(--signal-rose)',
  checking: 'var(--text-lo)',
}

export function ApiStatusPanel() {
  const t = useT()
  const services = useNetworkSuiteStore((s) => s.services)

  return (
    <Card index={16} title={t('widgets.apiStatus')} icon={<ServerCog size={14} />}>
      <div className="grid grid-cols-3 gap-1.5">
        {services.map((svc) => (
          <div key={svc.id} className="rounded-lg p-2 text-center" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mx-auto mb-1 h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[svc.status], boxShadow: svc.status === 'online' ? `0 0 6px ${STATUS_COLOR.online}` : 'none' }} />
            <div className="truncate text-[10px]" style={{ color: 'var(--text-hi)' }}>{svc.name}</div>
            <div className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
              {svc.status === 'checking' ? '...' : svc.responseMs !== null ? `${svc.responseMs.toFixed(0)} ms` : 'offline'}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        Comprovació de connectivitat real (no llegeix l'status page oficial de cada proveïdor).
      </p>
    </Card>
  )
}

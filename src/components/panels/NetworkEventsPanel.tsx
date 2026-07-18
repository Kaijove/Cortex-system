import { AnimatePresence, motion } from 'framer-motion'
import { History, AlertTriangle, Info, Wifi, Zap, Shield, Globe2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import type { NetworkEvent, NetworkEventCategory, NetworkEventSeverity } from '@/types/network'
import { useT } from '@/lib/i18n'

const SEVERITY_COLOR: Record<NetworkEventSeverity, string> = {
  info: 'var(--signal-cyan)',
  warning: 'var(--signal-amber)',
  critical: 'var(--signal-rose)',
}

const CATEGORY_ICON: Record<NetworkEventCategory, typeof Wifi> = {
  connection: Wifi,
  dns: Globe2,
  latency: AlertTriangle,
  packetloss: AlertTriangle,
  speedtest: Zap,
  vpn: Shield,
}

export function NetworkEventsPanel() {
  const t = useT()
  const events = useNetworkSuiteStore((s) => s.events)

  return (
    <Card index={17} title={t('widgets.netEvents')} icon={<History size={14} />}>
      <div className="max-h-64 space-y-1.5 overflow-y-auto">
        {events.length === 0 && (
          <p className="py-3 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>
            Sense esdeveniments encara — es registraran a mesura que es detectin canvis.
          </p>
        )}
        <AnimatePresence initial={false}>
          {events.slice(0, 20).map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

function EventRow({ event }: { event: NetworkEvent }) {
  const color = SEVERITY_COLOR[event.severity]
  const Icon = CATEGORY_ICON[event.category] ?? Info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-start gap-2 rounded-lg p-2"
      style={{ background: 'rgba(148,163,184,0.05)', borderLeft: `2px solid ${color}` }}
    >
      <Icon size={12} style={{ color }} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] leading-snug" style={{ color: 'var(--text-hi)' }}>{event.message}</p>
        <span className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{event.timestamp}</span>
      </div>
    </motion.div>
  )
}

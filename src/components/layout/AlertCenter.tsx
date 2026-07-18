import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Bell, CheckCircle2, Info, Pin, Trash2, X, XCircle } from 'lucide-react'
import { useSystemStore } from '@/store/systemStore'
import type { AlertItem, AlertPriority } from '@/types/system'
import { playNotificationSound, playWarningSound } from '@/lib/sounds'
import { useT } from '@/lib/i18n'

const PRIORITY_COLOR: Record<AlertPriority, string> = {
  info: 'var(--signal-cyan)',
  success: 'var(--signal-emerald)',
  warning: 'var(--signal-amber)',
  critical: 'var(--signal-rose)',
}

const PRIORITY_ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, critical: XCircle }

export function AlertCenter() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const alerts = useSystemStore((s) => s.alerts)
  const dismissAlert = useSystemStore((s) => s.dismissAlert)
  const togglePinAlert = useSystemStore((s) => s.togglePinAlert)
  const markAllAlertsRead = useSystemStore((s) => s.markAllAlertsRead)
  const clearAlerts = useSystemStore((s) => s.clearAlerts)

  const unreadCount = alerts.filter((a) => !a.read).length
  const pinned = alerts.filter((a) => a.pinned)
  const rest = alerts.filter((a) => !a.pinned)
  const prevCountRef = useRef(alerts.length)

  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      const newest = alerts[0]
      if (newest.priority === 'critical' || newest.priority === 'warning') playWarningSound()
      else playNotificationSound()
    }
    prevCountRef.current = alerts.length
  }, [alerts])

  function toggle() {
    setOpen((v) => {
      if (!v) markAllAlertsRead()
      return !v
    })
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="relative transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }} title={t('alerts.tooltip')} aria-label={`${t('alerts.title')}${unreadCount > 0 ? `, ${unreadCount} ${t('alerts.unread')}` : ''}`}>
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-black"
            style={{ background: 'var(--signal-rose)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl p-3 backdrop-blur-xl"
              style={{ background: 'rgba(8,10,16,0.9)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="label-eyebrow text-[10px]">{t('alerts.title')}</span>
                <button onClick={clearAlerts} title={t('alerts.clear')} className="transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }}>
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="max-h-96 space-y-1.5 overflow-y-auto">
                {alerts.length === 0 && (
                  <p className="py-4 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>
                    {t('alerts.empty')}
                  </p>
                )}
                {[...pinned, ...rest].map((alert) => (
                  <AlertRow key={alert.id} alert={alert} onDismiss={dismissAlert} onTogglePin={togglePinAlert} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function AlertRow({
  alert,
  onDismiss,
  onTogglePin,
}: {
  alert: AlertItem
  onDismiss: (id: string) => void
  onTogglePin: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const color = PRIORITY_COLOR[alert.priority]
  const Icon = PRIORITY_ICON[alert.priority]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.6 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 90) onDismiss(alert.id)
      }}
      whileDrag={{ cursor: 'grabbing' }}
      className="cursor-grab rounded-lg p-2 active:cursor-grabbing"
      style={{ background: 'rgba(148,163,184,0.06)', borderLeft: `2px solid ${color}` }}
    >
      <div className="flex items-start gap-2">
        <Icon size={14} style={{ color }} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs font-medium" style={{ color: 'var(--text-hi)' }}>{alert.title}</span>
            <span className="shrink-0 font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{alert.timestamp}</span>
          </div>
          {expanded && <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--text-lo)' }}>{alert.message}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={() => onTogglePin(alert.id)} title="Fixa" style={{ color: alert.pinned ? color : 'var(--text-lo)' }}>
            <Pin size={12} />
          </button>
          <button onClick={() => onDismiss(alert.id)} title="Descarta" style={{ color: 'var(--text-lo)' }}>
            <X size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, Bell, BellOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAutomationStore } from '@/store/automationStore'
import { useT } from '@/lib/i18n'

export function AutomationAnalyticsPanel() {
  const t = useT()
  const executions = useAutomationStore((s) => s.executions)
  const services = useAutomationStore((s) => s.services)
  const incidents = useAutomationStore((s) => s.incidents)
  const stabilityHistory = useAutomationStore((s) => s.stabilityHistory)
  const notificationPrefs = useAutomationStore((s) => s.notificationPrefs)
  const setNotificationPrefs = useAutomationStore((s) => s.setNotificationPrefs)
  const requestDesktopPermission = useAutomationStore((s) => s.requestDesktopPermission)

  const currentStability = stabilityHistory[stabilityHistory.length - 1]?.value ?? 100
  const alertsTriggered = executions.reduce((sum, e) => sum + e.actionsRun.filter((a) => a === 'alert' || a === 'notification').length, 0)
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length

  return (
    <Card index={37} title={t('widgets.automationAnalytics')} icon={<BarChart3 size={14} />} headerRight={<span className="font-data text-sm" style={{ color: 'var(--signal-emerald)' }}>{currentStability}/100</span>}>
      <div className="mb-3 grid grid-cols-2 gap-1.5 text-center">
        <Stat label="Regles executades" value={executions.length} />
        <Stat label="Alertes generades" value={alertsTriggered} />
        <Stat label="Incidències resoltes" value={resolvedIncidents} />
        <Stat label="Serveis reals monitoritzats" value={services.filter((s) => s.isReal).length} />
      </div>

      <div className="mb-3 h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stabilityHistory}>
            <defs>
              <linearGradient id="stabilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--signal-violet)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--signal-violet)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 11, borderRadius: 8 }} />
            <Area type="monotone" dataKey="value" stroke="var(--signal-violet)" fill="url(#stabilityGradient)" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mb-3 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        Estabilitat derivada de la variància de la puntuació de salut, no un valor inventat. No es mostra "temps de resposta" perquè les regles s'avaluen a cada cicle d'actualització — donar-hi una xifra en mil·lisegons seria enganyós.
      </p>

      <div className="border-t pt-2" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="label-eyebrow mb-1.5 text-[9px]">Notificacions</div>
        <div className="space-y-1">
          <ToggleRow label="Notificacions d'escriptori" checked={notificationPrefs.desktopEnabled} onChange={() => (notificationPrefs.desktopEnabled ? setNotificationPrefs({ desktopEnabled: false }) : requestDesktopPermission())} />
          <ToggleRow label="Notificacions dins l'app" checked={notificationPrefs.inAppEnabled} onChange={() => setNotificationPrefs({ inAppEnabled: !notificationPrefs.inAppEnabled })} />
          <ToggleRow label="Mode silenciós (sense so)" checked={notificationPrefs.silentMode} onChange={() => setNotificationPrefs({ silentMode: !notificationPrefs.silentMode })} />
          <ToggleRow label="Agrupa alertes similars" checked={notificationPrefs.groupAlerts} onChange={() => setNotificationPrefs({ groupAlerts: !notificationPrefs.groupAlerts })} />
        </div>
      </div>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="font-data text-sm" style={{ color: 'var(--text-hi)' }}>{value}</div>
      <div className="label-eyebrow text-[8px]">{label}</div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between rounded-md px-2 py-1" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <span className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-hi)' }}>
        {checked ? <Bell size={11} style={{ color: 'var(--signal-cyan)' }} /> : <BellOff size={11} style={{ color: 'var(--text-lo)' }} />}
        {label}
      </span>
      <span className="h-3.5 w-6 rounded-full p-0.5" style={{ background: checked ? 'var(--signal-cyan)' : 'rgba(148,163,184,0.2)' }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(9px)' : 'translateX(0)' }} />
      </span>
    </button>
  )
}

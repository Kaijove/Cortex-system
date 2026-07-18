import { Briefcase } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useAutomationStore } from '@/store/automationStore'
import { useT } from '@/lib/i18n'

export function ExecutiveDashboardPanel() {
  const t = useT()
  const healthScore = useSystemStore((s) => s.healthScore)
  const security = useSystemStore((s) => s.security)
  const alerts = useSystemStore((s) => s.alerts)
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const quality = useNetworkSuiteStore((s) => s.quality)
  const services = useAutomationStore((s) => s.services)
  const incidents = useAutomationStore((s) => s.incidents)

  const avgUptime = services.reduce((sum, s) => sum + s.uptimePercent, 0) / Math.max(1, services.length)
  const openIncidents = incidents.filter((i) => i.status !== 'resolved')
  const recommendation = healthScore.value < 70 ? 'Revisa el consum de CPU/RAM abans que empitjori.' : security.score < 70 ? 'Revisa el centre de seguretat.' : 'Cap acció urgent — sistema dins de paràmetres normals.'

  return (
    <Card index={47} title={t('widgets.executiveDashboard')} icon={<Briefcase size={14} />}>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <BigStat label="Salut general" value={`${healthScore.value}`} suffix="/100" />
        <BigStat label="Disponibilitat" value={avgUptime.toFixed(1)} suffix="%" />
        <BigStat label="Seguretat" value={`${security.score}`} suffix="/100" />
        <BigStat label="Eficiència de recursos" value={`${Math.round((healthScore.value + quality.healthScore) / 2)}`} suffix="/100" />
      </div>

      <div className="mb-2 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
        <div className="label-eyebrow mb-0.5 text-[8px]">Incidències recents</div>
        <div className="font-data text-[11px]" style={{ color: openIncidents.length > 0 ? 'var(--signal-amber)' : 'var(--signal-emerald)' }}>
          {openIncidents.length > 0 ? `${openIncidents.length} obertes` : 'Cap incidència oberta'}
        </div>
      </div>

      <div className="rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(45,212,238,0.08)' }}>
        <div className="label-eyebrow mb-0.5 text-[8px]">Recomanació principal</div>
        <p className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{recommendation}</p>
      </div>

      <p className="mt-2 font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{systemInfo.hostname} · {alerts.length} alertes totals</p>
    </Card>
  )
}

function BigStat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-lg py-2 text-center" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="font-data text-xl font-semibold" style={{ color: 'var(--text-hi)' }}>{value}<span className="text-xs" style={{ color: 'var(--text-lo)' }}>{suffix}</span></div>
      <div className="label-eyebrow text-[8px]">{label}</div>
    </div>
  )
}

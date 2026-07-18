import { useState } from 'react'
import { AlertOctagon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAutomationStore } from '@/store/automationStore'
import type { IncidentSeverity, IncidentStatus } from '@/types/automation'
import { useT } from '@/lib/i18n'

const SEVERITY_COLOR: Record<IncidentSeverity, string> = { low: 'var(--signal-cyan)', medium: 'var(--signal-amber)', high: 'var(--signal-amber)', critical: 'var(--signal-rose)' }
const STATUS_LABELS: Record<IncidentStatus, string> = { open: 'Obert', investigating: 'Investigant', resolved: 'Resolt' }
const FILTERS: (IncidentStatus | 'all')[] = ['all', 'open', 'investigating', 'resolved']

export function IncidentCenterPanel() {
  const t = useT()
  const incidents = useAutomationStore((s) => s.incidents)
  const updateIncidentStatus = useAutomationStore((s) => s.updateIncidentStatus)
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all')

  const filtered = incidents.filter((i) => filter === 'all' || i.status === filter)

  return (
    <Card index={36} title={t('widgets.incidentCenter')} icon={<AlertOctagon size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{incidents.filter((i) => i.status !== 'resolved').length} obertes</span>}>
      <div className="mb-2 flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-full px-2 py-0.5 text-[9px]"
            style={{ background: filter === f ? 'rgba(45,212,238,0.15)' : 'rgba(148,163,184,0.08)', color: filter === f ? 'var(--signal-cyan)' : 'var(--text-lo)' }}
          >
            {f === 'all' ? 'Totes' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="max-h-64 space-y-1.5 overflow-y-auto">
        {filtered.map((inc) => (
          <div key={inc.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)', borderLeft: `2px solid ${SEVERITY_COLOR[inc.severity]}` }}>
            <div className="mb-0.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{inc.title}</span>
              <span className="text-[9px] uppercase" style={{ color: SEVERITY_COLOR[inc.severity] }}>{inc.severity}</span>
            </div>
            <div className="mb-1 font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
              {inc.createdAt} · {inc.affectedComponents.join(', ')}
            </div>
            <p className="mb-1.5 text-[10px] leading-snug" style={{ color: 'var(--text-lo)' }}>{inc.suggestedResolution}</p>
            <div className="flex gap-1">
              {(['open', 'investigating', 'resolved'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => updateIncidentStatus(inc.id, st)}
                  className="rounded-full px-1.5 py-0.5 text-[8px]"
                  style={{ background: inc.status === st ? 'rgba(45,212,238,0.15)' : 'rgba(148,163,184,0.06)', color: inc.status === st ? 'var(--signal-cyan)' : 'var(--text-lo)' }}
                >
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-4 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Cap incidència</p>}
      </div>
    </Card>
  )
}

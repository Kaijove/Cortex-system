import { useMemo, useState } from 'react'
import { Activity, Pause, Play, Radio, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAutomationStore } from '@/store/automationStore'
import { exportTextFile } from '@/lib/exportUtils'
import type { StreamEventSeverity } from '@/types/automation'
import { useT } from '@/lib/i18n'

const SEVERITY_COLOR: Record<StreamEventSeverity, string> = { info: 'var(--signal-cyan)', warning: 'var(--signal-amber)', critical: 'var(--signal-rose)' }

export function EventStreamPanel() {
  const t = useT()
  const events = useAutomationStore((s) => s.streamEvents)
  const paused = useAutomationStore((s) => s.streamPaused)
  const togglePaused = useAutomationStore((s) => s.toggleStreamPaused)
  const [query, setQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<StreamEventSeverity | 'all'>('all')

  const filtered = useMemo(
    () => events.filter((e) => (severityFilter === 'all' || e.severity === severityFilter) && e.description.toLowerCase().includes(query.toLowerCase())),
    [events, query, severityFilter],
  )

  function handleExport() {
    exportTextFile(`event-stream-${Date.now()}.txt`, filtered.map((e) => `[${e.timestamp}] ${e.severity.toUpperCase()} (${e.category}) ${e.description} — ${e.source}`).join('\n'))
  }

  return (
    <Card
      index={33}
      title={t('widgets.eventStream')}
      icon={<Radio size={14} />}
      headerRight={
        <button onClick={togglePaused} style={{ color: paused ? 'var(--signal-amber)' : 'var(--signal-emerald)' }}>
          {paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      }
    >
      <div className="mb-2 flex gap-1.5">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)' }}>
          <Search size={11} style={{ color: 'var(--text-lo)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca..." className="w-full bg-transparent font-data text-[10px] outline-none" style={{ color: 'var(--text-hi)' }} />
        </div>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as StreamEventSeverity | 'all')} className="rounded-lg bg-transparent px-1.5 font-data text-[10px]" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }}>
          <option value="all" style={{ background: '#0a0d14' }}>Tots</option>
          <option value="info" style={{ background: '#0a0d14' }}>Info</option>
          <option value="warning" style={{ background: '#0a0d14' }}>Warning</option>
          <option value="critical" style={{ background: '#0a0d14' }}>Critical</option>
        </select>
        <button onClick={handleExport} className="glass-panel rounded-lg border px-2 text-[10px]" style={{ color: 'var(--text-lo)' }}>
          <Activity size={11} />
        </button>
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto">
        {filtered.slice(0, 40).map((e) => (
          <div key={e.id} className="rounded-md px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)', borderLeft: `2px solid ${SEVERITY_COLOR[e.severity]}` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--text-hi)' }}>{e.description}</span>
              <span className="font-data text-[8px]" style={{ color: 'var(--text-lo)' }}>{e.timestamp}</span>
            </div>
            <div className="font-data text-[8px]" style={{ color: 'var(--text-lo)' }}>{e.category} · {e.source}</div>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-3 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Cap esdeveniment</p>}
      </div>
    </Card>
  )
}

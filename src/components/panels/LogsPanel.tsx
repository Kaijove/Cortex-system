import { useMemo, useState } from 'react'
import { Download, ScrollText, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import type { LogSeverity } from '@/types/system'
import { useT } from '@/lib/i18n'

const SEVERITIES: LogSeverity[] = ['INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG']

const SEVERITY_HEX: Record<LogSeverity, string> = {
  INFO: 'var(--signal-cyan)',
  SUCCESS: 'var(--signal-emerald)',
  WARN: 'var(--signal-amber)',
  ERROR: 'var(--signal-rose)',
  DEBUG: 'var(--text-lo)',
}

export function LogsPanel() {
  const t = useT()
  const logs = useSystemStore((s) => s.logs)
  const logsPaused = useSystemStore((s) => s.logsPaused)
  const toggleLogsPaused = useSystemStore((s) => s.toggleLogsPaused)
  const clearLogs = useSystemStore((s) => s.clearLogs)

  const [activeFilters, setActiveFilters] = useState<Set<LogSeverity>>(new Set(SEVERITIES))

  const filtered = useMemo(() => logs.filter((l) => activeFilters.has(l.severity)), [logs, activeFilters])

  function toggleFilter(sev: LogSeverity) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(sev)) next.delete(sev)
      else next.add(sev)
      return next
    })
  }

  function exportLogs() {
    const text = filtered.map((l) => `[${l.timestamp}] ${l.severity} ${l.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card
      index={6}
      title={t('widgets.logs')}
      icon={<ScrollText size={14} />}
      headerRight={
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLogsPaused}
            className="glass-panel rounded-md border px-2 py-1 text-[11px] transition-colors"
            style={{ color: logsPaused ? 'var(--signal-amber)' : 'var(--text-lo)' }}
          >
            {logsPaused ? 'Pausat' : 'En viu'}
          </button>
          <button onClick={exportLogs} className="glass-panel rounded-md border p-1.5 transition-colors" style={{ color: 'var(--text-lo)' }} title="Exporta">
            <Download size={13} />
          </button>
          <button onClick={clearLogs} className="glass-panel rounded-md border p-1.5 transition-colors" style={{ color: 'var(--text-lo)' }} title="Neteja">
            <Trash2 size={13} />
          </button>
        </div>
      }
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {SEVERITIES.map((sev) => (
          <button
            key={sev}
            onClick={() => toggleFilter(sev)}
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors"
            style={{
              borderColor: activeFilters.has(sev) ? SEVERITY_HEX[sev] : 'var(--glass-border)',
              color: activeFilters.has(sev) ? SEVERITY_HEX[sev] : 'var(--text-lo)',
            }}
          >
            {sev}
          </button>
        ))}
      </div>

      <div
        className="h-56 overflow-y-auto rounded-lg p-2 font-mono text-[11px] leading-relaxed"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--glass-border)' }}
      >
        {filtered.length === 0 && <div style={{ color: 'var(--text-lo)' }}>Sense registres encara...</div>}
        {filtered.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="shrink-0" style={{ color: 'var(--text-lo)' }}>{log.timestamp}</span>
            <span className="shrink-0 font-semibold" style={{ color: SEVERITY_HEX[log.severity] }}>{log.severity}</span>
            <span style={{ color: 'var(--text-hi)' }}>{log.message}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

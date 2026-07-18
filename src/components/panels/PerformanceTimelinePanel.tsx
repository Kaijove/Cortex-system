import { useMemo } from 'react'
import { GitCommitHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useAutomationStore } from '@/store/automationStore'
import { useToolsStore } from '@/store/toolsStore'
import { useT } from '@/lib/i18n'

interface TimelineItem {
  id: string
  timestamp: string
  label: string
  color: string
}

export function PerformanceTimelinePanel() {
  const t = useT()
  const alerts = useSystemStore((s) => s.alerts)
  const streamEvents = useAutomationStore((s) => s.streamEvents)
  const maintenanceTasks = useAutomationStore((s) => s.maintenanceTasks)
  const snapshots = useToolsStore((s) => s.snapshots)

  const items: TimelineItem[] = useMemo(() => {
    const fromAlerts: TimelineItem[] = alerts.slice(0, 10).map((a) => ({ id: `a-${a.id}`, timestamp: a.timestamp, label: `Alerta: ${a.title}`, color: 'var(--signal-rose)' }))
    const fromEvents: TimelineItem[] = streamEvents.slice(0, 15).map((e) => ({ id: `e-${e.id}`, timestamp: e.timestamp, label: e.description, color: e.severity === 'critical' ? 'var(--signal-rose)' : e.severity === 'warning' ? 'var(--signal-amber)' : 'var(--signal-cyan)' }))
    const fromSnapshots: TimelineItem[] = snapshots.slice(0, 10).map((s) => ({ id: `s-${s.id}`, timestamp: s.timestamp, label: `Snapshot: ${s.label}`, color: 'var(--signal-violet)' }))
    const fromMaintenance: TimelineItem[] = maintenanceTasks.filter((t) => t.lastRunAt).map((t) => ({ id: `m-${t.id}`, timestamp: t.lastRunAt as string, label: `Manteniment: ${t.label}`, color: 'var(--signal-emerald)' }))
    return [...fromAlerts, ...fromEvents, ...fromSnapshots, ...fromMaintenance].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 30)
  }, [alerts, streamEvents, snapshots, maintenanceTasks])

  return (
    <Card index={44} title={t('widgets.performanceTimeline')} icon={<GitCommitHorizontal size={14} />}>
      {items.length === 0 ? (
        <p className="py-4 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Encara no hi ha esdeveniments registrats</p>
      ) : (
        <div className="relative max-h-64 space-y-2 overflow-y-auto pl-3">
          <div className="absolute bottom-2 left-1 top-2 w-px" style={{ background: 'var(--glass-border)' }} />
          {items.map((item) => (
            <div key={item.id} className="relative pl-3">
              <span className="absolute -left-2 top-1 h-2 w-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <div className="text-[10px]" style={{ color: 'var(--text-hi)' }}>{item.label}</div>
              <div className="font-data text-[8px]" style={{ color: 'var(--text-lo)' }}>{item.timestamp}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

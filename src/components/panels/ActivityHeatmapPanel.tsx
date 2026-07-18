import { useMemo } from 'react'
import { Grid3x3 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useAutomationStore } from '@/store/automationStore'
import { useT } from '@/lib/i18n'

const WEEKS = 20

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function ActivityHeatmapPanel() {
  const t = useT()
  const alerts = useSystemStore((s) => s.alerts)
  const streamEvents = useAutomationStore((s) => s.streamEvents)

  const countsByDay = useMemo(() => {
    const map: Record<string, number> = {}
    const today = dayKey(new Date())
    map[today] = alerts.length + streamEvents.length
    return map
  }, [alerts, streamEvents])

  const days = useMemo(() => {
    const arr: { key: string; count: number }[] = []
    const now = new Date()
    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = dayKey(d)
      arr.push({ key, count: countsByDay[key] ?? -1 })
    }
    return arr
  }, [countsByDay])

  const maxCount = Math.max(1, ...days.map((d) => d.count))

  function cellColor(count: number): string {
    if (count < 0) return 'rgba(148,163,184,0.06)'
    if (count === 0) return 'rgba(148,163,184,0.12)'
    const intensity = Math.min(1, count / maxCount)
    return `rgba(45, 212, 238, ${0.15 + intensity * 0.7})`
  }

  return (
    <Card index={41} title={t('widgets.activityHeatmap')} icon={<Grid3x3 size={14} />}>
      <div className="mb-2 grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0,1fr))` }}>
        {days.map((d) => (
          <div key={d.key} title={d.count < 0 ? `${d.key}: sense dades` : `${d.key}: ${d.count} esdeveniments`} className="aspect-square rounded-sm" style={{ background: cellColor(d.count) }} />
        ))}
      </div>
      <p className="text-[9px]" style={{ color: 'var(--text-lo)' }}>
        Només compta alertes i esdeveniments reals generats des que tens l'app oberta avui — els dies previs a la primera execució es mostren sense dades.
      </p>
    </Card>
  )
}

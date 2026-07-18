import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { useT } from '@/lib/i18n'

const WEEKDAYS = ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg']
const MONTH_NAMES = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre']

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function CalendarPanel() {
  const t = useT()
  const events = usePersonalizationStore((s) => s.events)
  const addEvent = usePersonalizationStore((s) => s.addEvent)
  const deleteEvent = usePersonalizationStore((s) => s.deleteEvent)

  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()))
  const [newTitle, setNewTitle] = useState('')

  const todayIso = toISODate(new Date())
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const eventsByDay = (day: number) => events.filter((e) => e.date === toISODate(new Date(year, month, day)))
  const upcoming = [...events].filter((e) => e.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  return (
    <Card index={28} title={t('widgets.calendar')} icon={<CalendarDays size={14} />}>
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} style={{ color: 'var(--text-lo)' }}><ChevronLeft size={14} /></button>
        <span className="label-eyebrow text-[10px]">{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} style={{ color: 'var(--text-lo)' }}><ChevronRight size={14} /></button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center font-data text-[8px]" style={{ color: 'var(--text-lo)' }}>
        {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const iso = toISODate(new Date(year, month, day))
          const isToday = iso === todayIso
          const hasEvents = eventsByDay(day).length > 0
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(iso)}
              className="relative rounded-md py-1 font-data text-[10px] transition-colors"
              style={{
                background: iso === selectedDate ? 'var(--glass-fill-hover)' : 'transparent',
                color: isToday ? 'var(--signal-cyan)' : 'var(--text-hi)',
                fontWeight: isToday ? 700 : 400,
              }}
            >
              {day}
              {hasEvents && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" style={{ background: 'var(--signal-amber)' }} />}
            </button>
          )
        })}
      </div>

      <div className="mb-2 flex gap-1.5">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTitle.trim()) {
              addEvent(newTitle.trim(), selectedDate, null)
              setNewTitle('')
            }
          }}
          placeholder={`Afegeix esdeveniment el ${selectedDate}...`}
          className="flex-1 rounded-lg px-2 py-1.5 font-data text-[10px] outline-none"
          style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-hi)' }}
        />
        <button
          onClick={() => {
            if (newTitle.trim()) {
              addEvent(newTitle.trim(), selectedDate, null)
              setNewTitle('')
            }
          }}
          className="glass-panel rounded-lg border px-2" style={{ color: 'var(--signal-cyan)' }}
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="label-eyebrow mb-1 text-[9px]">Propers esdeveniments</div>
      <div className="space-y-1">
        {upcoming.length === 0 && <p className="text-[10px]" style={{ color: 'var(--text-lo)' }}>Cap esdeveniment planificat</p>}
        {upcoming.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-md px-2 py-1" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <span className="truncate text-[10px]" style={{ color: 'var(--text-hi)' }}>{e.title}</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-data text-[9px]" style={{ color: e.date === todayIso ? 'var(--signal-cyan)' : 'var(--text-lo)' }}>{e.date}</span>
              <button onClick={() => deleteEvent(e.id)} style={{ color: 'var(--text-lo)' }}><Trash2 size={10} /></button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

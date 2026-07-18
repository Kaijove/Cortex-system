import { useEffect, useState } from 'react'
import { Clock, Plus, Play, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAutomationStore } from '@/store/automationStore'
import { useSystemStore } from '@/store/systemStore'
import { printSystemReport } from '@/lib/exportUtils'
import type { ScheduleFrequency, ScheduledTaskType } from '@/types/automation'
import { useT } from '@/lib/i18n'

const TYPE_LABELS: Record<ScheduledTaskType, string> = {
  snapshot: 'Snapshot', speedtest: 'Test de velocitat', logCleanup: 'Neteja de logs', report: 'Informe de rendiment', export: 'Exportació automàtica', widgetRefresh: 'Refresc de widgets', scan: 'Escaneig del sistema',
}
const FREQ_LABELS: Record<ScheduleFrequency, string> = { every5min: '5 min', hourly: 'Cada hora', daily: 'Diari', weekly: 'Setmanal' }

function countdown(ms: number): string {
  const total = Math.max(0, ms)
  const h = Math.floor(total / 3_600_000)
  const m = Math.floor((total % 3_600_000) / 60_000)
  const s = Math.floor((total % 60_000) / 1000)
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function SchedulerPanel() {
  const t = useT()
  const tasks = useAutomationStore((s) => s.scheduledTasks)
  const addScheduledTask = useAutomationStore((s) => s.addScheduledTask)
  const toggleScheduledTask = useAutomationStore((s) => s.toggleScheduledTask)
  const deleteScheduledTask = useAutomationStore((s) => s.deleteScheduledTask)
  const runTaskNow = useAutomationStore((s) => s.runTaskNow)
  const [now, setNow] = useState(Date.now())
  const [type, setType] = useState<ScheduledTaskType>('snapshot')
  const [freq, setFreq] = useState<ScheduleFrequency>('hourly')

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function handleRun(id: string, taskType: ScheduledTaskType) {
    runTaskNow(id)
    if (taskType === 'report') {
      const { cpu, ram, healthScore, systemInfo } = useSystemStore.getState()
      printSystemReport('Informe de rendiment programat', [
        { heading: 'Sistema', rows: [['Equip', systemInfo.hostname], ['Salut', `${healthScore.value}/100`]] },
        { heading: 'Rendiment', rows: [['CPU', `${cpu.usage.toFixed(0)}%`], ['RAM', `${ram.usedGB.toFixed(1)} / ${ram.totalGB} GB`]] },
      ])
    }
  }

  return (
    <Card index={31} title={t('widgets.scheduler')} icon={<Clock size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{tasks.filter((t) => t.enabled).length} actives</span>}>
      <div className="mb-3 flex gap-1.5">
        <select value={type} onChange={(e) => setType(e.target.value as ScheduledTaskType)} className="flex-1 rounded-md bg-transparent px-1.5 py-1 font-data text-[10px]" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }}>
          {(Object.keys(TYPE_LABELS) as ScheduledTaskType[]).map((t) => <option key={t} value={t} style={{ background: '#0a0d14' }}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select value={freq} onChange={(e) => setFreq(e.target.value as ScheduleFrequency)} className="rounded-md bg-transparent px-1.5 py-1 font-data text-[10px]" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }}>
          {(Object.keys(FREQ_LABELS) as ScheduleFrequency[]).map((f) => <option key={f} value={f} style={{ background: '#0a0d14' }}>{FREQ_LABELS[f]}</option>)}
        </select>
        <button onClick={() => addScheduledTask(TYPE_LABELS[type], type, freq)} className="glass-panel rounded-md border px-2" style={{ color: 'var(--signal-cyan)' }}><Plus size={13} /></button>
      </div>

      <div className="space-y-1.5">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-0.5 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{task.name}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleScheduledTask(task.id)} className="rounded-full px-1.5 py-0.5 text-[8px]" style={{ background: task.enabled ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)', color: task.enabled ? 'var(--signal-emerald)' : 'var(--text-lo)' }}>
                  {task.enabled ? 'activa' : 'pausada'}
                </button>
                <button onClick={() => handleRun(task.id, task.type)} style={{ color: 'var(--signal-cyan)' }}><Play size={11} /></button>
                <button onClick={() => deleteScheduledTask(task.id)} style={{ color: 'var(--text-lo)' }}><Trash2 size={11} /></button>
              </div>
            </div>
            <div className="flex justify-between font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
              <span>{FREQ_LABELS[task.frequency]} · última: {task.lastRunAt ?? 'mai'}</span>
              <span style={{ color: 'var(--signal-cyan)' }}>{task.enabled ? `en ${countdown(task.nextRunAt - now)}` : '—'}</span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="py-3 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Cap tasca programada</p>}
      </div>
    </Card>
  )
}

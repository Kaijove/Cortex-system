import { Wrench } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAutomationStore } from '@/store/automationStore'
import { useT } from '@/lib/i18n'

export function MaintenancePanel() {
  const t = useT()
  const tasks = useAutomationStore((s) => s.maintenanceTasks)
  const runMaintenanceTask = useAutomationStore((s) => s.runMaintenanceTask)

  return (
    <Card index={35} title={t('widgets.maintenance')} icon={<Wrench size={14} />}>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{task.label}</span>
              <button
                onClick={() => runMaintenanceTask(task.type)}
                disabled={task.running}
                className="rounded-md px-2 py-0.5 text-[9px] disabled:opacity-50"
                style={{ background: 'rgba(45,212,238,0.15)', color: 'var(--signal-cyan)' }}
              >
                {task.running ? 'En procés...' : 'Executa'}
              </button>
            </div>
            {task.running && <ProgressBar value={task.progressPercent} className="h-1.5" color="var(--signal-cyan)" />}
            {!task.running && (
              <div className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
                {task.lastRunAt ? `Última execució: ${task.lastRunAt}` : 'Mai executat'}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>Tasques simulades — no toquen fitxers reals del teu sistema.</p>
    </Card>
  )
}

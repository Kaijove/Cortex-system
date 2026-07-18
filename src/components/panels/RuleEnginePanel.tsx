import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, Workflow, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAutomationStore } from '@/store/automationStore'
import type { ConditionMetric, ConditionOperator, RuleActionType } from '@/types/automation'
import { useT } from '@/lib/i18n'

const METRIC_LABELS: Record<ConditionMetric, string> = {
  cpu: 'CPU %', ram: 'RAM %', disk: 'Disc %', temperature: 'Temp °C', network: 'Salut xarxa', security: 'Puntuació seguretat', apiStatus: 'Serveis online %', time: 'Hora del dia',
}
const ACTION_LABELS: Record<RuleActionType, string> = {
  alert: 'Mostra alerta crítica', log: 'Genera log', sound: 'Reprodueix so', snapshot: 'Crea snapshot', notification: 'Envia notificació',
}

export function RuleEnginePanel() {
  const t = useT()
  const rules = useAutomationStore((s) => s.rules)
  const executions = useAutomationStore((s) => s.executions)
  const addRule = useAutomationStore((s) => s.addRule)
  const toggleRule = useAutomationStore((s) => s.toggleRule)
  const deleteRule = useAutomationStore((s) => s.deleteRule)

  const [building, setBuilding] = useState(false)
  const [name, setName] = useState('')
  const [metric, setMetric] = useState<ConditionMetric>('cpu')
  const [operator, setOperator] = useState<ConditionOperator>('>')
  const [value, setValue] = useState(90)
  const [actions, setActions] = useState<RuleActionType[]>(['alert'])

  function createRule() {
    if (!name.trim()) return
    addRule({
      name: name.trim(),
      enabled: true,
      logic: 'AND',
      conditions: [{ id: `c-${Date.now()}`, metric, operator, value }],
      actions: actions.map((type) => ({ id: `a-${Date.now()}-${type}`, type })),
    })
    setName('')
    setBuilding(false)
  }

  return (
    <Card index={30} title={t('widgets.ruleEngine')} icon={<Workflow size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{rules.filter((r) => r.enabled).length} actives</span>}>
      <div className="mb-3 space-y-1.5">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{rule.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRule(rule.id)} className="rounded-full px-2 py-0.5 text-[9px]" style={{ background: rule.enabled ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)', color: rule.enabled ? 'var(--signal-emerald)' : 'var(--text-lo)' }}>
                  {rule.enabled ? 'activa' : 'inactiva'}
                </button>
                <button onClick={() => deleteRule(rule.id)} style={{ color: 'var(--text-lo)' }}><Trash2 size={11} /></button>
              </div>
            </div>
            <div className="font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
              SI {rule.conditions.map((c) => `${METRIC_LABELS[c.metric]} ${c.operator} ${c.value}`).join(` ${rule.logic} `)} → {rule.actions.map((a) => ACTION_LABELS[a.type]).join(', ')}
            </div>
            {rule.triggerCount > 0 && <div className="mt-0.5 font-data text-[9px]" style={{ color: 'var(--signal-cyan)' }}>Activada {rule.triggerCount}× · última: {rule.lastTriggeredAt}</div>}
          </div>
        ))}
        {rules.length === 0 && !building && <p className="py-3 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Cap regla creada</p>}
      </div>

      <AnimatePresence>
        {building && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3 overflow-hidden rounded-lg p-2.5" style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid var(--glass-border)' }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la regla..." className="mb-2 w-full rounded-md bg-transparent px-1 py-1 text-[11px] outline-none" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }} />
            <div className="mb-2 flex items-center gap-1.5 font-data text-[10px]">
              <span style={{ color: 'var(--text-lo)' }}>SI</span>
              <select value={metric} onChange={(e) => setMetric(e.target.value as ConditionMetric)} className="rounded-md bg-transparent px-1 py-0.5" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }}>
                {(Object.keys(METRIC_LABELS) as ConditionMetric[]).map((m) => <option key={m} value={m} style={{ background: '#0a0d14' }}>{METRIC_LABELS[m]}</option>)}
              </select>
              <select value={operator} onChange={(e) => setOperator(e.target.value as ConditionOperator)} className="rounded-md bg-transparent px-1 py-0.5" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }}>
                {(['>', '<', '>=', '<=', '=='] as ConditionOperator[]).map((op) => <option key={op} value={op} style={{ background: '#0a0d14' }}>{op}</option>)}
              </select>
              <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-14 rounded-md bg-transparent px-1 py-0.5" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }} />
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {(Object.keys(ACTION_LABELS) as RuleActionType[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setActions((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))}
                  className="rounded-full px-2 py-0.5 text-[9px]"
                  style={{ background: actions.includes(a) ? 'rgba(45,212,238,0.15)' : 'rgba(148,163,184,0.08)', color: actions.includes(a) ? 'var(--signal-cyan)' : 'var(--text-lo)' }}
                >
                  {ACTION_LABELS[a]}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-1.5">
              <button onClick={() => setBuilding(false)} className="rounded-md px-2 py-1 text-[10px]" style={{ color: 'var(--text-lo)' }}>Cancel·la</button>
              <button onClick={createRule} className="rounded-md px-2 py-1 text-[10px]" style={{ background: 'rgba(45,212,238,0.15)', color: 'var(--signal-cyan)' }}>Crea regla</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!building && (
        <button onClick={() => setBuilding(true)} className="glass-panel mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px]" style={{ color: 'var(--signal-cyan)' }}>
          <Plus size={13} /> Nova regla
        </button>
      )}

      {executions.length > 0 && (
        <div>
          <div className="label-eyebrow mb-1 flex items-center gap-1 text-[9px]"><Zap size={10} /> Historial d'execucions</div>
          <div className="max-h-24 space-y-0.5 overflow-y-auto font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
            {executions.slice(0, 8).map((e) => <div key={e.id}>{e.timestamp} · {e.ruleName}</div>)}
          </div>
        </div>
      )}
    </Card>
  )
}

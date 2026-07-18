import type { ReactNode } from 'react'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Pin, Power, RotateCw, X } from 'lucide-react'
import { useSystemStore } from '@/store/systemStore'
import { useToolsStore } from '@/store/toolsStore'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export function ProcessInspectorModal() {
  const selectedPid = useToolsStore((s) => s.selectedProcessPid)
  const processes = useSystemStore((s) => s.processes)
  const histories = useToolsStore((s) => s.processHistories)
  const pinnedPids = useToolsStore((s) => s.pinnedProcessPids)
  const terminatedPids = useToolsStore((s) => s.terminatedProcessPids)
  const selectProcess = useToolsStore((s) => s.selectProcess)
  const togglePinProcess = useToolsStore((s) => s.togglePinProcess)
  const terminateProcess = useToolsStore((s) => s.terminateProcess)
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, selectedPid !== null)

  if (selectedPid === null) return null
  const proc = processes.find((p) => p.pid === selectedPid)
  if (!proc) return null

  const history = histories[selectedPid] ?? { cpu: [], ram: [] }
  const isPinned = pinnedPids.has(selectedPid)
  const isTerminated = terminatedPids.has(selectedPid)

  // Deterministic-but-plausible parent/children/open files derived from the PID,
  // since the app has no real access to the OS process tree beyond the flat list.
  const parentPid = proc.pid > 1000 ? proc.pid - (proc.pid % 97) - 7 : null
  const childPids = processes.filter((p) => p.pid !== proc.pid && p.pid % (proc.pid % 5 + 3) === 0).slice(0, 3).map((p) => p.pid)
  const openFiles = [`/proc/${proc.pid}/status`, `/usr/lib/${proc.name}/${proc.name}.so`, `/home/${proc.owner}/.config/${proc.name}/config.json`]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={() => selectProcess(null)}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl p-4 backdrop-blur-xl"
        style={{ background: 'rgba(8,10,16,0.92)', border: '1px solid var(--glass-border)', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-data text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>{proc.name}</div>
            <div className="font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>PID {proc.pid} · {proc.owner}</div>
          </div>
          <button onClick={() => selectProcess(null)} style={{ color: 'var(--text-lo)' }} className="transition-colors hover:text-white">
            <X size={18} />
          </button>
        </div>

        {isTerminated && (
          <div className="mb-3 rounded-md px-2 py-1 text-[11px]" style={{ background: 'rgba(251,113,133,0.12)', color: 'var(--signal-rose)' }}>
            Marcat com a finalitzat (simulat) — no s'ha tocat cap procés real.
          </div>
        )}

        <div className="mb-3 grid grid-cols-2 gap-2">
          <MiniChart title="CPU" data={history.cpu} color="var(--signal-cyan)" suffix="%" />
          <MiniChart title="RAM" data={history.ram} color="var(--signal-violet)" suffix=" MB" />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 font-data text-[11px]" style={{ color: 'var(--text-lo)' }}>
          <Field label="Estat" value={proc.status} />
          <Field label="Prioritat" value={proc.priority?.toString() ?? 'N/D'} />
          <Field label="Fils" value={proc.threads?.toString() ?? 'N/D'} />
          <Field label="Temps d'execució" value={proc.runtime} />
          <Field label="Procés pare" value={parentPid?.toString() ?? '—'} />
          <Field label="Processos fill" value={childPids.length ? childPids.join(', ') : '—'} />
        </div>

        <div className="mb-3">
          <div className="label-eyebrow mb-1 text-[9px]">Línia de comandes</div>
          <div className="rounded-md p-2 font-mono text-[10px]" style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--text-lo)' }}>
            /usr/bin/{proc.name} --pid={proc.pid}
          </div>
        </div>

        <div className="mb-4">
          <div className="label-eyebrow mb-1 text-[9px]">Fitxers oberts (il·lustratiu)</div>
          <div className="space-y-0.5 font-mono text-[10px]" style={{ color: 'var(--text-lo)' }}>
            {openFiles.map((f) => <div key={f}>{f}</div>)}
          </div>
        </div>

        <div className="flex gap-2">
          <ActionButton icon={<Pin size={13} />} label={isPinned ? 'Desfixa' : 'Fixa'} active={isPinned} onClick={() => togglePinProcess(proc.pid)} />
          <ActionButton icon={<RotateCw size={13} />} label="Reinicia" onClick={() => {}} />
          <ActionButton icon={<Power size={13} />} label="Finalitza" danger onClick={() => terminateProcess(proc.pid)} disabled={isTerminated} />
        </div>
        <p className="mt-2 text-center text-[9px]" style={{ color: 'var(--text-lo)' }}>Reiniciar i finalitzar són simulats — no afecten cap procés real.</p>
      </motion.div>
    </motion.div>
  )
}

function MiniChart({ title, data, color, suffix }: { title: string; data: { time: string; value: number }[]; color: string; suffix: string }) {
  const last = data[data.length - 1]?.value ?? 0
  return (
    <div className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="mb-1 flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
        <span>{title}</span>
        <span style={{ color }}>{last.toFixed(0)}{suffix}</span>
      </div>
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 10, borderRadius: 6 }} />
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md px-2 py-1" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="text-[9px]" style={{ color: 'var(--text-lo)' }}>{label}</div>
      <div style={{ color: 'var(--text-hi)' }}>{value}</div>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  danger,
  disabled,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  const color = danger ? 'var(--signal-rose)' : active ? 'var(--signal-cyan)' : 'var(--text-lo)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="glass-panel flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] transition-colors disabled:opacity-40"
      style={{ color }}
    >
      {icon}
      {label}
    </button>
  )
}

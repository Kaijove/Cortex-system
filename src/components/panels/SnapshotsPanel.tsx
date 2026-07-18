import { useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToolsStore } from '@/store/toolsStore'
import { useT } from '@/lib/i18n'

function DiffValue({ a, b, unit = '', decimals = 1 }: { a: number; b: number; unit?: string; decimals?: number }) {
  const delta = b - a
  const color = Math.abs(delta) < 0.01 ? 'var(--text-lo)' : delta > 0 ? 'var(--signal-rose)' : 'var(--signal-emerald)'
  return (
    <span style={{ color }}>
      {delta > 0 ? '+' : ''}
      {delta.toFixed(decimals)}{unit}
    </span>
  )
}

export function SnapshotsPanel() {
  const t = useT()
  const snapshots = useToolsStore((s) => s.snapshots)
  const takeSnapshot = useToolsStore((s) => s.takeSnapshot)
  const deleteSnapshot = useToolsStore((s) => s.deleteSnapshot)
  const compareIds = useToolsStore((s) => s.compareIds)
  const setCompare = useToolsStore((s) => s.setCompare)
  const [label, setLabel] = useState('')

  const snapA = snapshots.find((s) => s.id === compareIds[0])
  const snapB = snapshots.find((s) => s.id === compareIds[1])

  return (
    <Card index={25} title={t('widgets.snapshots')} icon={<Camera size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{snapshots.length} desats</span>}>
      <div className="mb-2 flex gap-1.5">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nom (opcional)..."
          className="flex-1 rounded-lg px-2 py-1.5 font-data text-[11px] outline-none"
          style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-hi)' }}
        />
        <button
          onClick={() => {
            takeSnapshot(label)
            setLabel('')
          }}
          className="glass-panel rounded-lg border px-3 text-[11px] transition-colors"
          style={{ color: 'var(--signal-cyan)' }}
        >
          Captura
        </button>
      </div>

      {snapA && snapB && (
        <div className="mb-3 rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)' }}>
          <div className="mb-1 flex justify-between font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
            <span>{snapA.label}</span>
            <span>→</span>
            <span>{snapB.label}</span>
          </div>
          <div className="space-y-0.5 font-data text-[10px]">
            <div className="flex justify-between"><span style={{ color: 'var(--text-lo)' }}>Salut</span><DiffValue a={snapA.healthScore} b={snapB.healthScore} decimals={0} /></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-lo)' }}>CPU</span><DiffValue a={snapA.cpuUsage} b={snapB.cpuUsage} unit="%" decimals={0} /></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-lo)' }}>RAM</span><DiffValue a={snapA.ramUsedGB} b={snapB.ramUsedGB} unit=" GB" /></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-lo)' }}>Disc</span><DiffValue a={snapA.diskUsedGB} b={snapB.diskUsedGB} unit=" GB" /></div>
          </div>
        </div>
      )}

      <div className="max-h-48 space-y-1 overflow-y-auto">
        {snapshots.map((snap) => (
          <div key={snap.id} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="min-w-0">
              <div className="truncate text-[11px]" style={{ color: 'var(--text-hi)' }}>{snap.label}</div>
              <div className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
                {snap.timestamp} · salut {snap.healthScore} · CPU {snap.cpuUsage.toFixed(0)}%
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <CompareBtn active={compareIds[0] === snap.id} label="A" onClick={() => setCompare(0, compareIds[0] === snap.id ? null : snap.id)} />
              <CompareBtn active={compareIds[1] === snap.id} label="B" onClick={() => setCompare(1, compareIds[1] === snap.id ? null : snap.id)} />
              <button onClick={() => deleteSnapshot(snap.id)} style={{ color: 'var(--text-lo)' }} className="transition-colors hover:text-white">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {snapshots.length === 0 && (
          <EmptyState icon={<Camera size={22} />} message="Cap snapshot desat encara" actionLabel="Captura'n un" onAction={() => takeSnapshot()} />
        )}
      </div>
    </Card>
  )
}

function CompareBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-1.5 py-0.5 font-data text-[9px] transition-colors"
      style={{ background: active ? 'rgba(45,212,238,0.2)' : 'rgba(148,163,184,0.08)', color: active ? 'var(--signal-cyan)' : 'var(--text-lo)' }}
    >
      {label}
    </button>
  )
}

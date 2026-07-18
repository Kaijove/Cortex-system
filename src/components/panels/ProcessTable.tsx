import { useMemo, useState } from 'react'
import { Eye, ListTree, Pin, Power, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ContextMenuPortal } from '@/components/ui/ContextMenu'
import { useContextMenu } from '@/hooks/useContextMenu'
import { useSystemStore } from '@/store/systemStore'
import { useToolsStore } from '@/store/toolsStore'
import type { ProcessInfo } from '@/types/system'
import { useT } from '@/lib/i18n'

type SortKey = keyof Pick<ProcessInfo, 'pid' | 'name' | 'cpu' | 'ram' | 'threads' | 'status' | 'owner' | 'priority'>

const PAGE_SIZE = 10

const STATUS_COLOR: Record<ProcessInfo['status'], string> = {
  running: 'var(--signal-emerald)',
  sleeping: 'var(--text-lo)',
  stopped: 'var(--signal-amber)',
  zombie: 'var(--signal-rose)',
}

export function ProcessTable() {
  const t = useT()
  const processes = useSystemStore((s) => s.processes)
  const selectProcess = useToolsStore((s) => s.selectProcess)
  const togglePinProcess = useToolsStore((s) => s.togglePinProcess)
  const terminateProcess = useToolsStore((s) => s.terminateProcess)
  const { menu, openMenu, closeMenu } = useContextMenu()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('cpu')
  const [sortDesc, setSortDesc] = useState(true)
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? processes.filter((p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q)) : processes
    const sorted = [...base].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDesc ? -cmp : cmp
    })
    return sorted
  }, [processes, query, sortKey, sortDesc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDesc((d) => !d)
    } else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  return (
    <Card
      index={4}
      title={t('widgets.processes')}
      icon={<ListTree size={14} />}
      headerRight={<span className="label-eyebrow text-[9px]">{filtered.length} resultats</span>}
    >
      <div
        className="mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5"
        style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)' }}
      >
        <Search size={14} style={{ color: 'var(--text-lo)' }} />
        <input
          id="process-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          placeholder="Cerca per nom o PID..."
          className="w-full bg-transparent font-data text-xs outline-none"
          style={{ color: 'var(--text-hi)' }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-data text-xs">
          <thead className="sticky top-0 z-10" style={{ background: 'var(--void)' }}>
            <tr style={{ color: 'var(--text-lo)' }}>
              <Th label="PID" active={sortKey === 'pid'} desc={sortDesc} onClick={() => toggleSort('pid')} />
              <Th label="Nom" active={sortKey === 'name'} desc={sortDesc} onClick={() => toggleSort('name')} />
              <Th label="CPU %" active={sortKey === 'cpu'} desc={sortDesc} onClick={() => toggleSort('cpu')} />
              <Th label="RAM MB" active={sortKey === 'ram'} desc={sortDesc} onClick={() => toggleSort('ram')} />
              <Th label="Fils" active={sortKey === 'threads'} desc={sortDesc} onClick={() => toggleSort('threads')} />
              <Th label="Estat" active={sortKey === 'status'} desc={sortDesc} onClick={() => toggleSort('status')} />
              <Th label="Propietari" active={sortKey === 'owner'} desc={sortDesc} onClick={() => toggleSort('owner')} />
              <Th label="Prioritat" active={sortKey === 'priority'} desc={sortDesc} onClick={() => toggleSort('priority')} />
              <th className="py-1.5 pr-2 font-normal">Temps</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => (
              <tr
                key={p.pid}
                className="cursor-pointer border-t transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: 'var(--glass-border)' }}
                onClick={() => selectProcess(p.pid)}
                onContextMenu={(e) =>
                  openMenu(e, [
                    { label: 'Veure detalls', icon: <Eye size={12} />, onSelect: () => selectProcess(p.pid) },
                    { label: 'Fixa procés', icon: <Pin size={12} />, onSelect: () => togglePinProcess(p.pid) },
                    { label: 'Finalitza (simulat)', icon: <Power size={12} />, danger: true, onSelect: () => terminateProcess(p.pid) },
                  ])
                }
              >
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-lo)' }}>{p.pid}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-hi)' }}>{p.name}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-hi)' }}>{p.cpu.toFixed(1)}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-hi)' }}>{p.ram.toFixed(0)}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-hi)' }}>{p.threads ?? 'N/D'}</td>
                <td className="py-1.5 pr-2" style={{ color: STATUS_COLOR[p.status] }}>{p.status}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-lo)' }}>{p.owner}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-hi)' }}>{p.priority ?? 'N/D'}</td>
                <td className="py-1.5 pr-2" style={{ color: 'var(--text-lo)' }}>{p.runtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between font-data text-xs" style={{ color: 'var(--text-lo)' }}>
        <span>Pàgina {page + 1} de {totalPages}</span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="glass-panel rounded-md border px-2 py-1 transition-colors disabled:opacity-30"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="glass-panel rounded-md border px-2 py-1 transition-colors disabled:opacity-30"
          >
            Següent
          </button>
        </div>
      </div>
      <ContextMenuPortal menu={menu} onClose={closeMenu} />
    </Card>
  )
}

function Th({ label, active, desc, onClick }: { label: string; active: boolean; desc: boolean; onClick: () => void }) {
  return (
    <th
      className="cursor-pointer select-none py-1.5 pr-2 font-normal transition-colors hover:text-white"
      style={{ color: active ? 'var(--signal-cyan)' : undefined }}
      onClick={onClick}
    >
      {label}
      {active && <span className="ml-1">{desc ? '↓' : '↑'}</span>}
    </th>
  )
}

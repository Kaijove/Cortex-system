import { useMemo, useState } from 'react'
import { PackageSearch, ArrowUpCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToolsStore } from '@/store/toolsStore'
import { useT } from '@/lib/i18n'

export function PackageManagerPanel() {
  const t = useT()
  const packages = useToolsStore((s) => s.packages)
  const updatePackage = useToolsStore((s) => s.updatePackage)
  const updateAllPackages = useToolsStore((s) => s.updateAllPackages)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => packages.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), [packages, query])
  const updatesAvailable = packages.filter((p) => p.hasUpdate).length

  return (
    <Card
      index={23}
      title={t('widgets.packages')}
      icon={<PackageSearch size={14} />}
      headerRight={
        updatesAvailable > 0 ? (
          <button onClick={updateAllPackages} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px]" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--signal-emerald)' }}>
            <ArrowUpCircle size={10} /> Actualitza-ho tot ({updatesAvailable})
          </button>
        ) : (
          <span className="label-eyebrow text-[9px]" style={{ color: 'var(--signal-emerald)' }}>Al dia</span>
        )
      }
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca paquets..."
        className="mb-2 w-full rounded-lg px-2 py-1.5 font-data text-[11px] outline-none"
        style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-hi)' }}
      />
      <div className="max-h-56 space-y-1 overflow-y-auto">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="min-w-0">
              <div className="truncate text-[11px]" style={{ color: 'var(--text-hi)' }}>{p.name}</div>
              <div className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{p.version} · {p.repository} · {p.category}</div>
            </div>
            {p.hasUpdate ? (
              <button onClick={() => updatePackage(p.id)} className="shrink-0 rounded-md px-2 py-1 font-data text-[9px]" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--signal-emerald)' }}>
                → {p.latestVersion}
              </button>
            ) : (
              <span className="shrink-0 text-[9px]" style={{ color: 'var(--text-lo)' }}>al dia</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>Llista simulada — no interactua amb apt/pacman/dnf reals.</p>
    </Card>
  )
}

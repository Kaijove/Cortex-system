import { useMemo, useState } from 'react'
import { Database, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { exportCsvFile } from '@/lib/exportUtils'
import { useT } from '@/lib/i18n'

type SortKey = 'cpu' | 'ram' | 'disk' | 'network' | 'security' | 'health'

export function DataExplorerPanel() {
  const t = useT()
  const history = useAnalyticsStore((s) => s.history)
  const [sortKey, setSortKey] = useState<SortKey>('cpu')
  const [minValue, setMinValue] = useState('')

  const rows = useMemo(() => {
    let filtered = [...history].reverse().slice(0, 500)
    if (minValue) {
      const min = Number(minValue)
      filtered = filtered.filter((s) => s[sortKey] >= min)
    }
    return filtered.sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 20)
  }, [history, sortKey, minValue])

  return (
    <Card index={46} title={t('widgets.dataExplorer')} icon={<Database size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{history.length} mostres</span>}>
      <div className="mb-2 flex gap-1.5">
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-md bg-transparent px-1.5 py-1 font-data text-[10px]" style={{ color: 'var(--text-hi)', border: '1px solid var(--glass-border)' }}>
          {(['cpu', 'ram', 'disk', 'network', 'security', 'health'] as SortKey[]).map((k) => <option key={k} value={k} style={{ background: '#0a0d14' }}>{k}</option>)}
        </select>
        <div className="flex flex-1 items-center gap-1 rounded-md px-1.5" style={{ border: '1px solid var(--glass-border)' }}>
          <Search size={10} style={{ color: 'var(--text-lo)' }} />
          <input value={minValue} onChange={(e) => setMinValue(e.target.value)} placeholder="valor mínim..." type="number" className="w-full bg-transparent py-1 font-data text-[10px] outline-none" style={{ color: 'var(--text-hi)' }} />
        </div>
        <button
          onClick={() => exportCsvFile(`explorer-${Date.now()}.csv`, ['temps', sortKey], rows.map((r) => [new Date(r.t).toISOString(), r[sortKey].toFixed(1)]))}
          className="glass-panel rounded-md border px-2 text-[9px]"
          style={{ color: 'var(--text-lo)' }}
        >
          CSV
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto">
        <table className="w-full font-data text-[10px]">
          <thead>
            <tr style={{ color: 'var(--text-lo)' }}>
              <th className="pb-1 text-left font-normal">Temps</th>
              <th className="pb-1 text-right font-normal">{sortKey}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.t} className="border-t" style={{ borderColor: 'var(--glass-border)' }}>
                <td className="py-1" style={{ color: 'var(--text-lo)' }}>{new Date(r.t).toLocaleString('ca-ES')}</td>
                <td className="py-1 text-right" style={{ color: 'var(--text-hi)' }}>{r[sortKey].toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-4 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Cap resultat</p>}
      </div>
    </Card>
  )
}

import { useState } from 'react'
import { HardDriveDownload } from 'lucide-react'
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import { Card } from '@/components/ui/Card'
import { useToolsStore } from '@/store/toolsStore'
import { useT } from '@/lib/i18n'

const PALETTE = ['var(--signal-cyan)', 'var(--signal-violet)', 'var(--signal-amber)', 'var(--signal-emerald)', 'var(--signal-rose)']

export function StorageAnalyzerPanel() {
  const t = useT()
  const categories = useToolsStore((s) => s.storageCategories)
  const [drilled, setDrilled] = useState<string | null>(null)

  const activeCategory = categories.find((c) => c.name === drilled)
  const data = activeCategory?.children ?? categories

  const treeData = data.map((d, i) => ({ name: d.name, size: d.sizeGB, fill: PALETTE[i % PALETTE.length] }))
  const total = categories.reduce((sum, c) => sum + c.sizeGB, 0)
  const largestFolders = [...categories].sort((a, b) => b.sizeGB - a.sizeGB).slice(0, 3)

  return (
    <Card index={24} title={t('widgets.storageAnalyzer')} icon={<HardDriveDownload size={14} />} headerRight={<span className="label-eyebrow text-[9px]">{total.toFixed(1)} GB</span>}>
      {drilled && (
        <button onClick={() => setDrilled(null)} className="mb-2 font-data text-[10px]" style={{ color: 'var(--signal-cyan)' }}>
          ← Tornar
        </button>
      )}
      <div className="mb-3 h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="size"
            stroke="var(--void)"
            fill="var(--signal-cyan)"
            isAnimationActive={false}
            onClick={(node: { name?: string }) => !drilled && node?.name && setDrilled(node.name)}
            content={<TreemapCell />}
          >
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 11, borderRadius: 8 }} formatter={(v) => `${Number(v).toFixed(1)} GB`} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {!drilled && (
        <div>
          <div className="label-eyebrow mb-1 text-[9px]">Carpetes més grans</div>
          <div className="space-y-1">
            {largestFolders.map((f) => (
              <div key={f.name} className="flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
                <span>{f.name}</span>
                <span style={{ color: 'var(--text-hi)' }}>{f.sizeGB.toFixed(1)} GB</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>Categories il·lustratives — clica un bloc per veure'n el detall.</p>
    </Card>
  )
}

interface TreemapCellProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  fill?: string
}

function TreemapCell({ x = 0, y = 0, width = 0, height = 0, name, fill }: TreemapCellProps) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill, fillOpacity: 0.35, stroke: 'var(--void)', strokeWidth: 2, cursor: 'pointer' }} />
      {width > 40 && height > 20 && (
        <text x={x + 6} y={y + 16} fontSize={10} fill="var(--text-hi)">
          {name}
        </text>
      )}
    </g>
  )
}

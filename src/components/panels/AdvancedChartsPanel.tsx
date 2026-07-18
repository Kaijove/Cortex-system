import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useT } from '@/lib/i18n'

const COLORS = ['var(--signal-cyan)', 'var(--signal-violet)', 'var(--signal-amber)', 'var(--signal-emerald)', 'var(--signal-rose)']

export function AdvancedChartsPanel() {
  const t = useT()
  const cpu = useSystemStore((s) => s.cpu)
  const disk = useSystemStore((s) => s.disk)
  const processes = useSystemStore((s) => s.processes)

  const barData = cpu.cores.slice(0, 8).map((c) => ({ name: `C${c.id}`, ús: Math.round(c.usage) }))
  const donutData = disk.partitions.map((p) => ({ name: p.mountPoint, value: p.usedGB }))
  const scatterData = processes.slice(0, 30).map((p) => ({ x: p.cpu, y: p.ram, name: p.name }))

  return (
    <Card index={40} title={t('widgets.advancedCharts')} icon={<LayoutGrid size={14} />}>
      <div className="mb-1 label-eyebrow text-[9px]">Barres — ús per nucli</div>
      <div className="mb-3 h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 10, borderRadius: 6 }} />
            <Bar dataKey="ús" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-1 label-eyebrow text-[9px]">Donut — ús de disc per partició</div>
      <div className="mb-3 h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={44} paddingAngle={3} isAnimationActive={false}>
              {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 10, borderRadius: 6 }} formatter={(v) => `${Number(v).toFixed(1)} GB`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-1 label-eyebrow text-[9px]">Dispersió — CPU vs RAM per procés</div>
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis type="number" dataKey="x" name="CPU %" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <YAxis type="number" dataKey="y" name="RAM MB" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 10, borderRadius: 6 }} />
            <Scatter data={scatterData} fill="var(--signal-cyan)" isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

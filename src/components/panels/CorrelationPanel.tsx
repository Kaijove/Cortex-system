import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { GitCompareArrows } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { pearsonCorrelation } from '@/lib/analyticsUtils'
import { useT } from '@/lib/i18n'

function corrColor(r: number): string {
  const abs = Math.abs(r)
  if (abs > 0.6) return 'var(--signal-rose)'
  if (abs > 0.3) return 'var(--signal-amber)'
  return 'var(--text-lo)'
}

export function CorrelationPanel() {
  const t = useT()
  const history = useAnalyticsStore((s) => s.history)
  const recent = history.slice(-60)

  const cpuTempPairs = recent.filter((s) => s.temperature !== null).map((s) => ({ x: s.cpu, y: s.temperature as number }))
  const cpuTempR = pearsonCorrelation(cpuTempPairs)

  const ramDiskPairs = recent.map((s) => ({ x: s.ram, y: s.disk }))
  const ramDiskR = pearsonCorrelation(ramDiskPairs)

  return (
    <Card index={43} title={t('widgets.correlations')} icon={<GitCompareArrows size={14} />}>
      <div className="mb-3 space-y-1.5">
        <CorrRow label="CPU vs Temperatura" r={cpuTempR} available={cpuTempPairs.length >= 5} reason="Cal mode EN VIU amb sensor de temperatura i més mostres." />
        <CorrRow label="RAM vs Activitat de disc" r={ramDiskR} available={ramDiskPairs.length >= 5} />
        <CorrRow label="Xarxa vs Processos" r={0} available={false} reason="Comparació poc significativa amb les dades actuals; es manté només com a exemple del tipus de gràfic." />
        <CorrRow label="Meteorologia vs Temperatura del sistema" r={0} available={false} reason="Aquesta app no té cap font de dades meteorològiques real." />
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis type="number" dataKey="x" name="CPU %" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <YAxis type="number" dataKey="y" name="Temp °C" tick={{ fill: 'var(--text-lo)', fontSize: 9 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(10,12,18,0.9)', border: '1px solid var(--glass-border)', fontSize: 10, borderRadius: 6 }} />
            <Scatter data={cpuTempPairs} fill="var(--signal-cyan)" isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[9px]" style={{ color: 'var(--text-lo)' }}>CPU vs Temperatura, calculat sobre les últimes {cpuTempPairs.length} mostres reals.</p>
    </Card>
  )
}

function CorrRow({ label, r, available, reason }: { label: string; r: number; available: boolean; reason?: string }) {
  return (
    <div className="rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{label}</span>
        {available ? (
          <span className="font-data text-[10px] font-semibold" style={{ color: corrColor(r) }}>r = {r.toFixed(2)}</span>
        ) : (
          <span className="text-[9px]" style={{ color: 'var(--text-lo)' }}>N/D</span>
        )}
      </div>
      {!available && reason && <p className="mt-0.5 text-[9px]" style={{ color: 'var(--text-lo)' }}>{reason}</p>}
    </div>
  )
}

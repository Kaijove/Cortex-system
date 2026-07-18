import { LineChart as LineChartIcon, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import type { Prediction } from '@/types/system'
import { useT } from '@/lib/i18n'

const METRIC_COLOR: Record<Prediction['metric'], string> = {
  cpu: 'var(--signal-cyan)',
  ram: 'var(--signal-violet)',
  disk: 'var(--signal-amber)',
  network: 'var(--signal-emerald)',
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus }

export function PredictionsPanel() {
  const t = useT()
  const predictions = useSystemStore((s) => s.predictions)

  return (
    <Card index={10} title={t('widgets.predictions')} icon={<LineChartIcon size={14} />}>
      {predictions.length === 0 ? (
        <p className="text-[11px]" style={{ color: 'var(--text-lo)' }}>
          Recollint dades per generar prediccions...
        </p>
      ) : (
        <div className="space-y-3">
          {predictions.map((p) => (
            <PredictionRow key={p.id} prediction={p} />
          ))}
        </div>
      )}
    </Card>
  )
}

function PredictionRow({ prediction }: { prediction: Prediction }) {
  const color = METRIC_COLOR[prediction.metric]
  const TrendIcon = TREND_ICON[prediction.trend]

  const chartData = prediction.projectedHistory.map((p, i) => ({
    time: p.time,
    actual: i <= prediction.projectedFromIndex ? p.value : null,
    projected: i >= prediction.projectedFromIndex ? p.value : null,
  }))

  return (
    <div className="rounded-lg p-2.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-hi)' }}>
          <TrendIcon size={13} style={{ color }} />
          {prediction.label}
        </div>
        <span className="font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
          confiança {prediction.confidencePercent}%
        </span>
      </div>

      <div className="mb-1 h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis hide domain={['auto', 'auto']} />
            <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
            <Line type="monotone" dataKey="projected" stroke={color} strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] leading-snug" style={{ color: 'var(--text-lo)' }}>{prediction.explanation}</p>
    </div>
  )
}

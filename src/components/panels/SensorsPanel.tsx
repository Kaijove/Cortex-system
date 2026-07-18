import { Thermometer } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToolsStore } from '@/store/toolsStore'
import type { SensorCategory } from '@/types/tools'
import { useT } from '@/lib/i18n'

const CATEGORY_COLOR: Record<SensorCategory, string> = {
  temperature: 'var(--signal-amber)',
  fan: 'var(--signal-cyan)',
  power: 'var(--signal-emerald)',
  voltage: 'var(--signal-violet)',
}

export function SensorsPanel() {
  const t = useT()
  const sensors = useToolsStore((s) => s.sensors)

  return (
    <Card index={19} title={t('widgets.sensors')} icon={<Thermometer size={14} />}>
      <div className="grid grid-cols-2 gap-2">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="rounded-lg p-2.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--text-hi)' }}>{sensor.label}</span>
              {!sensor.isReal && <span className="text-[8px]" style={{ color: 'var(--text-lo)' }}>exemple</span>}
            </div>
            <div className="font-data text-lg font-semibold" style={{ color: CATEGORY_COLOR[sensor.category] }}>
              {sensor.current.toFixed(sensor.unit === 'V' ? 2 : 0)}
              <span className="ml-0.5 text-xs" style={{ color: 'var(--text-lo)' }}>{sensor.unit}</span>
            </div>
            <div className="mt-1 flex justify-between font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
              <span>min {sensor.min.toFixed(1)}</span>
              <span>mitj {sensor.avg.toFixed(1)}</span>
              <span>max {sensor.max.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

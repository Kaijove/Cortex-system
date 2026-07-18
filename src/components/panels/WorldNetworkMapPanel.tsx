import { motion } from 'framer-motion'
import { Radar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import type { RegionLatency } from '@/types/network'
import { useT } from '@/lib/i18n'

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 95

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function latencyColor(ms: number | null): string {
  if (ms === null) return 'var(--signal-rose)'
  if (ms < 150) return 'var(--signal-emerald)'
  if (ms < 350) return 'var(--signal-amber)'
  return 'var(--signal-rose)'
}

export function WorldNetworkMapPanel() {
  const t = useT()
  const regions = useNetworkSuiteStore((s) => s.regions)

  return (
    <Card index={15} title={t('widgets.netMap')} icon={<Radar size={14} />}>
      <p className="mb-2 text-[10px] leading-snug" style={{ color: 'var(--text-lo)' }}>
        Latència real mesurada a serveis representatius de cada regió (no és una traça de xarxa exacta al centre de dades).
      </p>
      <div className="flex justify-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {[0.33, 0.66, 1].map((f) => (
            <circle key={f} cx={CENTER} cy={CENTER} r={RADIUS * f} fill="none" stroke="var(--glass-border)" strokeWidth={1} />
          ))}
          {regions.map((region) => {
            const pos = pointOnCircle(region.angle, RADIUS)
            const color = region.status === 'checking' ? 'var(--text-lo)' : latencyColor(region.latencyMs)
            return (
              <g key={region.id}>
                <motion.line
                  x1={CENTER}
                  y1={CENTER}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={color}
                  strokeWidth={1}
                  strokeOpacity={0.35}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <RegionMarker region={region} pos={pos} color={color} />
              </g>
            )
          })}
          <circle cx={CENTER} cy={CENTER} r={5} fill="var(--signal-cyan)" />
          <circle cx={CENTER} cy={CENTER} r={9} fill="none" stroke="var(--signal-cyan)" strokeOpacity={0.4} strokeWidth={1.5} />
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {regions.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md px-2 py-1 font-data text-[10px]" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <span style={{ color: 'var(--text-lo)' }}>{r.label}</span>
            <span style={{ color: latencyColor(r.latencyMs) }}>{r.latencyMs === null ? (r.status === 'checking' ? '...' : 'N/D') : `${r.latencyMs.toFixed(0)} ms`}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RegionMarker({ region, pos, color }: { region: RegionLatency; pos: { x: number; y: number }; color: string }) {
  return (
    <g>
      <motion.circle
        cx={pos.x}
        cy={pos.y}
        r={5}
        fill={color}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <text x={pos.x} y={pos.y - 10} textAnchor="middle" fontSize={8} fill="var(--text-lo)">
        {region.label.split(' ')[0]}
      </text>
    </g>
  )
}

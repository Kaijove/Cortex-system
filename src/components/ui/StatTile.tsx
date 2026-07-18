interface StatTileProps {
  label: string
  value: string
  color?: string
}

/**
 * Small labeled metric tile — the "value on top, eyebrow label below" pattern
 * repeated (with copy-pasted drift) across CpuPanel, RamPanel, DiskPanel,
 * GpuMonitorPanel, HealthScorePanel, SpeedTestPanel and others. Extracted
 * here as the single source of truth; new panels should use this instead of
 * writing another local `Stat`/`MiniStat` function.
 */
export function StatTile({ label, value, color }: StatTileProps) {
  return (
    <div className="rounded-lg py-1.5 text-center" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="font-data text-sm" style={{ color: color ?? 'var(--text-hi)' }}>{value}</div>
      <div className="label-eyebrow text-[9px]">{label}</div>
    </div>
  )
}

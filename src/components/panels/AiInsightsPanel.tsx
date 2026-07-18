import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Cpu, HardDrive, Info, MemoryStick, Sparkles, Thermometer, Wifi } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import type { Insight, InsightCategory, InsightSeverity } from '@/types/system'
import { useT } from '@/lib/i18n'

const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  good: 'var(--signal-emerald)',
  info: 'var(--signal-cyan)',
  warning: 'var(--signal-amber)',
  critical: 'var(--signal-rose)',
}

const CATEGORY_ICON: Record<InsightCategory, typeof Cpu> = {
  cpu: Cpu,
  ram: MemoryStick,
  disk: HardDrive,
  network: Wifi,
  processes: Cpu,
  temperature: Thermometer,
  power: Sparkles,
  general: CheckCircle2,
}

export function AiInsightsPanel() {
  const t = useT()
  const insights = useSystemStore((s) => s.insights)

  return (
    <Card
      index={8}
      title={t('widgets.insights')}
      icon={<Sparkles size={14} />}
      headerRight={<span className="label-eyebrow text-[9px]">{insights.length} actius</span>}
    >
      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {insights.map((insight) => (
            <InsightRow key={insight.id} insight={insight} />
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

function InsightRow({ insight }: { insight: Insight }) {
  const color = SEVERITY_COLOR[insight.severity]
  const Icon = CATEGORY_ICON[insight.category] ?? Info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-lg p-2.5"
      style={{ background: 'rgba(148,163,184,0.05)', borderLeft: `2px solid ${color}` }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-hi)' }}>
          <Icon size={13} style={{ color }} />
          {insight.title}
        </div>
        <span className="font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>{insight.timestamp}</span>
      </div>
      <p className="mb-1 text-[11px] leading-snug" style={{ color: 'var(--text-lo)' }}>{insight.explanation}</p>
      <p className="text-[11px] leading-snug" style={{ color }}>→ {insight.recommendation}</p>
    </motion.div>
  )
}

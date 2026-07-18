import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-2 py-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ color: 'var(--text-lo)' }}
      >
        {icon}
      </motion.div>
      <p className="max-w-[220px] text-[11px] leading-snug" style={{ color: 'var(--text-lo)' }}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="glass-panel rounded-lg border px-3 py-1.5 text-[11px]" style={{ color: 'var(--signal-cyan)' }}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

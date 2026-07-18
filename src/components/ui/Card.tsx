import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springGentle, springSmooth } from '@/lib/motionPresets'

interface CardProps {
  title?: string
  icon?: ReactNode
  headerRight?: ReactNode
  children: ReactNode
  className?: string
  /** Stagger index for the mount-in animation (0, 1, 2...). */
  index?: number
  /** Opt out of the fullscreen toggle for widgets where it wouldn't make sense. */
  expandable?: boolean
}

/**
 * Glass panel: translucent fill, blurred backdrop, a hairline border that
 * brightens on hover, and a soft top highlight to sell the "frosted glass
 * catching light" read. Fades/rises in on mount (spring physics), staggered
 * by `index`. Every titled Card gets a fullscreen toggle for free — this is
 * the one shared component every widget in the app is built on, so this
 * single change reaches all of them without touching each panel file.
 */
export function Card({ title, icon, headerRight, children, className, index = 0, expandable = true }: CardProps) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = expandable && !!title

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...springSmooth, delay: index * 0.05 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
          'backdrop-blur-xl glass-panel',
          className,
        )}
        style={{ background: 'var(--glass-fill)' }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
        />

        {(title || headerRight) && (
          <header className="relative mb-3 flex items-center justify-between">
            <div className="label-eyebrow flex items-center gap-2" style={{ color: 'var(--text-lo)' }}>
              {icon}
              {title}
            </div>
            <div className="flex items-center gap-2">
              {headerRight}
              {canExpand && (
                <button
                  onClick={() => setExpanded(true)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: 'var(--text-lo)' }}
                  title="Pantalla completa"
                  aria-label={`Mostra ${title} a pantalla completa`}
                >
                  <Maximize2 size={12} />
                </button>
              )}
            </div>
          </header>
        )}
        <div className="relative">{children}</div>
      </motion.section>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springGentle}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border p-6 backdrop-blur-xl"
              style={{ background: 'rgba(8,10,16,0.92)', borderColor: 'var(--glass-border)', boxShadow: '0 40px 90px rgba(0,0,0,0.6)' }}
            >
              <header className="mb-4 flex items-center justify-between">
                <div className="label-eyebrow flex items-center gap-2 text-xs" style={{ color: 'var(--text-hi)' }}>
                  {icon}
                  {title}
                </div>
                <button onClick={() => setExpanded(false)} style={{ color: 'var(--text-lo)' }} className="transition-colors hover:text-white" aria-label="Tanca pantalla completa">
                  <Minimize2 size={16} />
                </button>
              </header>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  shortcut?: string
  danger?: boolean
  onSelect: () => void
}

interface ContextMenuState {
  x: number
  y: number
  items: ContextMenuItem[]
}

export function ContextMenuPortal({ menu, onClose }: { menu: ContextMenuState | null; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    setActiveIndex(0)
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(menu!.items.length - 1, i + 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)) }
      else if (e.key === 'Enter') { menu!.items[activeIndex]?.onSelect(); onClose() }
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu, activeIndex, onClose])

  return (
    <AnimatePresence>
      {menu && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="fixed z-[71] w-52 overflow-hidden rounded-xl border p-1 backdrop-blur-xl"
            style={{ left: menu.x, top: menu.y, background: 'rgba(8,10,16,0.94)', borderColor: 'var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
          >
            {menu.items.map((item, i) => (
              <button
                key={item.label}
                onClick={() => { item.onSelect(); onClose() }}
                onMouseEnter={() => setActiveIndex(i)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] transition-colors"
                style={{
                  background: i === activeIndex ? 'var(--glass-fill-hover)' : 'transparent',
                  color: item.danger ? 'var(--signal-rose)' : 'var(--text-hi)',
                }}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && <kbd className="text-[9px]" style={{ color: 'var(--text-lo)' }}>{item.shortcut}</kbd>}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

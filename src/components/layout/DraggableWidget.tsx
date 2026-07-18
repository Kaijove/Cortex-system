import { useState, type ReactNode, type DragEvent } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { usePersonalizationStore } from '@/store/personalizationStore'
import type { WidgetId } from '@/store/systemStore'
import type { ColumnId } from '@/types/personalization'
import { WidgetErrorBoundary } from '@/components/ui/WidgetErrorBoundary'

interface DraggableWidgetProps {
  id: WidgetId
  col: ColumnId
  index: number
  children: ReactNode
}

/**
 * Wraps a widget so it can be reordered via native HTML5 drag-and-drop within
 * or across the three columns. This is reorder-only (no free resize/snap
 * physics) — a pragmatic scope for a monitoring dashboard's widget list.
 */
export function DraggableWidget({ id, col, index, children }: DraggableWidgetProps) {
  const [dragOver, setDragOver] = useState(false)
  const lockedWidgets = usePersonalizationStore((s) => s.lockedWidgets)
  const toggleLockWidget = usePersonalizationStore((s) => s.toggleLockWidget)
  const moveWidget = usePersonalizationStore((s) => s.moveWidget)
  const isLocked = lockedWidgets.includes(id)

  function handleDragStart(e: DragEvent) {
    if (isLocked) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ col, index }))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    try {
      const from = JSON.parse(e.dataTransfer.getData('text/plain')) as { col: ColumnId; index: number }
      moveWidget(from, { col, index })
    } catch {
      // ignore malformed drag payloads
    }
  }

  return (
    <div
      draggable={!isLocked}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="group/drag relative"
      style={{
        outline: dragOver ? '2px dashed var(--signal-cyan)' : 'none',
        outlineOffset: 4,
        borderRadius: 16,
        // Skips layout/paint for widgets scrolled off-screen — a browser-native
        // equivalent of virtualization. Components stay mounted (their state,
        // e.g. an in-progress note edit, is never lost), only the rendering
        // work is deferred. `containIntrinsicSize` reserves approximate space
        // so the scrollbar doesn't jump as content is skipped/restored.
        contentVisibility: 'auto',
        containIntrinsicSize: '0 320px',
      }}
    >
      <button
        onClick={() => toggleLockWidget(id)}
        className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover/drag:opacity-100"
        style={{ background: 'rgba(8,10,16,0.9)', border: '1px solid var(--glass-border)', color: isLocked ? 'var(--signal-amber)' : 'var(--text-lo)' }}
        title={isLocked ? "Desbloqueja widget" : "Bloqueja widget (evita moure'l)"}
      >
        {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
      </button>
      <WidgetErrorBoundary label={id}>{children}</WidgetErrorBoundary>
    </div>
  )
}

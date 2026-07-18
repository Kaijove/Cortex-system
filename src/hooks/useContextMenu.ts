import { useState } from 'react'
import type { ContextMenuItem } from '@/components/ui/ContextMenu'

interface ContextMenuState {
  x: number
  y: number
  items: ContextMenuItem[]
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null)

  function openMenu(e: React.MouseEvent, items: ContextMenuItem[]) {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, items })
  }
  function closeMenu() {
    setMenu(null)
  }

  return { menu, openMenu, closeMenu }
}

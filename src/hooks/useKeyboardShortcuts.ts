import { useEffect } from 'react'
import { useSystemStore } from '@/store/systemStore'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { printSystemReport } from '@/lib/exportUtils'

interface Options {
  onToggleSettings: () => void
  onCloseAll?: () => void
}

/** Ignore shortcuts while the user is typing in an input, textarea, or the terminal. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useKeyboardShortcuts({ onToggleSettings, onCloseAll }: Options) {
  const togglePaused = useSystemStore((s) => s.togglePaused)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.ctrlKey || e.metaKey

      // Ctrl/Cmd+K opens the command palette even while typing elsewhere (but not while
      // already typing inside the palette itself, which handles its own keys).
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        usePersonalizationStore.getState().setCommandPaletteOpen(true)
        return
      }

      if (e.key === 'Escape') {
        usePersonalizationStore.getState().setCommandPaletteOpen(false)
        onCloseAll?.()
        return
      }

      if (isTypingTarget(e.target)) return

      if (e.code === 'Space') {
        e.preventDefault()
        togglePaused()
      } else if (e.key === '/' && !meta) {
        e.preventDefault()
        document.getElementById('process-search')?.focus()
      } else if (e.key === '?' || (meta && e.key === '/')) {
        e.preventDefault()
        onToggleSettings()
      } else if (meta && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        usePersonalizationStore.getState().cycleTheme()
      } else if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        const { cpu, ram, healthScore, systemInfo } = useSystemStore.getState()
        printSystemReport('Informe del sistema', [
          { heading: 'Sistema', rows: [['Equip', systemInfo.hostname], ['Salut', `${healthScore.value}/100`]] },
          { heading: 'Rendiment', rows: [['CPU', `${cpu.usage.toFixed(0)}%`], ['RAM', `${ram.usedGB.toFixed(1)} / ${ram.totalGB} GB`]] },
        ])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePaused, onToggleSettings, onCloseAll])
}

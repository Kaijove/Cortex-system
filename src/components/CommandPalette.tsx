import type { ReactNode, KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, FileDown, Palette, RefreshCw, ScrollText, Search, Settings, Star, Terminal, Zap } from 'lucide-react'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { useSystemStore, type WidgetId } from '@/store/systemStore'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useToolsStore } from '@/store/toolsStore'
import { THEMES } from '@/lib/themes'
import { printSystemReport } from '@/lib/exportUtils'
import { playClickSound } from '@/lib/sounds'

interface PaletteCommand {
  id: string
  label: string
  group: string
  icon: ReactNode
  run: () => void
}

/** Simple subsequence fuzzy match — good enough for a widget/command list this size. */
function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true
  let qi = 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

export function CommandPalette({ onOpenSettings }: { onOpenSettings: () => void }) {
  const open = usePersonalizationStore((s) => s.commandPaletteOpen)
  const setOpen = usePersonalizationStore((s) => s.setCommandPaletteOpen)
  const setTheme = usePersonalizationStore((s) => s.setTheme)
  const visibleWidgets = useSystemStore((s) => s.visibleWidgets)
  const toggleWidget = useSystemStore((s) => s.toggleWidget)
  const clearLogs = useSystemStore((s) => s.clearLogs)
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const cpu = useSystemStore((s) => s.cpu)
  const ram = useSystemStore((s) => s.ram)
  const healthScore = useSystemStore((s) => s.healthScore)
  const runSpeedTest = useNetworkSuiteStore((s) => s.runSpeedTest)
  const takeSnapshot = useToolsStore((s) => s.takeSnapshot)
  const recentCommandIds = usePersonalizationStore((s) => s.recentCommandIds)
  const favoriteCommandIds = usePersonalizationStore((s) => s.favoriteCommandIds)
  const pushRecentCommand = usePersonalizationStore((s) => s.pushRecentCommand)
  const toggleFavoriteCommand = usePersonalizationStore((s) => s.toggleFavoriteCommand)

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const commands: PaletteCommand[] = useMemo(() => {
    const widgetCmds: PaletteCommand[] = (Object.keys(visibleWidgets) as WidgetId[]).map((id) => ({
      id: `widget-${id}`,
      label: `${visibleWidgets[id] ? 'Amaga' : 'Mostra'} widget: ${id}`,
      group: 'Widgets',
      icon: <Search size={14} />,
      run: () => toggleWidget(id),
    }))

    const themeCmds: PaletteCommand[] = Object.values(THEMES).map((t) => ({
      id: `theme-${t.id}`,
      label: `Tema: ${t.name}`,
      group: 'Aparença',
      icon: <Palette size={14} />,
      run: () => setTheme(t.id),
    }))

    const actionCmds: PaletteCommand[] = [
      { id: 'act-settings', label: 'Obre configuració', group: 'Accions', icon: <Settings size={14} />, run: onOpenSettings },
      { id: 'act-terminal', label: 'Focus al terminal', group: 'Accions', icon: <Terminal size={14} />, run: () => document.getElementById('terminal-command-input')?.focus() },
      { id: 'act-speedtest', label: 'Executa test de velocitat', group: 'Accions', icon: <Zap size={14} />, run: () => runSpeedTest() },
      { id: 'act-snapshot', label: 'Genera snapshot', group: 'Accions', icon: <Camera size={14} />, run: () => takeSnapshot() },
      { id: 'act-clearlogs', label: 'Neteja logs', group: 'Accions', icon: <ScrollText size={14} />, run: clearLogs },
      { id: 'act-refresh', label: 'Refresca ara', group: 'Accions', icon: <RefreshCw size={14} />, run: () => useSystemStore.getState().tick() },
      {
        id: 'act-export',
        label: 'Exporta informe del sistema',
        group: 'Accions',
        icon: <FileDown size={14} />,
        run: () =>
          printSystemReport('Informe del sistema', [
            { heading: 'Sistema', rows: [['Equip', systemInfo.hostname], ['Salut', `${healthScore.value}/100`]] },
            { heading: 'Rendiment', rows: [['CPU', `${cpu.usage.toFixed(0)}%`], ['RAM', `${ram.usedGB.toFixed(1)} / ${ram.totalGB} GB`]] },
          ]),
      },
    ]

    return [...actionCmds, ...themeCmds, ...widgetCmds]
  }, [visibleWidgets, toggleWidget, setTheme, onOpenSettings, runSpeedTest, takeSnapshot, clearLogs, systemInfo, cpu, ram, healthScore])

  const filtered = useMemo(() => {
    const matches = commands.filter((c) => fuzzyMatch(query, c.label))
    if (query) return matches.slice(0, 40)
    // Empty query: favorites first, then recently used, then the rest — a real usage-based ranking.
    const favSet = new Set(favoriteCommandIds)
    const recentIndex = new Map(recentCommandIds.map((id, i) => [id, i]))
    return [...matches]
      .sort((a, b) => {
        const aFav = favSet.has(a.id) ? 0 : 1
        const bFav = favSet.has(b.id) ? 0 : 1
        if (aFav !== bFav) return aFav - bFav
        const aRec = recentIndex.get(a.id) ?? 99
        const bRec = recentIndex.get(b.id) ?? 99
        return aRec - bRec
      })
      .slice(0, 40)
  }, [commands, query, favoriteCommandIds, recentCommandIds])

  function runCommand(cmd: PaletteCommand) {
    pushRecentCommand(cmd.id)
    playClickSound()
    cmd.run()
    setOpen(false)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIndex]
      if (cmd) runCommand(cmd)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl backdrop-blur-xl"
            style={{ background: 'rgba(8,10,16,0.94)', border: '1px solid var(--glass-border)', boxShadow: '0 30px 70px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--glass-border)' }}>
              <Search size={15} style={{ color: 'var(--text-lo)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Cerca widgets, accions, temes..."
                className="w-full bg-transparent font-data text-sm outline-none"
                style={{ color: 'var(--text-hi)' }}
              />
              <kbd className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-lo)' }}>Esc</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && <p className="py-6 text-center text-[12px]" style={{ color: 'var(--text-lo)' }}>Cap resultat</p>}
              {filtered.map((cmd, i) => (
                <div
                  key={cmd.id}
                  onMouseEnter={() => setActiveIndex(i)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] transition-colors"
                  style={{ background: i === activeIndex ? 'var(--glass-fill-hover)' : 'transparent', color: 'var(--text-hi)' }}
                >
                  <button onClick={() => runCommand(cmd)} className="flex flex-1 items-center gap-2.5 text-left">
                    <span style={{ color: 'var(--signal-cyan)' }}>{cmd.icon}</span>
                    {cmd.label}
                    <span className="ml-auto text-[9px]" style={{ color: 'var(--text-lo)' }}>{cmd.group}</span>
                  </button>
                  <button
                    onClick={() => toggleFavoriteCommand(cmd.id)}
                    style={{ color: favoriteCommandIds.includes(cmd.id) ? 'var(--signal-amber)' : 'var(--text-lo)' }}
                  >
                    <Star size={11} fill={favoriteCommandIds.includes(cmd.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

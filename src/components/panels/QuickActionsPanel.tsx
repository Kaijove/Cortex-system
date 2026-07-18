import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Check, Copy, FileDown, Maximize, Palette, Plus, RefreshCw, ScrollText, Terminal, Zap, X } from 'lucide-react'
import { useSystemStore } from '@/store/systemStore'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useToolsStore } from '@/store/toolsStore'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { printSystemReport } from '@/lib/exportUtils'
import { playClickSound } from '@/lib/sounds'

export function QuickActionsPanel() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const clearLogs = useSystemStore((s) => s.clearLogs)
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const cpu = useSystemStore((s) => s.cpu)
  const ram = useSystemStore((s) => s.ram)
  const healthScore = useSystemStore((s) => s.healthScore)
  const runSpeedTest = useNetworkSuiteStore((s) => s.runSpeedTest)
  const takeSnapshot = useToolsStore((s) => s.takeSnapshot)

  async function copySystemInfo() {
    const text = `${systemInfo.hostname} — ${systemInfo.os} (${systemInfo.kernel})\nCPU: ${cpu.usage.toFixed(0)}% · RAM: ${ram.usedGB.toFixed(1)}/${ram.totalGB} GB · Salut: ${healthScore.value}/100`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore — clipboard unavailable
    }
  }

  function focusTerminal() {
    const el = document.getElementById('terminal-command-input')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus()
  }

  function exportReport() {
    printSystemReport('Informe del sistema', [
      {
        heading: 'Resum',
        rows: [
          ['Equip', systemInfo.hostname],
          ['SO', `${systemInfo.os} (${systemInfo.kernel})`],
          ['Puntuació de salut', `${healthScore.value}/100 (${healthScore.status})`],
        ],
      },
      {
        heading: 'Rendiment',
        rows: [
          ['CPU', `${cpu.usage.toFixed(0)}%`],
          ['RAM', `${ram.usedGB.toFixed(1)} / ${ram.totalGB} GB`],
        ],
      },
    ])
  }

  const cycleTheme = usePersonalizationStore((s) => s.cycleTheme)

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  const actions = [
    { icon: <ScrollText size={14} />, label: 'Neteja logs', onClick: clearLogs },
    { icon: <Zap size={14} />, label: 'Test de velocitat', onClick: () => runSpeedTest() },
    { icon: <Camera size={14} />, label: 'Genera snapshot', onClick: () => takeSnapshot() },
    { icon: <RefreshCw size={14} />, label: 'Refresca ara', onClick: () => useSystemStore.getState().tick() },
    { icon: <Terminal size={14} />, label: 'Focus terminal', onClick: focusTerminal },
    { icon: <Maximize size={14} />, label: 'Pantalla completa', onClick: toggleFullscreen },
    { icon: <Palette size={14} />, label: 'Canvia de tema', onClick: cycleTheme },
    { icon: copied ? <Check size={14} /> : <Copy size={14} />, label: 'Copia info sistema', onClick: copySystemInfo },
    { icon: <FileDown size={14} />, label: 'Exporta informe', onClick: exportReport },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open &&
          actions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              onClick={action.onClick}
              className="glass-panel flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] backdrop-blur-xl transition-colors hover:text-white"
              style={{ background: 'rgba(8,10,16,0.85)', color: 'var(--text-hi)' }}
            >
              {action.icon}
              {action.label}
            </motion.button>
          ))}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          playClickSound()
          setOpen((v) => !v)
        }}
        whileTap={{ scale: 0.94 }}
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
        style={{ background: 'var(--signal-cyan)', boxShadow: '0 8px 24px rgba(45,212,238,0.4)' }}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X size={20} color="#05070d" /> : <Plus size={20} color="#05070d" />}
        </motion.div>
      </motion.button>
    </div>
  )
}

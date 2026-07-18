import { useEffect, useRef, useState } from 'react'
import { TerminalSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { runCommand } from '@/lib/terminalCommands'
import { useT } from '@/lib/i18n'

interface LogLine {
  id: number
  type: 'input' | 'output'
  text: string
}

let lineId = 0

export function TerminalPanel() {
  const t = useT()
  const cpu = useSystemStore((s) => s.cpu)
  const ram = useSystemStore((s) => s.ram)
  const network = useSystemStore((s) => s.network)
  const systemInfo = useSystemStore((s) => s.systemInfo)

  const [lines, setLines] = useState<LogLine[]>([
    { id: lineId++, type: 'output', text: 'Benvingut al terminal simulat. Escriu "help" per veure les comandes.' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  function submit() {
    const command = input
    setLines((prev) => [...prev, { id: lineId++, type: 'input', text: command }])

    const output = runCommand(command, { cpu, ram, network, systemInfo, history })

    if (output[0] === '__CLEAR__') {
      setLines([])
    } else if (output.length > 0) {
      setLines((prev) => [...prev, ...output.map((text) => ({ id: lineId++, type: 'output' as const, text }))])
    }

    if (command.trim()) setHistory((prev) => [...prev, command])
    setHistoryIndex(null)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInput(history[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(nextIndex)
        setInput(history[nextIndex])
      }
    }
  }

  return (
    <Card index={5} title={t('widgets.terminal')} icon={<TerminalSquare size={14} />} className="flex flex-col">
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="h-64 cursor-text overflow-y-auto rounded-lg p-3 font-mono text-[11px] leading-relaxed"
        style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid var(--glass-border)' }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className="whitespace-pre"
            style={{ color: line.type === 'input' ? 'var(--signal-emerald)' : 'var(--text-lo)' }}
          >
            {line.type === 'input' ? `${systemInfo.user}@${systemInfo.hostname}:~$ ${line.text}` : line.text}
          </div>
        ))}
        <div className="flex items-center gap-1" style={{ color: 'var(--signal-emerald)' }}>
          <span>{systemInfo.user}@{systemInfo.hostname}:~$</span>
          <input
            id="terminal-command-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--text-hi)' }}
          />
          <span className="animate-pulse" style={{ color: 'var(--text-lo)' }}>▍</span>
        </div>
      </div>
    </Card>
  )
}

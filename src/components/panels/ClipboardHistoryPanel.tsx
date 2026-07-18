import { useState } from 'react'
import { Braces, Check, Clipboard, Copy, Link2, Palette, Pin, Search, Trash2, Type } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { usePersonalizationStore } from '@/store/personalizationStore'
import type { ClipboardItemKind } from '@/types/personalization'
import { useT } from '@/lib/i18n'

const KIND_ICON: Record<ClipboardItemKind, typeof Type> = {
  text: Type,
  code: Braces,
  link: Link2,
  color: Palette,
}

export function ClipboardHistoryPanel() {
  const t = useT()
  const history = usePersonalizationStore((s) => s.clipboardHistory)
  const togglePinClipboardItem = usePersonalizationStore((s) => s.togglePinClipboardItem)
  const clearClipboardHistory = usePersonalizationStore((s) => s.clearClipboardHistory)
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = history.filter((h) => h.content.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned))

  async function copyBack(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1000)
    } catch {
      // ignore
    }
  }

  return (
    <Card
      index={29}
      title={t('widgets.clipboard')}
      icon={<Clipboard size={14} />}
      headerRight={
        <button onClick={clearClipboardHistory} className="transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }} title="Neteja (manté fixats)">
          <Trash2 size={13} />
        </button>
      }
    >
      <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)' }}>
        <Search size={12} style={{ color: 'var(--text-lo)' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca..." className="w-full bg-transparent font-data text-[11px] outline-none" style={{ color: 'var(--text-hi)' }} />
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto">
        {filtered.map((item) => {
          const Icon = KIND_ICON[item.kind]
          return (
            <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
              <Icon size={12} style={{ color: 'var(--text-lo)' }} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[10px]" style={{ color: 'var(--text-hi)' }}>{item.content}</div>
                <div className="font-data text-[8px]" style={{ color: 'var(--text-lo)' }}>{item.timestamp}</div>
              </div>
              <button onClick={() => togglePinClipboardItem(item.id)} style={{ color: item.pinned ? 'var(--signal-amber)' : 'var(--text-lo)' }}>
                <Pin size={11} fill={item.pinned ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => copyBack(item.id, item.content)} style={{ color: 'var(--text-lo)' }}>
                {copiedId === item.id ? <Check size={11} style={{ color: 'var(--signal-emerald)' }} /> : <Copy size={11} />}
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="py-4 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Encara no s'ha copiat res</p>}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        Només recorda el que copies mentre uses aquesta app — el navegador no permet accedir a l'historial del porta-retalls del sistema operatiu.
      </p>
    </Card>
  )
}

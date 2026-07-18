import { useState } from 'react'
import { NotebookPen, Pin, Plus, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePersonalizationStore } from '@/store/personalizationStore'
import type { Note, NoteColor } from '@/types/personalization'
import { useT } from '@/lib/i18n'

const COLOR_MAP: Record<NoteColor, string> = {
  default: 'var(--text-lo)',
  cyan: 'var(--signal-cyan)',
  violet: 'var(--signal-violet)',
  amber: 'var(--signal-amber)',
  emerald: 'var(--signal-emerald)',
  rose: 'var(--signal-rose)',
}

function wordCount(text: string): number {
  return text.trim().length ? text.trim().split(/\s+/).length : 0
}

/** Minimal markdown-lite renderer: bold, italics, inline code, bullet lists. */
function renderMarkdownLite(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '• $1')
    .replace(/\n/g, '<br/>')
}

export function NotesPanel() {
  const t = useT()
  const notes = usePersonalizationStore((s) => s.notes)
  const addNote = usePersonalizationStore((s) => s.addNote)
  const updateNote = usePersonalizationStore((s) => s.updateNote)
  const deleteNote = usePersonalizationStore((s) => s.deleteNote)
  const togglePinNote = usePersonalizationStore((s) => s.togglePinNote)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = notes
    .filter((n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.tags.some((t) => t.includes(query.toLowerCase())))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <Card
      index={27}
      title={t('widgets.notes')}
      icon={<NotebookPen size={14} />}
      headerRight={
        <button onClick={addNote} className="transition-colors hover:text-white" style={{ color: 'var(--signal-cyan)' }}>
          <Plus size={15} />
        </button>
      }
    >
      <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)' }}>
        <Search size={12} style={{ color: 'var(--text-lo)' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca notes o etiquetes..." className="w-full bg-transparent font-data text-[11px] outline-none" style={{ color: 'var(--text-hi)' }} />
      </div>

      <div className="max-h-72 space-y-1.5 overflow-y-auto">
        {filtered.map((note) =>
          editingId === note.id ? (
            <NoteEditor key={note.id} note={note} onUpdate={(patch) => updateNote(note.id, patch)} onDone={() => setEditingId(null)} />
          ) : (
            <div
              key={note.id}
              onClick={() => setEditingId(note.id)}
              className="cursor-pointer rounded-lg p-2"
              style={{ background: 'rgba(148,163,184,0.05)', borderLeft: `2px solid ${COLOR_MAP[note.color]}` }}
            >
              <div className="mb-0.5 flex items-center justify-between gap-1">
                <span className="truncate text-[11px] font-medium" style={{ color: 'var(--text-hi)' }}>{note.title || 'Sense títol'}</span>
                <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => togglePinNote(note.id)} style={{ color: note.pinned ? 'var(--signal-amber)' : 'var(--text-lo)' }}>
                    <Pin size={11} fill={note.pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => deleteNote(note.id)} style={{ color: 'var(--text-lo)' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <div
                className="mb-1 line-clamp-2 text-[10px] leading-snug"
                style={{ color: 'var(--text-lo)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdownLite(note.content || 'Sense contingut...') }}
              />
              <div className="flex items-center justify-between font-data text-[8px]" style={{ color: 'var(--text-lo)' }}>
                <span>{note.tags.map((t) => `#${t}`).join(' ')}</span>
                <span>{wordCount(note.content)} paraules</span>
              </div>
            </div>
          ),
        )}
        {filtered.length === 0 && (
          <EmptyState icon={<NotebookPen size={22} />} message="Encara no tens cap nota" actionLabel="Crea la primera" onAction={addNote} />
        )}
      </div>
    </Card>
  )
}

function NoteEditor({ note, onUpdate, onDone }: { note: Note; onUpdate: (patch: Partial<Note>) => void; onDone: () => void }) {
  return (
    <div className="rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid var(--glass-border)' }}>
      <input
        value={note.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Títol"
        className="mb-1 w-full bg-transparent text-[11px] font-medium outline-none"
        style={{ color: 'var(--text-hi)' }}
      />
      <textarea
        value={note.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Escriu en Markdown: **negreta**, *cursiva*, `codi`, - llista"
        rows={4}
        className="mb-1 w-full resize-none bg-transparent font-mono text-[10px] outline-none"
        style={{ color: 'var(--text-hi)' }}
      />
      <input
        value={note.tags.join(', ')}
        onChange={(e) => onUpdate({ tags: e.target.value.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) })}
        placeholder="etiquetes, separades, per, comes"
        className="mb-1.5 w-full bg-transparent font-data text-[9px] outline-none"
        style={{ color: 'var(--text-lo)' }}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(Object.keys(COLOR_MAP) as NoteColor[]).map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ color: c })}
              className="h-4 w-4 rounded-full"
              style={{ background: COLOR_MAP[c], border: note.color === c ? '2px solid white' : 'none' }}
            />
          ))}
        </div>
        <button onClick={onDone} className="rounded-md px-2 py-1 text-[10px]" style={{ background: 'rgba(45,212,238,0.15)', color: 'var(--signal-cyan)' }}>
          Fet
        </button>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { File, Folder, FolderOpen, Search, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToolsStore } from '@/store/toolsStore'
import type { FsNode } from '@/types/tools'
import { useT } from '@/lib/i18n'

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`
  return `${bytes} B`
}

function findNode(root: FsNode, path: string[]): FsNode {
  let node = root
  for (const id of path) {
    const next = node.children?.find((c) => c.id === id)
    if (!next) break
    node = next
  }
  return node
}

function folderSize(node: FsNode): number {
  if (node.kind === 'file') return node.sizeBytes
  return (node.children ?? []).reduce((sum, c) => sum + folderSize(c), 0)
}

function collectFavorites(node: FsNode, acc: FsNode[] = []): FsNode[] {
  if (node.favorite) acc.push(node)
  node.children?.forEach((c) => collectFavorites(c, acc))
  return acc
}

export function FileExplorerPanel() {
  const t = useT()
  const fileSystem = useToolsStore((s) => s.fileSystem)
  const currentPath = useToolsStore((s) => s.currentPath)
  const navigateTo = useToolsStore((s) => s.navigateTo)
  const toggleFavorite = useToolsStore((s) => s.toggleFavorite)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FsNode | null>(null)

  const currentNode = findNode(fileSystem, currentPath)
  const favorites = useMemo(() => collectFavorites(fileSystem), [fileSystem])

  const items = (currentNode.children ?? []).filter((n) => n.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <Card index={20} title={t('widgets.fileExplorer')} icon={<Folder size={14} />}>
      <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)' }}>
        <Search size={13} style={{ color: 'var(--text-lo)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca..."
          className="w-full bg-transparent font-data text-[11px] outline-none"
          style={{ color: 'var(--text-hi)' }}
        />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1 font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
        <button onClick={() => navigateTo([])} className="hover:text-white">~</button>
        {currentPath.map((id, i) => {
          const node = findNode(fileSystem, currentPath.slice(0, i + 1))
          return (
            <span key={id} className="flex items-center gap-1">
              <span>/</span>
              <button onClick={() => navigateTo(currentPath.slice(0, i + 1))} className="hover:text-white">{node.name}</button>
            </span>
          )
        })}
      </div>

      {favorites.length > 0 && currentPath.length === 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {favorites.map((f) => (
            <span key={f.id} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px]" style={{ background: 'rgba(148,163,184,0.08)', color: 'var(--signal-amber)' }}>
              <Star size={9} fill="currentColor" /> {f.name}
            </span>
          ))}
        </div>
      )}

      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {items.map((node) => (
          <div
            key={node.id}
            onClick={() => (node.kind === 'folder' ? navigateTo([...currentPath, node.id]) : setSelected(node))}
            className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex min-w-0 items-center gap-2">
              {node.kind === 'folder' ? <Folder size={13} style={{ color: 'var(--signal-cyan)' }} /> : <File size={13} style={{ color: 'var(--text-lo)' }} />}
              <span className="truncate text-[11px]" style={{ color: 'var(--text-hi)' }}>{node.name}</span>
              {node.favorite && <Star size={9} fill="var(--signal-amber)" color="var(--signal-amber)" />}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{formatBytes(node.kind === 'folder' ? folderSize(node) : node.sizeBytes)}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(node.id) }} style={{ color: node.favorite ? 'var(--signal-amber)' : 'var(--text-lo)' }}>
                <Star size={11} fill={node.favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="py-3 text-center text-[11px]" style={{ color: 'var(--text-lo)' }}>Cap element</p>}
      </div>

      {selected && (
        <div className="mt-2 rounded-lg p-2" style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid var(--glass-border)' }}>
          <div className="mb-1 flex items-center gap-2">
            <FolderOpen size={12} style={{ color: 'var(--signal-cyan)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-hi)' }}>{selected.name}</span>
          </div>
          <div className="font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
            Mida: {formatBytes(selected.sizeBytes)} · Modificat: {selected.modified}
          </div>
        </div>
      )}

      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>Sistema de fitxers simulat, il·lustratiu.</p>
    </Card>
  )
}

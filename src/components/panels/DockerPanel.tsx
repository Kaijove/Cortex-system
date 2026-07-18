import type { ReactNode } from 'react'
import { Container, Pause, Play, RotateCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToolsStore } from '@/store/toolsStore'
import type { DockerContainerStatus } from '@/types/tools'
import { useT } from '@/lib/i18n'

const STATUS_COLOR: Record<DockerContainerStatus, string> = {
  running: 'var(--signal-emerald)',
  stopped: 'var(--text-lo)',
  restarting: 'var(--signal-amber)',
}

export function DockerPanel() {
  const t = useT()
  const containers = useToolsStore((s) => s.dockerContainers)
  const images = useToolsStore((s) => s.dockerImages)
  const volumes = useToolsStore((s) => s.dockerVolumes)
  const networks = useToolsStore((s) => s.dockerNetworks)
  const expandedId = useToolsStore((s) => s.expandedContainerId)
  const toggleExpand = useToolsStore((s) => s.toggleContainerExpand)
  const dockerAction = useToolsStore((s) => s.dockerAction)

  return (
    <Card
      index={21}
      title={t('widgets.docker')}
      icon={<Container size={14} />}
      headerRight={<span className="label-eyebrow text-[9px]">{containers.filter((c) => c.status === 'running').length}/{containers.length} actius</span>}
    >
      <div className="mb-3 space-y-1.5">
        {containers.map((c) => (
          <div key={c.id} className="rounded-lg" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="flex cursor-pointer items-center justify-between p-2" onClick={() => toggleExpand(c.id)}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[c.status] }} />
                <div className="min-w-0">
                  <div className="truncate text-[11px]" style={{ color: 'var(--text-hi)' }}>{c.name}</div>
                  <div className="truncate font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{c.image} · {c.ports}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{c.cpuPercent.toFixed(1)}% · {c.ramMB}MB</span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {c.status === 'running' ? (
                    <IconBtn onClick={() => dockerAction(c.id, 'stop')}><Pause size={11} /></IconBtn>
                  ) : (
                    <IconBtn onClick={() => dockerAction(c.id, 'start')}><Play size={11} /></IconBtn>
                  )}
                  <IconBtn onClick={() => dockerAction(c.id, 'restart')}><RotateCw size={11} /></IconBtn>
                </div>
              </div>
            </div>
            {expandedId === c.id && (
              <div className="border-t px-2 py-1.5 font-mono text-[10px]" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-lo)' }}>
                {c.logs.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
        <MiniStat label="Imatges" value={images.length} />
        <MiniStat label="Volums" value={volumes.length} />
        <MiniStat label="Xarxes" value={networks.length} />
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>Panell simulat — no gestiona un dimoni Docker real.</p>
    </Card>
  )
}

function IconBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass-panel rounded-md border p-1 transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }}>
      {children}
    </button>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md py-1.5 text-center" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="text-sm" style={{ color: 'var(--text-hi)' }}>{value}</div>
      <div>{label}</div>
    </div>
  )
}

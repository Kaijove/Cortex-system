import type { ReactNode } from 'react'
import { MonitorPlay, Play, Square, TerminalSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToolsStore } from '@/store/toolsStore'
import type { VmStatus } from '@/types/tools'
import { useT } from '@/lib/i18n'

const STATUS_COLOR: Record<VmStatus, string> = {
  running: 'var(--signal-emerald)',
  stopped: 'var(--text-lo)',
  paused: 'var(--signal-amber)',
}

export function VirtualMachinesPanel() {
  const t = useT()
  const vms = useToolsStore((s) => s.vms)
  const vmAction = useToolsStore((s) => s.vmAction)

  return (
    <Card index={22} title={t('widgets.vms')} icon={<MonitorPlay size={14} />}>
      <div className="space-y-1.5">
        {vms.map((vm) => (
          <div key={vm.id} className="rounded-lg p-2.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[vm.status] }} />
                <span className="text-[11px]" style={{ color: 'var(--text-hi)' }}>{vm.name}</span>
              </div>
              <span className="label-eyebrow text-[8px]">{vm.status}</span>
            </div>
            <div className="mb-1.5 font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>
              {vm.os} · {vm.cpuCores} vCPU · {vm.ramGB} GB · {vm.storageGB} GB · {vm.network} · {vm.uptime}
            </div>
            <div className="flex gap-1.5">
              {vm.status === 'stopped' ? (
                <VmBtn onClick={() => vmAction(vm.id, 'start')} label="Inicia" icon={<Play size={11} />} />
              ) : (
                <VmBtn onClick={() => vmAction(vm.id, 'stop')} label="Atura" icon={<Square size={11} />} />
              )}
              <VmBtn onClick={() => {}} label="Consola" icon={<TerminalSquare size={11} />} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>Simulat — no gestiona hipervisors reals (QEMU/VirtualBox).</p>
    </Card>
  )
}

function VmBtn({ onClick, label, icon }: { onClick: () => void; label: string; icon: ReactNode }) {
  return (
    <button onClick={onClick} className="glass-panel flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }}>
      {icon}{label}
    </button>
  )
}

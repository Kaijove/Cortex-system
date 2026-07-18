import type { ReactNode } from 'react'
import { Download, Gauge, Upload, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { RadialGauge } from '@/components/ui/RadialGauge'
import { useNetworkSuiteStore } from '@/store/networkSuiteStore'
import { useT } from '@/lib/i18n'

const PHASE_LABEL: Record<string, string> = {
  idle: 'Preparat',
  ping: 'Mesurant ping...',
  download: 'Provant baixada...',
  upload: 'Provant pujada...',
  done: 'Completat',
  error: 'Error',
}

function streamingQuality(mbps: number): string {
  if (mbps >= 25) return '4K fluid'
  if (mbps >= 10) return 'HD fluid'
  if (mbps >= 3) return 'SD amb talls ocasionals'
  return 'Poc fiable'
}
function gamingQuality(latencyMs: number): string {
  if (latencyMs < 30) return 'Excel·lent per online competitiu'
  if (latencyMs < 60) return 'Bo per la majoria de jocs'
  if (latencyMs < 100) return 'Notable en jocs ràpids'
  return 'Poc recomanable'
}
function videoCallQuality(mbps: number, latencyMs: number): string {
  if (mbps >= 3 && latencyMs < 100) return 'Excel·lent'
  if (mbps >= 1.5) return 'Bo'
  return 'Pot patir talls'
}

export function SpeedTestPanel() {
  const t = useT()
  const speedTest = useNetworkSuiteStore((s) => s.speedTest)
  const runSpeedTest = useNetworkSuiteStore((s) => s.runSpeedTest)
  const running = speedTest.phase !== 'idle' && speedTest.phase !== 'done' && speedTest.phase !== 'error'

  const download = speedTest.currentResult?.downloadMbps
  const upload = speedTest.currentResult?.uploadMbps
  const ping = speedTest.currentResult?.pingMs

  return (
    <Card index={14} title={t('widgets.speedTest')} icon={<Zap size={14} />}>
      <div className="mb-4 flex flex-col items-center">
        <RadialGauge
          value={running ? speedTest.progressPercent : download ? Math.min(100, (download / 300) * 100) : 0}
          size={100}
          strokeWidth={8}
          color="var(--signal-cyan)"
        />
        <div className="label-eyebrow mt-2 text-[10px]">{PHASE_LABEL[speedTest.phase]}</div>
      </div>

      {speedTest.error && <p className="mb-2 text-center text-[11px]" style={{ color: 'var(--signal-rose)' }}>{speedTest.error}</p>}

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Stat icon={<Gauge size={12} />} label="Ping" value={ping !== undefined ? `${ping.toFixed(0)} ms` : '—'} />
        <Stat icon={<Download size={12} />} label="Baixada" value={download !== undefined ? `${download.toFixed(0)} Mbps` : '—'} />
        <Stat icon={<Upload size={12} />} label="Pujada" value={upload !== undefined ? `${upload.toFixed(0)} Mbps` : '—'} />
      </div>

      <button
        onClick={() => runSpeedTest()}
        disabled={running}
        className="glass-panel w-full rounded-lg border py-2 text-xs font-medium transition-colors disabled:opacity-40"
        style={{ color: 'var(--signal-cyan)' }}
      >
        {running ? 'Executant...' : 'Executa el test'}
      </button>

      {speedTest.phase === 'done' && download !== undefined && ping !== undefined && (
        <div className="mt-3 space-y-1 font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
          <div className="flex justify-between"><span>Qualitat streaming</span><span style={{ color: 'var(--text-hi)' }}>{streamingQuality(download)}</span></div>
          <div className="flex justify-between"><span>Qualitat gaming</span><span style={{ color: 'var(--text-hi)' }}>{gamingQuality(ping)}</span></div>
          <div className="flex justify-between"><span>Qualitat videotrucada</span><span style={{ color: 'var(--text-hi)' }}>{videoCallQuality(download, ping)}</span></div>
        </div>
      )}

      {speedTest.history.length > 1 && (
        <div className="mt-3 border-t pt-2" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="label-eyebrow mb-1 text-[9px]">Historial</div>
          <div className="space-y-1">
            {speedTest.history.slice(1, 5).map((h) => (
              <div key={h.id} className="flex justify-between font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
                <span>{h.timestamp}</span>
                <span>↓{h.downloadMbps.toFixed(0)} ↑{h.uploadMbps.toFixed(0)} Mbps</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <div className="mb-0.5 flex items-center justify-center gap-1" style={{ color: 'var(--text-lo)' }}>{icon}</div>
      <div className="font-data text-xs" style={{ color: 'var(--text-hi)' }}>{value}</div>
      <div className="label-eyebrow text-[8px]">{label}</div>
    </div>
  )
}

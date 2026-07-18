import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { linearTrend } from '@/lib/analyticsUtils'
import { useT } from '@/lib/i18n'

export function AiAnalyticsSummaryPanel() {
  const t = useT()
  const processes = useSystemStore((s) => s.processes)
  const alerts = useSystemStore((s) => s.alerts)
  const history = useAnalyticsStore((s) => s.history)
  const recent = history.slice(-60)

  const summaries: string[] = []

  if (recent.length >= 4) {
    const first = recent[0]
    const last = recent[recent.length - 1]
    const deltaHealth = last.health - first.health
    summaries.push(
      Math.abs(deltaHealth) < 2
        ? "Què ha canviat: la salut general s'ha mantingut pràcticament igual en aquest període."
        : `Què ha canviat: la salut general ha ${deltaHealth > 0 ? 'millorat' : 'empitjorat'} ${Math.abs(deltaHealth).toFixed(0)} punts.`,
    )

    const metrics: { key: 'cpu' | 'ram' | 'disk' | 'network'; label: string }[] = [
      { key: 'cpu', label: 'CPU' }, { key: 'ram', label: 'Memòria' }, { key: 'disk', label: 'Disc' }, { key: 'network', label: 'Xarxa' },
    ]
    const variances = metrics.map((m) => {
      const values = recent.map((s) => s[m.key])
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((s2, v) => s2 + (v - mean) ** 2, 0) / values.length
      return { label: m.label, variance }
    })
    const mostUnstable = [...variances].sort((a, b) => b.variance - a.variance)[0]
    summaries.push(`Component més inestable: ${mostUnstable.label} (variació més gran en aquest període).`)

    const cpuTrend = linearTrend(recent.map((s) => s.cpu))
    if (Math.abs(cpuTrend.slope) > 0.05) {
      summaries.push(`Possible coll d'ampolla futur: la CPU mostra una tendència ${cpuTrend.slope > 0 ? 'creixent' : 'decreixent'} — val la pena vigilar-ho.`)
    }
  } else {
    summaries.push('Encara no hi ha prou historial per generar resums fiables — torna en uns minuts.')
  }

  if (processes.length > 0) {
    const top = [...processes].sort((a, b) => b.cpu - a.cpu)[0]
    summaries.push(`Procés amb més consum: "${top.name}" (${top.cpu.toFixed(0)}% CPU).`)
  }

  if (alerts.length > 0) {
    const counts: Record<string, number> = {}
    alerts.forEach((a) => { counts[a.title] = (counts[a.title] ?? 0) + 1 })
    const [mostCommon, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    summaries.push(`Alerta més freqüent: "${mostCommon}" (${count}×).`)
  }

  return (
    <Card index={48} title={t('widgets.aiAnalyticsSummary')} icon={<Sparkles size={14} />}>
      <div className="space-y-1.5">
        {summaries.map((s, i) => (
          <div key={i} className="rounded-lg px-2.5 py-1.5 text-[11px]" style={{ background: 'rgba(148,163,184,0.05)', color: 'var(--text-hi)' }}>
            {s}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        Generat amb regles transparents sobre dades reals recollides — no és un model de llenguatge extern, és lògica derivada de l'historial d'aquesta mateixa app.
      </p>
    </Card>
  )
}

import type { ReactNode } from 'react'
import { Camera, FileBarChart, FileDown, FileJson, FileSpreadsheet, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { exportCsvFile, exportDashboardScreenshot, exportJsonFile, exportSvgAsPng, exportSvgAsSvg, printSystemReport } from '@/lib/exportUtils'
import { useT } from '@/lib/i18n'

export function AnalyticsReportPanel() {
  const t = useT()
  const processes = useSystemStore((s) => s.processes)
  const disk = useSystemStore((s) => s.disk)
  const network = useSystemStore((s) => s.network)
  const alerts = useSystemStore((s) => s.alerts)
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const history = useAnalyticsStore((s) => s.history)

  const topByCpu = [...processes].sort((a, b) => b.cpu - a.cpu).slice(0, 3)
  const topByRam = [...processes].sort((a, b) => b.ram - a.ram).slice(0, 3)
  const longestRunning = [...processes].sort((a, b) => b.runtime.localeCompare(a.runtime))[0]
  const diskAvg = disk.partitions.reduce((sum, p) => sum + (p.usedGB / p.totalGB) * 100, 0) / Math.max(1, disk.partitions.length)

  function generateReport() {
    printSystemReport("Informe d'analítica", [
      { heading: 'Sistema', rows: [['Equip', systemInfo.hostname], ['Uptime', `${(systemInfo.uptimeSeconds / 3600).toFixed(1)} h`]] },
      { heading: 'Processos amb més CPU', rows: topByCpu.map((p) => [p.name, `${p.cpu.toFixed(1)}%`] as [string, string]) },
      { heading: 'Processos amb més RAM', rows: topByRam.map((p) => [p.name, `${p.ram.toFixed(0)} MB`] as [string, string]) },
      { heading: 'Resum de xarxa', rows: [['Baixada', `${network.downloadMbps.toFixed(1)} Mbps`], ['Pujada', `${network.uploadMbps.toFixed(1)} Mbps`]] },
      { heading: 'Emmagatzematge', rows: [['Ús mitjà', `${diskAvg.toFixed(0)}%`]] },
      { heading: 'Alertes', rows: [['Total registrades', `${alerts.length}`]] },
    ])
  }

  function exportDataCsv() {
    exportCsvFile(`analytics-history-${Date.now()}.csv`, ['temps', 'cpu', 'ram', 'disc', 'xarxa', 'seguretat', 'salut'], history.map((s) => [new Date(s.t).toISOString(), s.cpu.toFixed(1), s.ram.toFixed(1), s.disk.toFixed(1), s.network.toFixed(0), s.security.toFixed(0), s.health.toFixed(0)]))
  }

  function exportDataJson() {
    exportJsonFile(`analytics-history-${Date.now()}.json`, history)
  }

  function exportChartPng() {
    const svg = document.querySelector('#cpu-history-chart svg') as SVGSVGElement | null
    if (svg) exportSvgAsPng(svg, `chart-${Date.now()}.png`)
  }

  function exportChartSvg() {
    const svg = document.querySelector('#cpu-history-chart svg') as SVGSVGElement | null
    if (svg) exportSvgAsSvg(svg, `chart-${Date.now()}.svg`)
  }

  function exportScreenshot() {
    const root = document.getElementById('dashboard-capture-root')
    if (root) exportDashboardScreenshot(root, `dashboard-${Date.now()}.png`)
  }

  return (
    <Card index={45} title={t('widgets.analyticsReport')} icon={<FileBarChart size={14} />}>
      <div className="mb-3 space-y-1.5 font-data text-[10px]" style={{ color: 'var(--text-lo)' }}>
        <div>Procés amb més CPU: <span style={{ color: 'var(--text-hi)' }}>{topByCpu[0]?.name ?? '—'} ({topByCpu[0]?.cpu.toFixed(0) ?? 0}%)</span></div>
        <div>Procés amb més RAM: <span style={{ color: 'var(--text-hi)' }}>{topByRam[0]?.name ?? '—'} ({topByRam[0]?.ram.toFixed(0) ?? 0} MB)</span></div>
        <div>Procés més longeu: <span style={{ color: 'var(--text-hi)' }}>{longestRunning?.name ?? '—'} ({longestRunning?.runtime ?? '—'})</span></div>
        <div>Ús mitjà de disc: <span style={{ color: 'var(--text-hi)' }}>{diskAvg.toFixed(0)}%</span></div>
        <div>Alertes totals: <span style={{ color: 'var(--text-hi)' }}>{alerts.length}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <ExportBtn icon={<FileDown size={12} />} label="Informe (PDF)" onClick={generateReport} />
        <ExportBtn icon={<FileSpreadsheet size={12} />} label="Dades (CSV)" onClick={exportDataCsv} />
        <ExportBtn icon={<FileJson size={12} />} label="Dades (JSON)" onClick={exportDataJson} />
        <ExportBtn icon={<ImageIcon size={12} />} label="Gràfic (PNG)" onClick={exportChartPng} />
        <ExportBtn icon={<ImageIcon size={12} />} label="Gràfic (SVG)" onClick={exportChartSvg} />
        <ExportBtn icon={<Camera size={12} />} label="Captura del dashboard" onClick={exportScreenshot} />
      </div>
    </Card>
  )
}

function ExportBtn({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass-panel flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px]" style={{ color: 'var(--text-hi)' }}>
      {icon}{label}
    </button>
  )
}

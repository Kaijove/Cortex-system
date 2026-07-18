import { FileDown, FileJson, FileSpreadsheet, FileText, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useSystemStore } from '@/store/systemStore'
import { useToolsStore } from '@/store/toolsStore'
import { exportCsvFile, exportJsonFile, exportSvgAsPng, exportTextFile, printSystemReport } from '@/lib/exportUtils'
import { useT } from '@/lib/i18n'

export function ExportCenterPanel() {
  const t = useT()
  const logs = useSystemStore((s) => s.logs)
  const cpu = useSystemStore((s) => s.cpu)
  const ram = useSystemStore((s) => s.ram)
  const healthScore = useSystemStore((s) => s.healthScore)
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const snapshots = useToolsStore((s) => s.snapshots)

  function handleExportLogs() {
    const text = logs.map((l) => `[${l.timestamp}] ${l.severity} ${l.message}`).join('\n')
    exportTextFile(`logs-${Date.now()}.txt`, text || 'Sense registres.')
  }

  function handleExportCsv() {
    const headers = ['temps', 'cpu_percent', 'ram_percent']
    const rows = cpu.history.map((point, i) => [point.time, point.value.toFixed(1), (ram.history[i]?.value ?? 0).toFixed(1)])
    exportCsvFile(`rendiment-${Date.now()}.csv`, headers, rows)
  }

  function handleExportSnapshots() {
    exportJsonFile(`snapshots-${Date.now()}.json`, snapshots)
  }

  function handleExportReport() {
    printSystemReport('Informe del sistema', [
      { heading: 'Sistema', rows: [['Equip', systemInfo.hostname], ['SO', systemInfo.os], ['Salut', `${healthScore.value}/100`]] },
      { heading: 'Rendiment actual', rows: [['CPU', `${cpu.usage.toFixed(0)}%`], ['RAM', `${ram.usedGB.toFixed(1)} / ${ram.totalGB} GB`]] },
    ])
  }

  function handleExportChart() {
    const svg = document.querySelector('#cpu-history-chart svg') as SVGSVGElement | null
    if (svg) exportSvgAsPng(svg, `cpu-history-${Date.now()}.png`)
  }

  const items = [
    { icon: <FileDown size={14} />, label: 'Informe del sistema (PDF)', onClick: handleExportReport },
    { icon: <FileText size={14} />, label: 'Logs (TXT)', onClick: handleExportLogs },
    { icon: <FileSpreadsheet size={14} />, label: 'Rendiment (CSV)', onClick: handleExportCsv },
    { icon: <FileJson size={14} />, label: 'Snapshots (JSON)', onClick: handleExportSnapshots },
    { icon: <ImageIcon size={14} />, label: 'Gràfic de CPU (PNG)', onClick: handleExportChart },
  ]

  return (
    <Card index={26} title={t('widgets.exportCenter')} icon={<FileDown size={14} />}>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="glass-panel flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-[11px] transition-colors hover:text-white"
            style={{ color: 'var(--text-hi)' }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[9px]" style={{ color: 'var(--text-lo)' }}>
        El PDF s'obre com a diàleg d'impressió del navegador (tria "Desa com a PDF"). El PNG exporta el gràfic d'historial de CPU.
      </p>
    </Card>
  )
}

import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Header } from './Header'
import { AuroraBackground } from './AuroraBackground'
import { CursorGlow } from './CursorGlow'
import { DraggableWidget } from './DraggableWidget'
import { CpuPanel } from '@/components/panels/CpuPanel'
import { RamPanel } from '@/components/panels/RamPanel'
import { DiskPanel } from '@/components/panels/DiskPanel'
import { NetworkPanel } from '@/components/panels/NetworkPanel'
import { ProcessTable } from '@/components/panels/ProcessTable'
import { TerminalPanel } from '@/components/panels/TerminalPanel'
import { LogsPanel } from '@/components/panels/LogsPanel'
import { SystemInfoPanel } from '@/components/panels/SystemInfoPanel'
const SettingsPanel = lazy(() => import('@/components/panels/SettingsPanel').then((m) => ({ default: m.SettingsPanel })))
import { HealthScorePanel } from '@/components/panels/HealthScorePanel'
import { AiInsightsPanel } from '@/components/panels/AiInsightsPanel'
import { SecurityCenterPanel } from '@/components/panels/SecurityCenterPanel'
import { PredictionsPanel } from '@/components/panels/PredictionsPanel'
import { NetworkOverviewPanel } from '@/components/panels/NetworkOverviewPanel'
import { BandwidthMonitorPanel } from '@/components/panels/BandwidthMonitorPanel'
import { ConnectionQualityPanel } from '@/components/panels/ConnectionQualityPanel'
import { SpeedTestPanel } from '@/components/panels/SpeedTestPanel'
import { WorldNetworkMapPanel } from '@/components/panels/WorldNetworkMapPanel'
import { ApiStatusPanel } from '@/components/panels/ApiStatusPanel'
import { NetworkEventsPanel } from '@/components/panels/NetworkEventsPanel'
import { GpuMonitorPanel } from '@/components/panels/GpuMonitorPanel'
import { SensorsPanel } from '@/components/panels/SensorsPanel'
import { FileExplorerPanel } from '@/components/panels/FileExplorerPanel'
import { DockerPanel } from '@/components/panels/DockerPanel'
import { VirtualMachinesPanel } from '@/components/panels/VirtualMachinesPanel'
import { PackageManagerPanel } from '@/components/panels/PackageManagerPanel'
import { StorageAnalyzerPanel } from '@/components/panels/StorageAnalyzerPanel'
import { SnapshotsPanel } from '@/components/panels/SnapshotsPanel'
import { ExportCenterPanel } from '@/components/panels/ExportCenterPanel'
import { QuickActionsPanel } from '@/components/panels/QuickActionsPanel'
const ProcessInspectorModal = lazy(() => import('@/components/panels/ProcessInspectorModal').then((m) => ({ default: m.ProcessInspectorModal })))
import { NotesPanel } from '@/components/panels/NotesPanel'
import { CalendarPanel } from '@/components/panels/CalendarPanel'
import { ClipboardHistoryPanel } from '@/components/panels/ClipboardHistoryPanel'
import { RuleEnginePanel } from '@/components/panels/RuleEnginePanel'
import { SchedulerPanel } from '@/components/panels/SchedulerPanel'
import { ServiceUptimePanel } from '@/components/panels/ServiceUptimePanel'
import { EventStreamPanel } from '@/components/panels/EventStreamPanel'
import { HealthCenterPanel } from '@/components/panels/HealthCenterPanel'
import { MaintenancePanel } from '@/components/panels/MaintenancePanel'
import { IncidentCenterPanel } from '@/components/panels/IncidentCenterPanel'
import { AutomationAnalyticsPanel } from '@/components/panels/AutomationAnalyticsPanel'
import { AnalyticsOverviewPanel } from '@/components/panels/AnalyticsOverviewPanel'
import { HistoricalAnalysisPanel } from '@/components/panels/HistoricalAnalysisPanel'
import { AdvancedChartsPanel } from '@/components/panels/AdvancedChartsPanel'
import { ActivityHeatmapPanel } from '@/components/panels/ActivityHeatmapPanel'
import { TrendAnalysisPanel } from '@/components/panels/TrendAnalysisPanel'
import { CorrelationPanel } from '@/components/panels/CorrelationPanel'
import { PerformanceTimelinePanel } from '@/components/panels/PerformanceTimelinePanel'
import { AnalyticsReportPanel } from '@/components/panels/AnalyticsReportPanel'
import { DataExplorerPanel } from '@/components/panels/DataExplorerPanel'
import { ExecutiveDashboardPanel } from '@/components/panels/ExecutiveDashboardPanel'
import { AiAnalyticsSummaryPanel } from '@/components/panels/AiAnalyticsSummaryPanel'
const CommandPalette = lazy(() => import('@/components/CommandPalette').then((m) => ({ default: m.CommandPalette })))
import { useSystemStore, type WidgetId } from '@/store/systemStore'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useNetworkSuitePolling } from '@/hooks/useNetworkSuitePolling'
import { useClipboardCapture } from '@/hooks/useClipboardCapture'
import { applyTheme } from '@/lib/themes'
import type { ColumnId } from '@/types/personalization'

const WIDGET_MAP: Record<WidgetId, ReactNode> = {
  health: <HealthScorePanel />,
  cpu: <CpuPanel />,
  insights: <AiInsightsPanel />,
  netOverview: <NetworkOverviewPanel />,
  speedTest: <SpeedTestPanel />,
  fileExplorer: <FileExplorerPanel />,
  docker: <DockerPanel />,
  terminal: <TerminalPanel />,
  ram: <RamPanel />,
  disk: <DiskPanel />,
  sysinfo: <SystemInfoPanel />,
  gpuMonitor: <GpuMonitorPanel />,
  sensors: <SensorsPanel />,
  security: <SecurityCenterPanel />,
  netBandwidth: <BandwidthMonitorPanel />,
  vms: <VirtualMachinesPanel />,
  netMap: <WorldNetworkMapPanel />,
  calendar: <CalendarPanel />,
  ruleEngine: <RuleEnginePanel />,
  scheduler: <SchedulerPanel />,
  serviceUptime: <ServiceUptimePanel />,
  eventStream: <EventStreamPanel />,
  healthCenter: <HealthCenterPanel />,
  maintenance: <MaintenancePanel />,
  incidentCenter: <IncidentCenterPanel />,
  automationAnalytics: <AutomationAnalyticsPanel />,
  analyticsOverview: <AnalyticsOverviewPanel />,
  historicalAnalysis: <HistoricalAnalysisPanel />,
  advancedCharts: <AdvancedChartsPanel />,
  activityHeatmap: <ActivityHeatmapPanel />,
  trendAnalysis: <TrendAnalysisPanel />,
  correlations: <CorrelationPanel />,
  performanceTimeline: <PerformanceTimelinePanel />,
  analyticsReport: <AnalyticsReportPanel />,
  dataExplorer: <DataExplorerPanel />,
  executiveDashboard: <ExecutiveDashboardPanel />,
  aiAnalyticsSummary: <AiAnalyticsSummaryPanel />,
  network: <NetworkPanel />,
  netQuality: <ConnectionQualityPanel />,
  predictions: <PredictionsPanel />,
  storageAnalyzer: <StorageAnalyzerPanel />,
  packages: <PackageManagerPanel />,
  snapshots: <SnapshotsPanel />,
  exportCenter: <ExportCenterPanel />,
  apiStatus: <ApiStatusPanel />,
  netEvents: <NetworkEventsPanel />,
  logs: <LogsPanel />,
  notes: <NotesPanel />,
  clipboard: <ClipboardHistoryPanel />,
  processes: <ProcessTable />,
  quickActions: null,
}

const COLUMNS: ColumnId[] = ['col1', 'col2', 'col3']

/**
 * Three-column layout floating above the ambient aurora background.
 * Widget order is driven by personalizationStore.columnOrder (drag-and-drop
 * reorder), visibility by systemStore.visibleWidgets — both persisted.
 */
export function DashboardLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const visible = useSystemStore((s) => s.visibleWidgets)
  const columnOrder = usePersonalizationStore((s) => s.columnOrder)
  const themeId = usePersonalizationStore((s) => s.themeId)
  const customAccent = usePersonalizationStore((s) => s.customAccent)

  useKeyboardShortcuts({ onToggleSettings: () => setSettingsOpen((v) => !v), onCloseAll: () => setSettingsOpen(false) })
  useNetworkSuitePolling()
  useClipboardCapture()

  useEffect(() => {
    applyTheme(themeId, customAccent)
  }, [themeId, customAccent])

  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ background: 'var(--void)' }}>
      <AuroraBackground />
      <CursorGlow />
      <div className="relative z-10 flex h-full flex-col">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main id="dashboard-capture-root" className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col} className="space-y-4">
                {columnOrder[col]
                  .filter((id) => visible[id])
                  .map((id, index) => (
                    <DraggableWidget key={id} id={id} col={col} index={index}>
                      {WIDGET_MAP[id]}
                    </DraggableWidget>
                  ))}
              </div>
            ))}
          </div>

          {visible.processes && (
            <div className="mt-4">
              <ProcessTable />
            </div>
          )}
        </main>
      </div>

      <Suspense fallback={null}>
        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
        <AnimatePresence>
          <ProcessInspectorModal />
        </AnimatePresence>
        <CommandPalette onOpenSettings={() => setSettingsOpen(true)} />
      </Suspense>
      {visible.quickActions && <QuickActionsPanel />}
    </div>
  )
}

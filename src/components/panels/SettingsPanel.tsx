import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSystemStore, type WidgetId } from '@/store/systemStore'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { THEMES } from '@/lib/themes'
import { exportJsonFile } from '@/lib/exportUtils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useT, type Locale } from '@/lib/i18n'

const REFRESH_OPTIONS = [
  { label: '0.5s', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '5s', value: 5000 },
]

const PRESET_COLORS = ['#2dd4ee', '#a78bfa', '#f5a623', '#34d399', '#fb7185', '#ffffff', '#38bdf8', '#facc15']

const TAB_IDS = ['appearance', 'dashboard', 'accessibility', 'shortcuts', 'advanced'] as const
type TabId = (typeof TAB_IDS)[number]

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, true)
  const t = useT()
  const [tab, setTab] = useState<TabId>('appearance')
  const refreshRateMs = useSystemStore((s) => s.refreshRateMs)
  const setRefreshRate = useSystemStore((s) => s.setRefreshRate)
  const isPaused = useSystemStore((s) => s.isPaused)
  const togglePaused = useSystemStore((s) => s.togglePaused)
  const visibleWidgets = useSystemStore((s) => s.visibleWidgets)
  const toggleWidget = useSystemStore((s) => s.toggleWidget)
  const resetLayout = useSystemStore((s) => s.resetLayout)

  const themeId = usePersonalizationStore((s) => s.themeId)
  const setTheme = usePersonalizationStore((s) => s.setTheme)
  const customAccent = usePersonalizationStore((s) => s.customAccent)
  const setCustomAccent = usePersonalizationStore((s) => s.setCustomAccent)
  const recentColors = usePersonalizationStore((s) => s.recentColors)
  const profiles = usePersonalizationStore((s) => s.profiles)
  const activeProfileId = usePersonalizationStore((s) => s.activeProfileId)
  const switchProfile = usePersonalizationStore((s) => s.switchProfile)
  const addProfile = usePersonalizationStore((s) => s.addProfile)
  const columnOrder = usePersonalizationStore((s) => s.columnOrder)
  const savedLayouts = usePersonalizationStore((s) => s.savedLayouts)
  const saveLayout = usePersonalizationStore((s) => s.saveLayout)
  const applyLayout = usePersonalizationStore((s) => s.applyLayout)
  const deleteLayout = usePersonalizationStore((s) => s.deleteLayout)
  const resetColumnOrder = usePersonalizationStore((s) => s.resetColumnOrder)
  const reducedMotion = usePersonalizationStore((s) => s.reducedMotion)
  const setReducedMotion = usePersonalizationStore((s) => s.setReducedMotion)
  const highContrast = usePersonalizationStore((s) => s.highContrast)
  const setHighContrast = usePersonalizationStore((s) => s.setHighContrast)
  const soundEnabled = usePersonalizationStore((s) => s.soundEnabled)
  const setSoundEnabled = usePersonalizationStore((s) => s.setSoundEnabled)
  const soundVolume = usePersonalizationStore((s) => s.soundVolume)
  const setSoundVolume = usePersonalizationStore((s) => s.setSoundVolume)
  const locale = usePersonalizationStore((s) => s.locale)
  const setLocale = usePersonalizationStore((s) => s.setLocale)

  const TAB_LABELS: Record<TabId, string> = {
    appearance: t('settings.tabAppearance'),
    dashboard: t('settings.tabDashboard'),
    accessibility: t('settings.tabAccessibility'),
    shortcuts: t('settings.tabShortcuts'),
    advanced: t('settings.tabAdvanced'),
  }

  const WIDGET_LABELS: Record<WidgetId, string> = {
    cpu: t('widgets.cpu'), ram: t('widgets.ram'), disk: t('widgets.disk'), network: t('widgets.network'),
    processes: t('widgets.processes'), terminal: t('widgets.terminal'), logs: t('widgets.logs'), sysinfo: t('widgets.sysinfo'),
    insights: t('widgets.insights'), health: t('widgets.health'), security: t('widgets.security'), predictions: t('widgets.predictions'),
    netOverview: t('widgets.netOverview'), netBandwidth: t('widgets.netBandwidth'), netQuality: t('widgets.netQuality'),
    speedTest: t('widgets.speedTest'), netMap: t('widgets.netMap'), apiStatus: t('widgets.apiStatus'), netEvents: t('widgets.netEvents'),
    gpuMonitor: t('widgets.gpuMonitor'), sensors: t('widgets.sensors'), fileExplorer: t('widgets.fileExplorer'), docker: t('widgets.docker'),
    vms: t('widgets.vms'), packages: t('widgets.packages'), storageAnalyzer: t('widgets.storageAnalyzer'), snapshots: t('widgets.snapshots'),
    exportCenter: t('widgets.exportCenter'), quickActions: t('widgets.quickActions'), notes: t('widgets.notes'), calendar: t('widgets.calendar'),
    clipboard: t('widgets.clipboard'), ruleEngine: t('widgets.ruleEngine'), scheduler: t('widgets.scheduler'), serviceUptime: t('widgets.serviceUptime'),
    eventStream: t('widgets.eventStream'), healthCenter: t('widgets.healthCenter'), maintenance: t('widgets.maintenance'),
    incidentCenter: t('widgets.incidentCenter'), automationAnalytics: t('widgets.automationAnalytics'), analyticsOverview: t('widgets.analyticsOverview'),
    historicalAnalysis: t('widgets.historicalAnalysis'), advancedCharts: t('widgets.advancedCharts'), activityHeatmap: t('widgets.activityHeatmap'),
    trendAnalysis: t('widgets.trendAnalysis'), correlations: t('widgets.correlations'), performanceTimeline: t('widgets.performanceTimeline'),
    analyticsReport: t('widgets.analyticsReport'), dataExplorer: t('widgets.dataExplorer'), executiveDashboard: t('widgets.executiveDashboard'),
    aiAnalyticsSummary: t('widgets.aiAnalyticsSummary'),
  }

  const SHORTCUTS: [string, string][] = [
    ['Ctrl/Cmd + K', locale === 'en' ? 'Open the command palette' : 'Obre la paleta de comandes'],
    [locale === 'en' ? 'Space' : 'Espai', locale === 'en' ? 'Pause/resume updates' : 'Pausa/reprèn les actualitzacions'],
    ['/', locale === 'en' ? 'Search processes' : 'Cerca processos'],
    ['?', locale === 'en' ? 'Open/close settings' : 'Obre/tanca configuració'],
    ['Ctrl/Cmd + Shift + T', locale === 'en' ? 'Switch theme' : 'Canvia de tema'],
    ['Ctrl/Cmd + /', locale === 'en' ? 'Show this help' : 'Mostra aquesta ajuda'],
    ['Esc', locale === 'en' ? 'Close popups' : 'Tanca finestres emergents'],
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-96 flex-col backdrop-blur-xl"
        style={{ borderLeft: '1px solid var(--glass-border)', background: 'rgba(5,7,13,0.85)' }}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="label-eyebrow text-xs" style={{ color: 'var(--text-hi)' }}>{t('settings.title')}</h2>
          <button onClick={onClose} className="transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }} aria-label={t('common.close')}>
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-1 px-4 pb-3">
          {TAB_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="rounded-md px-2 py-1 text-[11px] transition-colors"
              style={{ background: tab === id ? 'var(--glass-fill-hover)' : 'transparent', color: tab === id ? 'var(--signal-cyan)' : 'var(--text-lo)' }}
            >
              {TAB_LABELS[id]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
          {tab === 'appearance' && (
            <>
              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.theme')}</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.values(THEMES).map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className="rounded-lg border p-2 text-left transition-colors"
                      style={{ borderColor: themeId === th.id ? th.signalCyan : 'var(--glass-border)', background: th.void }}
                    >
                      <div className="mb-1 flex gap-0.5">
                        {[th.signalCyan, th.signalViolet, th.signalAmber, th.signalEmerald].map((c) => (
                          <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-[9px]" style={{ color: th.textHi }}>{th.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.language')}</h3>
                <div className="flex gap-1.5">
                  {(['ca', 'en'] as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className="flex-1 rounded-md border px-2.5 py-1.5 text-xs transition-colors"
                      style={{ borderColor: locale === l ? 'var(--signal-cyan)' : 'var(--glass-border)', color: locale === l ? 'var(--signal-cyan)' : 'var(--text-hi)' }}
                    >
                      {l === 'ca' ? 'Català' : 'English'}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.customAccent')}</h3>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={customAccent ?? THEMES[themeId].signalCyan}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent"
                  />
                  <button onClick={() => setCustomAccent(null)} className="rounded-md px-2 py-1 text-[10px]" style={{ color: 'var(--text-lo)', background: 'rgba(148,163,184,0.08)' }}>
                    {t('settings.resetToThemeAccent')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => setCustomAccent(c)} className="h-5 w-5 rounded-full" style={{ background: c, border: customAccent === c ? '2px solid white' : 'none' }} />
                  ))}
                  {recentColors.map((c) => (
                    <button key={c} onClick={() => setCustomAccent(c)} className="h-5 w-5 rounded-full opacity-70" style={{ background: c }} />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.profiles')}</h3>
                <div className="space-y-1.5">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className="glass-panel flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs"
                      style={{ color: 'var(--text-hi)', borderColor: activeProfileId === p.id ? 'var(--signal-cyan)' : 'var(--glass-border)' }}
                    >
                      <span>{p.avatarEmoji}</span>
                      <span className="flex-1">{p.name}</span>
                      <span className="font-data text-[9px]" style={{ color: 'var(--text-lo)' }}>{THEMES[p.themeId].name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => addProfile(`Profile ${profiles.length + 1}`, '👤')}
                    className="w-full rounded-md px-2.5 py-1.5 text-[11px]"
                    style={{ color: 'var(--text-lo)', background: 'rgba(148,163,184,0.05)' }}
                  >
                    {t('settings.newProfile')}
                  </button>
                </div>
              </section>
            </>
          )}

          {tab === 'dashboard' && (
            <>
              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.refreshRate')}</h3>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {REFRESH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRefreshRate(opt.value)}
                      className="rounded-md border px-2.5 py-1 font-data text-xs transition-colors"
                      style={{
                        borderColor: refreshRateMs === opt.value ? 'var(--signal-cyan)' : 'var(--glass-border)',
                        color: refreshRateMs === opt.value ? 'var(--signal-cyan)' : 'var(--text-lo)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={togglePaused}
                  className="w-full rounded-md border px-3 py-1.5 text-xs transition-colors"
                  style={{ borderColor: isPaused ? 'var(--signal-amber)' : 'var(--glass-border)', color: isPaused ? 'var(--signal-amber)' : 'var(--text-hi)' }}
                >
                  {isPaused ? t('settings.resumeUpdates') : t('settings.pauseUpdates')}
                </button>
              </section>

              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.visibleWidgets')}</h3>
                <div className="space-y-1.5">
                  {(Object.keys(WIDGET_LABELS) as WidgetId[]).map((id) => (
                    <label key={id} className="glass-panel flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs" style={{ color: 'var(--text-hi)' }}>
                      {WIDGET_LABELS[id]}
                      <input type="checkbox" checked={visibleWidgets[id]} onChange={() => toggleWidget(id)} className="accent-cyan-400" />
                    </label>
                  ))}
                </div>
              </section>

              <button onClick={resetLayout} className="glass-panel w-full rounded-md border px-3 py-1.5 text-xs transition-colors hover:text-white" style={{ color: 'var(--text-lo)' }}>
                {t('settings.resetLayout')}
              </button>
            </>
          )}

          {tab === 'shortcuts' && (
            <section>
              <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.keyboardShortcuts')}</h3>
              <div className="space-y-1.5 font-data text-[11px]" style={{ color: 'var(--text-hi)' }}>
                {SHORTCUTS.map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between rounded-md px-2 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
                    <span style={{ color: 'var(--text-lo)' }}>{desc}</span>
                    <kbd className="rounded px-1.5 py-0.5" style={{ background: 'rgba(148,163,184,0.12)' }}>{key}</kbd>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'advanced' && (
            <>
              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.savedLayouts')}</h3>
                <div className="mb-2 space-y-1.5">
                  {savedLayouts.map((l) => (
                    <div key={l.id} className="flex items-center justify-between rounded-md px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
                      <button onClick={() => applyLayout(l.id)} className="text-xs" style={{ color: 'var(--text-hi)' }}>{l.name}</button>
                      <button onClick={() => deleteLayout(l.id)} className="text-[10px]" style={{ color: 'var(--signal-rose)' }}>{t('common.delete').toLowerCase()}</button>
                    </div>
                  ))}
                  {savedLayouts.length === 0 && <p className="text-[11px]" style={{ color: 'var(--text-lo)' }}>{t('settings.noSavedLayouts')}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => saveLayout(`Layout ${savedLayouts.length + 1}`)}
                    className="glass-panel flex-1 rounded-md border px-2 py-1.5 text-[11px]"
                    style={{ color: 'var(--signal-cyan)' }}
                  >
                    {t('settings.saveCurrentLayout')}
                  </button>
                  <button onClick={resetColumnOrder} className="glass-panel flex-1 rounded-md border px-2 py-1.5 text-[11px]" style={{ color: 'var(--text-lo)' }}>
                    {t('settings.resetOrder')}
                  </button>
                </div>
              </section>

              <section>
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.importExport')}</h3>
                <button
                  onClick={() => exportJsonFile(`layout-${Date.now()}.json`, columnOrder)}
                  className="glass-panel w-full rounded-md border px-3 py-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-hi)' }}
                >
                  {t('settings.exportLayout')}
                </button>
              </section>
            </>
          )}
          {tab === 'accessibility' && (
            <>
              <section className="mb-6">
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.motionContrast')}</h3>
                <div className="space-y-1.5">
                  <ToggleRow label={t('settings.reduceMotion')} checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} />
                  <ToggleRow label={t('settings.highContrast')} checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
                </div>
                <p className="mt-2 text-[10px]" style={{ color: 'var(--text-lo)' }}>{t('settings.reduceMotionHint')}</p>
              </section>

              <section>
                <h3 className="label-eyebrow mb-2 text-[10px]">{t('settings.sound')}</h3>
                <div className="space-y-1.5">
                  <ToggleRow label={t('settings.soundEnabled')} checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                  {soundEnabled && (
                    <div className="rounded-md px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
                      <div className="mb-1 flex justify-between text-[10px]" style={{ color: 'var(--text-lo)' }}>
                        <span>{t('settings.volume')}</span><span>{Math.round(soundVolume * 100)}%</span>
                      </div>
                      <input type="range" min={0} max={1} step={0.05} value={soundVolume} onChange={(e) => setSoundVolume(Number(e.target.value))} className="w-full accent-cyan-400" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[10px]" style={{ color: 'var(--text-lo)' }}>{t('settings.soundHint')}</p>
              </section>
            </>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5" style={{ background: 'rgba(148,163,184,0.05)' }}>
      <span className="text-xs" style={{ color: 'var(--text-hi)' }}>{label}</span>
      <span className="h-3.5 w-6 rounded-full p-0.5" style={{ background: checked ? 'var(--signal-cyan)' : 'rgba(148,163,184,0.2)' }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(9px)' : 'translateX(0)' }} />
      </span>
    </button>
  )
}

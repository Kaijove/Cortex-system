import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent, ClipboardItem, ColumnId, Note, Profile, ThemeId } from '@/types/personalization'
import type { WidgetId } from './systemStore'
import { applyTheme } from '@/lib/themes'
import { nowLabel } from '@/lib/utils'

const DEFAULT_COLUMN_ORDER: Record<ColumnId, WidgetId[]> = {
  col1: ['health', 'healthCenter', 'executiveDashboard', 'cpu', 'insights', 'aiAnalyticsSummary', 'netOverview', 'speedTest', 'fileExplorer', 'docker', 'ruleEngine', 'terminal'],
  col2: ['ram', 'disk', 'sysinfo', 'gpuMonitor', 'sensors', 'security', 'netBandwidth', 'vms', 'netMap', 'serviceUptime', 'maintenance', 'analyticsOverview', 'trendAnalysis', 'advancedCharts', 'calendar'],
  col3: ['network', 'netQuality', 'predictions', 'storageAnalyzer', 'packages', 'snapshots', 'exportCenter', 'apiStatus', 'netEvents', 'eventStream', 'scheduler', 'incidentCenter', 'automationAnalytics', 'historicalAnalysis', 'activityHeatmap', 'correlations', 'performanceTimeline', 'analyticsReport', 'dataExplorer', 'logs', 'notes', 'clipboard'],
}

function defaultProfile(): Profile {
  return {
    id: 'default',
    name: 'Kai',
    avatarEmoji: '🛹',
    themeId: 'cyberpunk',
    language: 'Català',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lastSession: null,
  }
}

interface SavedLayout {
  id: string
  name: string
  columnOrder: Record<ColumnId, WidgetId[]>
}

interface PersonalizationState {
  themeId: ThemeId
  customAccent: string | null
  recentColors: string[]

  profiles: Profile[]
  activeProfileId: string

  columnOrder: Record<ColumnId, WidgetId[]>
  lockedWidgets: WidgetId[]
  savedLayouts: SavedLayout[]

  notes: Note[]
  events: CalendarEvent[]
  clipboardHistory: ClipboardItem[]

  commandPaletteOpen: boolean
  shortcutsHelpOpen: boolean
  reducedMotion: boolean
  highContrast: boolean
  soundEnabled: boolean
  soundVolume: number
  recentCommandIds: string[]
  favoriteCommandIds: string[]
  locale: 'ca' | 'en'

  setTheme: (id: ThemeId) => void
  setCustomAccent: (hex: string | null) => void
  addRecentColor: (hex: string) => void

  addProfile: (name: string, avatarEmoji: string) => void
  switchProfile: (id: string) => void
  updateActiveProfile: (patch: Partial<Profile>) => void

  moveWidget: (from: { col: ColumnId; index: number }, to: { col: ColumnId; index: number }) => void
  toggleLockWidget: (id: WidgetId) => void
  resetColumnOrder: () => void
  saveLayout: (name: string) => void
  applyLayout: (id: string) => void
  deleteLayout: (id: string) => void

  addNote: () => void
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void
  togglePinNote: (id: string) => void

  addEvent: (title: string, date: string, time: string | null) => void
  deleteEvent: (id: string) => void

  pushClipboardItem: (content: string) => void
  togglePinClipboardItem: (id: string) => void
  clearClipboardHistory: () => void

  setCommandPaletteOpen: (open: boolean) => void
  setShortcutsHelpOpen: (open: boolean) => void
  cycleTheme: () => void
  setReducedMotion: (v: boolean) => void
  setHighContrast: (v: boolean) => void
  setSoundEnabled: (v: boolean) => void
  setSoundVolume: (v: number) => void
  pushRecentCommand: (id: string) => void
  toggleFavoriteCommand: (id: string) => void
  setLocale: (locale: 'ca' | 'en') => void
}

function detectClipboardKind(content: string): ClipboardItem['kind'] {
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(content.trim())) return 'color'
  if (/^https?:\/\//i.test(content.trim())) return 'link'
  if (/[{};]|=>|function |const |import /.test(content)) return 'code'
  return 'text'
}

export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set, get) => ({
      themeId: 'cyberpunk',
      customAccent: null,
      recentColors: [],

      profiles: [defaultProfile()],
      activeProfileId: 'default',

      columnOrder: DEFAULT_COLUMN_ORDER,
      lockedWidgets: [],
      savedLayouts: [],

      notes: [],
      events: [],
      clipboardHistory: [],

      commandPaletteOpen: false,
      shortcutsHelpOpen: false,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
      highContrast: false,
      soundEnabled: false,
      soundVolume: 0.4,
      recentCommandIds: [],
      favoriteCommandIds: [],
      locale: 'ca',

      setTheme: (id) => {
        applyTheme(id, get().customAccent)
        set({ themeId: id })
      },
      setCustomAccent: (hex) => {
        applyTheme(get().themeId, hex)
        set({ customAccent: hex })
        if (hex) get().addRecentColor(hex)
      },
      addRecentColor: (hex) => set((s) => ({ recentColors: [hex, ...s.recentColors.filter((c) => c !== hex)].slice(0, 8) })),

      addProfile: (name, avatarEmoji) =>
        set((s) => ({
          profiles: [...s.profiles, { id: `profile-${Date.now()}`, name, avatarEmoji, themeId: s.themeId, language: 'Català', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, lastSession: null }],
        })),
      switchProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id)
        if (!profile) return
        applyTheme(profile.themeId, get().customAccent)
        set((s) => ({
          activeProfileId: id,
          themeId: profile.themeId,
          profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, lastSession: nowLabel() } : p)),
        }))
      },
      updateActiveProfile: (patch) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? { ...p, ...patch } : p)) })),

      moveWidget: (from, to) =>
        set((s) => {
          const order = { ...s.columnOrder, [from.col]: [...s.columnOrder[from.col]] }
          if (to.col !== from.col) order[to.col] = [...s.columnOrder[to.col]]
          const [moved] = order[from.col].splice(from.index, 1)
          if (!moved) return s
          order[to.col].splice(to.index, 0, moved)
          return { columnOrder: order }
        }),
      toggleLockWidget: (id) =>
        set((s) => ({ lockedWidgets: s.lockedWidgets.includes(id) ? s.lockedWidgets.filter((w) => w !== id) : [...s.lockedWidgets, id] })),
      resetColumnOrder: () => set({ columnOrder: DEFAULT_COLUMN_ORDER, lockedWidgets: [] }),
      saveLayout: (name) => set((s) => ({ savedLayouts: [...s.savedLayouts, { id: `layout-${Date.now()}`, name, columnOrder: s.columnOrder }] })),
      applyLayout: (id) => {
        const layout = get().savedLayouts.find((l) => l.id === id)
        if (layout) set({ columnOrder: layout.columnOrder })
      },
      deleteLayout: (id) => set((s) => ({ savedLayouts: s.savedLayouts.filter((l) => l.id !== id) })),

      addNote: () =>
        set((s) => ({
          notes: [
            { id: `note-${Date.now()}`, title: 'Nova nota', content: '', color: 'default', tags: [], pinned: false, createdAt: nowLabel(), updatedAt: nowLabel() },
            ...s.notes,
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: nowLabel() } : n)) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      togglePinNote: (id) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })),

      addEvent: (title, date, time) =>
        set((s) => ({ events: [...s.events, { id: `event-${Date.now()}`, title, date, time }] })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      pushClipboardItem: (content) => {
        const trimmed = content.trim()
        if (!trimmed) return
        set((s) => {
          if (s.clipboardHistory[0]?.content === trimmed) return s
          const item: ClipboardItem = { id: `clip-${Date.now()}`, content: trimmed, kind: detectClipboardKind(trimmed), timestamp: nowLabel(), pinned: false }
          return { clipboardHistory: [item, ...s.clipboardHistory].slice(0, 60) }
        })
      },
      togglePinClipboardItem: (id) =>
        set((s) => ({ clipboardHistory: s.clipboardHistory.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)) })),
      clearClipboardHistory: () => set((s) => ({ clipboardHistory: s.clipboardHistory.filter((c) => c.pinned) })),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setShortcutsHelpOpen: (open) => set({ shortcutsHelpOpen: open }),
      cycleTheme: () => {
        const ids: ThemeId[] = ['macos', 'tokyoNight', 'nord', 'catppuccin', 'dracula', 'gruvbox', 'matrix', 'cyberpunk', 'midnightBlue']
        const next = ids[(ids.indexOf(get().themeId) + 1) % ids.length]
        get().setTheme(next)
      },
      setReducedMotion: (v) => {
        document.documentElement.setAttribute('data-reduced-motion', String(v))
        set({ reducedMotion: v })
      },
      setHighContrast: (v) => {
        document.documentElement.setAttribute('data-high-contrast', String(v))
        set({ highContrast: v })
      },
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setSoundVolume: (v) => set({ soundVolume: v }),
      pushRecentCommand: (id) => set((s) => ({ recentCommandIds: [id, ...s.recentCommandIds.filter((c) => c !== id)].slice(0, 6) })),
      toggleFavoriteCommand: (id) =>
        set((s) => ({ favoriteCommandIds: s.favoriteCommandIds.includes(id) ? s.favoriteCommandIds.filter((c) => c !== id) : [...s.favoriteCommandIds, id] })),
      setLocale: (locale) => {
        document.documentElement.setAttribute('lang', locale)
        set({ locale })
      },
    }),
    {
      name: 'system-monitor-dashboard-personalization',
      partialize: (s) => ({
        themeId: s.themeId,
        customAccent: s.customAccent,
        recentColors: s.recentColors,
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        columnOrder: s.columnOrder,
        lockedWidgets: s.lockedWidgets,
        savedLayouts: s.savedLayouts,
        notes: s.notes,
        events: s.events,
        clipboardHistory: s.clipboardHistory,
        reducedMotion: s.reducedMotion,
        highContrast: s.highContrast,
        soundEnabled: s.soundEnabled,
        soundVolume: s.soundVolume,
        favoriteCommandIds: s.favoriteCommandIds,
        locale: s.locale,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.themeId, state.customAccent)
          document.documentElement.setAttribute('data-reduced-motion', String(state.reducedMotion))
          document.documentElement.setAttribute('data-high-contrast', String(state.highContrast))
          document.documentElement.setAttribute('lang', state.locale)
        }
      },
    },
  ),
)

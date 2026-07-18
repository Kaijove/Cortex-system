export type ThemeId = 'macos' | 'tokyoNight' | 'nord' | 'catppuccin' | 'dracula' | 'gruvbox' | 'matrix' | 'cyberpunk' | 'midnightBlue'

export interface ThemeTokens {
  id: ThemeId
  name: string
  void: string
  glassFill: string
  glassFillHover: string
  glassBorder: string
  glassBorderHover: string
  signalCyan: string
  signalViolet: string
  signalAmber: string
  signalEmerald: string
  signalRose: string
  textHi: string
  textLo: string
}

export interface Profile {
  id: string
  name: string
  avatarEmoji: string
  themeId: ThemeId
  language: string
  timezone: string
  lastSession: string | null
}

export type NoteColor = 'default' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose'

export interface Note {
  id: string
  title: string
  content: string
  color: NoteColor
  tags: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string | null
}

export type ClipboardItemKind = 'text' | 'code' | 'link' | 'color'

export interface ClipboardItem {
  id: string
  content: string
  kind: ClipboardItemKind
  timestamp: string
  pinned: boolean
}

export type ColumnId = 'col1' | 'col2' | 'col3'

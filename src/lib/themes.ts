import type { ThemeId, ThemeTokens } from '@/types/personalization'

export const THEMES: Record<ThemeId, ThemeTokens> = {
  macos: {
    id: 'macos', name: 'macOS',
    void: '#111114', glassFill: 'rgba(255,255,255,0.06)', glassFillHover: 'rgba(255,255,255,0.1)',
    glassBorder: 'rgba(255,255,255,0.12)', glassBorderHover: 'rgba(255,255,255,0.22)',
    signalCyan: '#0a84ff', signalViolet: '#bf5af2', signalAmber: '#ff9f0a', signalEmerald: '#30d158', signalRose: '#ff453a',
    textHi: '#f5f5f7', textLo: '#98989d',
  },
  tokyoNight: {
    id: 'tokyoNight', name: 'Tokyo Night',
    void: '#1a1b26', glassFill: 'rgba(169,177,214,0.06)', glassFillHover: 'rgba(169,177,214,0.1)',
    glassBorder: 'rgba(169,177,214,0.14)', glassBorderHover: 'rgba(169,177,214,0.26)',
    signalCyan: '#7dcfff', signalViolet: '#bb9af7', signalAmber: '#e0af68', signalEmerald: '#9ece6a', signalRose: '#f7768e',
    textHi: '#c0caf5', textLo: '#565f89',
  },
  nord: {
    id: 'nord', name: 'Nord',
    void: '#2e3440', glassFill: 'rgba(216,222,233,0.06)', glassFillHover: 'rgba(216,222,233,0.1)',
    glassBorder: 'rgba(216,222,233,0.14)', glassBorderHover: 'rgba(216,222,233,0.26)',
    signalCyan: '#88c0d0', signalViolet: '#b48ead', signalAmber: '#ebcb8b', signalEmerald: '#a3be8c', signalRose: '#bf616a',
    textHi: '#eceff4', textLo: '#7d8494',
  },
  catppuccin: {
    id: 'catppuccin', name: 'Catppuccin',
    void: '#1e1e2e', glassFill: 'rgba(205,214,244,0.06)', glassFillHover: 'rgba(205,214,244,0.1)',
    glassBorder: 'rgba(205,214,244,0.14)', glassBorderHover: 'rgba(205,214,244,0.26)',
    signalCyan: '#89dceb', signalViolet: '#cba6f7', signalAmber: '#f9e2af', signalEmerald: '#a6e3a1', signalRose: '#f38ba8',
    textHi: '#cdd6f4', textLo: '#7f849c',
  },
  dracula: {
    id: 'dracula', name: 'Dracula',
    void: '#191a21', glassFill: 'rgba(248,248,242,0.06)', glassFillHover: 'rgba(248,248,242,0.1)',
    glassBorder: 'rgba(248,248,242,0.14)', glassBorderHover: 'rgba(248,248,242,0.26)',
    signalCyan: '#8be9fd', signalViolet: '#bd93f9', signalAmber: '#f1fa8c', signalEmerald: '#50fa7b', signalRose: '#ff5555',
    textHi: '#f8f8f2', textLo: '#6272a4',
  },
  gruvbox: {
    id: 'gruvbox', name: 'Gruvbox',
    void: '#1d2021', glassFill: 'rgba(235,219,178,0.06)', glassFillHover: 'rgba(235,219,178,0.1)',
    glassBorder: 'rgba(235,219,178,0.14)', glassBorderHover: 'rgba(235,219,178,0.26)',
    signalCyan: '#83a598', signalViolet: '#d3869b', signalAmber: '#fabd2f', signalEmerald: '#b8bb26', signalRose: '#fb4934',
    textHi: '#ebdbb2', textLo: '#928374',
  },
  matrix: {
    id: 'matrix', name: 'Matrix',
    void: '#000000', glassFill: 'rgba(0,255,65,0.05)', glassFillHover: 'rgba(0,255,65,0.09)',
    glassBorder: 'rgba(0,255,65,0.18)', glassBorderHover: 'rgba(0,255,65,0.32)',
    signalCyan: '#00ff41', signalViolet: '#39ff6a', signalAmber: '#adff2f', signalEmerald: '#00ff41', signalRose: '#ff3131',
    textHi: '#c8ffd4', textLo: '#3f8f52',
  },
  cyberpunk: {
    id: 'cyberpunk', name: 'Cyberpunk',
    void: '#0a0014', glassFill: 'rgba(255,0,200,0.06)', glassFillHover: 'rgba(255,0,200,0.1)',
    glassBorder: 'rgba(0,240,255,0.18)', glassBorderHover: 'rgba(0,240,255,0.32)',
    signalCyan: '#00f0ff', signalViolet: '#d000ff', signalAmber: '#fcee0a', signalEmerald: '#05ffa1', signalRose: '#ff2079',
    textHi: '#f0e6ff', textLo: '#8a6fa8',
  },
  midnightBlue: {
    id: 'midnightBlue', name: 'Midnight Blue',
    void: '#050c1a', glassFill: 'rgba(148,180,255,0.06)', glassFillHover: 'rgba(148,180,255,0.1)',
    glassBorder: 'rgba(148,180,255,0.14)', glassBorderHover: 'rgba(148,180,255,0.26)',
    signalCyan: '#4cc9f0', signalViolet: '#7b8cff', signalAmber: '#f2c94c', signalEmerald: '#43e6a0', signalRose: '#ff6b8b',
    textHi: '#e6ecff', textLo: '#6b7ba3',
  },
}

const VAR_MAP: Record<keyof Omit<ThemeTokens, 'id' | 'name'>, string> = {
  void: '--void',
  glassFill: '--glass-fill',
  glassFillHover: '--glass-fill-hover',
  glassBorder: '--glass-border',
  glassBorderHover: '--glass-border-hover',
  signalCyan: '--signal-cyan',
  signalViolet: '--signal-violet',
  signalAmber: '--signal-amber',
  signalEmerald: '--signal-emerald',
  signalRose: '--signal-rose',
  textHi: '--text-hi',
  textLo: '--text-lo',
}

/**
 * Applies a theme (plus an optional custom accent override for --signal-cyan,
 * the color used as the primary accent across the app) by setting CSS custom
 * properties on the root element. Every existing panel already reads these
 * vars, so this reaches all 26+ components without touching any of them.
 */
export function applyTheme(themeId: ThemeId, customAccent?: string | null) {
  const theme = THEMES[themeId]
  const root = document.documentElement
  ;(Object.keys(VAR_MAP) as (keyof typeof VAR_MAP)[]).forEach((key) => {
    root.style.setProperty(VAR_MAP[key], theme[key])
  })
  if (customAccent) {
    root.style.setProperty('--signal-cyan', customAccent)
  }
}

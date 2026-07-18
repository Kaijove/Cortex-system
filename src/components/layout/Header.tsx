import { useEffect, useState } from 'react'
import { Pause, Play, Settings, Terminal, Wifi } from 'lucide-react'
import { useSystemStore } from '@/store/systemStore'
import { usePersonalizationStore } from '@/store/personalizationStore'
import { formatUptime } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { AlertCenter } from './AlertCenter'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const systemInfo = useSystemStore((s) => s.systemInfo)
  const isPaused = useSystemStore((s) => s.isPaused)
  const isLive = useSystemStore((s) => s.isLive)
  const togglePaused = useSystemStore((s) => s.togglePaused)
  const locale = usePersonalizationStore((s) => s.locale)
  const t = useT()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const liveColor = isLive ? 'var(--signal-emerald)' : 'var(--signal-amber)'
  const dateLocale = locale === 'en' ? 'en-GB' : 'ca-ES'

  return (
    <header
      className="relative z-10 flex items-center justify-between px-4 py-3 backdrop-blur-xl"
      style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(5,7,13,0.55)' }}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <Terminal size={18} style={{ color: 'var(--signal-cyan)' }} className="shrink-0" />
        <div className="flex min-w-0 items-center text-sm">
          <span className="truncate font-semibold" style={{ color: 'var(--text-hi)' }}>{systemInfo.hostname}</span>
          <span className="ml-2 hidden font-data text-xs sm:inline" style={{ color: 'var(--text-lo)' }}>
            {systemInfo.os} · {systemInfo.kernel}
          </span>
          <span
            className="ml-2 flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: `${liveColor}22`, color: liveColor }}
            title={isLive ? t('header.liveTooltip') : t('header.simulatedTooltip')}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: liveColor }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: liveColor }} />
            </span>
            <span className="hidden sm:inline">{isLive ? t('common.live') : t('common.simulated')}</span>
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 font-data text-xs sm:gap-4" style={{ color: 'var(--text-lo)' }}>
        <span className="hidden lg:inline">{systemInfo.user}</span>
        <span className="hidden md:inline">Uptime: {formatUptime(systemInfo.uptimeSeconds)}</span>
        <Wifi size={14} style={{ color: 'var(--signal-emerald)' }} className="hidden sm:block" />
        <span className="tabular-nums" style={{ color: 'var(--text-hi)' }}>
          {now.toLocaleTimeString('en-GB', { hour12: false })}
        </span>
        <span className="hidden md:inline">{now.toLocaleDateString(dateLocale)}</span>
        <span className="hidden xl:inline">{systemInfo.timezone}</span>

        <button
          onClick={togglePaused}
          title={isPaused ? t('header.resume') : t('header.pause')}
          aria-label={isPaused ? t('header.resumeAria') : t('header.pauseAria')}
          className="transition-colors hover:text-white"
          style={{ color: isPaused ? 'var(--signal-amber)' : 'var(--text-lo)' }}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>

        <AlertCenter />

        <button
          onClick={onOpenSettings}
          title={t('header.settingsTooltip')}
          aria-label={t('header.settingsAria')}
          className="transition-colors hover:text-white"
          style={{ color: 'var(--text-lo)' }}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}

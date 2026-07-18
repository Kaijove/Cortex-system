import { usePersonalizationStore } from '@/store/personalizationStore'

let sharedCtx: AudioContext | null = null
function getCtx(): AudioContext | null {
  try {
    if (!sharedCtx) sharedCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    return sharedCtx
  } catch {
    return null
  }
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine') {
  const { soundEnabled, soundVolume } = usePersonalizationStore.getState()
  if (!soundEnabled) return
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = freq
  osc.type = type
  gain.gain.setValueAtTime(0.001, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.12 * soundVolume, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + durationMs / 1000)
}

export const playClickSound = () => tone(520, 60, 'sine')
export const playSuccessSound = () => {
  tone(660, 90, 'sine')
  setTimeout(() => tone(880, 120, 'sine'), 80)
}
export const playWarningSound = () => tone(300, 180, 'triangle')
export const playNotificationSound = () => tone(740, 140, 'sine')

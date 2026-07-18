import { usePersonalizationStore } from '@/store/personalizationStore'
import { ca } from './ca'
import { en } from './en'

export type Locale = 'ca' | 'en'

export const DICTIONARIES = { ca, en } as const

type Vars = Record<string, string | number>

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj)
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
}

/** Looks up `key` (dot path, e.g. "widgets.cpu.title") in the given locale, falling back to Catalan, then to the key itself. */
export function translate(locale: Locale, key: string, vars?: Vars): string {
  const value = getPath(DICTIONARIES[locale], key) ?? getPath(DICTIONARIES.ca, key)
  if (typeof value !== 'string') return key
  return interpolate(value, vars)
}

/** `const t = useT()` then `t('widgets.cpu.title')` — reactive to the current locale. */
export function useT() {
  const locale = usePersonalizationStore((s) => s.locale)
  return (key: string, vars?: Vars) => translate(locale, key, vars)
}

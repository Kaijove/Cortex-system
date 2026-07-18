/** True when running inside the Tauri desktop shell, false in a plain browser tab. */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

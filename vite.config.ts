import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    watch: {
      // Rust writes actively-locked binaries into src-tauri/target while
      // compiling. Vite's own watcher has no reason to look in there (it's
      // Tauri's build output, not frontend source) — watching it anyway is
      // what causes the Windows EBUSY crash during `tauri dev`.
      ignored: ['**/src-tauri/**'],
    },
  },
})

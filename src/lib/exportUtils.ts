function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportTextFile(filename: string, content: string) {
  downloadBlob(filename, content, 'text/plain')
}

export function exportJsonFile(filename: string, data: unknown) {
  downloadBlob(filename, JSON.stringify(data, null, 2), 'application/json')
}

export function exportCsvFile(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
  downloadBlob(filename, csv, 'text/csv')
}

/**
 * "PDF export" via the browser's native print dialog (Save as PDF) — a real
 * printable document, not a fabricated file. Opens a formatted report in a
 * new window and triggers print().
 */
export function printSystemReport(title: string, sections: { heading: string; rows: [string, string][] }[]) {
  const win = window.open('', '_blank')
  if (!win) return

  const bodyHtml = sections
    .map(
      (section) => `
        <h2>${section.heading}</h2>
        <table>
          ${section.rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
        </table>
      `,
    )
    .join('')

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, sans-serif; color: #111; padding: 32px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
          h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #444; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          td { padding: 4px 0; border-bottom: 1px solid #eee; }
          td:first-child { color: #666; width: 40%; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="subtitle">Generat el ${new Date().toLocaleString('ca-ES')}</div>
        ${bodyHtml}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}

/** Real full-dashboard screenshot via html2canvas. Note: backdrop-filter blur
 *  (the glass effect) doesn't rasterize reliably in html2canvas — the capture
 *  will show the panels and colors correctly but with less blur than on
 *  screen. That's a known library limitation, not something faked here. */
export async function exportDashboardScreenshot(target: HTMLElement, filename: string) {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(target, {
    backgroundColor: '#05070d',
    scale: Math.min(2, window.devicePixelRatio || 1),
    useCORS: true,
  })
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  })
}
export function exportSvgAsSvg(svg: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer()
  let source = serializer.serializeToString(svg)
  if (!source.includes('xmlns=')) {
    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  downloadBlob(filename, source, 'image/svg+xml')
}

export function exportSvgAsPng(svg: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer()
  let source = serializer.serializeToString(svg)
  if (!source.includes('xmlns=')) {
    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const bbox = svg.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = bbox.width * 2
    canvas.height = bbox.height * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#05070d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    canvas.toBlob((blob) => {
      if (!blob) return
      const pngUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(pngUrl)
    })
  }
  img.src = url
}

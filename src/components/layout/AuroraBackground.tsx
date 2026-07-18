import { useEffect, useRef } from 'react'
import { usePersonalizationStore } from '@/store/personalizationStore'

/**
 * The dashboard's one orchestrated motion signature: three slow-drifting,
 * heavily blurred color blobs behind a fine noise texture and a vignette.
 * Everything else in the UI stays deliberately quiet by comparison.
 * Drift/breathing are pure CSS (see index.css). The subtle cursor parallax
 * below is real mouse tracking, applied as a lightweight transform offset —
 * skipped entirely when reduced motion is on.
 */
export function AuroraBackground() {
  const layerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePersonalizationStore((s) => s.reducedMotion)

  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function onMove(e: MouseEvent) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 24
      targetY = (e.clientY / window.innerHeight - 0.5) * 24
    }

    function animate() {
      currentX += (targetX - currentX) * 0.04
      currentY += (targetY - currentY) * 0.04
      if (layerRef.current) {
        layerRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`
      }
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  return (
    <>
      <div ref={layerRef} className="aurora-layer">
        <div className="aurora-blob aurora-blob--cyan" />
        <div className="aurora-blob aurora-blob--violet" />
        <div className="aurora-blob aurora-blob--emerald" />
      </div>
      <div className="noise-overlay" />
      <div className="vignette-layer" />
    </>
  )
}

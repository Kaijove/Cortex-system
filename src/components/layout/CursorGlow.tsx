import { useEffect, useRef } from 'react'
import { usePersonalizationStore } from '@/store/personalizationStore'

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePersonalizationStore((s) => s.reducedMotion)

  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    let tx = -300
    let ty = -300
    let cx = -300
    let cy = -300

    function onMove(e: MouseEvent) {
      tx = e.clientX
      ty = e.clientY
    }
    function animate() {
      cx += (tx - cx) * 0.18
      cy += (ty - cy) * 0.18
      if (ref.current) ref.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(animate)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  if (reducedMotion) return null
  return <div ref={ref} className="cursor-glow" />
}

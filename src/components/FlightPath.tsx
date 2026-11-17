import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// O avião da marca desce pela lateral junto com a página e deixa o rastro verde.
// Leve: só transform e scaleY, uma atualização por quadro, nada de SVG recalculado.
export default function FlightPath() {
  const plane = useRef<HTMLImageElement>(null)
  const trail = useRef<HTMLSpanElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const pl = plane.current, tr = trail.current
    if (!pl || !tr) return
    let raf = 0, last = window.scrollY, tilt = 0
    const draw = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      const dy = window.scrollY - last; last = window.scrollY
      tilt += (Math.max(-14, Math.min(14, dy * 0.6)) - tilt) * 0.25
      const track = window.innerHeight - 140
      pl.style.transform = `translate3d(0,${(70 + p * track).toFixed(1)}px,0) rotate(${(128 + tilt).toFixed(1)}deg)`
      tr.style.transform = `scaleY(${p.toFixed(4)})`
      if (Math.abs(tilt) > 0.2) raf = requestAnimationFrame(draw)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw()
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [pathname])

  if (pathname.startsWith('/carrinho') || pathname.startsWith('/quiz')) return null
  return (
    <div className="fp" aria-hidden="true">
      <span className="fp-rail" />
      <span ref={trail} className="fp-trail" />
      <img ref={plane} className="fp-plane" src="/intro/aviao.webp" width="165" height="130" alt="" />
    </div>
  )
}

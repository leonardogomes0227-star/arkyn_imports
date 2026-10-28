import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Bottle from './Bottle'

const Hero3D = lazy(() => import('./Hero3D'))

function can3D() {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) <= 2) return false
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

/** Frasco 3D carregado sob demanda; no celular fraco ou com "reduzir movimento", mostra o frasco estático. */
export default function HeroBottle() {
  const ref = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)
  useEffect(() => {
    if (!can3D() || !ref.current) return
    const start = () => setLoad(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); 'requestIdleCallback' in window ? requestIdleCallback(start) : setTimeout(start, 300) } })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const poster = <div className="hero-poster"><Bottle id="arkyn-hero" brand="Arkyn Imports" big /></div>
  return (
    <div className="hero-3d" ref={ref}>
      {load ? <Suspense fallback={poster}><Hero3D /></Suspense> : poster}
    </div>
  )
}

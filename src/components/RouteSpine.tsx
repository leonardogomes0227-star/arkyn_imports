import { useEffect, useRef, useState, type ReactNode } from 'react'

// A rota verde da logo vira a "coluna" da página: uma linha que serpenteia entre as seções
// e se desenha conforme a rolagem, com o avião da marca voando na ponta.
const BASE_HEADING = -38 // direção do avião no arquivo (graus)

function buildPath(w: number, h: number) {
  const step = Math.max(520, Math.min(760, h / 9))
  const pad = w < 700 ? 10 : 28
  let d = `M ${pad} 0`
  let x = pad, y = 0, right = true
  while (y < h) {
    const ny = Math.min(h, y + step), nx = right ? w - pad : pad
    d += ` C ${x} ${y + step * 0.5}, ${nx} ${y + step * 0.5}, ${nx} ${ny}`
    x = nx; y = ny; right = !right
  }
  return d
}

export default function RouteSpine({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const plane = useRef<HTMLImageElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  useEffect(() => {
    const el = root.current, p = path.current, pl = plane.current
    if (!el || !p || !pl || !box.h) return
    const L = p.getTotalLength()
    p.style.strokeDasharray = `${L}`
    let raf = 0
    const draw = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const prog = reduced ? 0.04 : Math.min(1, Math.max(0, (window.innerHeight * 0.55 - r.top) / r.height))
      const len = prog * L
      p.style.strokeDashoffset = `${L - len}`
      const a = p.getPointAtLength(Math.max(0, len - 3)), b = p.getPointAtLength(Math.min(L, len + 3)), pt = p.getPointAtLength(len)
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
      pl.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%) rotate(${ang - BASE_HEADING}deg)`
      pl.style.opacity = prog > 0.003 && prog < 0.997 ? '1' : '0'
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(draw) }
    draw(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [box.w, box.h, reduced])

  return (
    <div ref={root} className="rs">
      {box.h > 0 && (
        <>
          <svg className="rs-svg" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
            <path d={buildPath(box.w, box.h)} className="rs-ghost" />
            <path ref={path} d={buildPath(box.w, box.h)} className="rs-line" />
          </svg>
          <img ref={plane} className="rs-plane" src="/intro/aviao.webp" width="165" height="130" alt="" aria-hidden="true" />
        </>
      )}
      <div className="rs-in">{children}</div>
    </div>
  )
}

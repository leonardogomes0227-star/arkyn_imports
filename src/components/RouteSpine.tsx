import { useEffect, useRef, useState, type ReactNode } from 'react'

// A rota verde da logo serpenteia pelo meio da página, entre as seções, e se desenha conforme a rolagem,
// com o avião voando na ponta. Leve: os pontos da rota são calculados uma vez (ao montar e ao mudar o tamanho);
// na rolagem só muda o traço (stroke-dashoffset) e a posição do avião (transform).
const BASE_HEADING = -38 // direção do avião no arquivo (graus)
const SAMPLES = 700

function buildPath(w: number, h: number) {
  const step = Math.max(560, Math.min(820, h / 7))
  const pad = w < 700 ? 18 : w * 0.12
  let d = `M ${w / 2} 0`
  let x = w / 2, y = 0, right = true
  while (y < h) {
    const ny = Math.min(h, y + step), nx = right ? w - pad : pad
    d += ` C ${x} ${y + step * 0.55}, ${nx} ${y + step * 0.45}, ${nx} ${ny}`
    x = nx; y = ny; right = !right
  }
  return d
}

export default function RouteSpine({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const plane = useRef<HTMLImageElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = root.current
    if (!el) return
    let t = 0
    const measure = () => { window.clearTimeout(t); t = window.setTimeout(() => setBox(b => (Math.abs(b.w - el.clientWidth) > 2 || Math.abs(b.h - el.clientHeight) > 40 ? { w: el.clientWidth, h: el.clientHeight } : b)), 150) }
    setBox({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(measure); ro.observe(el)
    return () => { ro.disconnect(); window.clearTimeout(t) }
  }, [])

  useEffect(() => {
    const el = root.current, p = path.current, pl = plane.current
    if (!el || !p || !pl || !box.h) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { pl.style.display = 'none'; return }
    // amostra a rota uma vez: posição e ângulo em cada ponto
    const L = p.getTotalLength()
    const xs = new Float32Array(SAMPLES + 1), ys = new Float32Array(SAMPLES + 1), an = new Float32Array(SAMPLES + 1)
    for (let i = 0; i <= SAMPLES; i++) {
      const a = p.getPointAtLength(Math.max(0, (i / SAMPLES) * L - 2)), b = p.getPointAtLength(Math.min(L, (i / SAMPLES) * L + 2))
      const m = p.getPointAtLength((i / SAMPLES) * L)
      xs[i] = m.x; ys[i] = m.y; an[i] = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - BASE_HEADING
    }
    p.style.strokeDasharray = `${L}`
    let raf = 0, top = el.getBoundingClientRect().top + window.scrollY
    const draw = () => {
      raf = 0
      const prog = Math.min(1, Math.max(0, (window.scrollY + window.innerHeight * 0.55 - top) / box.h))
      const i = Math.round(prog * SAMPLES)
      p.style.strokeDashoffset = `${L * (1 - prog)}`
      pl.style.transform = `translate3d(${xs[i]}px,${ys[i]}px,0) translate(-50%,-50%) rotate(${an[i]}deg)`
      pl.style.opacity = prog > 0.002 && prog < 0.998 ? '1' : '0'
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(draw) }
    const re = () => { top = el.getBoundingClientRect().top + window.scrollY; on() }
    draw()
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', re)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', re); cancelAnimationFrame(raf) }
  }, [box.w, box.h])

  const d = box.h ? buildPath(box.w, box.h) : ''
  return (
    <div ref={root} className="rs">
      {box.h > 0 && (
        <>
          <svg className="rs-svg" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
            <path d={d} className="rs-ghost" />
            <path ref={path} d={d} className="rs-line" />
          </svg>
          <img ref={plane} className="rs-plane" src="/intro/aviao.webp" width="165" height="130" alt="" aria-hidden="true" />
        </>
      )}
      <div className="rs-in">{children}</div>
    </div>
  )
}

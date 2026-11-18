import { useEffect, useRef, useState } from 'react'

const KEY = 'arkyn-intro-visto'
const FLY = 2000        // ms: o avião cruza a tela e pousa no lugar dele na logo
const HOLD = 3700       // ms: quando a cortina abre

// Espaço de desenho = a própria logo (800 x 471). O avião da logo fica em (667.5, 65).
const PATH = 'M -650 620 C -300 640, 100 430, 340 285 C 460 212, 550 154, 667.5 65'
const BASE_HEADING = -38 // direção do avião no recorte da logo (graus)

// Abre sempre que a pessoa entra no site pela página inicial (nova aba, link, recarregar).
// Só pula quando ela já viu nos últimos 2 minutos (ex.: voltou da página de pagamento).
function seen() {
  if (typeof window === 'undefined' || window.location.pathname !== '/') return true
  try { return Date.now() - Number(sessionStorage.getItem(KEY) || 0) < 120000 } catch { return false }
}
function markSeen() {
  try { sessionStorage.setItem(KEY, String(Date.now())) } catch { /* navegação privada: só não lembra */ }
}
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const inOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

/** Abertura: um avião cruza a tela deixando a trajetória verde, pousa no lugar do avião da logo
 *  e a logo aprovada se revela atrás dele. Uma vez por visita. Toque, clique ou tecla pulam. */
export default function Intro() {
  const [phase, setPhase] = useState<'on' | 'out' | 'done'>(() => (seen() ? 'done' : 'on'))
  const path = useRef<SVGPathElement>(null)
  const trailA = useRef<SVGPathElement>(null)
  const trailB = useRef<SVGPathElement>(null)
  const plane = useRef<SVGGElement>(null)
  const logo = useRef<HTMLImageElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase !== 'on') return
    markSeen()
    const reduced = false
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const skip = () => setPhase('out')
    window.addEventListener('keydown', skip)
    let raf = 0, timer = 0

    if (reduced) {
      if (logo.current) logo.current.style.clipPath = 'none'
      if (plane.current) plane.current.style.opacity = '0'
      timer = window.setTimeout(() => setPhase('out'), 1300)
    } else {
      const p = path.current!, L = p.getTotalLength()
      const t0 = performance.now()
      let landed = false
      const frame = (now: number) => {
        const t = now - t0
        const x = clamp(t / FLY)
        const e = 1 - Math.pow(1 - x, 2)                   // chega desacelerando
        const head = e * L
        const tail = Math.max(0, head - L * 0.5)
        const dash = `${Math.max(0.01, head - tail)} ${L * 2}`
        const fade = 1 - clamp((t - 1900) / 600)
        for (const r of [trailA.current, trailB.current]) {
          if (!r) continue
          r.setAttribute('stroke-dasharray', dash)
          r.setAttribute('stroke-dashoffset', String(-tail))
          r.style.opacity = String(fade)
        }
        // posição e direção do avião
        const a = p.getPointAtLength(Math.max(0, head - 2)), b = p.getPointAtLength(Math.min(L, head + 2))
        const pt = p.getPointAtLength(head)
        const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
        const rot = ang - BASE_HEADING + Math.sin(Math.PI * e) * 5 * (1 - e)
        const s = 0.42 + 0.58 * e
        if (plane.current) {
          plane.current.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${rot}) scale(${s})`)
          plane.current.style.opacity = t >= FLY ? '0' : '1'
        }
        // logo se revela da esquerda para a direita; o canto do avião só abre quando ele pousa
        const w = inOut(clamp((t - 900) / 1100)) * 100
        const topLimit = 72 + 28 * clamp((t - FLY) / 260)
        const tw = Math.min(w, topLimit)
        if (logo.current) {
          logo.current.style.clipPath = `polygon(0 0, ${tw}% 0, ${tw}% 28%, ${w}% 28%, ${w}% 100%, 0 100%)`
          if (w >= 99.9 && topLimit >= 99.9) logo.current.style.clipPath = 'none'
        }
        if (!landed && t >= FLY) { landed = true; stage.current?.classList.add('land') }
        if (t < HOLD) raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
      timer = window.setTimeout(() => setPhase('out'), HOLD)
    }
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); window.removeEventListener('keydown', skip); document.documentElement.style.overflow = prev }
  }, [phase])

  useEffect(() => {
    if (phase !== 'out') return
    document.documentElement.style.overflow = ''
    const t = window.setTimeout(() => setPhase('done'), 1100)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null
  return (
    <div className={phase === 'out' ? 'ax-intro out' : 'ax-intro'} role="presentation" onClick={() => setPhase('out')}>
      <span className="ax-intro-half top" aria-hidden="true" />
      <span className="ax-intro-half bottom" aria-hidden="true" />
      <div className="ax-intro-in" aria-hidden="true">
        <div className="ax-intro-stage" ref={stage}>
          <span className="ax-intro-glow" />
          <img ref={logo} className="ax-intro-logo" src="/intro/logo-arkyn.webp" width="1200" height="706" alt="" style={{ clipPath: 'polygon(0 0, 0 0, 0 28%, 0 28%, 0 100%, 0 100%)' }} />
          <svg viewBox="0 0 800 471" className="ax-intro-svg">
            <path ref={path} d={PATH} fill="none" stroke="none" />
            <path ref={trailA} d={PATH} fill="none" stroke="#C7F401" strokeWidth="7" strokeLinecap="round" strokeDasharray="0.01 9999" />
            <path ref={trailB} d={PATH} fill="none" stroke="#DEFF78" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.01 9999" transform="translate(14 10)" />
            <g ref={plane}><image href="/intro/aviao.webp" x="-82.5" y="-65" width="165" height="130" /></g>
          </svg>
        </div>
      </div>
      <button type="button" className="ax-intro-skip" onClick={e => { e.stopPropagation(); setPhase('out') }}>Pular</button>
    </div>
  )
}

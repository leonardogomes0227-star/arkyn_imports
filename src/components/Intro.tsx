import { useEffect, useRef, useState } from 'react'

const KEY = 'arkyn-intro-visto'
// Linha do tempo (ms)
const JET = 1300        // ato 1: o avião sai do fundo e passa pela câmera
const LAND0 = 1450      // ato 2: o avião faz a curva e pousa na logo
const FLY = 1350
const HOLD = 4500       // a cortina abre

// Espaço de desenho = a própria logo (800 x 471). O avião da logo fica em (667.5, 65).
const PATH = 'M -650 620 C -300 640, 100 430, 340 285 C 460 212, 550 154, 667.5 65'
const BASE_HEADING = -38 // direção do avião no recorte da logo (graus)
// Colunas das letras ARKYN na logo (em % da largura)
const LETTERS: [number, number][] = [[0, 27.8], [27.8, 41.8], [41.8, 60], [60, 80], [80, 100]]
const TAG = 'Perfumaria árabe & importada'

function seen() {
  if (typeof window === 'undefined' || window.location.pathname !== '/') return true
  try { return Date.now() - Number(sessionStorage.getItem(KEY) || 0) < 120000 } catch { return false }
}
function markSeen() {
  try { sessionStorage.setItem(KEY, String(Date.now())) } catch { /* navegação privada: só não lembra */ }
}
const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** Abertura em quatro atos: partículas em velocidade de dobra, o avião passa pela câmera, clarão,
 *  e a logo se monta — globo gira, o avião pousa deixando o rastro, as letras sobem e um brilho
 *  metálico cruza. Uma vez por visita. Toque, clique ou tecla pulam. */
export default function Intro() {
  const [phase, setPhase] = useState<'on' | 'out' | 'done'>(() => (seen() ? 'done' : 'on'))
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const jet = useRef<HTMLImageElement>(null)
  const path = useRef<SVGPathElement>(null)
  const trailA = useRef<SVGPathElement>(null)
  const trailB = useRef<SVGPathElement>(null)
  const plane = useRef<SVGGElement>(null)

  useEffect(() => {
    if (phase !== 'on') return
    markSeen()
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const skip = () => setPhase('out')
    window.addEventListener('keydown', skip)
    let raf = 0, timer = 0, gone = false

    // campo de partículas (estrelas/névoa) vindo na direção da tela
    const cv = canvas.current!, ctx = cv.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 1.25)
    let W = 0, H = 0
    const size = () => { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    size(); window.addEventListener('resize', size)
    const N = W < 700 ? 140 : 230
    const P = Array.from({ length: N }, () => ({ x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random(), lime: Math.random() < .28 }))

    const p = path.current!, L = p.getTotalLength()
    let t0 = 0, last = 0
    const frame = (now: number) => {
      if (!t0) { t0 = now; last = now }
      const t = now - t0, dt = Math.min(50, now - last) / 1000; last = now
      const el = root.current
      // velocidade: acelera até o clarão, depois flutua devagar
      const speed = t < JET ? 0.25 + 2.6 * Math.pow(t / JET, 2) : 0.06 + 2.85 * Math.exp(-(t - JET) / 260)
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2, cy = H / 2, f = Math.min(W, H) * 0.55
      const fadeAll = 1 - clamp((t - (HOLD - 300)) / 500)
      ctx.lineCap = 'round'
      for (const s of P) {
        const z0 = s.z
        s.z -= speed * dt
        if (s.z <= 0.02) { s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; s.z = 1; continue }
        const x1 = cx + s.x / z0 * f, y1 = cy + s.y / z0 * f
        const x2 = cx + s.x / s.z * f, y2 = cy + s.y / s.z * f
        const a = clamp((1 - s.z) * 1.4) * fadeAll * (t < JET ? 1 : 0.55)
        ctx.strokeStyle = s.lime ? `rgba(199,244,1,${a})` : `rgba(214,214,220,${a * .85})`
        ctx.lineWidth = (1 - s.z) * 2.2 + .3
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      }
      // ato 1: avião vem do fundo, cresce e passa por cima da câmera
      if (jet.current) {
        const u = clamp(t / JET), e = u * u * u
        const sc = 0.05 + e * 3
        jet.current.style.transform = `translate(-50%,-50%) translate(${e * 34}vw, ${-e * 26}vh) rotate(${-8 + u * 14}deg) scale(${sc})`
        jet.current.style.opacity = String(clamp(u * 6) * (1 - clamp((u - .7) / .25)))
      }
      if (t >= JET - 60 && el && !el.classList.contains('a2')) el.classList.add('a2')
      // ato 2: pouso na logo com o rastro verde
      const ft = t - LAND0
      if (ft >= 0) {
        const x = clamp(ft / FLY), e = 1 - Math.pow(1 - x, 2.4)
        const head = e * L, tail = Math.max(0, head - L * 0.5)
        const dash = `${Math.max(0.01, head - tail)} ${L * 2}`
        const fade = 1 - clamp((ft - FLY + 100) / 500)
        for (const r of [trailA.current, trailB.current]) {
          if (!r) continue
          r.setAttribute('stroke-dasharray', dash)
          r.setAttribute('stroke-dashoffset', String(-tail))
          r.style.opacity = String(fade)
        }
        const a = p.getPointAtLength(Math.max(0, head - 2)), b = p.getPointAtLength(Math.min(L, head + 2)), pt = p.getPointAtLength(head)
        const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
        if (plane.current) {
          plane.current.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang - BASE_HEADING + Math.sin(Math.PI * e) * 6 * (1 - e)}) scale(${0.45 + 0.55 * e})`)
          plane.current.style.opacity = ft >= FLY ? '0' : '1'
        }
        if (ft >= FLY && el && !el.classList.contains('a3')) el.classList.add('a3')
      }
      if (t < HOLD + 900) raf = requestAnimationFrame(frame)
    }
    // só começa quando as imagens e as fontes estão prontas (senão corre com a tela em branco)
    const load = (src: string) => { const im = new Image(); im.src = src; return (im.decode ? im.decode() : Promise.resolve()).catch(() => undefined) }
    const begin = () => {
      if (gone) return; gone = true
      root.current?.classList.add('go')
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(frame) })
      timer = window.setTimeout(() => setPhase('out'), HOLD)
    }
    const fallback = window.setTimeout(begin, 2500)
    Promise.all([load('/intro/logo-arkyn.webp'), load('/intro/aviao.webp'), document.fonts?.ready]).then(() => { window.clearTimeout(fallback); begin() })
    return () => {
      gone = true; window.clearTimeout(fallback); window.clearTimeout(timer)
      window.removeEventListener('keydown', skip); window.removeEventListener('resize', size)
      document.documentElement.style.overflow = prev
      // deixa as partículas terminarem de sumir enquanto a cortina abre
      window.setTimeout(() => cancelAnimationFrame(raf), 1000)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'out') return
    document.documentElement.style.overflow = ''
    const t = window.setTimeout(() => setPhase('done'), 1100)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null
  const logo = '/intro/logo-arkyn.webp'
  return (
    <div ref={root} className={phase === 'out' ? 'ax-intro out' : 'ax-intro'} role="presentation" onClick={() => setPhase('out')}>
      <span className="ax-intro-half top" aria-hidden="true" />
      <span className="ax-intro-half bottom" aria-hidden="true" />
      <canvas ref={canvas} className="ax-i-stars" aria-hidden="true" />
      <img ref={jet} className="ax-i-jet" src="/intro/aviao.webp" alt="" aria-hidden="true" />
      <span className="ax-i-flash" aria-hidden="true" />
      <div className="ax-intro-in" aria-hidden="true">
        <div className="ax-intro-stage">
          <span className="ax-intro-glow" />
          <div className="ax-i-globe"><img src={logo} alt="" /></div>
          <div className="ax-i-plane"><img src={logo} alt="" /></div>
          {LETTERS.map(([a, b], i) => (
            <div key={i} className="ax-i-letter" style={{ clipPath: `inset(56% ${100 - b}% 11% ${a}%)`, animationDelay: `${2050 + i * 90}ms` }}><img src={logo} alt="" /></div>
          ))}
          <div className="ax-i-imports"><img src={logo} alt="" /></div>
          <div className="ax-i-shine" style={{ WebkitMaskImage: `url(${logo})`, maskImage: `url(${logo})` }}><i /></div>
          <svg viewBox="0 0 800 471" className="ax-intro-svg">
            <path ref={path} d={PATH} fill="none" stroke="none" />
            <path ref={trailA} d={PATH} fill="none" stroke="#C7F401" strokeWidth="7" strokeLinecap="round" strokeDasharray="0.01 9999" />
            <path ref={trailB} d={PATH} fill="none" stroke="#DEFF78" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.01 9999" transform="translate(14 10)" />
            <g ref={plane} style={{ opacity: 0 }}><image href="/intro/aviao.webp" x="-82.5" y="-65" width="165" height="130" /></g>
          </svg>
        </div>
        <p className="ax-i-tag">{[...TAG].map((c, i) => <span key={i} style={{ animationDelay: `${2900 + i * 28}ms` }}>{c === ' ' ? ' ' : c}</span>)}</p>
        <p className="ax-i-route"><b>Coxim · MS</b><i /><b>todo o Brasil</b></p>
      </div>
      <button type="button" className="ax-intro-skip" onClick={e => { e.stopPropagation(); setPhase('out') }}>Pular</button>
    </div>
  )
}

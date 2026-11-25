import { useEffect, useRef, useState, type CSSProperties } from 'react'

const KEY = 'arkyn-intro-visto'
const WORD = 'ARKYN'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
// linha do tempo (ms)
const T_FLAP = 1150, T_LOGO = 2950, T_TEAR = 4700, T_END = 5600

// Toca toda vez que o site é aberto ou recarregado, em qualquer página. Só fica de fora o painel e o retorno do pagamento.
// Dentro do site (trocar de página) não repete, porque o componente continua montado.
function seen() {
  if (typeof window === 'undefined') return true
  return /^\/(admin|pedido|carrinho)(\/|$)/.test(window.location.pathname)
}
function markSeen() { try { sessionStorage.setItem(KEY, String(Date.now())) } catch { /* navegação privada */ } }

/** Painel de aeroporto: cada letra gira por outras até parar na certa. */
function Flap({ ch, stop }: { ch: string; stop: number }) {
  const [c, setC] = useState(' ')
  useEffect(() => {
    let raf = 0, last = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      if (now - t0 >= stop) { setC(ch); return }
      if (now - last > 55) { last = now; setC(CHARS[Math.floor(Math.random() * CHARS.length)]) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ch, stop])
  return <span className={c === ch ? 'in-flap ok' : 'in-flap'}><b key={c}>{c}</b></span>
}

/** Abertura: o avião da marca desenha a rota, um painel de letras forma ARKYN,
 *  a logo com brilho metálico e a tela se destacando pelo picote, como um bilhete. */
export default function Intro() {
  const [phase, setPhase] = useState<'on' | 'tear' | 'done'>(() => (seen() ? 'done' : 'on'))
  const [stage, setStage] = useState(0) // 1 painel · 2 logo
  const [vw, setVw] = useState({ w: 390, h: 844 })
  const timers = useRef<number[]>([])
  const armed = useRef(false) // toque ou tecla só pulam depois de 1,6 s (evita pular sem querer)

  useEffect(() => {
    if (phase !== 'on') return
    markSeen()
    setVw({ w: window.innerWidth, h: window.innerHeight })
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const at = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))
    let started = false
    const start = () => {
      if (started) return; started = true
      at(T_FLAP, () => setStage(1))
      at(T_LOGO, () => setStage(2))
      at(T_TEAR, () => setPhase('tear'))
    }
    const img = new Image(); img.src = '/intro/logo-arkyn.webp'
    const fb = window.setTimeout(start, 1200)
    Promise.all([img.decode?.().catch(() => undefined), document.fonts?.ready]).then(() => { window.clearTimeout(fb); start() })
    const skip = () => { if (armed.current) setPhase('tear') }
    const arm = window.setTimeout(() => { armed.current = true }, 1600)
    // vigia: aconteça o que acontecer, em 9 s a intro fecha e libera o site
    const guard = window.setTimeout(() => setPhase(p => (p === 'on' ? 'tear' : p)), 9000)
    const guard2 = window.setTimeout(() => { document.documentElement.style.overflow = ''; setPhase('done') }, 11500)
    window.addEventListener('keydown', skip)
    return () => { timers.current.forEach(window.clearTimeout); timers.current = []; window.clearTimeout(fb); window.clearTimeout(arm); window.clearTimeout(guard); window.clearTimeout(guard2); window.removeEventListener('keydown', skip); document.documentElement.style.overflow = prev }
  }, [phase])

  // voltar de outra aba/app com a página guardada: recarrega para a intro tocar de novo
  useEffect(() => {
    const back = (e: PageTransitionEvent) => { if (e.persisted && !seen()) window.location.reload() }
    window.addEventListener('pageshow', back)
    return () => window.removeEventListener('pageshow', back)
  }, [])

  useEffect(() => {
    if (phase !== 'tear') return
    document.documentElement.style.overflow = ''
    const t = window.setTimeout(() => setPhase('done'), T_END - T_TEAR)
    return () => window.clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null
  const { w, h } = vw
  const mob = w < 700
  // rota em arco no terço de cima, de Dubai (esquerda) ao Brasil (direita)
  const ax = w * (mob ? 0.1 : 0.18), bx = w * (mob ? 0.9 : 0.82), y = h * (mob ? 0.3 : 0.28), lift = h * (mob ? 0.12 : 0.16)
  const route = `M ${ax} ${y} C ${ax + (bx - ax) * 0.3} ${y - lift}, ${ax + (bx - ax) * 0.7} ${y - lift}, ${bx} ${y}`
  const pw = mob ? 44 : 62

  return (
    <div className={phase === 'tear' ? 'in-intro tear' : 'in-intro'} role="presentation" onClick={() => { if (armed.current) setPhase('tear') }}>
      <div className="in-half top" aria-hidden="true" />
      <div className="in-half bot" aria-hidden="true" />
      <div className="in-perf" aria-hidden="true" />
      <div className="in-stage" aria-hidden="true">
        <svg className="in-route" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
          <path id="in-path" d={route} pathLength={1} />
          <circle className="in-dot a" cx={ax} cy={y} r="4" />
          <circle className="in-dot b" cx={bx} cy={y} r="4" />
          <image href="/intro/aviao.webp" width={pw} height={pw * 0.79} x={-pw / 2} y={-pw * 0.4}>
            <animateMotion dur="1.35s" begin="0.25s" fill="freeze" rotate="auto" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines=".5 0 .2 1"><mpath href="#in-path" /></animateMotion>
          </image>
        </svg>
        <div className={`in-center s${stage}`}>
          <div className="in-board">{stage >= 1 && [...WORD].map((ch, i) => <Flap key={i} ch={ch} stop={420 + i * 130} />)}</div>
          <div className="in-logo"><img src="/intro/logo-arkyn.webp" alt="" width="1200" height="706" /><i className="in-shine" style={{ WebkitMaskImage: 'url(/intro/logo-arkyn.webp)', maskImage: 'url(/intro/logo-arkyn.webp)' } as CSSProperties} /></div>
          <p className="in-tag">Perfumaria árabe &amp; importada</p>
          <p className="in-sub"><span>Produtos originais</span><i /><span>Para todo o Brasil</span></p>
        </div>
      </div>
      <button type="button" className="in-skip" onClick={e => { e.stopPropagation(); setPhase('tear') }}>Pular</button>
    </div>
  )
}

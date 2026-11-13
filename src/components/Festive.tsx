import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/* ---------- barra de progresso da rolagem (topo da tela) ---------- */
export function ScrollBar() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - window.innerHeight
      bar.current?.style.setProperty('--p', h > 0 ? String(Math.min(1, window.scrollY / h)) : '0')
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    tick(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return <div className="nt-progress" ref={bar} aria-hidden="true" />
}

/* ---------- contagem regressiva até o Natal ---------- */
function target(now: Date) {
  const y = now.getFullYear()
  const t = new Date(y, 11, 25, 0, 0, 0)
  const end = new Date(y, 11, 26, 0, 0, 0)
  if (now >= end) return { t: new Date(y + 1, 11, 25, 0, 0, 0), merry: false }
  return { t, merry: now >= t }
}
function useCountdown() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id) }, [])
  const { t, merry } = target(now)
  const ms = Math.max(0, t.getTime() - now.getTime())
  const s = Math.floor(ms / 1000)
  return { merry, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}
function Tile({ n, label, pad = 2 }: { n: number; label: string; pad?: number }) {
  return (
    <div className="nt-tile">
      <b key={n}>{String(n).padStart(pad, '0')}</b>
      <small>{label}</small>
    </div>
  )
}
export function ChristmasBand({ whatsapp }: { whatsapp: string }) {
  const { merry, d, h, m, s } = useCountdown()
  return (
    <section className="nt-band" aria-label="Contagem regressiva para o Natal">
      <div className="nt-band-in">
        <div className="nt-band-txt">
          <p className="nt-kicker">Natal Arkyn</p>
          <h2>{merry ? 'Feliz Natal!' : <>Faltam <em>{d} {d === 1 ? 'dia' : 'dias'}</em> para o Natal</>}</h2>
          <span>{merry ? 'Obrigado por escolher a Arkyn. Boas festas!' : 'Escolha o presente com calma. Retirada em Coxim sem custo de frete.'}</span>
        </div>
        {!merry && (
          <div className="nt-tiles" role="timer" aria-live="off">
            <Tile n={d} label="dias" pad={2} /><i>:</i><Tile n={h} label="horas" /><i>:</i><Tile n={m} label="min" /><i>:</i><Tile n={s} label="seg" />
          </div>
        )}
        <div className="nt-band-cta">
          <Link to="/catalogo" className="nt-btn">Escolher presentes</Link>
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero ajuda para escolher um perfume de presente de Natal.')}`} target="_blank" rel="noreferrer" className="nt-btn nt-btn--ghost">Ajuda no WhatsApp</a>
        </div>
      </div>
    </section>
  )
}

/* ---------- faixa de marcas em movimento ---------- */
export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null
  const row = (hidden: boolean) => (
    <ul className="nt-mq-row" aria-hidden={hidden || undefined}>
      {items.map(b => <li key={b}><Link to={`/catalogo?brand=${encodeURIComponent(b)}`} tabIndex={hidden ? -1 : 0}>{b}</Link><i aria-hidden="true">❄</i></li>)}
    </ul>
  )
  return (
    <section className="nt-mq" aria-label="Marcas da loja">
      <div className="nt-mq-track">{row(false)}{row(true)}{row(true)}</div>
    </section>
  )
}

/* ---------- brilhos, bolas de Natal e avião no banner ---------- */
const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: `${(i * 37 + 11) % 100}%`, y: `${(i * 53 + 7) % 100}%`, s: `${6 + (i * 5) % 12}px`,
  d: `${(i * 0.37) % 4}s`, t: `${2.6 + (i * 0.23) % 2.4}s`,
}))
export function Sparkles() {
  return (
    <div className="nt-sparks" aria-hidden="true">
      {STARS.map((p, i) => <i key={i} style={{ '--x': p.x, '--y': p.y, '--s': p.s, '--d': p.d, '--t': p.t } as CSSProperties} />)}
    </div>
  )
}
const BALLS: { x: string; len: number; size: number; c: string; d: string; t: string }[] = [
  { x: '41%', len: 52, size: 38, c: 'red', d: '0s', t: '4.6s' },
  { x: '54%', len: 98, size: 46, c: 'gold', d: '.6s', t: '5.4s' },
  { x: '66%', len: 40, size: 32, c: 'green', d: '1.1s', t: '4.1s' },
  { x: '91%', len: 76, size: 42, c: 'red', d: '.3s', t: '5s' },
]
export function Baubles() {
  return (
    <div className="nt-baubles" aria-hidden="true">
      {BALLS.map((b, i) => (
        <span key={i} className={`nt-ball nt-ball--${b.c}`} style={{ '--x': b.x, '--len': `${b.len}px`, '--sz': `${b.size}px`, '--d': b.d, '--t': b.t } as CSSProperties}><em /></span>
      ))}
    </div>
  )
}
export function PlaneTrail() {
  const path = 'M -60 610 C 260 470, 520 640, 800 380 S 1240 120, 1520 70'
  return (
    <svg className="nt-plane" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d={path} className="nt-plane-line" fill="none" />
      <g>
        <path d="M18 0 L4 -3 L-2 -14 L-6 -14 L-3 -3 L-12 -3 L-15 -8 L-18 -8 L-15 0 L-18 8 L-15 8 L-12 3 L-3 3 L-6 14 L-2 14 L4 3 Z" transform="scale(1.7)" fill="#f3dc9f" />
        <animateMotion dur="11s" repeatCount="indefinite" rotate="auto" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
      </g>
    </svg>
  )
}

/* ---------- jornada do pedido (linha dourada que se desenha ao rolar) ---------- */
export function Journey({ steps }: { steps: [ReactNode, string, string][] }) {
  const ref = useRef<HTMLElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return (
    <section ref={ref} className={on ? 'nt-jn in' : 'nt-jn'} aria-label="Como comprar na Arkyn">
      <header className="nt-jn-head">
        <p className="nt-kicker">Do pedido ao presente</p>
        <h2>Sem complicação, do começo ao embrulho.</h2>
      </header>
      <div className="nt-jn-body">
        <svg className="nt-jn-line" viewBox="0 0 1000 26" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 13 C 125 0, 125 26, 250 13 S 375 0, 500 13 S 625 26, 750 13 S 875 0, 1000 13" pathLength={1} />
        </svg>
        <ol>
          {steps.map(([ic, t, d], i) => (
            <li key={t} style={{ '--i': i } as CSSProperties}>
              <span className="nt-jn-node">{ic}<b>{i + 1}</b></span>
              <h3>{t}</h3><p>{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- link com inclinação 3D que segue o mouse ---------- */
export function TiltLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--rx', String(((e.clientX - r.left) / r.width - 0.5) * 2))
    el.style.setProperty('--ry', String(((e.clientY - r.top) / r.height - 0.5) * 2))
  }
  const leave = () => { ref.current?.style.setProperty('--rx', '0'); ref.current?.style.setProperty('--ry', '0') }
  return <Link ref={ref} to={to} className={className} onPointerMove={move} onPointerLeave={leave}>{children}</Link>
}

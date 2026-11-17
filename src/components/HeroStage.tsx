import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'

// Palco de campanha: um perfume por vez, frasco grande, palavra gigante em contorno atrás
// e a rota verde da marca cruzando até um avião. Dados (nome, preço, notas) vêm do catálogo.
const SLIDES: { id: string; word: string }[] = [
  { id: 'maison-alhambra-victorioso-nero-100ml', word: 'NERO' },
  { id: 'lattafa-fakhar-extrait-gold-100ml', word: 'FAKHAR' },
  { id: 'maison-alhambra-pink-eclipse-100ml', word: 'ECLIPSE' },
  { id: 'french-avenue-vulcan-feu-100ml', word: 'VULCAN' },
]
const MS = 7000
const split = (name: string) => {
  const t = name.replace(/ \d+\s?ml$/i, '').trim()
  const i = t.indexOf(' ')
  return i < 0 ? [t, ''] : [t.slice(0, i), t.slice(i + 1)]
}

export default function HeroStage() {
  const { products, settings } = useStore()
  const slides = SLIDES.map(s => ({ ...s, p: products.find(p => p.id === s.id && p.stock > 0) })).filter(s => s.p)
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [off, setOff] = useState(false)
  const root = useRef<HTMLElement>(null)
  const drag = useRef<number | null>(null)
  const n = slides.length

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(q.matches); on(); q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting), { threshold: 0.2 })
    io.observe(el); return () => io.disconnect()
  }, [])
  const stop = hover || paused || off || reduced
  useEffect(() => {
    if (stop || n < 2) return
    const t = window.setTimeout(() => setI(k => (k + 1) % n), MS)
    return () => window.clearTimeout(t)
  }, [i, stop, n])
  if (!n) return null
  const go = (k: number) => setI(((k % n) + n) % n)
  const ship = settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}` : 'Entrega para a sua cidade'

  return (
    <section ref={root} className="hx" aria-roledescription="carrossel" aria-label="Perfumes em destaque" tabIndex={0}
      onKeyDown={e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true) }} onPointerLeave={() => setHover(false)}
      onPointerDown={e => { drag.current = e.clientX }} onPointerCancel={() => { drag.current = null }}
      onPointerUp={e => { if (drag.current === null) return; const dx = e.clientX - drag.current; drag.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1) }}>
      <svg className="hx-route" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path className="hx-r1" d="M-20 850 C 420 880, 900 760, 1120 380 S 1380 200, 1500 230" />
        <path className="hx-r2" d="M-20 866 C 420 896, 900 776, 1120 396 S 1380 216, 1500 246" />
      </svg>
      <img className="hx-plane" src="/intro/aviao.webp" width="165" height="130" alt="" aria-hidden="true" />

      {slides.map((s, k) => {
        const p = s.p!, on = k === i
        const [a, b] = split(p.name)
        const src = `/hero/${p.id}.webp`
        return (
          <div key={p.id} className={on ? 'hx-slide on' : 'hx-slide'} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${n}`} aria-hidden={!on}>
            <span className="hx-word" aria-hidden="true">{s.word}</span>
            <div className="hx-stage">
              <img className="hx-bottle" src={src} width="1100" height="1100" alt={`${p.brand} ${p.name}`} decoding="async" {...(k === 0 ? { fetchpriority: 'high' } : { loading: 'lazy' as const })} />
              <span className="hx-floor" aria-hidden="true" />
            </div>
            <div className="hx-copy">
              <span className="hx-eyebrow">{p.brand} · Eau de Parfum</span>
              <h2 className="hx-title"><span>{a}</span>{b && <i>{b}</i>}</h2>
              {p.description && <p className="hx-desc">{p.description}</p>}
              <div className="hx-buy">
                <Link to={`/produto/${p.id}`} className="hx-btn" tabIndex={on ? 0 : -1}>Comprar agora<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
                <div className="hx-price"><small>{settings.installments > 1 ? `ou ${settings.installments}x de ${brl(p.price / settings.installments)}` : 'à vista'}</small>{brl(p.price)}</div>
              </div>
            </div>
            {!!p.notes?.length && (
              <dl className="hx-notes">
                <dt>Notas</dt>
                <dd>{p.notes.slice(0, 6).join(' · ')}</dd>
              </dl>
            )}
          </div>
        )
      })}

      {n > 1 && (
        <div className="hx-ctrl">
          <div className="hx-dots" role="tablist" aria-label="Escolher perfume">
            {slides.map((s, k) => (
              <button key={s.id} type="button" role="tab" aria-selected={k === i} aria-label={s.p!.name} className={k === i ? 'hx-dot on' : 'hx-dot'} onClick={() => go(k)}>
                <span key={k === i ? `on-${i}` : 'off'} style={{ animationDuration: `${MS}ms`, animationPlayState: stop ? 'paused' : 'running' }} />
              </button>
            ))}
          </div>
          <button type="button" className="hx-pause" aria-pressed={paused} aria-label={paused ? 'Retomar troca automática' : 'Pausar troca automática'} onClick={() => setPaused(v => !v)}>{paused ? 'Retomar' : 'Pausar'}</button>
        </div>
      )}

      <div className="hx-strip">
        <span><b>Pix</b> ou cartão{settings.installments > 1 ? ` em até ${settings.installments}x` : ''}</span>
        <span><b>Retirada</b> grátis em Coxim – MS</span>
        <span><b>Entrega</b> {ship}</span>
        <span><b>Atendimento</b> direto no WhatsApp</span>
      </div>
    </section>
  )
}

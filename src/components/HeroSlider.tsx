import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'
import { noteGradient } from '../lib/noteColors'

// Cada perfume ganha a própria "fotografia de estúdio": fundo, luz e contraste combinando com o frasco.
// O recorte do frasco (sem fundo) fica em public/hero/<id>.webp; sem recorte, usa a foto do produto.
type Theme = { from: string; to: string; spot: string; ink: string; mute: string; accent: string; rule: string; btnBg: string; btnFg: string; floor: string }
const SLIDES: [string, Theme][] = [
  ['french-avenue-vulcan-feu-100ml', { from: '#052b35', to: '#0e5866', spot: 'rgba(96,204,210,.55)', ink: '#f5efe3', mute: 'rgba(245,239,227,.68)', accent: '#e2c78c', rule: 'rgba(245,239,227,.22)', btnBg: '#f5efe3', btnFg: '#052b35', floor: 'rgba(0,18,24,.34)' }],
  ['lattafa-afeef-100ml', { from: '#f3e9d7', to: '#dec9a2', spot: 'rgba(255,255,255,.9)', ink: '#2a2015', mute: 'rgba(42,32,21,.64)', accent: '#94742f', rule: 'rgba(42,32,21,.2)', btnBg: '#2a2015', btnFg: '#f3e9d7', floor: 'rgba(90,64,20,.16)' }],
  ['armaf-club-de-nuit-maleka-105ml', { from: '#211630', to: '#46305f', spot: 'rgba(192,152,232,.46)', ink: '#f4edf9', mute: 'rgba(244,237,249,.68)', accent: '#dcc4f2', rule: 'rgba(244,237,249,.22)', btnBg: '#f4edf9', btnFg: '#211630', floor: 'rgba(14,6,24,.4)' }],
  ['lattafa-asad-elixir-100ml', { from: '#0e0f12', to: '#2b2e36', spot: 'rgba(160,168,186,.42)', ink: '#f2f2f3', mute: 'rgba(242,242,243,.64)', accent: '#c6cad2', rule: 'rgba(242,242,243,.2)', btnBg: '#f2f2f3', btnFg: '#0e0f12', floor: 'rgba(0,0,0,.42)' }],
  ['maison-alhambra-pink-eclipse-100ml', { from: '#f8e5e1', to: '#ecc5c0', spot: 'rgba(255,255,255,.88)', ink: '#2b1819', mute: 'rgba(43,24,25,.62)', accent: '#a34f59', rule: 'rgba(43,24,25,.18)', btnBg: '#2b1819', btnFg: '#f8e5e1', floor: 'rgba(120,50,56,.14)' }],
  ['maison-alhambra-victorioso-nero-100ml', { from: '#090909', to: '#1e1a11', spot: 'rgba(188,153,82,.4)', ink: '#f3ebd9', mute: 'rgba(243,235,217,.66)', accent: '#cba85c', rule: 'rgba(243,235,217,.2)', btnBg: '#f3ebd9', btnFg: '#090909', floor: 'rgba(0,0,0,.45)' }],
]
const AUTOPLAY_MS = 6500
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function HeroSlider() {
  const { products, settings, add } = useStore()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [added, setAdded] = useState('')
  const [reduced, setReduced] = useState(false)
  const root = useRef<HTMLElement>(null)
  const drag = useRef<number | null>(null)
  const frame = useRef(0)
  const n = settings.installments

  const items = SLIDES.map(([id, theme]) => ({ p: products.find(x => x.id === id), theme })).filter(s => s.p && s.p.image)
  const total = items.length

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(q.matches)
    on(); q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])

  const go = (k: number) => total && setI(((k % total) + total) % total)

  // Profundidade: o frasco e a luz se movem um pouco com o mouse (só em telas com mouse)
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !root.current) return
    const r = root.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => { root.current?.style.setProperty('--px', x.toFixed(3)); root.current?.style.setProperty('--py', y.toFixed(3)) })
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }
  const onDown = (e: PointerEvent) => { drag.current = e.clientX }
  const onUp = (e: PointerEvent) => {
    if (drag.current === null) return
    const dx = e.clientX - drag.current; drag.current = null
    if (Math.abs(dx) > 48) go(dx < 0 ? i + 1 : i - 1)
  }
  const buy = (id: string) => { add(id); setAdded(id); window.setTimeout(() => setAdded(a => (a === id ? '' : a)), 1800) }

  if (!total) return null
  return (
    <section ref={root} className="lx" aria-roledescription="carrossel" aria-label="Perfumes em destaque" tabIndex={0}
      onKeyDown={onKey} onPointerMove={onMove} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { drag.current = null }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setPaused(true) }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') { setPaused(false); root.current?.style.setProperty('--px', '0'); root.current?.style.setProperty('--py', '0') } }}
      onFocus={e => { if (e.target.matches(':focus-visible')) setPaused(true) }} onBlur={() => setPaused(false)}>
      <div className="lx-view">
        {items.map(({ p, theme }, k) => {
          if (!p) return null
          const on = k === i
          const img = `/hero/${p.id}.webp`
          const vars = { '--from': theme.from, '--to': theme.to, '--spot': theme.spot, '--ink': theme.ink, '--mute': theme.mute, '--accent': theme.accent, '--rule': theme.rule, '--btn-bg': theme.btnBg, '--btn-fg': theme.btnFg, '--floor': theme.floor } as CSSProperties
          const profile = (p.tags ?? []).filter(t => ['doce', 'amadeirado', 'fresco', 'floral', 'especiado'].includes(t)).slice(0, 2).map(cap).join(' · ')
          const tab = on ? 0 : -1
          return (
            <article key={p.id} className={on ? 'lx-slide on' : 'lx-slide'} style={vars} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${total}: ${p.brand} ${p.name}`} aria-hidden={!on}>
              <div className="lx-stage" aria-hidden="true">
                <span className="lx-wall" />
                <span className="lx-floor" />
                <div className="lx-prod">
                  <span className="lx-pshadow" />
                  <div className="lx-enter">
                    <div className="lx-pimg">
                      <img src={img} alt="" className="lx-refl" loading="lazy" decoding="async" />
                      <img src={img} alt="" className="lx-photo" loading={k === 0 ? 'eager' : 'lazy'} decoding="async" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lx-info">
                <span className="lx-brand lx-a" style={{ '--d': '.15s' } as CSSProperties}>{p.brand}</span>
                <h2 className="lx-name lx-a" style={{ '--d': '.25s' } as CSSProperties}>{p.name.replace(/ \d+ml$/i, '')}</h2>
                {profile && <p className="lx-profile lx-a" style={{ '--d': '.38s' } as CSSProperties}>{profile}</p>}
                {!!p.notes?.length && (
                  <div className="lx-notes lx-a" style={{ '--d': '.5s' } as CSSProperties}>
                    <span className="lx-notes-h">Notas</span>
                    <ol>
                      {p.notes.slice(0, 4).map((nt, j) => (
                        <li key={nt} style={{ '--j': j } as CSSProperties}><em>{String(j + 1).padStart(2, '0')}</em><i style={{ background: noteGradient(nt) }} />{nt}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="lx-buy lx-a" style={{ '--d': '.78s' } as CSSProperties}>
                  <p className="lx-price">{brl(p.price)}{n > 1 && <small>ou {n}x de {brl(p.price / n)}</small>}</p>
                  <div className="lx-actions">
                    <Link to={`/produto/${p.id}`} className="lx-btn" tabIndex={tab}><span>Comprar agora</span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
                    <button type="button" className={added === p.id ? 'lx-add done' : 'lx-add'} tabIndex={tab} onClick={() => buy(p.id)}>{added === p.id ? 'Adicionado à sacola ✓' : 'Adicionar à sacola'}</button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="lx-ctrl" style={{ '--ink': items[i].theme.ink, '--rule': items[i].theme.rule } as CSSProperties}>
        <span className="lx-count" aria-hidden="true"><b>{String(i + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}</span>
        <div className="lx-bars" role="tablist" aria-label="Escolher perfume">
          {items.map(({ p }, k) => p && (
            <button key={p.id} type="button" role="tab" aria-selected={k === i} aria-label={`${p.brand} ${p.name}`} className={k === i ? 'lx-bar on' : k < i ? 'lx-bar seen' : 'lx-bar'} onClick={() => go(k)}>
              <span style={{ animationPlayState: paused ? 'paused' : 'running' }} onAnimationEnd={() => { if (k === i && !reduced) go(i + 1) }} />
            </button>
          ))}
        </div>
        <div className="lx-arrows">
          <button type="button" aria-label="Perfume anterior" onClick={() => go(i - 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button type="button" aria-label="Próximo perfume" onClick={() => go(i + 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </div>
      </div>
      <style>{`.lx-bar.on span{animation-duration:${AUTOPLAY_MS}ms}`}</style>
    </section>
  )
}

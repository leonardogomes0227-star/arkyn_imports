import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'

// Banner principal no padrão das grandes perfumarias: imagem de campanha de ponta a ponta
// (versão para computador e para celular), nome do perfume em destaque, preço real do catálogo e botão de compra.
type Banner = {
  id: string; tone: 'dark' | 'light'
  eyebrow: string; title: string; product?: string; note?: string; cta: [string, string]
}
const BANNERS: Banner[] = [
  { id: 'natal', tone: 'dark', eyebrow: 'Coleção de Natal Arkyn', title: 'O Natal mais perfumado', product: 'lattafa-fakhar-extrait-gold-100ml', cta: ['Ver presentes', '/catalogo'] },
  { id: 'ele', tone: 'dark', eyebrow: 'Presente para ele', title: 'Victorioso Nero', product: 'maison-alhambra-victorioso-nero-100ml', cta: ['Comprar agora', '/produto/maison-alhambra-victorioso-nero-100ml'] },
  { id: 'ela', tone: 'dark', eyebrow: 'Presente para ela', title: 'Club de Nuit Maleka', product: 'armaf-club-de-nuit-maleka-105ml', cta: ['Comprar agora', '/produto/armaf-club-de-nuit-maleka-105ml'] },
  { id: 'splash', tone: 'light', eyebrow: 'Body Splash Lattafa', title: 'Perfume o dia todo', product: 'lattafa-body-splash-mayar', note: 'Mayar, Noble Blush e Yara Tous', cta: ['Ver body splash', '/catalogo?cat=splash'] },
]
const MS = 6500

export default function BannerHero() {
  const { products } = useStore()
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const drag = useRef<number | null>(null)
  const n = BANNERS.length
  const go = (k: number) => setI(((k % n) + n) % n)

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(q.matches); on(); q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0.2 })
    io.observe(el); return () => io.disconnect()
  }, [])
  const stop = hover || paused || offscreen || reduced

  const line = (b: Banner) => {
    const p = b.product ? products.find(x => x.id === b.product) : undefined
    if (!p) return b.note ?? ''
    if (b.id === 'splash') return `${b.note} · ${brl(p.price)} cada`
    if (b.id === 'natal') return `Destaque: ${p.name.replace(/ \d+ml$/i, '')} · ${brl(p.price)}`
    return `${p.brand} · ${brl(p.price)}`
  }

  return (
    <section ref={root} className={`bn bn-on--${BANNERS[i].tone}`} aria-roledescription="carrossel" aria-label="Campanhas da loja" tabIndex={0}
      onKeyDown={e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true) }} onPointerLeave={() => setHover(false)}
      onPointerDown={e => { drag.current = e.clientX }} onPointerCancel={() => { drag.current = null }}
      onPointerUp={e => { if (drag.current === null) return; const dx = e.clientX - drag.current; drag.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1) }}>
      {BANNERS.map((b, k) => {
        const on = k === i
        const load = k === 0 || k === i || k === (i + 1) % n
        const info = line(b)
        return (
          <div key={b.id} className={`bn-slide bn--${b.tone}${on ? ' on' : ''}`} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${n}`} aria-hidden={!on}>
            <picture className="bn-pic" aria-hidden="true">
              {load && <source media="(max-width: 860px)" srcSet={`/banners/${b.id}-mobile-720.webp 720w, /banners/${b.id}-mobile.webp 1080w`} sizes="100vw" />}
              {load && <source srcSet={`/banners/${b.id}-desktop-1440.webp 1440w, /banners/${b.id}-desktop.webp 2400w`} sizes="100vw" />}
              <img src={load ? `/banners/${b.id}-desktop-1440.webp` : undefined} alt="" width="2400" height="900" decoding="async"
                loading={k === 0 ? 'eager' : 'lazy'} {...(k === 0 ? { fetchpriority: 'high' } : {})} />
            </picture>
            <div className="bn-txt">
              <p className="bn-eyebrow">{b.eyebrow}</p>
              <h2 className="bn-title">{b.title}</h2>
              {info && <p className="bn-info">{info}</p>}
              <Link to={b.cta[1]} className="bn-btn" tabIndex={on ? 0 : -1}>{b.cta[0]}<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
            </div>
          </div>
        )
      })}

      <div className="bn-ctrl">
        <button type="button" className="bn-arrow" aria-label="Campanha anterior" onClick={() => go(i - 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <div className="bn-dots" role="tablist" aria-label="Escolher campanha">
          {BANNERS.map((b, k) => (
            <button key={b.id} type="button" role="tab" aria-selected={k === i} aria-label={b.eyebrow} className={k === i ? 'bn-dot on' : 'bn-dot'} onClick={() => go(k)}>
              <span key={k === i ? `on-${i}` : 'off'} style={{ animationDuration: `${MS}ms`, animationPlayState: stop ? 'paused' : 'running' }} onAnimationEnd={() => { if (k === i) go(i + 1) }} />
            </button>
          ))}
        </div>
        <button type="button" className="bn-arrow" aria-label="Próxima campanha" onClick={() => go(i + 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <button type="button" className="bn-pause" aria-pressed={paused} aria-label={paused ? 'Retomar troca automática' : 'Pausar troca automática'} onClick={() => setPaused(v => !v)}>
          {paused ? <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>}
        </button>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'
import { sized } from '../lib/img'

// Banner principal no estilo das grandes perfumarias: faixa inteira, composição de três frascos,
// cor própria por campanha e preço real tirado do catálogo.
type Banner = {
  id: string; tone: 'wine' | 'emerald' | 'plum' | 'champagne'
  eyebrow: string; title: [string, string]; sub: string; cta: [string, string]
  items: [string, string, string] // esquerda, centro (maior), direita
}
const BANNERS: Banner[] = [
  { id: 'natal', tone: 'wine', eyebrow: 'Natal Arkyn', title: ['Presentes que', 'ficam na memória.'],
    sub: 'Perfumes árabes originais para presentear quem você ama.', cta: ['Ver presentes', '/catalogo'],
    items: ['maison-alhambra-pink-eclipse-100ml', 'lattafa-fakhar-extrait-gold-100ml', 'lattafa-asad-elixir-100ml'] },
  { id: 'ele', tone: 'emerald', eyebrow: 'Presente para ele', title: ['Marcante,', 'do jantar à ceia.'],
    sub: 'Amadeirados e especiados que deixam presença por onde passam.', cta: ['Ver masculinos', '/catalogo?cat=masculino'],
    items: ['maison-alhambra-salvo-elixir-60ml', 'maison-alhambra-victorioso-nero-100ml', 'french-avenue-vulcan-feu-100ml'] },
  { id: 'ela', tone: 'plum', eyebrow: 'Presente para ela', title: ['Doce, floral', 'e inesquecível.'],
    sub: 'Fragrâncias femininas para encantar na noite de Natal.', cta: ['Ver femininos', '/catalogo?cat=feminino'],
    items: ['lattafa-yara-rose-100ml', 'armaf-club-de-nuit-maleka-105ml', 'lattafa-afeef-100ml'] },
  { id: 'splash', tone: 'champagne', eyebrow: 'Body Splash Lattafa', title: ['Perfume no corpo', 'o dia inteiro.'],
    sub: 'Leves, cremosos e perfeitos para dar junto com o perfume.', cta: ['Ver body splash', '/catalogo?cat=splash'],
    items: ['lattafa-body-splash-noble-blush', 'lattafa-body-splash-mayar', 'lattafa-body-splash-yara-tous'] },
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

  const priceLine = (b: Banner) => {
    const list = b.items.map(id => products.find(p => p.id === id)).filter(Boolean) as { price: number }[]
    if (!list.length) return ''
    const min = Math.min(...list.map(p => p.price)), max = Math.max(...list.map(p => p.price))
    return min === max ? `${brl(min)} cada` : `A partir de ${brl(min)}`
  }

  return (
    <section ref={root} className={`bn bn-on--${BANNERS[i].tone}`} aria-roledescription="carrossel" aria-label="Campanhas da loja" tabIndex={0}
      onKeyDown={e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true) }} onPointerLeave={() => setHover(false)}
      onPointerDown={e => { drag.current = e.clientX }} onPointerCancel={() => { drag.current = null }}
      onPointerUp={e => { if (drag.current === null) return; const dx = e.clientX - drag.current; drag.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1) }}>
      {BANNERS.map((b, k) => {
        const on = k === i
        const price = priceLine(b)
        return (
          <div key={b.id} className={`bn-slide bn--${b.tone}${on ? ' on' : ''}`} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${n}`} aria-hidden={!on}>
            <div className="bn-bg" aria-hidden="true"><i className="bn-glow" /><i className="bn-ring" /><i className="bn-ring bn-ring--2" /><i className="bn-floor" /></div>
            <div className="bn-txt">
              <p className="bn-eyebrow">{b.eyebrow}</p>
              <h2 className="bn-title"><span>{b.title[0]}</span> <em>{b.title[1]}</em></h2>
              <p className="bn-sub">{b.sub}</p>
              {price && <p className="bn-price">{price}</p>}
              <Link to={b.cta[1]} className="bn-btn" tabIndex={on ? 0 : -1}>{b.cta[0]}<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
            </div>
            <div className="bn-group" aria-hidden="true">
              {b.items.map((id, j) => {
                const src = `/hero/${id}.webp`
                const near = k === i || k === (i + 1) % n || k === 0
                return <img key={id} className={`bn-p bn-p--${j}`} src={near ? src : undefined} srcSet={near ? `${sized(src, 480)} 480w, ${src} 1100w` : undefined}
                  sizes={j === 1 ? '(max-width:860px) 46vw, 24vw' : '(max-width:860px) 32vw, 17vw'} alt="" loading={k === 0 ? 'eager' : 'lazy'} decoding="async"
                  {...(k === 0 && j === 1 ? { fetchpriority: 'high' } : {})} style={{ '--j': j } as CSSProperties} />
              })}
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

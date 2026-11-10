import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'

// Destaques editoriais da Home. As imagens são recortes dos frascos reais (public/hero); trocar por fotos de
// campanha é só mudar o campo `img`. Os textos não afirmam preço, desconto nem estoque.
type Slide = { id: string; img: string; eyebrow: string; title: string[]; sub: string; cta: [string, string]; cta2?: [string, string] }
const SLIDES: Slide[] = [
  { id: 'colecao', img: '/hero/lattafa-asad-elixir-100ml.webp', eyebrow: 'Perfumaria selecionada', title: ['Uma experiência', 'que marca.'],
    sub: 'Descubra fragrâncias selecionadas para quem valoriza autenticidade, personalidade e sofisticação.', cta: ['Explorar coleção', '/catalogo'], cta2: ['Qual é o seu cheiro?', '/quiz'] },
  { id: 'ele', img: '/hero/maison-alhambra-victorioso-nero-100ml.webp', eyebrow: 'Para ele', title: ['Noite longa,', 'presença forte.'],
    sub: 'Amadeirados e especiados para quem chega marcando território.', cta: ['Ver masculinos', '/catalogo?cat=masculino'] },
  { id: 'ela', img: '/hero/maison-alhambra-pink-eclipse-100ml.webp', eyebrow: 'Para ela', title: ['Doce, floral', 'e marcante.'],
    sub: 'Fragrâncias femininas que enchem o ambiente de personalidade.', cta: ['Ver femininos', '/catalogo?cat=feminino'] },
  { id: 'quiz', img: '/hero/armaf-club-de-nuit-maleka-105ml.webp', eyebrow: 'Compre pelo cheiro', title: ['Qual é o', 'seu cheiro?'],
    sub: 'Responda o quiz e veja os perfumes do catálogo que combinam com você.', cta: ['Fazer o quiz', '/quiz'] },
]
const MS = 7000

export default function CampaignHero() {
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [moved, setMoved] = useState(false)
  const [warm, setWarm] = useState(false) // só depois do primeiro slide estabilizar, pré-carrega o próximo
  const root = useRef<HTMLElement>(null)
  const drag = useRef<number | null>(null)
  const total = SLIDES.length
  const go = (k: number) => { setMoved(true); setI(((k % total) + total) % total) }

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(q.matches); on(); q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  useEffect(() => { const t = window.setTimeout(() => setWarm(true), 3000); return () => window.clearTimeout(t) }, [])
  // pausa quando o banner sai da tela
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])

  const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }
  const onUp = (e: PointerEvent) => {
    if (drag.current === null) return
    const dx = e.clientX - drag.current; drag.current = null
    if (Math.abs(dx) > 48) go(dx < 0 ? i + 1 : i - 1)
  }
  const stop = hover || offscreen || userPaused

  return (
    <section ref={root} className="ch" aria-roledescription="carrossel" aria-label="Destaques da loja" tabIndex={0} onKeyDown={onKey}
      onPointerDown={e => { drag.current = e.clientX }} onPointerUp={onUp} onPointerCancel={() => { drag.current = null }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true) }} onPointerLeave={e => { if (e.pointerType === 'mouse') setHover(false) }}
      onFocus={e => { if (e.target.matches(':focus-visible')) setHover(true) }} onBlur={() => setHover(false)}>
      {SLIDES.map((s, k) => {
        const on = k === i
        const tab = on ? 0 : -1
        const want = k === 0 || k === i || (warm && k === (i + 1) % total)
        return (
          <div key={s.id} className={on ? `ch-slide on${moved ? '' : ' init'}` : 'ch-slide'} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${total}`} aria-hidden={!on}>
            <div className="ch-info">
              <p className="ch-eyebrow" style={{ '--d': '.05s' } as CSSProperties}>{s.eyebrow}</p>
              <h2 className="ch-title" aria-label={s.title.join(' ')}>
                {s.title.map((line, n) => <span key={line} className="ch-line" aria-hidden="true"><b style={{ '--d': `${0.12 + n * 0.1}s` } as CSSProperties}>{line}</b></span>)}
              </h2>
              <p className="ch-sub" style={{ '--d': '.35s' } as CSSProperties}>{s.sub}</p>
              <div className="ch-cta" style={{ '--d': '.45s' } as CSSProperties}>
                <Link to={s.cta[1]} className="ch-btn" tabIndex={tab}>{s.cta[0]}</Link>
                {s.cta2 && <Link to={s.cta2[1]} className="ch-link" tabIndex={tab}>{s.cta2[0]}</Link>}
              </div>
            </div>
            <div className="ch-prod" aria-hidden="true">
              <div className="ch-plate"><img src={want ? s.img : undefined} alt="" width="800" height="800" loading={k === 0 ? 'eager' : 'lazy'} decoding="async" {...(k === 0 ? { fetchpriority: 'high' } : {})} /></div>
            </div>
          </div>
        )
      })}

      <div className="ch-ctrl">
        <button type="button" className="ch-pause" aria-pressed={userPaused} aria-label={userPaused ? 'Retomar troca automática dos destaques' : 'Pausar troca automática dos destaques'} onClick={() => setUserPaused(v => !v)}>
          {userPaused
            ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>}
        </button>
        <div className="ch-bars" role="tablist" aria-label="Escolher destaque">
          {SLIDES.map((s, k) => (
            <button key={s.id} type="button" role="tab" aria-selected={k === i} aria-label={`${s.eyebrow}: ${s.title.join(' ')}`} className={k === i ? 'ch-bar on' : k < i ? 'ch-bar seen' : 'ch-bar'} onClick={() => go(k)}>
              <span style={{ animationPlayState: stop ? 'paused' : 'running', animationDuration: `${MS}ms` }} onAnimationEnd={() => { if (k === i && !reduced) go(i + 1) }} />
            </button>
          ))}
        </div>
        <span className="ch-count" aria-hidden="true"><b>{String(i + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}</span>
      </div>
      <div className="ch-arrows">
        <button type="button" aria-label="Destaque anterior" onClick={() => go(i - 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <button type="button" aria-label="Próximo destaque" onClick={() => go(i + 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      </div>
    </section>
  )
}

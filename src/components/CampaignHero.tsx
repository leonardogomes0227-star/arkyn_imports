import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'

// Campanhas da Home. As imagens são recortes dos frascos reais (public/hero); trocar por fotos de campanha
// é só mudar o campo `img`. Textos não afirmam preço, desconto nem estoque.
type Slide = {
  id: string; img: string; word: string; eyebrow: string; title: string[]; sub: string
  cta: [string, string]; cta2?: [string, string]
  theme: { from: string; to: string; glow: string; ink: string; accent: string; btnBg: string; btnFg: string }
}
const SLIDES: Slide[] = [
  { id: 'arabe', img: '/hero/lattafa-asad-elixir-100ml.webp', word: 'ARKYN', eyebrow: 'Perfumaria selecionada', title: ['Uma experiência', 'que marca.'],
    sub: 'Descubra fragrâncias selecionadas para quem valoriza autenticidade, personalidade e sofisticação.', cta: ['Explorar coleção', '/catalogo'], cta2: ['Qual é o seu cheiro?', '/quiz'],
    theme: { from: '#f6f2ea', to: '#e5dcce', glow: 'rgba(255,255,255,.95)', ink: '#2b2025', accent: '#6f5b37', btnBg: '#111111', btnFg: '#ffffff' } },
  { id: 'ele', img: '/hero/maison-alhambra-victorioso-nero-100ml.webp', word: 'ELE', eyebrow: 'Para ele', title: ['Noite longa,', 'presença forte.'],
    sub: 'Amadeirados e especiados para quem chega marcando território.', cta: ['Ver masculinos', '/catalogo?cat=masculino'],
    theme: { from: '#efebe3', to: '#d9d1c4', glow: 'rgba(255,255,255,.95)', ink: '#2b2025', accent: '#6f5b37', btnBg: '#111111', btnFg: '#ffffff' } },
  { id: 'ela', img: '/hero/maison-alhambra-pink-eclipse-100ml.webp', word: 'ELA', eyebrow: 'Para ela', title: ['Doce, floral', 'e marcante.'],
    sub: 'Fragrâncias femininas que enchem o ambiente de personalidade.', cta: ['Ver femininos', '/catalogo?cat=feminino'],
    theme: { from: '#f6ece6', to: '#e8d3c8', glow: 'rgba(255,255,255,.95)', ink: '#2b2025', accent: '#111111', btnBg: '#111111', btnFg: '#ffffff' } },
  { id: 'vulcan', img: '/hero/french-avenue-vulcan-feu-100ml.webp', word: 'FEU', eyebrow: 'Destaque da casa', title: ['Fogo', 'na pele.'],
    sub: 'Vulcan Feu, da French Avenue: especiado e amadeirado, com manga, limão e gengibre.', cta: ['Conhecer o Vulcan Feu', '/produto/french-avenue-vulcan-feu-100ml'],
    theme: { from: '#ebefec', to: '#cdd9d2', glow: 'rgba(255,255,255,.95)', ink: '#1f2b2a', accent: '#5f7a72', btnBg: '#111111', btnFg: '#ffffff' } },
  { id: 'quiz', img: '/hero/armaf-club-de-nuit-maleka-105ml.webp', word: 'CHEIRO', eyebrow: 'Compre pelo cheiro', title: ['Qual é o', 'seu cheiro?'],
    sub: 'Responda o quiz e veja os perfumes do catálogo que combinam com você.', cta: ['Fazer o quiz', '/quiz'],
    theme: { from: '#f0ecf2', to: '#d8cfe0', glow: 'rgba(255,255,255,.95)', ink: '#2b2025', accent: '#7a6a8a', btnBg: '#111111', btnFg: '#ffffff' } },
]
const MS = 6500

export default function CampaignHero() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [moved, setMoved] = useState(false)
  const root = useRef<HTMLElement>(null)
  const drag = useRef<number | null>(null)
  const frame = useRef(0)
  const total = SLIDES.length
  const go = (k: number) => { setMoved(true); setI(((k % total) + total) % total) }

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(q.matches); on(); q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  // pausa quando o banner sai da tela
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !root.current) return
    const r = root.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => { root.current?.style.setProperty('--px', x.toFixed(3)); root.current?.style.setProperty('--py', y.toFixed(3)) })
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }
  const stop = paused || offscreen || userPaused

  return (
    <section ref={root} className={userPaused ? 'ch is-paused' : 'ch'} aria-roledescription="carrossel" aria-label="Campanhas" tabIndex={0} onKeyDown={onKey} onPointerMove={onMove}
      onPointerDown={e => { drag.current = e.clientX }}
      onPointerUp={e => { if (drag.current === null) return; const dx = e.clientX - drag.current; drag.current = null; if (Math.abs(dx) > 48) go(dx < 0 ? i + 1 : i - 1) }}
      onPointerCancel={() => { drag.current = null }}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setPaused(true) }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') { setPaused(false); root.current?.style.setProperty('--px', '0'); root.current?.style.setProperty('--py', '0') } }}
      onFocus={e => { if (e.target.matches(':focus-visible')) setPaused(true) }} onBlur={() => setPaused(false)}>
      {SLIDES.map((s, k) => {
        const on = k === i
        const t = s.theme
        const vars = { '--from': t.from, '--to': t.to, '--glow': t.glow, '--ink': t.ink, '--accent': t.accent, '--btn-bg': t.btnBg, '--btn-fg': t.btnFg } as CSSProperties
        const tab = on ? 0 : -1
        return (
          <div key={s.id} className={on ? `ch-slide on${moved ? '' : ' init'}` : 'ch-slide'} style={vars} role="group" aria-roledescription="slide" aria-label={`${k + 1} de ${total}`} aria-hidden={!on}>
            <span className="ch-bg" aria-hidden="true" />
            <span className="ch-word" aria-hidden="true">{s.word}</span>
            <span className="ch-smoke a" aria-hidden="true" /><span className="ch-smoke b" aria-hidden="true" />
            <span className="ch-dust" aria-hidden="true">{Array.from({ length: 14 }, (_, n) => <i key={n} style={{ '--n': n } as CSSProperties} />)}</span>
            <div className="ch-prod" aria-hidden="true">
              <span className="ch-pglow" />
              <div className="ch-float"><img src={s.img} alt="" width="800" height="800" loading={k === 0 ? 'eager' : 'lazy'} decoding="async" {...(k === 0 ? { fetchpriority: 'high' } : {})} /></div>
              <span className="ch-pfloor" />
            </div>
            <div className="ch-info">
              <p className="ch-eyebrow" style={{ '--d': '.1s' } as CSSProperties}>{s.eyebrow}</p>
              <h2 className="ch-title" aria-label={s.title.join(' ')}>
                {s.title.map((line, n) => <span key={line} className="ch-line" aria-hidden="true"><b style={{ '--d': `${0.2 + n * 0.14}s` } as CSSProperties}>{line}</b></span>)}
              </h2>
              <p className="ch-sub" style={{ '--d': '.55s' } as CSSProperties}>{s.sub}</p>
              <div className="ch-cta" style={{ '--d': '.7s' } as CSSProperties}>
                <Link to={s.cta[1]} className="ch-btn" tabIndex={tab}>{s.cta[0]}<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
                {s.cta2 && <Link to={s.cta2[1]} className="ch-link" tabIndex={tab}>{s.cta2[0]}</Link>}
              </div>
            </div>
          </div>
        )
      })}

      <div className="ch-ctrl">
        <div className="ch-bottom">
        <button type="button" className="ch-pause" aria-pressed={userPaused} aria-label={userPaused ? 'Retomar troca automática das campanhas' : 'Pausar troca automática das campanhas'} onClick={() => setUserPaused(v => !v)}>
          {userPaused
            ? <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>}
        </button>
        <div className="ch-bars" role="tablist" aria-label="Escolher campanha">
          {SLIDES.map((s, k) => (
            <button key={s.id} type="button" role="tab" aria-selected={k === i} aria-label={`${s.eyebrow}: ${s.title.join(' ')}`} className={k === i ? 'ch-bar on' : k < i ? 'ch-bar seen' : 'ch-bar'} onClick={() => go(k)}>
              <span style={{ animationPlayState: stop ? 'paused' : 'running', animationDuration: `${MS}ms` }} onAnimationEnd={() => { if (k === i && !reduced) go(i + 1) }} />
            </button>
          ))}
        </div>
        </div>
        <span className="ch-count" aria-hidden="true"><b>{String(i + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}</span>
        <div className="ch-arrows">
          <button type="button" aria-label="Campanha anterior" onClick={() => go(i - 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button type="button" aria-label="Próxima campanha" onClick={() => go(i + 1)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </div>
      </div>
    </section>
  )
}

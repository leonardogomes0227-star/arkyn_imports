import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'
import { noteGradient } from '../lib/noteColors'

// Slides de perfumes: cor de fundo suave combinando com o frasco
const SLIDES: [string, string][] = [
  ['lattafa-afeef-100ml', '#efe6d6'],
  ['armaf-club-de-nuit-maleka-105ml', '#ebe3f2'],
  ['french-avenue-vulcan-feu-100ml', '#d8edef'],
  ['lattafa-asad-elixir-100ml', '#e3e4e7'],
  ['maison-alhambra-pink-eclipse-100ml', '#f8e4e2'],
  ['maison-alhambra-victorioso-nero-100ml', '#e4e2de'],
]

export default function HeroSlider() {
  const { products, settings } = useStore()
  const track = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const [pause, setPause] = useState(false)
  const n = settings.installments

  const items = SLIDES.map(([id, bg]) => ({ p: products.find(x => x.id === id), bg })).filter(s => s.p && s.p.image)
  const total = items.length + 1 // +1 = slide da marca

  const go = (k: number) => {
    const el = track.current
    if (!el) return
    const idx = (k + total) % total
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setI(idx)
  }

  useEffect(() => {
    if (pause || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => go(i + 1), 5500)
    return () => clearInterval(t)
  })

  const onScroll = () => {
    const el = track.current
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <section className="hs" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} onTouchStart={() => setPause(true)} aria-roledescription="carrossel">
      <div className="hs-track" ref={track} onScroll={onScroll}>
        <div className="hs-slide hs-brand">
          <img src="/logo-full.png" alt="Arkyn Imports" />
          <p>Perfumes árabes<br />Retirada em Coxim – MS</p>
          <Link to="/catalogo" className="btn round">Ver todos os perfumes</Link>
        </div>
        {items.map(({ p, bg }) => p && (
          <div key={p.id} className="hs-slide" style={{ background: bg }}>
            <div className="hs-txt">
              <span className="hs-k">{p.brand}</span>
              <h2>{p.name.replace(/ \d+ml$/i, '')}</h2>
              {!!p.notes?.length && <p className="hs-notes">Notas: {p.notes.slice(0, 4).join(' · ')}</p>}
              <p className="hs-price">{brl(p.price)}{n > 1 && <span> ou {n}x de {brl(p.price / n)}</span>}</p>
              <Link to={`/produto/${p.id}`} className="btn round">Comprar agora</Link>
            </div>
            <div className="hs-img">
              <Link to={`/produto/${p.id}`} aria-label={p.name}><img src={p.image} alt={`${p.brand} ${p.name}`} /></Link>
              {p.notes?.slice(0, 4).map((nt, k) => (
                <span key={nt} className={`chip c${k}`} style={{ animationDelay: `${k * -1.3}s` }}><i style={{ background: noteGradient(nt) }} />{nt}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="hs-arr prev" aria-label="Anterior" onClick={() => go(i - 1)}>‹</button>
      <button className="hs-arr next" aria-label="Próximo" onClick={() => go(i + 1)}>›</button>
      <div className="hs-dots">{Array.from({ length: total }, (_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={`Slide ${k + 1}`} onClick={() => go(k)} />)}</div>
    </section>
  )
}

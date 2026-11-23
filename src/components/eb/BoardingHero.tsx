import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cutoutFor } from '../../lib/cutouts'
import { brl } from '../../lib/store'
import type { Product } from '../../lib/types'
import { famOf, flightOf, gateOf, shortName, statusOf } from './flight'

// Código de barras desenhado a partir do código do voo (sempre o mesmo para o mesmo perfume).
function Barcode({ seed }: { seed: string }) {
  let h = 7
  const bars: number[] = []
  for (let i = 0; i < 46; i++) { h = (h * 9301 + 49297 + seed.charCodeAt(i % seed.length)) % 233280; bars.push(1 + (h % 3)) }
  let x = 0
  return (
    <svg className="eb-bar" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((w, i) => { const r = i % 2 ? null : <rect key={i} x={x} y="0" width={w} height="34" />; x += w + 1.4; return r })}
    </svg>
  )
}

export function Ticket({ p, priority = false }: { p: Product; priority?: boolean }) {
  const [st, label] = statusOf(p)
  const fam = famOf(p)
  const img = cutoutFor(p)
  return (
    <Link to={`/produto/${p.id}`} className="eb-ticket" aria-label={`${p.name}, ${p.brand}, ${brl(p.price)}`}>
      <span className="eb-t-head"><span>Cartão de embarque</span><b>Voo {flightOf(p.id)}</b></span>
      <span className="eb-t-route">
        <span><b>DXB</b><small>Dubai</small></span>
        <svg viewBox="0 0 120 40" aria-hidden="true"><path d="M4 34 C 34 2, 86 2, 116 26" /><g transform="translate(60 11) rotate(8)"><path d="M-8 0 L8 0 M2 -5 L6 0 L2 5 M-6 -3 L-4 0 L-6 3" /></g></svg>
        <span><b>BR</b><small>Todo o Brasil</small></span>
      </span>
      <span className="eb-t-photo">
        {img && <img src={img} alt="" width="800" height="800" loading={priority ? 'eager' : 'lazy'} decoding="async" {...(priority ? { fetchpriority: 'high' } : {})} />}
        <span className={`eb-stamp is-${st}`}>{st === 'go' ? <>Pronta<br />entrega</> : label}</span>
      </span>
      <span className="eb-perf" aria-hidden="true" />
      <span className="eb-t-fields">
        <span><small>Passageiro</small><b>{shortName(p.name)}</b></span>
        <span><small>Casa</small><b>{p.brand}</b></span>
        <span><small>Família</small><b>{fam || '—'}</b></span>
        <span><small>Portão</small><b>{gateOf(p)}</b></span>
        <span className="eb-t-fare"><small>Tarifa</small><b>{brl(p.price)}</b></span>
      </span>
      <Barcode seed={flightOf(p.id) + p.id} />
    </Link>
  )
}

/** Topo da loja: cartões de embarque dos perfumes em destaque, de passar com o dedo. */
export default function BoardingHero({ items }: { items: Product[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(0)
  useEffect(() => {
    const t = track.current
    if (!t) return
    let raf = 0
    const read = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setOn(Math.round(t.scrollLeft / Math.max(1, t.clientWidth * 0.86)))) }
    t.addEventListener('scroll', read, { passive: true })
    return () => { t.removeEventListener('scroll', read); cancelAnimationFrame(raf) }
  }, [])
  const go = (i: number) => { const t = track.current; const el = t?.children[i] as HTMLElement | undefined; if (t && el) t.scrollTo({ left: el.offsetLeft - t.offsetLeft - (t.clientWidth - el.clientWidth) / 2, behavior: 'smooth' }) }

  return (
    <section className="eb-hero" aria-labelledby="eb-hero-t">
      <div className="eb-hero-txt">
        <h1 id="eb-hero-t">Perfumes árabes que <em>embarcam</em> para a sua casa.</h1>
        <p>Lattafa, Maison Alhambra, Armaf e mais. Envio para todo o Brasil; em Coxim, retirada grátis na loja.</p>
        <div className="eb-hero-cta">
          <a href="#partidas" className="eb-btn">Ver as partidas <span aria-hidden="true">↓</span></a>
          <Link to="/quiz" className="eb-link">Qual é o seu cheiro?</Link>
        </div>
      </div>
      <div className="eb-hero-pass">
        <div className="eb-track" ref={track}>
          {items.map((p, i) => <div key={p.id} className="eb-slide" style={{ '--i': i } as CSSProperties}><Ticket p={p} priority={i === 0} /></div>)}
        </div>
        {items.length > 1 && (
          <div className="eb-dots" role="tablist" aria-label="Perfumes em destaque">
            {items.map((p, i) => <button key={p.id} type="button" role="tab" aria-selected={on === i} aria-label={shortName(p.name)} className={on === i ? 'on' : ''} onClick={() => go(i)} />)}
          </div>
        )}
      </div>
    </section>
  )
}

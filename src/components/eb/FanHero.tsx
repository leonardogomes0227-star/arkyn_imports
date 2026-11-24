import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cutoutFor } from '../../lib/cutouts'
import { brl, useStore } from '../../lib/store'
import type { Product } from '../../lib/types'
import { shortName, volumeOf } from './flight'

/** Faixa com os perfumes da loja correndo devagar; cada nome abre o perfume. */
export function LiveTicker({ items }: { items: Product[] }) {
  if (!items.length) return null
  const row = items.map(p => (
    <Link key={p.id} to={`/produto/${p.id}`} tabIndex={-1}>
      {shortName(p.name).toUpperCase()} <b>{brl(p.price)}</b>{p.stock <= 3 && <i>ÚLTIMAS UNIDADES</i>}
    </Link>
  ))
  return (
    <div className="fh-tick" aria-hidden="true">
      <div className="fh-tick-in" style={{ '--n': items.length } as CSSProperties}><span>{row}</span><span>{row}</span></div>
    </div>
  )
}

function MiniPass({ p }: { p: Product }) {
  return (
    <>
      <span className="fh-h"><span>{p.brand}</span><b>{volumeOf(p.name) ? `${volumeOf(p.name)} ml` : ''}</b></span>
      <span className="fh-ph">
        <img src={cutoutFor(p)} alt="" draggable={false} />
        <em className="fh-stamp">{p.stock <= 3 ? <>Últimas<br />unidades</> : <>Pronta<br />entrega</>}</em>
      </span>
      <span className="fh-pf" />
      <span className="fh-n"><b>{shortName(p.name)}</b><small>{brl(p.price)}</small></span>
    </>
  )
}

/** Começo do site: 3 bilhetes em leque com os frascos, trocando sozinhos; o avião voa por trás. */
export default function FanHero() {
  const { products } = useStore()
  const pool = useMemo(() => {
    const live = products.filter(p => p.stock > 0 && cutoutFor(p) && (p.category === 'masculino' || p.category === 'feminino'))
    const pick = [...live.filter(p => p.featured), ...live.filter(p => !p.featured)]
    // alterna masculino e feminino para o leque sempre misturar
    const m = pick.filter(p => p.category === 'masculino'), f = pick.filter(p => p.category === 'feminino')
    const out: Product[] = []
    for (let i = 0; out.length < Math.min(9, pick.length); i++) { if (m[i]) out.push(m[i]); if (f[i]) out.push(f[i]); if (!m[i] && !f[i]) break }
    return out
  }, [products])
  const [k, setK] = useState(0)
  const [hold, setHold] = useState(false)
  const start = useRef(0)
  const n = pool.length
  useEffect(() => {
    if (hold || n < 3) return
    const t = window.setInterval(() => setK(v => (v + 1) % n), 3600)
    return () => window.clearInterval(t)
  }, [hold, n])
  if (n < 3) return null
  const at = (o: number) => pool[(k + o + n) % n]
  const cards = [{ p: at(-1), pos: 'l' }, { p: at(1), pos: 'r' }, { p: at(0), pos: 'c' }]
  const scrollToCheckin = () => document.getElementById('checkin')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="fh" aria-labelledby="fh-t">
      <LiveTicker items={pool} />
      <div className="fh-in">
        <div className="fh-stage"
          onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}
          onTouchStart={e => { start.current = e.touches[0].clientX; setHold(true) }}
          onTouchEnd={e => { const d = e.changedTouches[0].clientX - start.current; if (Math.abs(d) > 40) setK(v => (v + (d < 0 ? 1 : -1) + n) % n); setHold(false) }}>
          <p className="fh-kick">Perfumaria árabe · {products.filter(p => p.stock > 0).length} perfumes</p>
          <svg className="fh-route" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 200 C 90 80, 230 10, 410 40" /></svg>
          <img className="fh-plane" src="/intro/aviao.webp" alt="" aria-hidden="true" draggable={false} />
          <div className="fh-fan">
            {cards.map(({ p, pos }) => (
              <Link key={p.id} to={`/produto/${p.id}`} className={`fh-t fh-${pos}`} tabIndex={pos === 'c' ? 0 : -1} aria-hidden={pos !== 'c'} aria-label={pos === 'c' ? `${p.name}, ${brl(p.price)}` : undefined}>
                <MiniPass p={p} />
              </Link>
            ))}
          </div>
          <div className="fh-dots" aria-hidden="true">{pool.map((p, i) => <i key={p.id} className={i === k ? 'on' : ''} />)}</div>
        </div>
        <div className="fh-txt">
          <h1 id="fh-t">Perfumes árabes <em>originais</em>, direto para a sua casa.</h1>
          <div className="fh-cta">
            <button type="button" className="fh-a" onClick={scrollToCheckin}>Descubra o seu · 30s <span aria-hidden="true">→</span></button>
            <a href="#perfumes" className="fh-b">Ver perfumes</a>
          </div>
          <ul className="fh-trust"><li>Originais</li><li>Todo o Brasil</li><li>Retirada em Coxim</li></ul>
        </div>
      </div>
    </section>
  )
}

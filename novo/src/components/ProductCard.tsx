import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cutoutFor } from '../lib/cutouts'
import { brl, famOf, shortName, useStore } from '../lib/store'
import type { Product } from '../lib/types'
import { IBag, IChevron, IHeart } from './Icons'

export default function ProductCard({ p, eager = false }: { p: Product; eager?: boolean }) {
  const { add, favs, toggleFav, settings, setBag } = useStore()
  const [added, setAdded] = useState(false)
  const fav = favs.includes(p.id)
  const out = p.stock <= 0
  const sale = !!p.old_price && p.old_price > p.price
  const img = cutoutFor(p) ?? p.image
  const n = settings.installments
  const buy = () => { add(p.id); setAdded(true); window.setTimeout(() => setAdded(false), 1600); window.setTimeout(() => setBag(true), 350) }
  return (
    <article className={out ? 'nv-card out' : 'nv-card'}>
      <div className="nv-card-media">
        <Link to={`/produto/${p.id}`} className="nv-card-img" tabIndex={-1} aria-hidden="true">
          {img && <img src={img} alt="" width="600" height="600" loading={eager ? 'eager' : 'lazy'} decoding="async" />}
        </Link>
        <div className="nv-badges">
          {sale && <span className="nv-badge sale">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
          {!sale && p.featured && !out && <span className="nv-badge">Destaque</span>}
          {!out && p.stock <= 3 && <span className="nv-badge warn">Últimas unidades</span>}
          {out && <span className="nv-badge mute">Esgotado</span>}
        </div>
        <button type="button" className={fav ? 'nv-fav on' : 'nv-fav'} aria-pressed={fav} aria-label={fav ? `Remover ${p.name} dos favoritos` : `Favoritar ${p.name}`} onClick={() => toggleFav(p.id)}><IHeart filled={fav} width={19} height={19} /></button>
        {!out && <button type="button" className={added ? 'nv-quick done' : 'nv-quick'} onClick={buy}>{added ? 'Adicionado ✓' : <><IBag width={17} height={17} /> Adicionar à sacola</>}</button>}
        {!out && <button type="button" className={added ? 'nv-card-buy done' : 'nv-card-buy'} aria-label={`Adicionar ${p.name} à sacola`} onClick={buy}>{added ? '✓' : <IBag width={18} height={18} />}</button>}
      </div>
      <div className="nv-card-info">
        <small>{p.brand}</small>
        <Link to={`/produto/${p.id}`} className="nv-card-name">{shortName(p.name)}</Link>
        {famOf(p) && <span className="nv-card-fam">{famOf(p)}{p.notes?.length ? ` · ${p.notes.slice(0, 2).join(', ')}` : ''}</span>}
        <div className="nv-price">
          {sale && <s>{brl(p.old_price!)}</s>}
          <b>{brl(p.price)}</b>
          <span>{n > 1 ? `ou ${n}x de ${brl(p.price / n)} sem juros` : 'no Pix ou cartão'}</span>
        </div>
      </div>
    </article>
  )
}

/** Vitrine em carrossel: rola com o dedo no celular, setas no computador. */
export function Rail({ title, sub, to, items }: { title: string; sub?: string; to?: string; items: Product[] }) {
  const track = useRef<HTMLDivElement>(null)
  if (!items.length) return null
  const move = (d: number) => { const t = track.current; if (t) t.scrollBy({ left: d * t.clientWidth * 0.8, behavior: 'smooth' }) }
  return (
    <section className="nv-rail">
      <div className="nv-sec-head">
        <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
        <div className="nv-rail-ctl">
          {to && <Link to={to} className="nv-more">Ver todos</Link>}
          <button type="button" aria-label="Anteriores" onClick={() => move(-1)}><IChevron dir="left" width={18} height={18} /></button>
          <button type="button" aria-label="Próximos" onClick={() => move(1)}><IChevron width={18} height={18} /></button>
        </div>
      </div>
      <div className="nv-rail-track" ref={track}>{items.map((p, i) => <ProductCard key={p.id} p={p} eager={i < 2} />)}</div>
    </section>
  )
}

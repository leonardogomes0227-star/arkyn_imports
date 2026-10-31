import { Link } from 'react-router-dom'
import Placeholder from './Placeholder'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  const { add, settings } = useStore()
  const sale = !!p.old_price && p.old_price > p.price && p.stock > 0
  return (
    <article className="card">
      <Link to={`/produto/${p.id}`} className="thumb">
        {sale && <span className="off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
        {p.image ? <img src={p.image} alt={`${p.brand} ${p.name}`} loading="lazy" /> : <Placeholder brand={p.brand} />}
      </Link>
      <div className="info">
        <small>{p.brand}</small>
        <Link to={`/produto/${p.id}`}><h3>{p.name}</h3></Link>
        {p.stock > 0 && p.stock <= 3 && <span className="low">{p.stock === 1 ? 'Última peça' : `Restam ${p.stock}`}</span>}
        <div className="row">
          <div>
            {sale && <em className="old">{brl(p.old_price!)}</em>}
            <strong>{p.stock > 0 ? brl(p.price) : 'Esgotado'}</strong>
            {p.stock > 0 && settings.installments > 1 && <em className="inst">até {settings.installments}x de {brl(p.price / settings.installments)}</em>}
          </div>
          <button className="add" disabled={p.stock <= 0} onClick={() => add(p.id)}>Adicionar</button>
        </div>
      </div>
    </article>
  )
}

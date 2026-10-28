import { Link } from 'react-router-dom'
import Bottle from './Bottle'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  const { add, settings } = useStore()
  return (
    <article className="card">
      <Link to={`/produto/${p.id}`} className="thumb">{p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <Bottle id={p.id} brand={p.brand} />}</Link>
      <div className="info">
        <small>{p.brand}</small>
        {p.stock > 0 && p.stock <= 3 && <span className="low">{p.stock === 1 ? 'Última peça!' : `Restam ${p.stock}`}</span>}
        <Link to={`/produto/${p.id}`}><h3>{p.name}</h3></Link>
        <div className="row">
          <div><strong>{p.stock > 0 ? brl(p.price) : 'Esgotado'}</strong>{p.stock > 0 && settings.installments > 1 && <em className="inst">ou até {settings.installments}x de {brl(p.price / settings.installments)}</em>}</div>
          <button className="plus" disabled={p.stock <= 0} onClick={() => add(p.id)} aria-label="Adicionar ao carrinho" title={p.stock > 0 ? 'Adicionar' : 'Esgotado'}>+</button>
        </div>
      </div>
    </article>
  )
}

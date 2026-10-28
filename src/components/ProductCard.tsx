import { Link } from 'react-router-dom'
import Bottle from './Bottle'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useStore()
  return (
    <article className="card">
      <Link to={`/produto/${p.id}`} className="thumb">{p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <Bottle id={p.id} brand={p.brand} />}</Link>
      <div className="info">
        <small>{p.brand}</small>
        <Link to={`/produto/${p.id}`}><h3>{p.name}</h3></Link>
        <div className="row">
          <strong>{brl(p.price)}</strong>
          <button className="plus" disabled={p.stock <= 0} onClick={() => add(p.id)} aria-label="Adicionar ao carrinho" title={p.stock > 0 ? 'Adicionar' : 'Esgotado'}>+</button>
        </div>
      </div>
    </article>
  )
}

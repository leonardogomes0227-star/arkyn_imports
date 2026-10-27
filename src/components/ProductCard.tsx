import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useStore()
  return (
    <article className="card">
      <div className="thumb">{p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <span>{p.brand}</span>}</div>
      <small>{p.brand}</small>
      <h3>{p.name}</h3>
      <strong>{brl(p.price)}</strong>
      <button className="btn" disabled={p.stock <= 0} onClick={() => add(p.id)}>{p.stock > 0 ? 'Adicionar' : 'Esgotado'}</button>
    </article>
  )
}

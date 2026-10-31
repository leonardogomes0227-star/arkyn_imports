import { Link } from 'react-router-dom'
import Placeholder from './Placeholder'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  const { add, settings } = useStore()
  const sale = !!p.old_price && p.old_price > p.price && p.stock > 0
  const n = settings.installments
  return (
    <article className="card">
      <Link to={`/produto/${p.id}`} className="thumb">
        {sale && <span className="off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
        {p.image ? <img src={p.image} alt={`${p.brand} ${p.name}`} loading="lazy" /> : <Placeholder brand={p.brand} />}
      </Link>
      <div className="info">
        {!!p.tags?.length && <span className="tagpill">{p.tags[0]}</span>}
        <Link to={`/produto/${p.id}`}><h3>{p.name}</h3></Link>
        <small>{p.brand}</small>
        {p.stock > 0 && p.stock <= 3 && <span className="low">{p.stock === 1 ? 'Última unidade' : `Restam ${p.stock} unidades`}</span>}
        <div className="pr">
          {p.stock > 0 ? <>
            {sale && <em className="old">{brl(p.old_price!)}</em>}
            <strong>{brl(p.price)}</strong>
            {n > 1 && <em className="inst">ou {n}x de {brl(p.price / n)} sem juros</em>}
          </> : <strong className="soldout">Esgotado</strong>}
        </div>
        <button className="buy" disabled={p.stock <= 0} onClick={() => add(p.id)}>{p.stock > 0 ? 'Adicionar à sacola' : 'Indisponível'}</button>
      </div>
    </article>
  )
}

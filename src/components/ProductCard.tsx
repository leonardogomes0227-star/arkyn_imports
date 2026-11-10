import { Link } from 'react-router-dom'
import Placeholder from './Placeholder'
import { brl, useStore } from '../lib/store'
import { noteGradient } from '../lib/noteColors'
import { useToast } from './Toast'
import type { Product } from '../lib/types'

export default function ProductCard({ p }: { p: Product }) {
  const { add, settings, setOpen } = useStore()
  const { toast } = useToast()
  const sale = !!p.old_price && p.old_price > p.price && p.stock > 0
  const n = settings.installments
  const clean = !!p.image?.includes('-net/')
  const hint = p.notes?.length ? p.notes : [p.family, ...(p.tags ?? [])].filter(Boolean) as string[]
  return (
    <article className="card">
      <Link to={`/produto/${p.id}`} className={`thumb${clean ? ' clean' : ''}`}>
        {sale && <span className="off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
        {p.image ? <img src={p.image} alt={`${p.brand} ${p.name}`} loading="lazy" /> : <Placeholder brand={p.brand} />}
        {p.stock > 0 && (
          <button className="quick" aria-label="Adicionar à sacola" title="Adicionar à sacola" onClick={e => { e.preventDefault(); add(p.id, false); toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) }) }}>+</button>
        )}
        {!!hint.length && (
          <span className="notes" aria-hidden="true">
            <b>{p.notes?.length ? 'Notas' : 'Perfil'}</b>
            {hint.slice(0, 6).map(n => <i key={n}>{p.notes?.length ? <u style={{ background: noteGradient(n) }} /> : null}{n}</i>)}
          </span>
        )}
      </Link>
      <div className="info">
        <small>{p.brand}</small>
        <Link to={`/produto/${p.id}`}><h3>{p.name}</h3></Link>
        {p.stock > 0 && p.stock <= 3 && <span className="low">{p.stock === 1 ? 'Última unidade' : `Restam ${p.stock} unidades`}</span>}
        <div className="pr">
          {p.stock > 0 ? <>
            <span className="pline">{sale && <em className="old">{brl(p.old_price!)}</em>}<strong>{brl(p.price)}</strong></span>
            {n > 1 && <em className="inst">ou {n}x de {brl(p.price / n)} sem juros</em>}
          </> : <strong className="soldout">Esgotado</strong>}
        </div>
      </div>
    </article>
  )
}

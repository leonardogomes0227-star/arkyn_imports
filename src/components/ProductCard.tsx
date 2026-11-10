import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Placeholder from './Placeholder'
import SizedImg from './SizedImg'
import { useToast } from './Toast'
import { brl, useStore } from '../lib/store'
import { IconHeart } from './Icons'
import { noteGradient } from '../lib/noteColors'
import type { Product } from '../lib/types'

export function ProductSkeleton({ n = 4 }: { n?: number }) {
  return <>{Array.from({ length: n }, (_, i) => (
    <div className="card sk" key={i} aria-hidden="true"><div className="thumb ax-skel" /><div className="info"><span className="ax-skel sk-l s" /><span className="ax-skel sk-l m" /><span className="ax-skel sk-l p" /></div></div>
  ))}</>
}

export default function ProductCard({ p }: { p: Product }) {
  const { add, settings, setOpen, favs, toggleFav } = useStore()
  const fav = favs.includes(p.id)
  const { toast } = useToast()
  const [loaded, setLoaded] = useState(false)
  const [done, setDone] = useState(false)
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => { if (img.current?.complete) setLoaded(true) }, [])

  const out = p.stock <= 0
  const sale = !!p.old_price && p.old_price > p.price && !out
  const n = settings.installments
  const clean = !!p.image?.includes('-net/')
  const second = p.images?.find(x => x && x !== p.image) // segunda foto real do cadastro, se existir
  const hint = p.notes?.length ? p.notes : [p.family, ...(p.tags ?? [])].filter(Boolean) as string[]
  const quick = (e: React.MouseEvent) => {
    e.preventDefault()
    add(p.id, false)
    setDone(true); window.setTimeout(() => setDone(false), 1400)
    toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) })
  }

  return (
    <article className={out ? 'card is-out' : 'card'}>
      <Link to={`/produto/${p.id}`} className={`thumb${clean ? ' clean' : ''}${loaded || !p.image ? ' ready' : ''}`} aria-label={`${p.brand} ${p.name}`}>
        {!loaded && p.image && <span className="ax-skel thumb-skel" />}
        {sale && <span className="off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
        {p.image ? <SizedImg ref={img} className="m" src={p.image} size={480} responsive sizes="(max-width:560px) 45vw, (max-width:1100px) 30vw, 300px" width={800} height={800} alt={`${p.brand} ${p.name}`} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} /> : <Placeholder brand={p.brand} />}
        {second && <SizedImg className="alt" src={second} size={480} width={800} height={800} alt="" loading="lazy" decoding="async" />}
        {out && <span className="sold">Esgotado</span>}
        <button type="button" className={fav ? 'fav on' : 'fav'} aria-pressed={fav} aria-label={fav ? `Remover ${p.name} dos favoritos` : `Favoritar ${p.name}`} onClick={e => { e.preventDefault(); toggleFav(p.id) }}><IconHeart size={18} filled={fav} /></button>
        {!!hint.length && !out && (
          <span className="notes" aria-hidden="true">
            <b>{p.notes?.length ? 'Notas' : 'Perfil'}</b>
            {hint.slice(0, 6).map(x => <i key={x}>{p.notes?.length ? <u style={{ background: noteGradient(x) }} /> : null}{x}</i>)}
          </span>
        )}
      </Link>
      <div className="info">
        <small>{p.brand}</small>
        <Link to={`/produto/${p.id}`}><h3>{p.name}</h3></Link>
        {!out && p.stock <= 3 && <span className="low">{p.stock === 1 ? 'Última unidade' : `Restam ${p.stock} unidades`}</span>}
        <div className="pr">
          {!out ? <>
            <span className="pline">{sale && <em className="old">{brl(p.old_price!)}</em>}<strong>{brl(p.price)}</strong></span>
            {n > 1 && <em className="inst">ou {n}x de {brl(p.price / n)} sem juros</em>}
          </> : <strong className="soldout">Indisponível no momento</strong>}
        </div>
        {!out && <button type="button" className={done ? 'card-add done' : 'card-add'} onClick={quick}>{done ? 'Adicionado ✓' : 'Adicionar à sacola'}</button>}
      </div>
    </article>
  )
}

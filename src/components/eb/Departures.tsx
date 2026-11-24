import { useRef, type CSSProperties } from 'react'
import { flyToBag } from '../../lib/fly'
import { Link } from 'react-router-dom'
import SizedImg from '../SizedImg'
import { useToast } from '../Toast'
import { photoOf } from '../../lib/cutouts'
import { brl, useStore } from '../../lib/store'
import type { Product } from '../../lib/types'
import { famOf, shortName, statusOf, volumeOf } from './flight'

/** Um produto em formato de bilhete: faixa da marca, foto, picote, nome, família, preço e compra. */
export function TicketCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { add, setOpen } = useStore()
  const { toast } = useToast()
  const [st, label] = statusOf(p)
  const img = photoOf(p)
  const fam = famOf(p)
  const vol = volumeOf(p.name)
  const pic = useRef<HTMLSpanElement>(null)
  const buy = () => { add(p.id, false); flyToBag(pic.current?.querySelector('img') ?? null); toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) }) }
  return (
    <li className={`tc is-${st}`} style={{ '--i': Math.min(i, 8) } as CSSProperties}>
      <Link to={`/produto/${p.id}`} className="tc-link">
        <span className="tc-hd"><span>{p.brand}</span><span>{vol ? `${vol} ml` : ''}</span></span>
        <span className="tc-ph" ref={pic}>
          {img && <SizedImg src={img} size={480} width={480} height={480} alt={`${p.brand} ${p.name}`} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />}
          {st !== 'go' && <em className={`tc-tag is-${st}`}>{label}</em>}
        </span>
        <span className="tc-perf" aria-hidden="true" />
        <span className="tc-body">
          <small>{fam}</small>
          <b>{shortName(p.name)}</b>
          {p.notes?.length ? <span className="tc-meta">{p.notes.slice(0, 3).join(' · ')}</span> : null}
        </span>
      </Link>
      <span className="tc-foot">
        <span className="tc-fare"><small>Preço</small>{p.old_price && p.old_price > p.price && <s>{brl(p.old_price)}</s>}<b>{brl(p.price)}</b></span>
        {st !== 'off' ? <button type="button" className="tc-add" aria-label={`Adicionar ${p.name} à sacola`} onClick={buy}>Adicionar</button> : <span className="tc-off">Esgotado</span>}
      </span>
    </li>
  )
}

export function DepartureBoard({ items, empty }: { items: Product[]; empty?: React.ReactNode }) {
  if (!items.length) return <>{empty}</>
  return <ul className="tc-grid">{items.map((p, i) => <TicketCard key={p.id} p={p} i={i} />)}</ul>
}

/** Título com letras de painel de aeroporto que giram até parar. */
export function FlapTitle({ text, as: Tag = 'h2', id }: { text: string; as?: 'h1' | 'h2'; id?: string }) {
  return (
    <Tag className="eb-flap" id={id} aria-label={text}>
      {[...text].map((c, i) => <span key={i} aria-hidden="true" className={c === ' ' ? 'sp' : undefined} style={{ '--i': i } as CSSProperties}>{c === ' ' ? ' ' : c}</span>)}
    </Tag>
  )
}

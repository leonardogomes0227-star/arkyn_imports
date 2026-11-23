import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import SizedImg from '../SizedImg'
import { useToast } from '../Toast'
import { photoOf } from '../../lib/cutouts'
import { brl, useStore } from '../../lib/store'
import type { Product } from '../../lib/types'
import { famOf, flightOf, gateOf, shortName, statusOf, volumeOf } from './flight'

/** Uma linha do painel de partidas: foto, nome, casa e família, portão, tarifa e status. */
export function DepartureRow({ p, i = 0 }: { p: Product; i?: number }) {
  const { add, setOpen } = useStore()
  const { toast } = useToast()
  const [st, label] = statusOf(p)
  const img = photoOf(p)
  const fam = famOf(p)
  const vol = volumeOf(p.name)
  const buy = () => { add(p.id, false); toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) }) }
  return (
    <li className={`eb-row is-${st}`} style={{ '--i': Math.min(i, 12) } as CSSProperties}>
      <Link to={`/produto/${p.id}`} className="eb-row-link">
        <span className="eb-row-img">{img && <SizedImg src={img} size={160} width={160} height={160} alt="" loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />}</span>
        <span className="eb-row-main">
          <b>{shortName(p.name)}</b>
          <small>{p.brand}{fam && <> · {fam}</>}{vol && <> · {vol} ml</>}</small>
        </span>
        <span className="eb-row-gate" aria-label={`Voo ${flightOf(p.id)}, portão ${gateOf(p)}`}><i>{flightOf(p.id)}</i><em>{gateOf(p)}</em></span>
        <span className="eb-row-fare">{p.old_price && p.old_price > p.price && <s>{brl(p.old_price)}</s>}{brl(p.price)}</span>
        <span className={`eb-st is-${st}`}>{label}</span>
      </Link>
      {st !== 'off' && <button type="button" className="eb-row-add" aria-label={`Adicionar ${p.name} à sacola`} onClick={buy}><span aria-hidden="true">+</span></button>}
    </li>
  )
}

export function DepartureBoard({ items, empty }: { items: Product[]; empty?: React.ReactNode }) {
  if (!items.length) return <>{empty}</>
  return (
    <div className="eb-board">
      <div className="eb-board-head" aria-hidden="true"><span>Perfume</span><span>Voo · Portão</span><span>Tarifa</span><span>Status</span></div>
      <ul className="eb-rows">{items.map((p, i) => <DepartureRow key={p.id} p={p} i={i} />)}</ul>
    </div>
  )
}

/** Título com letras de painel de aeroporto que giram até parar. */
export function FlapTitle({ text, as: Tag = 'h2', id }: { text: string; as?: 'h1' | 'h2'; id?: string }) {
  return (
    <Tag className="eb-flap" id={id} aria-label={text}>
      {[...text].map((c, i) => <span key={i} aria-hidden="true" className={c === ' ' ? 'sp' : undefined} style={{ '--i': i } as CSSProperties}>{c === ' ' ? ' ' : c}</span>)}
    </Tag>
  )
}

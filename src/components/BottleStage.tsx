import { Link } from 'react-router-dom'
import { photoOf } from '../lib/cutouts'
import { PYRAMIDS } from '../lib/pyramids'
import type { Product } from '../lib/types'
import { noteImg, tiersOf } from './NotePyramid'

export interface StageNote { note: string; img: string; tier?: string }

/** Até 3 ingredientes com foto real, um de cada camada quando dá. Só rotula "Saída/Corpo/Fundo" se a marca confirmou a pirâmide. */
export function stageNotes(p: Pick<Product, 'id' | 'notes'>, max = 3): StageNote[] {
  const t = tiersOf(p), official = !!PYRAMIDS[p.id], names = ['Saída', 'Corpo', 'Fundo']
  const out: StageNote[] = []
  for (let i = 0; i < 3; i++) {
    const n = t[i].find(x => noteImg(x) && !out.some(o => o.note === x))
    if (n) out.push({ note: n, img: noteImg(n)!, tier: official ? names[i] : undefined })
  }
  for (const n of t.flat()) if (out.length < max && noteImg(n) && !out.some(o => o.note === n)) out.push({ note: n, img: noteImg(n)! })
  return out.slice(0, max)
}

/** Frasco grande sobre um disco claro, com as fotos dos ingredientes ao redor. */
export default function BottleStage({ p }: { p: Product }) {
  const notes = stageNotes(p), photo = photoOf(p)
  return (
    <div className="bs">
      <span className="bs-disc" aria-hidden="true" />
      {photo && <img className="bs-bottle" src={photo} alt={`${p.brand} ${p.name}`} width="540" height="1200" />}
      {notes.map((n, i) => (
        <Link key={n.note} to={`/catalogo?q=${encodeURIComponent(n.note)}`} className={`bs-ing bs-i${i}`}>
          <img src={n.img} alt="" width="160" height="160" loading="lazy" decoding="async" />
          <span>{n.tier ? `${n.tier} · ` : ''}{n.note}</span>
        </Link>
      ))}
    </div>
  )
}

/** Faixa pequena de ingredientes (página do produto). */
export function IngredientRow({ p }: { p: Product }) {
  const notes = stageNotes(p, 4)
  if (!notes.length) return null
  return (
    <div className="ing-row">
      <p>De que é feito</p>
      <ul>{notes.map(n => <li key={n.note}><Link to={`/catalogo?q=${encodeURIComponent(n.note)}`}><img src={n.img} alt="" width="160" height="160" loading="lazy" decoding="async" /><span>{n.note}</span></Link></li>)}</ul>
    </div>
  )
}

/** Bolinhas de ingredientes no card de produto. */
export function IngredientDots({ p }: { p: Product }) {
  const notes = stageNotes(p, 3)
  if (!notes.length) return null
  return <span className="ing-dots" title={notes.map(n => n.note).join(', ')} aria-hidden="true">{notes.map(n => <img key={n.note} src={n.img} alt="" width="40" height="40" loading="lazy" decoding="async" />)}<em>{notes.map(n => n.note).join(' · ')}</em></span>
}

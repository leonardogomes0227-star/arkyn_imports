import type { CSSProperties } from 'react'
import { PYRAMIDS } from '../lib/pyramids'
import { groupOf } from '../lib/noteGroups'
import type { Product } from '../lib/types'
import { NOTE_FILES } from '../lib/noteImgs'

// Pirâmide olfativa no estilo de catálogo de perfumaria: três camadas com a foto de cada ingrediente,
// e ao lado o nome da camada ligado por uma linha pontilhada.
// Usa a pirâmide oficial quando cadastrada; senão distribui as notas pela família
// (cítricas e frutas na saída, flores e especiarias no corpo, doces e madeiras no fundo).
const TIER_OF: Record<string, 0 | 1 | 2> = { citricas: 0, frutas: 0, flores: 1, especiarias: 1, doces: 2, madeiras: 2 }

export function tiersOf(p: Pick<Product, 'id' | 'notes'>): [string[], string[], string[]] {
  const off = PYRAMIDS[p.id]
  if (off) return [off.top, off.heart, off.base]
  const t: [string[], string[], string[]] = [[], [], []]
  for (const n of p.notes ?? []) t[TIER_OF[groupOf(n).id] ?? 1].push(n)
  for (let i = 0; i < 3; i++) if (!t[i].length) { const from = [0, 1, 2].filter(j => j !== i).sort((a, b) => t[b].length - t[a].length)[0]; if (t[from].length > 1) t[i].push(t[from].pop()!) }
  return t
}

// Fotos dos ingredientes (public/notas). Nota sem foto aparece só pelo nome.
const slug = (n: string) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const ALIAS: Record<string, string> = { 'madeira-ambar': 'ambar', 'limao-siciliano': 'limao', 'praline': 'pralina' }
const NOTE_IMGS = new Set<string>(NOTE_FILES)
export const noteImg = (n: string) => { const s = ALIAS[slug(n)] ?? slug(n); return NOTE_IMGS.has(s) ? `/notas/${s}.webp` : undefined }

const LABELS = ['notas de saída', 'notas de corpo', 'notas de fundo']
const HINTS = ['Os primeiros minutos', 'Algumas horas depois', 'O que fica na pele']

function Tier({ notes, i, mini }: { notes: string[]; i: number; mini: boolean }) {
  const pics = notes.map(n => [n, noteImg(n)] as const).filter(([, s]) => s).slice(0, [2, 3, 4][i] - (mini && i ? 1 : 0))
  return (
    <div className={`np-tier np-t${i}`} style={{ '--i': i } as CSSProperties}>
      <div className="np-shape">
        {pics.length ? (
          <div className="np-pics">{pics.map(([n, s], k) => <img key={n} src={s} alt={n} width="200" height="200" loading="lazy" decoding="async" style={{ '--k': k - (pics.length - 1) / 2 } as CSSProperties} />)}</div>
        ) : (
          <div className="np-words">{notes.join(' · ')}</div>
        )}
      </div>
      <div className="np-side">
        <i className="np-dots" aria-hidden="true" />
        <div>
          <b>{LABELS[i]}</b>
          <span>{notes.join(', ')}</span>
          {!mini && <small>{HINTS[i]}</small>}
        </div>
      </div>
    </div>
  )
}

export default function NotePyramid({ p, compact = false }: { p: Pick<Product, 'id' | 'notes'>; compact?: boolean }) {
  const tiers = tiersOf(p)
  if (!tiers.some(t => t.length)) return null
  return (
    <div className={compact ? 'np np--mini' : 'np'} aria-label="Pirâmide olfativa">
      {!compact && <p className="np-title">Pirâmide olfativa</p>}
      {tiers.map((notes, i) => <Tier key={i} notes={notes} i={i} mini={compact} />)}
    </div>
  )
}

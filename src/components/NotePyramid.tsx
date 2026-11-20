import { useState, type CSSProperties } from 'react'
import { PYRAMIDS } from '../lib/pyramids'
import { groupOf } from '../lib/noteGroups'
import type { Product } from '../lib/types'
import { NOTE_FILES } from '../lib/noteImgs'

// Pirâmide olfativa em estilo de catálogo de perfumaria: cada camada do triângulo é preenchida
// com fotos reais dos ingredientes; ao lado, o nome da camada ligado por linha pontilhada.
// Passar o mouse (ou tocar) numa camada destaca ela e a legenda correspondente.
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

// Fotos dos ingredientes (public/notas). Nota sem foto entra só pelo nome.
const slug = (n: string) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const ALIAS: Record<string, string> = { 'madeira-ambar': 'ambar', 'limao-siciliano': 'limao', 'praline': 'pralina', 'flores-brancas': 'jasmim' }
const NOTE_IMGS = new Set<string>(NOTE_FILES)
export const noteImg = (n: string) => { const s = ALIAS[slug(n)] ?? slug(n); return NOTE_IMGS.has(s) ? `/notas/${s}.webp` : undefined }

const LABELS = ['Notas de saída', 'Notas de corpo', 'Notas de fundo']
const HINTS = ['Os primeiros minutos', 'Algumas horas depois', 'O que fica na pele']
const MAX = [1, 2, 3]   // quantas fotos cabem em cada camada (a ponta é estreita)

export default function NotePyramid({ p, compact = false }: { p: Pick<Product, 'id' | 'notes'>; compact?: boolean }) {
  const [on, setOn] = useState<number | null>(null)
  const tiers = tiersOf(p)
  if (!tiers.some(t => t.length)) return null
  const pick = (i: number) => (compact ? undefined : () => setOn(v => (v === i ? null : i)))
  const hover = (i: number | null) => (compact ? undefined : () => setOn(i))
  return (
    <div className={`np${compact ? ' np--mini' : ''}${on !== null ? ' has-on' : ''}`} aria-label="Pirâmide olfativa">
      {!compact && (
        <div className="np-head">
          <p className="np-title">Pirâmide olfativa</p>
          <small>Toque ou passe o mouse em cada camada</small>
        </div>
      )}
      <div className="np-body" onMouseLeave={hover(null)}>
        {tiers.map((notes, i) => {
          const pics = notes.map(n => [n, noteImg(n)] as const).filter((x): x is readonly [string, string] => !!x[1]).slice(0, MAX[i])
          return (
            <div key={i} className={`np-row np-t${i}${on === i ? ' on' : ''}`} style={{ '--i': 2 - i } as CSSProperties}
              onMouseEnter={hover(i)} onClick={pick(i)}>
              <div className="np-tier" role={compact ? undefined : 'button'} tabIndex={compact ? undefined : 0} aria-label={`${LABELS[i]}: ${notes.join(', ')}`}
                onFocus={hover(i)} onKeyDown={compact ? undefined : e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOn(v => (v === i ? null : i)) } }}>
                <div className={`np-fill${pics.length ? '' : ' np-fill--none'}`} style={{ '--g': groupOf(notes[0] ?? '').color } as CSSProperties}>
                  {pics.length
                    ? pics.map(([n, s]) => <img key={n} src={s} alt="" width="520" height="520" loading="lazy" decoding="async" />)
                    : <span>{notes[0] ?? ''}</span>}
                </div>
              </div>
              <i className="np-lead" aria-hidden="true" />
              <div className="np-legend">
                <b>{compact ? LABELS[i].replace('Notas de ', '') : LABELS[i]}</b>
                <span>{notes.join(', ')}</span>
                {!compact && <small>{HINTS[i]}</small>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

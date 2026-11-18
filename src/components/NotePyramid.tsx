import type { CSSProperties } from 'react'
import { PYRAMIDS } from '../lib/pyramids'
import { groupOf } from '../lib/noteGroups'
import type { Product } from '../lib/types'

// Pirâmide olfativa: saída (topo), corpo/coração (meio) e fundo (base).
// Usa a pirâmide oficial quando cadastrada; senão distribui as notas pela família de cada uma,
// como na perfumaria: cítricas e frutas evaporam primeiro, flores e especiarias formam o corpo,
// doces, madeiras e resinas ficam no fundo.
const TIER_OF: Record<string, 0 | 1 | 2> = { citricas: 0, frutas: 0, flores: 1, especiarias: 1, doces: 2, madeiras: 2 }

export function tiersOf(p: Pick<Product, 'id' | 'notes'>): [string[], string[], string[]] {
  const off = PYRAMIDS[p.id]
  if (off) return [off.top, off.heart, off.base]
  const t: [string[], string[], string[]] = [[], [], []]
  for (const n of p.notes ?? []) t[TIER_OF[groupOf(n).id] ?? 1].push(n)
  // nenhum nível vazio: puxa uma nota do nível vizinho mais cheio
  for (let i = 0; i < 3; i++) if (!t[i].length) { const from = [0, 1, 2].filter(j => j !== i).sort((a, b) => t[b].length - t[a].length)[0]; if (t[from].length > 1) t[i].push(t[from].pop()!) }
  return t
}

const LABELS = ['Notas de saída', 'Notas de corpo', 'Notas de fundo']
const HINTS = ['Primeiros minutos', 'Algumas horas', 'O que fica na pele']

export default function NotePyramid({ p, compact = false }: { p: Pick<Product, 'id' | 'notes'>; compact?: boolean }) {
  const tiers = tiersOf(p)
  if (!tiers.some(t => t.length)) return null
  if (compact) return (
    <div className="pyr-mini" aria-label="Pirâmide olfativa">
      <b className="pyr-mini-t">Pirâmide olfativa</b>
      {tiers.map((notes, i) => (
        <div key={i} className={`pyq-row pyq-${i}`} style={{ '--i': i } as CSSProperties}>
          <small>{['Saída', 'Corpo', 'Fundo'][i]}</small>
          <span>{notes.join(' · ')}</span>
        </div>
      ))}
    </div>
  )
  return (
    <div className="pyr" role="list" aria-label="Pirâmide olfativa">
      {tiers.map((notes, i) => (
        <div key={i} className={`pyr-row pyr-${i}`} role="listitem" style={{ '--i': i } as CSSProperties}>
          <span className="pyr-band" aria-hidden="true" />
          <div className="pyr-notes">{notes.map(n => <span key={n} style={{ '--g': groupOf(n).color } as CSSProperties}>{n}</span>)}</div>
          <div className="pyr-label"><b>{LABELS[i]}</b><small>{HINTS[i]}</small></div>
        </div>
      ))}
    </div>
  )
}

import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import SizedImg from './SizedImg'
import { cutoutFor } from '../lib/cutouts'
import { noteColor, noteGradient } from '../lib/noteColors'
import { brl, useStore } from '../lib/store'

// Seção "Escolha pelo cheiro": a página inteira ganha a cor da família escolhida,
// mostra as notas que mais aparecem nela e os perfumes reais do catálogo daquela família.
const FAMS: { id: string; name: string; color: string; line: string }[] = [
  { id: 'doce', name: 'Doce', color: '#7a1f3d', line: 'Baunilha, âmbar e frutas. Aconchegante e envolvente.' },
  { id: 'amadeirado', name: 'Amadeirado', color: '#6b4420', line: 'Madeiras, tabaco e especiarias. Elegante e firme.' },
  { id: 'floral', name: 'Floral', color: '#7a2c66', line: 'Jasmim, flor de laranjeira e rosa. Delicado e marcante.' },
  { id: 'especiado', name: 'Especiado', color: '#8a4012', line: 'Pimenta rosa, açafrão e canela. Quente e intenso.' },
  { id: 'fresco', name: 'Fresco', color: '#1d6156', line: 'Cítricos e ervas. Leve, limpo e para o calor.' },
]

export default function ScentExplorer() {
  const { products } = useStore()
  const fams = FAMS.map(f => {
    const list = products.filter(p => p.stock > 0 && p.tags?.includes(f.id) && (p.category === 'masculino' || p.category === 'feminino'))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(n => freq.set(n, (freq.get(n) ?? 0) + 1)))
    return { ...f, list, notes: [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n) }
  }).filter(f => f.list.length)
  const [sel, setSel] = useState(0)
  if (!fams.length) return null
  const f = fams[Math.min(sel, fams.length - 1)]

  return (
    <section className="sx" style={{ '--fam': f.color } as CSSProperties} aria-labelledby="sx-t">
      <div className="sx-in">
        <h2 id="sx-t" className="sx-h">Escolha pelo cheiro</h2>
        <div className="sx-tabs" role="tablist" aria-label="Famílias olfativas">
          {fams.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === f.id} className={x.id === f.id ? 'on' : ''} style={{ '--c': x.color } as CSSProperties} onClick={() => setSel(i)}>
              {x.name}<small>{x.list.length}</small>
            </button>
          ))}
        </div>

        <div key={f.id} className="sx-body" role="tabpanel">
          <div className="sx-info">
            <b className="sx-name" aria-label={f.name}>{[...f.name].map((ch, i) => <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>{ch}</span>)}</b>
            <p>{f.line}</p>
            <ul className="sx-notes" aria-label="Notas que mais aparecem">
              {f.notes.map((n, i) => <li key={n} style={{ '--c': noteColor(n)[1], '--i': i } as CSSProperties}><i style={{ background: noteGradient(n) }} />{n}</li>)}
            </ul>
            <Link to={`/catalogo?tag=${f.id}`} className="hx-btn">Ver os {f.list.length} {f.name.toLowerCase()}s<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
          </div>
          <div className="sx-row">
            {f.list.slice(0, 8).map((p, i) => {
              const src = cutoutFor(p) ?? p.image
              return (
                <Link key={p.id} to={`/produto/${p.id}`} className="sx-p" style={{ '--i': i } as CSSProperties}>
                  <span className="sx-img">{src ? <SizedImg src={src} size={480} width={300} height={300} alt="" loading="lazy" decoding="async" /> : null}</span>
                  <small>{p.brand}</small>
                  <b>{p.name.replace(/\s?\d+\s?ml$/i, '')}</b>
                  <em>{brl(p.price)}</em>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

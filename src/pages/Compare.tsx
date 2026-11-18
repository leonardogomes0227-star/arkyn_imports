import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import SizedImg from '../components/SizedImg'
import { useToast } from '../components/Toast'
import { clearCompare, toggleCompare, useCompare } from '../lib/compare'
import { cutoutFor } from '../lib/cutouts'
import { noteColor, noteGradient } from '../lib/noteColors'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

const FAMILIAS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const GENERO = { masculino: 'Masculino', feminino: 'Feminino', unissex: 'Unissex' } as const
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function Compare() {
  usePageMeta({ title: 'Comparar perfumes | Arkyn Imports', description: 'Compare perfumes lado a lado: preço, família olfativa e notas.', noindex: true })
  const ids = useCompare()
  const { products, add, setOpen } = useStore()
  const { toast } = useToast()
  const list = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[]
  if (list.length < 2) {
    return (
      <section className="section ax-empty-page">
        <h1>Compare até 3 perfumes</h1>
        <p className="muted">Toque em “Comparar” nos cartões do catálogo para escolher os perfumes. Aqui você vê preço, família e notas lado a lado.</p>
        <Link to="/catalogo" className="hx-btn">Ver os perfumes</Link>
      </section>
    )
  }
  const best = Math.min(...list.filter(p => p.stock > 0).map(p => p.price))
  const common = list.map(p => p.notes ?? []).reduce((a, b) => a.filter(n => b.includes(n)))
  const vol = (p: Product) => p.name.match(/(\d+)\s?ml/i)?.[1]
  const rows: [string, (p: Product) => React.ReactNode][] = [
    ['Preço', p => <b className={p.stock > 0 && p.price === best && list.length > 1 ? 'cmp-best' : ''}>{brl(p.price)}{p.stock > 0 && p.price === best ? <small>menor preço</small> : null}</b>],
    ['Volume', p => (vol(p) ? `${vol(p)} ml` : '—')],
    ['Público', p => GENERO[p.gender]],
    ['Família', p => (p.tags ?? []).filter(t => FAMILIAS.includes(t)).map(cap).join(' · ') || '—'],
    ['Momento', p => (p.tags ?? []).filter(t => t === 'dia' || t === 'noite').map(cap).join(' · ') || '—'],
    ['Notas', p => (p.notes?.length ? <ul className="cmp-notes">{p.notes.map(n => <li key={n} className={common.includes(n) ? 'shared' : ''} style={{ '--c': noteColor(n)[1] } as CSSProperties}><i style={{ background: noteGradient(n) }} />{n}</li>)}</ul> : '—')],
  ]
  return (
    <section className="section cmp-page">
      <h1>Comparar perfumes</h1>
      <p className="muted">{common.length ? <>Notas em comum ficam destacadas: <b>{common.join(', ')}</b>.</> : 'Nenhuma nota em comum entre esses perfumes.'}</p>
      <div className="cmp-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th scope="col"><button type="button" className="link" onClick={clearCompare}>Limpar comparação</button></th>
              {list.map(p => {
                const src = cutoutFor(p) ?? p.image
                return (
                  <th scope="col" key={p.id}>
                    <button type="button" className="cmp-x" aria-label={`Remover ${p.name}`} onClick={() => toggleCompare(p.id)}>×</button>
                    <Link to={`/produto/${p.id}`} className="cmp-img">{src ? <SizedImg src={src} size={480} width={260} height={260} alt={`${p.brand} ${p.name}`} /> : null}</Link>
                    <small>{p.brand}</small>
                    <Link to={`/produto/${p.id}`}><h2>{p.name}</h2></Link>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, cell]) => <tr key={label}><th scope="row">{label}</th>{list.map(p => <td key={p.id}>{cell(p)}</td>)}</tr>)}
            <tr className="cmp-act">
              <th scope="row" />
              {list.map(p => (
                <td key={p.id}>
                  {p.stock > 0
                    ? <button type="button" className="btn" onClick={() => { add(p.id, false); toast(`${p.name} adicionado à sacola`, { label: 'Ver sacola', run: () => setOpen(true) }) }}>Adicionar à sacola</button>
                    : <span className="muted">Indisponível no momento</span>}
                  <Link to={`/produto/${p.id}`} className="btn ghost">Ver perfume</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { noteImg, tiersOf } from './NotePyramid'

/** "Escolha pelo ingrediente": os ingredientes com foto que mais aparecem nos perfumes da loja. */
export default function IngredientStrip() {
  const { products } = useStore()
  const count = new Map<string, number>()
  for (const p of products) if (p.stock > 0 && p.active !== false) for (const n of new Set(tiersOf(p).flat())) if (noteImg(n)) count.set(n, (count.get(n) ?? 0) + 1)
  const top = [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12)
  if (top.length < 4) return null
  return (
    <section className="istrip" aria-labelledby="is-t">
      <div className="hm-head"><div><p className="hm-eyebrow">Notas olfativas</p><h2 id="is-t">Escolha pelo ingrediente</h2></div></div>
      <ul>{top.map(([n, c]) => (
        <li key={n}><Link to={`/catalogo?q=${encodeURIComponent(n)}`}><img src={noteImg(n)} alt="" width="160" height="160" loading="lazy" decoding="async" /><b>{n}</b><small>{c} {c === 1 ? 'perfume' : 'perfumes'}</small></Link></li>
      ))}</ul>
    </section>
  )
}

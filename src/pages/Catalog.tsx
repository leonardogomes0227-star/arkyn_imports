import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'

const tabs: [Category | 'todos', string][] = [
  ['todos', 'Todos'], ['masculino', 'Masculinos'], ['feminino', 'Femininos'], ['splash', 'Splash'], ['skincare', 'Skincare'],
]

export default function Catalog() {
  const { products } = useStore()
  const [tab, setTab] = useState<Category | 'todos'>('todos')
  const [q, setQ] = useState('')
  const list = products.filter(p => (tab === 'todos' || p.category === tab) && `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <section className="section">
      <h2>Catálogo</h2>
      <div className="filters">
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'chip on' : 'chip'} onClick={() => setTab(k)}>{l}</button>)}
        <input placeholder="Buscar perfume..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
      {!list.length && <p className="muted">Nenhum produto encontrado.</p>}
    </section>
  )
}

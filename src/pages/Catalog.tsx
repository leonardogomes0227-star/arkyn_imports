import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'

const tabs: [Category | 'todos', string][] = [
  ['todos', 'Todos'], ['masculino', 'Masculinos'], ['feminino', 'Femininos'], ['splash', 'Splash'], ['skincare', 'Skincare'],
]

export default function Catalog() {
  const { products } = useStore()
  const [sp] = useSearchParams()
  const [tab, setTab] = useState<Category | 'todos'>((sp.get('cat') as Category) || 'todos')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('')
  const list = products.filter(p => (tab === 'todos' || p.category === tab) && `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : Number(!!b.image) - Number(!!a.image))
  return (
    <section className="section">
      <h2>Catálogo</h2>
      <div className="filters">
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'chip on' : 'chip'} onClick={() => setTab(k)}>{l}</button>)}
        <input placeholder="Buscar perfume ou marca..." value={q} onChange={e => setQ(e.target.value)} />
        <select value={sort} onChange={e => setSort(e.target.value)}><option value="">Ordenar</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option></select>
      </div>
      <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
      {!list.length && <p className="muted">Nenhum produto encontrado.</p>}
    </section>
  )
}

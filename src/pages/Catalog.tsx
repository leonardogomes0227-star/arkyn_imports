import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'

const tabs: [Category | 'todos', string][] = [
  ['todos', 'Todos'], ['masculino', 'Masculinos'], ['feminino', 'Femininos'], ['splash', 'Splash'], ['skincare', 'Skincare'],
]
const PERFIS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const OCASIAO: Record<string, string> = { calor: 'fresco' } // "Calor e praia" usa o perfil fresco

export default function Catalog() {
  const { products } = useStore()
  const [sp] = useSearchParams()
  const [tab, setTab] = useState<Category | 'todos'>((sp.get('cat') as Category) || 'todos')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('')
  const [brand, setBrand] = useState('')
  const [tag, setTag] = useState(OCASIAO[sp.get('tag') ?? ''] ?? sp.get('tag') ?? '')
  const [max, setMax] = useState(0)
  const [stockOnly, setStockOnly] = useState(false)

  const base = products.filter(p => (tab === 'todos' || p.category === tab) && `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase()))
  const brands = [...new Set(base.map(p => p.brand))].sort()
  const count = (f: (p: (typeof products)[number]) => boolean) => base.filter(f).length

  const list = base
    .filter(p => (!brand || p.brand === brand) && (!tag || p.tags?.includes(tag)) && (!max || p.price <= max) && (!stockOnly || p.stock > 0))
    .sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : sort === 'az' ? a.name.localeCompare(b.name) : Number(!!b.image) - Number(!!a.image))

  return (
    <section className="section">
      <h2>Catálogo</h2>
      <div className="filters">
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'chip on' : 'chip'} onClick={() => { setTab(k); setBrand('') }}>{l}</button>)}
        <input placeholder="Buscar perfume ou marca..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="facets">
        <select value={brand} onChange={e => setBrand(e.target.value)}>
          <option value="">Todas as marcas</option>
          {brands.map(b => <option key={b} value={b}>{b} ({count(p => p.brand === b)})</option>)}
        </select>
        <select value={tag} onChange={e => setTag(e.target.value)}>
          <option value="">Qualquer perfil</option>
          {PERFIS.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)} ({count(p => !!p.tags?.includes(t))})</option>)}
        </select>
        <select value={max} onChange={e => setMax(Number(e.target.value))}>
          <option value={0}>Qualquer preço</option><option value={200}>Até R$ 200</option><option value={300}>Até R$ 300</option><option value={400}>Até R$ 400</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Destaque</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option><option value="az">A–Z</option>
        </select>
        <label><input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} /> Só em estoque</label>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>{list.length} produto{list.length === 1 ? '' : 's'}</p>
      <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
      {!list.length && <p className="muted">Nenhum produto encontrado com esses filtros.</p>}
    </section>
  )
}

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'
import type { Category, Product } from '../lib/types'

const CATS: [Category, string][] = [['masculino', 'Perfumes masculinos'], ['feminino', 'Perfumes femininos'], ['splash', 'Splash e miniaturas'], ['skincare', 'Skincare']]
const PERFIS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const OCASIAO: Record<string, string> = { calor: 'fresco' }
const PRICES: [number, string][] = [[200, 'Até R$ 200'], [300, 'Até R$ 300'], [400, 'Até R$ 400']]
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function Catalog() {
  const { products } = useStore()
  const [sp] = useSearchParams()
  const [cat, setCat] = useState<string>(sp.get('cat') ?? '')
  const [brand, setBrand] = useState(sp.get('brand') ?? '')
  const [tag, setTag] = useState(OCASIAO[sp.get('tag') ?? ''] ?? sp.get('tag') ?? '')
  const [max, setMax] = useState(0)
  const [stockOnly, setStockOnly] = useState(false)
  const [sort, setSort] = useState('')
  const [open, setOpen] = useState(false)
  const q = sp.get('q') ?? ''

  const matches = (p: Product, skip?: string) =>
    (skip === 'cat' || !cat || p.category === cat) && (skip === 'brand' || !brand || p.brand === brand) &&
    (skip === 'tag' || !tag || !!p.tags?.includes(tag)) && (skip === 'max' || !max || p.price <= max) &&
    (!stockOnly || p.stock > 0) && `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase())
  const count = (skip: string, f: (p: Product) => boolean) => products.filter(p => matches(p, skip) && f(p)).length
  const list = products.filter(p => matches(p)).sort((a, b) =>
    sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : sort === 'az' ? a.name.localeCompare(b.name) : Number(!!b.image) - Number(!!a.image))
  const brands = [...new Set(products.map(p => p.brand))].sort()
  const title = q ? `Resultados para “${q}”` : CATS.find(c => c[0] === cat)?.[1] ?? 'Todos os perfumes'
  const any = cat || brand || tag || max || stockOnly

  const opt = (on: boolean, label: string, n: number, click: () => void) =>
    <button key={label} className={on ? 'fopt on' : 'fopt'} onClick={click} disabled={!n && !on}>{label} <span>({n})</span></button>

  return (
    <section className="section">
      <p className="crumbs">Início / {title}</p>
      <div className="shop">
        <aside className={open ? 'side on' : 'side'}>
          <div className="side-head"><b>Filtros</b>{any && <button className="link" onClick={() => { setCat(''); setBrand(''); setTag(''); setMax(0); setStockOnly(false) }}>Limpar tudo</button>}</div>
          <h4>Categoria</h4>{CATS.map(([k, l]) => opt(cat === k, l, count('cat', p => p.category === k), () => setCat(cat === k ? '' : k)))}
          <h4>Família olfativa</h4>{PERFIS.map(t => opt(tag === t, cap(t), count('tag', p => !!p.tags?.includes(t)), () => setTag(tag === t ? '' : t)))}
          <h4>Marca</h4>{brands.map(b => opt(brand === b, b, count('brand', p => p.brand === b), () => setBrand(brand === b ? '' : b)))}
          <h4>Preço</h4>{PRICES.map(([v, l]) => opt(max === v, l, count('max', p => p.price <= v), () => setMax(max === v ? 0 : v)))}
          <label className="fchk"><input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} /> Só em estoque</label>
          <button className="btn round side-close" onClick={() => setOpen(false)}>Ver {list.length} produtos</button>
        </aside>
        <div className="results">
          <h1 className="page-title">{title}</h1>
          <div className="toolbar">
            <span className="total">Total de <b>{list.length}</b> produtos</span>
            <button className="btn round ghost filters-btn" onClick={() => setOpen(true)}>Filtrar</button>
            <label>Ordenar por
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="">Relevância</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option><option value="az">A–Z</option>
              </select>
            </label>
          </div>
          <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
          {!list.length && <p className="muted">Nenhum produto encontrado. Tente limpar os filtros.</p>}
        </div>
      </div>
    </section>
  )
}

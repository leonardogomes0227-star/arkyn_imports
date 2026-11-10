import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard, { ProductSkeleton } from '../components/ProductCard'
import { CAT_LABEL, matchProduct } from '../lib/search'
import { useStore } from '../lib/store'
import type { Category, Product } from '../lib/types'

const CATS = Object.entries(CAT_LABEL) as [Category, string][]
const PERFIS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const OCASIAO: Record<string, string> = { calor: 'fresco' }
const PRICES: [number, string][] = [[200, 'Até R$ 200'], [300, 'Até R$ 300'], [400, 'Até R$ 400']]
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function Catalog() {
  const { products, ready, settings } = useStore()
  const [sp] = useSearchParams()
  const [cat, setCat] = useState<string>(sp.get('cat') ?? '')
  const [brand, setBrand] = useState(sp.get('brand') ?? '')
  const [tag, setTag] = useState(OCASIAO[sp.get('tag') ?? ''] ?? sp.get('tag') ?? '')
  const [max, setMax] = useState(0)
  const [stockOnly, setStockOnly] = useState(false)
  const [offersOnly, setOffersOnly] = useState(false)
  const [sort, setSort] = useState('')
  const [open, setOpen] = useState(false)
  const q = sp.get('q') ?? ''

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])

  const isOffer = (p: Product) => !!p.old_price && p.old_price > p.price
  const hasOffers = products.some(isOffer)
  const matches = (p: Product, skip?: string) =>
    (skip === 'cat' || !cat || p.category === cat) && (skip === 'brand' || !brand || p.brand === brand) &&
    (skip === 'tag' || !tag || !!p.tags?.includes(tag)) && (skip === 'max' || !max || p.price <= max) &&
    (!stockOnly || p.stock > 0) && (!offersOnly || isOffer(p)) && matchProduct(p, q)
  const count = (skip: string, f: (p: Product) => boolean) => products.filter(p => matches(p, skip) && f(p)).length
  const list = products.filter(p => matches(p)).sort((a, b) =>
    sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : sort === 'az' ? a.name.localeCompare(b.name) : Number(b.stock > 0) - Number(a.stock > 0) || Number(!!b.image) - Number(!!a.image))
  const brands = [...new Set(products.map(p => p.brand))].sort()
  const title = q ? `Resultados para “${q}”` : CATS.find(c => c[0] === cat)?.[1] ?? (brand || tag ? [brand, tag && cap(tag)].filter(Boolean).join(' · ') : 'Todos os perfumes')
  const any = cat || brand || tag || max || stockOnly || offersOnly
  const clear = () => { setCat(''); setBrand(''); setTag(''); setMax(0); setStockOnly(false); setOffersOnly(false) }

  const opt = (on: boolean, label: string, n: number, click: () => void) =>
    <button key={label} type="button" className={on ? 'fopt on' : 'fopt'} aria-pressed={on} onClick={click} disabled={!n && !on}>{label} <span>({n})</span></button>

  const active: [string, () => void][] = [
    ...(cat ? [[CAT_LABEL[cat as Category] ?? cat, () => setCat('')] as [string, () => void]] : []),
    ...(brand ? [[brand, () => setBrand('')] as [string, () => void]] : []),
    ...(tag ? [[cap(tag), () => setTag('')] as [string, () => void]] : []),
    ...(max ? [[`Até R$ ${max}`, () => setMax(0)] as [string, () => void]] : []),
    ...(stockOnly ? [['Só em estoque', () => setStockOnly(false)] as [string, () => void]] : []),
    ...(offersOnly ? [['Ofertas', () => setOffersOnly(false)] as [string, () => void]] : []),
  ]

  return (
    <section className="section catalog">
      <nav className="crumbs" aria-label="Você está em"><Link to="/">Início</Link> / <span aria-current="page">{title}</span></nav>
      <div className="shop">
        <aside className={open ? 'side on' : 'side'} aria-label="Filtros">
          <div className="side-head"><b>Filtros</b>{any && <button type="button" className="link" onClick={clear}>Limpar tudo</button>}<button type="button" className="side-x" aria-label="Fechar filtros" onClick={() => setOpen(false)}>✕</button></div>
          <h4>Categoria</h4>{CATS.map(([k, l]) => opt(cat === k, l, count('cat', p => p.category === k), () => setCat(cat === k ? '' : k)))}
          <h4>Família olfativa</h4>{PERFIS.map(t => opt(tag === t, cap(t), count('tag', p => !!p.tags?.includes(t)), () => setTag(tag === t ? '' : t)))}
          <h4>Marca</h4>{brands.map(b => opt(brand === b, b, count('brand', p => p.brand === b), () => setBrand(brand === b ? '' : b)))}
          <h4>Preço</h4>{PRICES.map(([v, l]) => opt(max === v, l, count('max', p => p.price <= v), () => setMax(max === v ? 0 : v)))}
          <label className="fchk"><input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} /> Só em estoque</label>
          {hasOffers && <label className="fchk"><input type="checkbox" checked={offersOnly} onChange={e => setOffersOnly(e.target.checked)} /> Só ofertas</label>}
          <button type="button" className="btn side-close" onClick={() => setOpen(false)}>Ver {list.length} {list.length === 1 ? 'produto' : 'produtos'}</button>
        </aside>
        <div className="side-scrim" onClick={() => setOpen(false)} />

        <div className="results">
          <h1 className="page-title">{title}</h1>
          <div className="toolbar">
            <span className="total" aria-live="polite">{ready ? <><b>{list.length}</b> {list.length === 1 ? 'produto' : 'produtos'}</> : 'Carregando…'}</span>
            <button type="button" className="btn ghost filters-btn" onClick={() => setOpen(true)}>Filtrar{any ? ` (${active.length})` : ''}</button>
            <label>Ordenar por
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="">Relevância</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option><option value="az">A–Z</option>
              </select>
            </label>
          </div>
          {active.length > 0 && (
            <div className="active-filters" aria-label="Filtros aplicados">
              {active.map(([l, rm]) => <button key={l} type="button" onClick={rm} aria-label={`Remover filtro ${l}`}>{l} <span aria-hidden="true">✕</span></button>)}
              <button type="button" className="link" onClick={clear}>Limpar tudo</button>
            </div>
          )}

          {!ready ? <div className="grid"><ProductSkeleton n={6} /></div> : list.length > 0 ? (
            <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <div className="ax-empty-results">
              <p className="ax-eyebrow">Sem resultados</p>
              <h2>Nenhum perfume encontrado{q ? ` para “${q}”` : ''}</h2>
              <p className="muted">Tente outra palavra ou remova algum filtro. Você também pode explorar por família olfativa.</p>
              <div className="ax-chips">
                {any && <button type="button" className="btn" onClick={clear}>Limpar filtros</button>}
                {PERFIS.map(f => <Link key={f} to={`/catalogo?tag=${f}`}>{cap(f)}</Link>)}
              </div>
              <a className="textlink" href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(q ? `Olá! Procuro: ${q}` : 'Olá! Gostaria de ajuda para escolher um perfume.')}`} target="_blank" rel="noreferrer">Pedir ajuda no WhatsApp</a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

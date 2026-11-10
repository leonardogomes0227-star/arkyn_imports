import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { brl, useStore } from '../lib/store'
import type { Category, Product } from '../lib/types'

const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

function Shelf({ title, to, items }: { title: string; to: string; items: Product[] }) {
  if (!items.length) return null
  return (
    <section className="section">
      <div className="sec-head"><h2>{title}</h2><Link to={to} className="textlink">Ver todos</Link></div>
      <div className="grid shelf">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  )
}

export default function Home() {
  const { products, settings } = useStore()
  const cover = products.find(p => p.id === 'lattafa-afeef-100ml')
  // destaques: os marcados no painel; sem marcação, 2 masculinos + 2 femininos. Prateleiras não repetem.
  const withPhoto = (c: Category) => products.filter(p => p.stock > 0 && p.category === c && !!p.image)
  const masc = withPhoto('masculino'), fem = withPhoto('feminino')
  const flagged = products.filter(p => p.stock > 0 && p.featured).slice(0, 8)
  const featured = flagged.length ? flagged : [masc[4], fem[4], masc[5], fem[5]].filter(Boolean)
  const shown = new Set(featured.map(p => p.id))
  const by = (list: Product[]) => list.filter(p => !shown.has(p.id)).slice(0, 4)
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].sort()
  const n = settings.installments
  const scents = SCENTS.map(t => {
    const list = products.filter(p => p.tags?.includes(t))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1)))
    const notes = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => x)
    return [t, list.length, notes] as [string, number, string[]]
  }).filter(([, c]) => c > 0)

  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div className="hero-txt">
            <span className="hero-k">{cover?.brand ?? 'Lattafa'} · Eau de Parfum 100ml</span>
            <h1>{settings.heroTitle || 'Afeef'}</h1>
            <p>O frasco dos pavões dourados, com pedras coloridas. Peça para presentear ou colecionar.</p>
            {cover && <p className="hero-price">{brl(cover.price)}{n > 1 && <span> · ou {n}x de {brl(cover.price / n)}</span>}</p>}
            <div className="hero-cta">
              <Link to={cover ? `/produto/${cover.id}` : '/catalogo'} className="btn round light">Ver o Afeef</Link>
              <Link to="/catalogo" className="hero-link">Todos os perfumes →</Link>
            </div>
          </div>
          <Link to={cover ? `/produto/${cover.id}` : '/catalogo'} className="hero-ph" aria-label="Lattafa Afeef"><img src="/capa.jpg" alt="Perfume Lattafa Afeef" /></Link>
        </div>
      </section>

      <nav className="rail" aria-label="Marcas">
        {brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}
      </nav>

      <section className="section scents">
        <h2 className="scents-h">Escolha pelo cheiro</h2>
        {scents.map(([t, count, notes]) => (
          <Link key={t} to={`/catalogo?tag=${t}`} className="scent">
            <b>{cap(t)}</b>
            <span className="scent-notes">{notes.join(' · ')}</span>
            <em>{count} perfumes →</em>
          </Link>
        ))}
      </section>

      <Shelf title="Destaques" to="/catalogo" items={featured} />

      <section className="wrap quizband">
        <div><b>Não sabe qual escolher?</b><p>Responda 5 perguntas rápidas e receba 3 indicações para você.</p></div>
        <Link to="/quiz" className="btn round light">Fazer o quiz</Link>
      </section>

      <Shelf title="Perfumes masculinos" to="/catalogo?cat=masculino" items={by(masc)} />
      <Shelf title="Perfumes femininos" to="/catalogo?cat=feminino" items={by(fem)} />

    </>
  )
}

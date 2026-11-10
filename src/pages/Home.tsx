import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'
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
  const { products } = useStore()
  // destaques: os marcados no painel; sem marcação, 2 masculinos + 2 femininos. Prateleiras não repetem.
  const withPhoto = (c: Category) => products.filter(p => p.stock > 0 && p.category === c && !!p.image)
  const masc = withPhoto('masculino'), fem = withPhoto('feminino')
  const flagged = products.filter(p => p.stock > 0 && p.featured).slice(0, 8)
  const featured = flagged.length ? flagged : products.filter(p => p.stock > 0 && !!p.image).slice(0, 8)
  const shown = new Set(featured.map(p => p.id))
  const by = (list: Product[]) => list.filter(p => !shown.has(p.id)).slice(0, 4)
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].sort()
  const scents = SCENTS.map(t => {
    const list = products.filter(p => p.tags?.includes(t))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1)))
    const notes = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => x)
    const thumbs = list.filter(p => p.image).slice(0, 3).map(p => p.image as string)
    return [t, list.length, notes, thumbs] as [string, number, string[], string[]]
  }).filter(([, c]) => c > 0)

  return (
    <>
      <HeroSlider />

      <Shelf title="Destaques" to="/catalogo" items={featured} />

      <nav className="rail" aria-label="Marcas">
        {brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}
      </nav>

      <section className="section scents">
        <div className="sec-head"><h2>Escolha pelo cheiro</h2><Link to="/quiz" className="textlink">Fazer o quiz</Link></div>
        <div className="scent-grid">
          {scents.map(([t, count, notes, thumbs]) => (
            <Link key={t} to={`/catalogo?tag=${t}`} className="scent">
              <span className="scent-th">{thumbs.map(src => <i key={src}><img src={src} alt="" loading="lazy" /></i>)}</span>
              <b>{cap(t)}</b>
              <small>{notes.join(' · ')}</small>
              <em>{count} perfumes →</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap quizband">
        <div><b>Não sabe qual escolher?</b><p>Responda 5 perguntas rápidas e receba 3 indicações para você.</p></div>
        <Link to="/quiz" className="btn round light">Fazer o quiz</Link>
      </section>

      <Shelf title="Perfumes masculinos" to="/catalogo?cat=masculino" items={by(masc)} />
      <Shelf title="Perfumes femininos" to="/catalogo?cat=feminino" items={by(fem)} />

    </>
  )
}

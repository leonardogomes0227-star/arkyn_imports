import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { usePageMeta } from '../lib/seo'
import { useStore } from '../lib/store'

export default function Favorites() {
  const { products, favs } = useStore()
  usePageMeta({ title: 'Favoritos | Arkyn Imports', description: 'Os perfumes que você salvou na Arkyn Imports.', path: '/favoritos', noindex: true })
  const list = favs.flatMap(id => products.filter(p => p.id === id))
  return (
    <section className="section">
      <div className="ax-sec-head"><div><p className="ax-eyebrow">Sua lista</p><h2>Favoritos</h2></div></div>
      {list.length ? (
        <div className="grid shelf">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="ax-empty-page">
          <h1>Nenhum favorito ainda</h1>
          <p className="muted">Toque no coração de um perfume para salvar aqui.</p>
          <Link to="/catalogo" className="btn">Explorar o catálogo</Link>
        </div>
      )}
    </section>
  )
}

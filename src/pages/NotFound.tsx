import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'

export default function NotFound() {
  usePageMeta({ title: 'Página não encontrada | Arkyn Imports', description: 'A página que você procura não existe ou foi movida.', noindex: true })
  return (
    <section className="section ax-empty-page">
      <p className="ax-eyebrow">Erro 404</p>
      <h1>Página não encontrada</h1>
      <p className="muted">O endereço pode ter mudado ou o produto saiu do catálogo.</p>
      <div className="ax-chips" style={{ justifyContent: 'center', marginTop: 22 }}>
        <Link to="/" className="btn">Ir para o início</Link>
        <Link to="/catalogo" className="btn ghost">Ver o catálogo</Link>
      </div>
    </section>
  )
}

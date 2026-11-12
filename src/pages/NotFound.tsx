import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'

export default function NotFound() {
  usePageMeta({ title: 'Página não encontrada | Arkyn Imports', description: 'Esse endereço não existe na Arkyn Imports.', noindex: true })
  return (
    <section className="section ax-empty-page">
      <p className="ax-eyebrow">404</p>
      <h1>Não encontramos essa página</h1>
      <p className="muted">O link pode ter mudado. Volte ao início ou veja os perfumes.</p>
      <div className="ax-chips" style={{ justifyContent: 'center', marginTop: 22 }}>
        <Link to="/" className="btn">Ir para o início</Link>
        <Link to="/catalogo" className="btn ghost">Ver perfumes</Link>
      </div>
    </section>
  )
}

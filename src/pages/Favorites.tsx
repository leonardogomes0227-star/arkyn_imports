import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { usePageMeta } from '../lib/seo'
import { useStore } from '../lib/store'

export default function Favorites() {
  const { products, favs, ready } = useStore()
  const nav = useNavigate()
  usePageMeta({ title: 'Favoritos | Arkyn Imports', description: 'Os perfumes que você salvou na Arkyn Imports.', path: '/favoritos', noindex: true })
  const list = favs.flatMap(id => products.filter(p => p.id === id))

  // Link de "favoritos" compartilhado (WhatsApp, Google): quem abre não tem favoritos salvos.
  // Se esta é a primeira página da visita e a lista está vazia, leva para o começo da loja.
  const firstPage = typeof window !== 'undefined' && (window.history.state?.idx ?? 0) === 0
  useEffect(() => { if (ready && !list.length && firstPage) nav('/', { replace: true }) }, [ready, list.length, firstPage, nav])

  const picks = products.filter(p => p.stock > 0 && !favs.includes(p.id)).sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 4)
  return (
    <section className="section">
      <div className="ax-sec-head"><div><p className="ax-eyebrow">Sua lista</p><h2>Favoritos</h2></div></div>
      {list.length ? (
        <div className="grid shelf">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <>
          <div className="ax-empty-page">
            <h1>Nenhum favorito ainda</h1>
            <p className="muted">Toque no coração de um perfume para salvar aqui. Comece por estes:</p>
          </div>
          <div className="grid shelf">{picks.map(p => <ProductCard key={p.id} p={p} />)}</div>
          <p style={{ textAlign: 'center', marginTop: 28 }}><Link to="/catalogo" className="hx-btn">Ver todos os perfumes</Link></p>
        </>
      )}
    </section>
  )
}

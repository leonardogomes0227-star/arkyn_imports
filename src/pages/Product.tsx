import { Link, useParams } from 'react-router-dom'
import Bottle from '../components/Bottle'
import ProductCard from '../components/ProductCard'
import { brl, useStore } from '../lib/store'

export default function Product() {
  const { id } = useParams()
  const { products, settings, add } = useStore()
  const p = products.find(x => x.id === id)
  if (!p) return <section className="section"><h2>Produto não encontrado</h2><Link to="/catalogo" className="btn">Ver catálogo</Link></section>
  const related = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4)
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no ${p.brand} ${p.name}.`)}`
  return (
    <section className="section">
      <p className="crumbs"><Link to="/catalogo">Catálogo</Link> / {p.brand}</p>
      <div className="pdp">
        <div className="pdp-img">{p.image ? <img src={p.image} alt={p.name} /> : <Bottle id={p.id} brand={p.brand} big />}</div>
        <div className="pdp-info">
          <small>{p.brand}</small>
          <h1>{p.name}</h1>
          <strong className="price">{brl(p.price)}</strong>
          <p className="muted">{p.stock > 0 ? `${p.stock} em estoque` : 'Esgotado'} · Pix ou cartão de crédito</p>
          {!!p.tags?.length && <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>}
          {!!p.notes?.length && <p><b>Notas:</b> {p.notes.join(' · ')}</p>}
          <button className="btn" disabled={p.stock <= 0} onClick={() => add(p.id)}>ADICIONAR AO CARRINHO</button>
          <a className="btn ghost" href={wa} target="_blank" rel="noreferrer">TIRAR DÚVIDA NO WHATSAPP</a>
        </div>
      </div>
      {!!related.length && <>
        <div className="sec-head" style={{ marginTop: 40 }}><h2>COMBINA COM</h2></div>
        <div className="grid">{related.map(r => <ProductCard key={r.id} p={r} />)}</div>
      </>}
    </section>
  )
}

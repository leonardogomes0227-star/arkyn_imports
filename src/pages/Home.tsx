import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'

const steps = [
  ['1', 'Escolha', 'Navegue pelo catálogo e adicione seus perfumes ao carrinho.'],
  ['2', 'Pague', 'Finalize com Pix ou cartão de crédito pelo Mercado Pago.'],
  ['3', 'Receba', 'Retire em Coxim ou receba na sua porta.'],
]

export default function Home() {
  const { products } = useStore()
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Perfumes árabes e importados</p>
        <h1>Sua próxima fragrância favorita está aqui.</h1>
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </section>
      <section className="section">
        <h2>Destaques</h2>
        <div className="grid">{products.slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}</div>
      </section>
      <section className="section">
        <h2>Como comprar</h2>
        <div className="steps">
          {steps.map(([n, t, d]) => <div key={n} className="step"><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'

const cats = [
  ['masculino', 'Perfumes\nMasculinos', '♂'],
  ['feminino', 'Perfumes\nFemininos', '♀'],
  ['splash', 'Splash &\nMiniaturas', '✦'],
  ['skincare', 'Skincare', '◌'],
]
const steps = [
  ['1', 'Escolha', 'Navegue pelo catálogo e adicione seus perfumes ao carrinho.'],
  ['2', 'Pague', 'Finalize com Pix ou cartão de crédito pelo Mercado Pago.'],
  ['3', 'Receba', 'Retire em Coxim ou receba na sua porta.'],
]

export default function Home() {
  const { products, settings } = useStore()
  return (
    <>
      <section className="hero">
        <div className="hero-in">
        <div className="hero-text">
          <small>PERFUMES ÁRABES E IMPORTADOS</small>
          <h1>Fragrâncias que deixam uma marca.</h1>
          <p>Lattafa, Armaf, Maison Alhambra, French Avenue e mais, direto de Coxim - MS.</p>
          <Link to="/catalogo" className="btn dark">EXPLORAR CATÁLOGO →</Link>
        </div>
        <img className="hero-img" src="/logo-full.png" alt="Arkyn Imports" />
        </div>
      </section>

      <section className="cats">
        {cats.map(([k, l, i]) => (
          <Link key={k} to={`/catalogo?cat=${k}`} className="cat"><span>{i}</span>{l.split('\n').map(t => <em key={t}>{t}</em>)}</Link>
        ))}
      </section>

      <section className="section">
        <div className="sec-head"><h2>DESTAQUES</h2><Link to="/catalogo">VER TODOS →</Link></div>
        <div className="grid">{[...products].sort((a, b) => Number(!!b.image) - Number(!!a.image)).slice(0, 10).map(p => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="section promos">
        <div className="promo darkp">
          <small>PERFUMES MASCULINOS</small><h3>Encontre sua assinatura.</h3>
          <p>Asad, Fakhar, Salvo e Liquid Brun: as fragrâncias mais pedidas.</p>
          <Link to="/catalogo?cat=masculino" className="btn light">VER MASCULINOS →</Link>
          <img src="/produtos/lattafa-asad-elixir-100ml.jpg" alt="Lattafa Asad Elixir" loading="lazy" />
        </div>
        <div className="promo beige">
          <small>PERFUMES FEMININOS</small><h3>Presentes que falam por você.</h3>
          <p>Afeef, Atheeri, Tharwah e outras queridinhas.</p>
          <Link to="/catalogo?cat=feminino" className="btn light">VER FEMININOS →</Link>
          <img src="/produtos/lattafa-afeef-100ml.jpg" alt="Lattafa Afeef" loading="lazy" />
        </div>
      </section>

      <section className="section">
        <div className="quiz-cta">
          <div><small>QUIZ</small><h3>Qual é o seu cheiro?</h3><p>Responda 5 perguntas e receba 3 indicações para você.</p></div>
          <Link to="/quiz" className="btn light">FAZER O QUIZ →</Link>
        </div>
      </section>

      <section className="section">
        <div className="sec-head"><h2>COMO COMPRAR</h2></div>
        <div className="steps">
          {steps.map(([n, t, d]) => <div key={n} className="step"><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      <section className="benefits">
        <div><b>Pix e cartão</b><small>Pagamento seguro</small></div>
        <div><b>Retirada em Coxim</b><small>{settings.pickupAddress}</small></div>
        <div><b>Atendimento no WhatsApp</b><small>Tire dúvidas antes de comprar</small></div>
      </section>
    </>
  )
}

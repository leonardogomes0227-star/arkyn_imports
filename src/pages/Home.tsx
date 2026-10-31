import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/store'
import type { Category, Product } from '../lib/types'

const TILES: [string, string, string, string][] = [
  ['/catalogo?cat=masculino', 'Masculinos', '/produtos/maison-alhambra-salvo-elixir-60ml.jpg', 'Salvo Elixir'],
  ['/catalogo?cat=feminino', 'Femininos', '/produtos/lattafa-tharwah-gold-100ml.jpg', 'Tharwah Gold'],
  ['/catalogo?cat=skincare', 'Skincare', '/produtos/celimax-the-vita-a-retinal-shot-15ml.jpg', 'Celimax'],
]
const STEPS = [['Escolha', 'Navegue pela coleção ou faça o quiz.'], ['Pague', 'Pix ou cartão, pelo Mercado Pago.'], ['Receba', 'Retire em Coxim ou receba na sua cidade.']]

function Shelf({ title, to, items }: { title: string; to: string; items: Product[] }) {
  if (!items.length) return null
  return (
    <section className="section wide">
      <div className="sec-head"><h2>{title}</h2><Link to={to} className="textlink">Ver todos →</Link></div>
      <div className="grid">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  )
}

export default function Home() {
  const { products, settings } = useStore()
  const cover = products.find(p => p.id === 'lattafa-afeef-100ml')
  const inStock = products.filter(p => p.stock > 0)
  const rank = (p: Product) => Number(!!p.featured) * 2 + Number(!!p.image)
  const featured = [...inStock].sort((a, b) => rank(b) - rank(a)).slice(0, 8)
  const shown = new Set(featured.map(p => p.id))
  // prateleiras por categoria: primeiro o que ainda não apareceu em destaque
  const by = (c: Category) => inStock.filter(p => p.category === c && !!p.image).sort((a, b) => Number(shown.has(a.id)) - Number(shown.has(b.id)) || rank(b) - rank(a)).slice(0, 4)
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].sort()

  return (
    <>
      <section className="banner">
        <div className="banner-text">
          <p className="eyebrow">Perfumaria árabe e importada · Coxim – MS</p>
          <h1>{settings.heroTitle || <>Seu cheiro, do jeito que você quer <em>ser lembrado.</em></>}</h1>
          <div className="cover-cta">
            <Link to="/quiz" className="btn gold">Descobrir meu perfume</Link>
            <Link to="/catalogo" className="textlink">Ver a coleção →</Link>
          </div>
        </div>
        <figure className="banner-photo">
          <img src="/capa.jpg" alt="Perfume Lattafa Afeef na mão, em frente à prateleira da loja" />
          {cover && <figcaption><Link to={`/produto/${cover.id}`}>{cover.brand} {cover.name} →</Link></figcaption>}
        </figure>
      </section>

      <div className="trust">
        <span>Pix e cartão de crédito</span><span>Retirada em Coxim</span><span>Entrega em cidades selecionadas</span><span>Atendimento pelo WhatsApp</span>
      </div>

      <section className="section wide">
        <div className="tiles">
          {TILES.map(([to, label, img, alt]) => (
            <Link key={label} to={to} className="tile"><img src={img} alt={alt} loading="lazy" /><span>{label}</span></Link>
          ))}
          <Link to="/quiz" className="tile quiztile"><b>Qual é o seu cheiro?</b><span>Faça o quiz →</span></Link>
        </div>
      </section>

      <Shelf title="Em destaque" to="/catalogo" items={featured} />

      <section className="section wide">
        <div className="sec-head"><h2>Compre por marca</h2></div>
        <div className="brands">{brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
      </section>

      <Shelf title="Perfumes masculinos" to="/catalogo?cat=masculino" items={by('masculino')} />
      <Shelf title="Perfumes femininos" to="/catalogo?cat=feminino" items={by('feminino')} />

      <section className="section wide how">
        <div className="sec-head"><h2>Como comprar</h2></div>
        <ol>{STEPS.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}</ol>
      </section>
    </>
  )
}

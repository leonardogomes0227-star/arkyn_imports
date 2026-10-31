import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { IconCard, IconChat, IconStore, IconTruck } from '../components/Icons'
import { useStore } from '../lib/store'
import type { Category, Product } from '../lib/types'

const CATS: [string, string, string, string][] = [
  ['/catalogo?cat=masculino', 'Para ele', 'Perfumes masculinos', '/produtos/lattafa-asad-elixir-100ml.jpg'],
  ['/catalogo?cat=feminino', 'Para ela', 'Perfumes femininos', '/produtos/lattafa-tharwah-gold-100ml.jpg'],
  ['/catalogo?cat=skincare', 'Skincare', 'Cuidados com a pele', '/produtos/celimax-the-vita-a-retinal-shot-15ml.jpg'],
]

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

  return (
    <>
      <section className="wrap">
        <div className="banner">
          <Link to={cover ? `/produto/${cover.id}` : '/catalogo'} className="banner-img"><img src="/capa.jpg" alt="Perfume Lattafa Afeef" /></Link>
          <div className="banner-panel">
            <span className="b-brand">{cover?.brand ?? 'Lattafa'}</span>
            <h1>{settings.heroTitle || <>Afeef<br />by Lattafa</>}</h1>
            <p>Frasco de pavões dourados com pedras coloridas. Uma peça para presentear ou colecionar.</p>
            <Link to={cover ? `/produto/${cover.id}` : '/catalogo'} className="btn round">Confira agora</Link>
          </div>
        </div>
      </section>

      <section className="wrap benefits">
        <div><span className="ic"><IconCard /></span><div><b>{n > 1 ? `Parcele em até ${n}x` : 'Pix e cartão'}</b><small>{n > 1 ? 'no cartão de crédito' : 'pagamento pelo Mercado Pago'}</small></div></div>
        <div><span className="ic"><IconStore /></span><div><b>Retirada em Coxim</b><small>sem custo de frete</small></div></div>
        <div><span className="ic"><IconTruck /></span><div><b>Entrega</b><small>{settings.freeShippingFrom > 0 ? `frete grátis acima de R$ ${settings.freeShippingFrom.toFixed(2).replace('.', ',')}` : 'consulte sua cidade'}</small></div></div>
        <div><span className="ic"><IconChat /></span><div><b>Atendimento</b><small>pelo WhatsApp</small></div></div>
      </section>

      <section className="wrap catcards">
        {CATS.map(([to, title, label, img]) => (
          <Link key={title} to={to} className="catcard">
            <div className="cc-img"><img src={img} alt={label} loading="lazy" /><b>{title}</b><span>Compre agora</span></div>
            <strong>{label}</strong>
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

      <section className="section">
        <div className="sec-head"><h2>Marcas</h2></div>
        <div className="brands">{brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
      </section>
    </>
  )
}

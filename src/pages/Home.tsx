import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { brl, useStore } from '../lib/store'
import type { Category } from '../lib/types'

const GROUPS: [Category, string][] = [['masculino', 'Masculinos'], ['feminino', 'Femininos'], ['splash', 'Splash e miniaturas'], ['skincare', 'Skincare']]
const STEPS = [
  ['Escolha', 'Navegue pela coleção ou faça o quiz e monte a sua sacola.'],
  ['Pague', 'Pix ou cartão de crédito, em ambiente seguro do Mercado Pago.'],
  ['Receba', 'Retire em Coxim ou receba onde estiver, conforme a cidade.'],
]
const ASK: [string, string][] = [['masculino', 'Masculino'], ['feminino', 'Feminino'], ['any', 'Tanto faz'], ['present', 'Presente']]

export default function Home() {
  const { products, settings } = useStore()
  const cover = products.find(p => p.id === 'lattafa-afeef-100ml')
  const featured = [...products].filter(p => p.stock > 0)
    .sort((a, b) => Number(!!b.featured) * 2 + Number(!!b.image) - (Number(!!a.featured) * 2 + Number(!!a.image))).slice(0, 8)

  return (
    <>
      <section className="cover">
        <div className="cover-text">
          <p className="eyebrow">Perfumaria árabe e importada · Coxim – MS</p>
          <h1>{settings.heroTitle || <>Seu cheiro, do jeito que você quer <em>ser lembrado.</em></>}</h1>
          <p className="lead">Lattafa, Armaf, Maison Alhambra, French Avenue e outras casas, com Pix ou cartão e retirada em Coxim.</p>
          <div className="cover-cta">
            <Link to="/quiz" className="btn gold">Descobrir meu perfume</Link>
            <Link to="/catalogo" className="textlink">Ver a coleção →</Link>
          </div>
        </div>
        <figure className="cover-photo">
          <img src="/capa.jpg" alt="Perfume Lattafa Afeef na mão, em frente à prateleira da loja" />
          {cover && <figcaption><Link to={`/produto/${cover.id}`}><span>{cover.brand} {cover.name}</span><b>{brl(cover.price)} →</b></Link></figcaption>}
        </figure>
      </section>

      <section className="section wide">
        <div className="sec-head"><h2>Em destaque</h2><Link to="/catalogo" className="textlink">Ver os {products.length} perfumes →</Link></div>
        <div className="grid">{featured.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="ask">
        <div className="ask-in">
          <div>
            <h2>Qual é o seu cheiro?</h2>
            <p>Cinco perguntas rápidas e três indicações da coleção. Comece por aqui:</p>
          </div>
          <div className="ask-q">
            <span>Pra quem é o perfume?</span>
            <div>{ASK.map(([v, l]) => <Link key={v} to={`/quiz?p=${v}`}>{l}</Link>)}</div>
          </div>
        </div>
      </section>

      <section className="section wide">
        <div className="sec-head"><h2>Tabela de preços</h2><span className="muted">Valores de hoje, à vista no Pix ou no cartão</span></div>
        <div className="pricelist">
          {GROUPS.map(([cat, title]) => {
            const list = products.filter(p => p.category === cat && p.active !== false).sort((a, b) => a.brand.localeCompare(b.brand))
            return list.length ? (
              <div key={cat}>
                <h3>{title}</h3>
                {list.map(p => (
                  <Link key={p.id} to={`/produto/${p.id}`} className="prow">
                    <span className="pn"><i>{p.brand}</i> {p.name}</span>
                    <span className="dots" />
                    <b>{p.stock > 0 ? brl(p.price) : 'Esgotado'}</b>
                  </Link>
                ))}
              </div>
            ) : null
          })}
        </div>
      </section>

      <section className="section wide how">
        <div className="sec-head"><h2>Como comprar</h2></div>
        <ol>
          {STEPS.map(([t, d], i) => <li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { IconCard, IconChat, IconStore, IconTruck } from '../components/Icons'
import { brl, useStore } from '../lib/store'
import type { Category, Product } from '../lib/types'

const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

// Recortes sem fundo disponíveis (public/hero). Para os demais, usa a foto do produto.
const CUTOUTS = new Set(['french-avenue-vulcan-feu-100ml', 'lattafa-afeef-100ml', 'armaf-club-de-nuit-maleka-105ml', 'lattafa-asad-elixir-100ml', 'maison-alhambra-pink-eclipse-100ml', 'maison-alhambra-victorioso-nero-100ml'])
// Visual de cada categoria real do catálogo (produto de capa preferido + cores)
const CATS: { cat: Category; title: string; prefer: string; a: string; b: string; dark: boolean }[] = [
  { cat: 'masculino', title: 'Masculinos', prefer: 'lattafa-asad-elixir-100ml', a: '#17181c', b: '#363943', dark: true },
  { cat: 'feminino', title: 'Femininos', prefer: 'maison-alhambra-pink-eclipse-100ml', a: '#f6e0dc', b: '#e7bcb6', dark: false },
  { cat: 'splash', title: 'Splash e miniaturas', prefer: '', a: '#2b2620', b: '#4a4034', dark: true },
  { cat: 'skincare', title: 'Skincare', prefer: 'celimax-the-vita-a-retinal-shot-15ml', a: '#efe6d3', b: '#ddd0b3', dark: false },
]

function SecHead({ eyebrow, title, to, link = 'Ver todos' }: { eyebrow?: string; title: string; to?: string; link?: string }) {
  return (
    <div className="ax-sec-head">
      <div>{eyebrow && <p className="ax-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>
      {to && <Link to={to} className="textlink">{link}</Link>}
    </div>
  )
}

function Shelf({ eyebrow, title, to, items }: { eyebrow?: string; title: string; to: string; items: Product[] }) {
  if (!items.length) return null
  return (
    <Reveal as="section" className="section">
      <SecHead eyebrow={eyebrow} title={title} to={to} />
      <div className="grid shelf">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </Reveal>
  )
}

export default function Home() {
  const { products, settings } = useStore()
  const live = products.filter(p => p.stock > 0)
  const withPhoto = (c: Category) => live.filter(p => p.category === c && !!p.image)
  const masc = withPhoto('masculino'), fem = withPhoto('feminino')

  // Vitrines: só aparecem quando os dados sustentam. "Mais vendidos" e "Novidades" ficam de fora
  // porque o cadastro não guarda vendas por produto nem data de cadastro.
  const flagged = live.filter(p => p.featured).slice(0, 8)
  const featured = flagged.length ? flagged : live.filter(p => !!p.image).slice(0, 8)
  const offers = live.filter(p => !!p.old_price && p.old_price > p.price).slice(0, 8)
  const shown = new Set([...featured, ...offers].map(p => p.id))
  const by = (list: Product[]) => list.filter(p => !shown.has(p.id)).slice(0, 4)
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].sort()

  const cats = CATS.map(c => {
    const inCat = products.filter(p => p.category === c.cat)
    const pick = inCat.find(p => p.id === c.prefer && p.image) ?? inCat.find(p => p.image)
    const src = pick ? (CUTOUTS.has(pick.id) ? `/hero/${pick.id}.webp` : pick.image!) : ''
    return { ...c, count: inCat.length, src, cut: !!pick && CUTOUTS.has(pick.id) }
  }).filter(c => c.count > 0)

  const scents = SCENTS.map(t => {
    const list = products.filter(p => p.tags?.includes(t))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1)))
    const notes = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => x)
    const thumbs = list.filter(p => p.image).slice(0, 3).map(p => p.image as string)
    return [t, list.length, notes, thumbs] as [string, number, string[], string[]]
  }).filter(([, c]) => c > 0)

  const n = settings.installments
  const benefits: [JSX.Element, string, string][] = [
    [<IconCard key="c" size={26} />, n > 1 ? `Parcele em até ${n}x` : 'Pix e cartão', 'Pagamento seguro pelo Mercado Pago'],
    [<IconStore key="s" size={26} />, 'Retirada em Coxim', 'Sem custo de frete'],
    [<IconTruck key="t" size={26} />, 'Entrega', settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}` : 'Consulte a sua cidade'],
    [<IconChat key="w" size={26} />, 'Atendimento', 'Direto pelo WhatsApp'],
  ]

  return (
    <>
      <HeroSlider />

      <Reveal as="section" className="ax-benefits" >
        {benefits.map(([ic, t, s]) => <div key={t}>{ic}<span><b>{t}</b><small>{s}</small></span></div>)}
      </Reveal>

      {cats.length > 0 && (
        <Reveal as="section" className="section">
          <SecHead eyebrow="Explore" title="Compre por categoria" to="/catalogo" link="Ver tudo" />
          <div className="cat-grid">
            {cats.map((c, i) => (
              <Link key={c.cat} to={`/catalogo?cat=${c.cat}`} className={`cat-tile${c.dark ? ' dk' : ''}`} style={{ '--a': c.a, '--b': c.b, '--i': i } as React.CSSProperties}>
                {c.src && <img src={c.src} alt="" loading="lazy" className={c.cut ? 'cut' : 'photo'} />}
                <span className="cat-txt">
                  <small>{c.count} {c.count === 1 ? 'produto' : 'produtos'}</small>
                  <b>{c.title}</b>
                </span>
                <span className="cat-go" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <Shelf eyebrow="Seleção da casa" title="Destaques" to="/catalogo" items={featured} />
      <Shelf eyebrow="Condições especiais" title="Ofertas" to="/catalogo" items={offers} />

      <nav className="rail" aria-label="Marcas">
        <span className="ax-eyebrow">Marcas</span>
        {brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}
      </nav>

      <section className="ax-band">
        <div className="ax-band-in">
          <Reveal className="ax-band-head">
            <div><p className="ax-eyebrow">Famílias olfativas</p><h2>Escolha pelo cheiro que você gosta</h2></div>
            <p className="ax-band-p">Cada família reúne os perfumes do catálogo com aquele perfil. Veja as notas mais presentes e explore.</p>
            <Link to="/quiz" className="btn light">Fazer o quiz</Link>
          </Reveal>
          <div className="scent-grid">
            {scents.map(([t, count, notes, thumbs], i) => (
              <Reveal key={t} delay={i * 70}>
                <Link to={`/catalogo?tag=${t}`} className="scent">
                  <span className="scent-th">{thumbs.map(src => <i key={src}><img src={src} alt="" loading="lazy" /></i>)}</span>
                  <b>{cap(t)}</b>
                  <small>{notes.join(' · ')}</small>
                  <em>{count} perfumes →</em>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Shelf eyebrow="Para ele" title="Perfumes masculinos" to="/catalogo?cat=masculino" items={by(masc)} />
      <Shelf eyebrow="Para ela" title="Perfumes femininos" to="/catalogo?cat=feminino" items={by(fem)} />
    </>
  )
}

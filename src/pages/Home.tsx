import { Link } from 'react-router-dom'
import CampaignHero from '../components/CampaignHero'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { IconCard, IconChat, IconStore, IconTruck } from '../components/Icons'
import { brl, useStore } from '../lib/store'
import { usePageMeta } from '../lib/seo'
import type { Category, Product } from '../lib/types'

const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

// Recortes sem fundo disponíveis (public/hero). Para os demais, usa a foto do produto.
const CUTOUTS = new Set(['french-avenue-vulcan-feu-100ml', 'lattafa-afeef-100ml', 'armaf-club-de-nuit-maleka-105ml', 'lattafa-asad-elixir-100ml', 'maison-alhambra-pink-eclipse-100ml', 'maison-alhambra-victorioso-nero-100ml'])
// Categorias em oval: produto de capa preferido + tons suaves. Só aparecem as que têm produto.
const OVALS: { label: string; to: string; match: (p: Product) => boolean; prefer: string; a: string; b: string }[] = [
  { label: 'Masculinos', to: '/catalogo?cat=masculino', match: p => p.category === 'masculino', prefer: 'lattafa-asad-elixir-100ml', a: '#f1ece4', b: '#d9cfbf' },
  { label: 'Femininos', to: '/catalogo?cat=feminino', match: p => p.category === 'feminino', prefer: 'maison-alhambra-pink-eclipse-100ml', a: '#f3ebe3', b: '#ddcfc0' },
  { label: 'Doces', to: '/catalogo?tag=doce', match: p => !!p.tags?.includes('doce'), prefer: 'lattafa-afeef-100ml', a: '#f4ede0', b: '#e3d3b5' },
  { label: 'Amadeirados', to: '/catalogo?tag=amadeirado', match: p => !!p.tags?.includes('amadeirado'), prefer: 'maison-alhambra-victorioso-nero-100ml', a: '#eee9e1', b: '#d2c8b8' },
  { label: 'Splash e miniaturas', to: '/catalogo?cat=splash', match: p => p.category === 'splash', prefer: '', a: '#efeae3', b: '#d8cfc0' },
  { label: 'Skincare', to: '/catalogo?cat=skincare', match: p => p.category === 'skincare', prefer: 'celimax-the-vita-a-retinal-shot-15ml', a: '#f0ece3', b: '#d9d1bf' },
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
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  usePageMeta({
    title: 'Arkyn Imports | Perfumes árabes e importados em Coxim – MS',
    description: 'Perfumes árabes e importados em Coxim – MS. Compre online com Pix ou cartão de crédito, ou retire na loja.',
    path: '/',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Arkyn Imports', url: origin, logo: `${origin}/logo-full.png`, sameAs: ['https://instagram.com/arkyn_imports'],
        address: { '@type': 'PostalAddress', addressLocality: 'Coxim', addressRegion: 'MS', addressCountry: 'BR' }, telephone: `+${settings.whatsapp}` },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Arkyn Imports', url: origin, potentialAction: { '@type': 'SearchAction', target: `${origin}/catalogo?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    ],
  })
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

  const cats = OVALS.map(c => {
    const inCat = products.filter(c.match)
    const pick = inCat.find(p => p.id === c.prefer && p.image) ?? inCat.find(p => p.image)
    const src = pick ? (CUTOUTS.has(pick.id) ? `/hero/${pick.id}.webp` : pick.image!) : ''
    return { ...c, count: inCat.length, src, cut: !!pick && CUTOUTS.has(pick.id) }
  }).filter(c => c.count > 0 && !!c.src)

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
      <CampaignHero />

      <Reveal as="section" className="ax-benefits" >
        {benefits.map(([ic, t, s]) => <div key={t}>{ic}<span><b>{t}</b><small>{s}</small></span></div>)}
      </Reveal>



      {cats.length > 0 && (
        <Reveal as="section" className="section">
          <SecHead eyebrow="Explore" title="Compre por categoria" to="/catalogo" link="Ver tudo" />
          <div className="oval-grid">
            {cats.map((c, i) => (
              <Link key={c.label} to={c.to} className="oval" style={{ '--a': c.a, '--b': c.b, '--i': i } as React.CSSProperties}>
                <span className="oval-img">{c.src && <img src={c.src} alt="" loading="lazy" className={c.cut ? 'cut' : 'photo'} />}</span>
                <b>{c.label}</b>
                <small>{c.count} {c.count === 1 ? 'produto' : 'produtos'}</small>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <Shelf eyebrow="Para começar" title="Destaques" to="/catalogo" items={featured} />

      <Reveal as="section" className="bq-promo" aria-label="Sobre a Arkyn">
        <div className="bq-promo-txt">
          <p>Arkyn Imports</p>
          <h2>Mais que uma fragrância. Uma assinatura.</h2>
          <span>Perfumes árabes e importados escolhidos com cuidado, com atendimento próximo, em Coxim – MS.</span>
          <Link to="/catalogo" className="bq-btn light">Conhecer os perfumes</Link>
        </div>
        <div className="bq-promo-img" aria-hidden="true">
          {['lattafa-afeef-100ml', 'maison-alhambra-pink-eclipse-100ml', 'lattafa-asad-elixir-100ml'].map((id, i) => <img key={id} src={`/hero/${id}.webp`} alt="" loading="lazy" style={{ '--i': i } as React.CSSProperties} />)}
          <span className="bq-podium" />
        </div>
      </Reveal>

      <Shelf eyebrow="Condições especiais" title="Ofertas" to="/catalogo" items={offers} />

      <nav className="ar-brands" aria-label="Marcas">
        <div className="ar-brands-track">
          {[...brands, ...brands].map((b, i) => <Link key={b + i} to={`/catalogo?brand=${encodeURIComponent(b)}`} tabIndex={i >= brands.length ? -1 : 0} aria-hidden={i >= brands.length}>{b}</Link>)}
        </div>
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

import { Link } from 'react-router-dom'
import CampaignHero from '../components/CampaignHero'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import SizedImg from '../components/SizedImg'
import { IconCard, IconChat, IconStore, IconTruck } from '../components/Icons'
import { brl, useStore } from '../lib/store'
import { usePageMeta } from '../lib/seo'
import type { Category, Product } from '../lib/types'

const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

// Recortes sem fundo disponíveis (public/hero). Para os demais, usa a foto do produto.
const CUTOUTS = new Set(['french-avenue-vulcan-feu-100ml', 'lattafa-afeef-100ml', 'armaf-club-de-nuit-maleka-105ml', 'lattafa-asad-elixir-100ml', 'maison-alhambra-pink-eclipse-100ml', 'maison-alhambra-victorioso-nero-100ml'])
// Categorias editoriais: produto de capa preferido. Só aparecem as que têm produto com foto.
const CATS: { label: string; to: string; match: (p: Product) => boolean; prefer: string }[] = [
  { label: 'Masculinos', to: '/catalogo?cat=masculino', match: p => p.category === 'masculino', prefer: 'lattafa-asad-elixir-100ml' },
  { label: 'Femininos', to: '/catalogo?cat=feminino', match: p => p.category === 'feminino', prefer: 'maison-alhambra-pink-eclipse-100ml' },
  { label: 'Doces', to: '/catalogo?tag=doce', match: p => !!p.tags?.includes('doce'), prefer: 'lattafa-afeef-100ml' },
  { label: 'Amadeirados', to: '/catalogo?tag=amadeirado', match: p => !!p.tags?.includes('amadeirado'), prefer: 'maison-alhambra-victorioso-nero-100ml' },
  { label: 'Splash e miniaturas', to: '/catalogo?cat=splash', match: p => p.category === 'splash', prefer: '' },
  { label: 'Skincare', to: '/catalogo?cat=skincare', match: p => p.category === 'skincare', prefer: 'celimax-the-vita-a-retinal-shot-15ml' },
]

// Banners de coleção: só conteúdo que existe na loja (sem preço, desconto ou promoção).
const PROMOS = [
  { k: 'Masculinos', title: 'Presença e personalidade', sub: 'Amadeirados e especiados para o dia a dia e para a noite.', btn: 'Ver masculinos', to: '/catalogo?cat=masculino', img: '/hero/lattafa-asad-elixir-100ml.webp', w: 436, h: 1000, tone: 'navy' },
  { k: 'Femininos', title: 'Doces, florais e marcantes', sub: 'Fragrâncias que enchem o ambiente de personalidade.', btn: 'Ver femininos', to: '/catalogo?cat=feminino', img: '/hero/maison-alhambra-pink-eclipse-100ml.webp', w: 1000, h: 749, tone: 'rose' },
  { k: 'Compre pelo cheiro', title: 'Qual é o seu cheiro?', sub: 'Responda o quiz e veja os perfumes que combinam com você.', btn: 'Fazer o quiz', to: '/quiz', img: '/hero/armaf-club-de-nuit-maleka-105ml.webp', w: 1000, h: 881, tone: 'bronze' },
] as const

function SecHead({ eyebrow, title, to, link = 'Ver todos' }: { eyebrow?: string; title: string; to?: string; link?: string }) {
  return (
    <div className="ax-sec-head">
      <div>{eyebrow && <p className="ax-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>
      {to && <Link to={to} className="ax-sec-link">{link} <span aria-hidden="true">→</span></Link>}
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
  const flagged = live.filter(p => p.featured).slice(0, 4)
  const featured = flagged.length ? flagged : live.filter(p => !!p.image).slice(0, 4)
  const offers = live.filter(p => !!p.old_price && p.old_price > p.price).slice(0, 8)
  const shown = new Set([...featured, ...offers].map(p => p.id))
  const by = (list: Product[]) => list.filter(p => !shown.has(p.id)).slice(0, 4)
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].sort()

  const cats = CATS.map(c => {
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
      <h1 className="sr-only">Arkyn Imports: perfumes árabes e importados em Coxim – MS</h1>
      <CampaignHero />

      {cats.length > 0 && (
        <Reveal as="section" className="cat-card" aria-label="Compre por categoria">
          {cats.map(c => (
            <Link key={c.label} to={c.to} className="cat-c">
              <span className="cat-c-img">{c.src && <SizedImg src={c.src} size={480} width={480} height={480} alt="" loading="lazy" decoding="async" className={c.cut ? 'cut' : 'photo'} />}</span>
              <b>{c.label}</b>
              <small>{c.count} {c.count === 1 ? 'produto' : 'produtos'}</small>
            </Link>
          ))}
        </Reveal>
      )}

      <Reveal as="section" className="pm-row">
        {PROMOS.map(b => (
          <Link key={b.to} to={b.to} className={`pm pm--${b.tone}`}>
            <span className="pm-txt"><small>{b.k}</small><b>{b.title}</b><em>{b.sub}</em><i className="pm-btn">{b.btn}</i></span>
            <img src={b.img} width={b.w} height={b.h} alt="" loading="lazy" decoding="async" />
          </Link>
        ))}
      </Reveal>

      <Shelf eyebrow="Para começar" title="Destaques" to="/catalogo" items={featured} />

      <section className="ax-bband" aria-label="Como comprar">
        <div className="ax-benefits">
          {benefits.map(([ic, t, s]) => <div key={t}>{ic}<span><b>{t}</b><small>{s}</small></span></div>)}
        </div>
      </section>


      <Reveal as="section" className="statement">
        <p className="ax-eyebrow">Arkyn Imports</p>
        <h2>Mais que uma fragrância. Uma assinatura.</h2>
        <span>Perfumes árabes e importados escolhidos com cuidado, com atendimento próximo, em Coxim – MS.</span>
      </Reveal>

      <Shelf eyebrow="Condições especiais" title="Ofertas" to="/catalogo" items={offers} />
      <Shelf eyebrow="Para ele" title="Perfumes masculinos" to="/catalogo?cat=masculino" items={by(masc)} />
      <Shelf eyebrow="Para ela" title="Perfumes femininos" to="/catalogo?cat=feminino" items={by(fem)} />

      {brands.length > 0 && (
        <Reveal as="section" className="ar-brands">
          <nav aria-label="Marcas">
            <p className="ax-eyebrow">Marcas</p>
            <div>{brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
          </nav>
        </Reveal>
      )}

      <section className="ax-band">
        <div className="ax-band-in">
          <Reveal className="ax-band-head">
            <div><p className="ax-eyebrow">Famílias olfativas</p><h2>Escolha pelo cheiro que você gosta</h2></div>
            <p className="ax-band-p">Cada família reúne os perfumes do catálogo com aquele perfil. Veja as notas mais presentes e explore.</p>
            <Link to="/quiz" className="btn">Fazer o quiz</Link>
          </Reveal>
          <div className="scent-grid">
            {scents.map(([t, count, notes, thumbs], i) => (
              <Reveal key={t} delay={i * 70}>
                <Link to={`/catalogo?tag=${t}`} className="scent">
                  <span className="scent-th">{thumbs.map(src => <i key={src}><SizedImg src={src} size={160} width={160} height={160} alt="" loading="lazy" decoding="async" /></i>)}</span>
                  <b>{cap(t)}</b>
                  <small>{notes.join(' · ')}</small>
                  <em>{count} perfumes →</em>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

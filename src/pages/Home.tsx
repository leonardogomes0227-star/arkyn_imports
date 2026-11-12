import { Link } from 'react-router-dom'
import CampaignHero from '../components/CampaignHero'
import Newsletter from '../components/Newsletter'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import Reviews from '../components/Reviews'
import SizedImg from '../components/SizedImg'
import { IconCard, IconChat, IconStore, IconTruck } from '../components/Icons'
import { isArab } from '../lib/fragrance'
import { BESTSELLER_IDS, LAUNCH_IDS, pickByIds } from '../lib/merch'
import { REVIEWS } from '../lib/reviews'
import { brl, useStore } from '../lib/store'
import { usePageMeta } from '../lib/seo'
import type { Product } from '../lib/types'

const cap = (t: string) => t[0].toUpperCase() + t.slice(1)
const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']

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
    title: 'Arkyn Imports | Perfumes árabes originais',
    description: 'Perfumes árabes e importados, originais e lacrados. Pix com desconto, parcelamento no cartão e envio para todo o Brasil. Retirada em Coxim – MS.',
    path: '/',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Arkyn Imports', url: origin, logo: `${origin}/logo-full.png`, sameAs: ['https://instagram.com/arkyn_imports'],
        address: { '@type': 'PostalAddress', addressLocality: 'Coxim', addressRegion: 'MS', addressCountry: 'BR' }, telephone: `+${settings.whatsapp}` },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Arkyn Imports', url: origin, potentialAction: { '@type': 'SearchAction', target: `${origin}/catalogo?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    ],
  })

  const live = products.filter(p => p.stock > 0 && p.active !== false && p.image)
  const best = pickByIds(live, BESTSELLER_IDS).slice(0, 8)
  const launches = pickByIds(live, LAUNCH_IDS).filter(p => !best.some(b => b.id === p.id)).slice(0, 8)
  const offers = live.filter(p => !!p.old_price && p.old_price > p.price).slice(0, 8)
  const brands = [...new Set(products.map(p => p.brand))].sort()
  const n = settings.installments
  const pix = settings.pixDiscount ?? 0
  const ship = settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}` : 'Combinamos o frete no WhatsApp'

  const cats: { label: string; to: string; img?: string; count: number; plain?: boolean }[] = [
    { label: 'Feminino', to: '/catalogo?cat=feminino', img: '/hero/maison-alhambra-pink-eclipse-100ml.webp', count: products.filter(p => p.category === 'feminino').length },
    { label: 'Masculino', to: '/catalogo?cat=masculino', img: '/hero/maison-alhambra-victorioso-nero-100ml.webp', count: products.filter(p => p.category === 'masculino').length },
    { label: 'Unissex', to: '/catalogo?col=unissex', count: products.filter(p => p.gender === 'unissex').length, plain: true },
    { label: 'Árabes', to: '/catalogo?col=arabe', img: '/hero/armaf-club-de-nuit-maleka-105ml.webp', count: products.filter(isArab).length },
    { label: 'Kits e presentes', to: '/catalogo?col=presente', img: '/hero/lattafa-afeef-100ml.webp', count: products.filter(p => p.tags?.includes('presente')).length },
  ]

  const scents = SCENTS.map(t => {
    const list = products.filter(p => p.tags?.includes(t))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1)))
    const notes = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([x]) => x)
    const thumbs = list.filter(p => p.image).slice(0, 3).map(p => p.image as string)
    return [t, list.length, notes, thumbs] as [string, number, string[], string[]]
  }).filter(([, c]) => c > 0)

  const benefits: [JSX.Element, string, string][] = [
    [<IconTruck key="t" size={26} />, 'Todo o Brasil', ship],
    [<IconStore key="s" size={26} />, 'Originais', 'Lacrados, prontos para enviar'],
    [<IconCard key="c" size={26} />, n > 1 ? `Até ${n}x no cartão` : 'Cartão de crédito', 'Pagamento pelo Mercado Pago'],
    [<IconChat key="w" size={26} />, pix > 0 ? `${pix}% no Pix` : 'Pix', pix > 0 ? 'O desconto entra no checkout' : 'Pagamento na hora'],
  ]

  return (
    <>
      <h1 className="sr-only">Arkyn Imports, perfumes árabes originais</h1>
      <CampaignHero />

      <section className="ax-benefits" aria-label="Vantagens da loja">
        {benefits.map(([ic, t, s]) => <div key={t}>{ic}<span><b>{t}</b><small>{s}</small></span></div>)}
      </section>

      <Reveal as="section" className="section ak-cat-sec">
        <SecHead eyebrow="Navegue" title="Escolha por categoria" to="/catalogo" link="Ver tudo" />
        <div className="ak-mosaic">
          {cats.map((c, i) => (
            <Link key={c.label} to={c.to} className={c.plain ? `ak-tile ak-tile--${i} is-plain` : `ak-tile ak-tile--${i}`}>
              {c.img && <img src={c.img} alt="" width={640} height={800} loading="lazy" decoding="async" />}
              <span><small>{c.count} {c.count === 1 ? 'perfume' : 'perfumes'}</small><b>{c.label}</b></span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Shelf eyebrow="Preferidos" title="Mais vendidos" to="/catalogo" items={best} />

      <section className="ak-pay">
        <p className="ak-pay-num" aria-hidden="true">{pix > 0 ? `${pix}%` : 'Pix'}</p>
        <div>
          <p className="ax-eyebrow">Pagamento</p>
          <h2>{pix > 0 ? `${pix}% de desconto no Pix` : 'Pague no Pix ou no cartão'}{n > 1 ? `. Até ${n}x no cartão` : ''}.</h2>
          <p>O valor no Pix aparece em cada perfume{settings.freeShippingFrom > 0 ? `. Frete grátis acima de ${brl(settings.freeShippingFrom)}` : ''}. Enviamos para todo o Brasil.</p>
          <Link to="/catalogo?col=oferta" className="btn">Ver ofertas</Link>
        </div>
        <img src="/hero/french-avenue-vulcan-feu-100ml.webp" width={800} height={800} alt="" />
      </section>

      <Shelf eyebrow="Novidades" title="Lançamentos" to="/catalogo" items={launches} />
      <div className="ak-offers">
        <Shelf eyebrow="Com desconto" title="Ofertas" to="/catalogo?col=oferta" items={offers} />
      </div>

      {brands.length > 0 && (
        <section className="ak-brands" aria-label="Marcas">
          <p className="ax-eyebrow">Marcas da loja</p>
          <div className="ak-brand-row">
            {[...brands, ...brands].map((b, i) => <Link key={`${b}-${i}`} to={`/catalogo?brand=${encodeURIComponent(b)}`} aria-hidden={i >= brands.length ? true : undefined} tabIndex={i >= brands.length ? -1 : undefined}>{b}</Link>)}
          </div>
        </section>
      )}

      <section className="ax-band">
        <div className="ax-band-in">
          <Reveal className="ax-band-head">
            <div><p className="ax-eyebrow">Pelo cheiro</p><h2>Qual tipo você prefere?</h2></div>
            <p className="ax-band-p">Doce, amadeirado, fresco, floral ou especiado. Cada grupo mostra os perfumes do catálogo com esse perfil.</p>
            <Link to="/quiz" className="btn">Me ajuda a escolher</Link>
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

      <Link to="/quiz" className="ak-quizband">
        <div>
          <p className="ax-eyebrow">Quiz</p>
          <h2>Não sabe qual escolher?</h2>
          <span>Responda algumas perguntas e veja perfumes do nosso catálogo.</span>
        </div>
        <span className="btn">Começar</span>
      </Link>

      <Reviews items={REVIEWS} title="Quem já comprou" />
      <Newsletter />
    </>
  )
}

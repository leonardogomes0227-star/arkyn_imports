import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import HeroStage from '../components/HeroStage'
import { ChristmasBand, Marquee } from '../components/Festive'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import SizedImg from '../components/SizedImg'
import { brl, useStore } from '../lib/store'
import { SEASON } from '../lib/season'
import { usePageMeta } from '../lib/seo'
import type { Category, Product } from '../lib/types'

const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
// cor de aura de cada família olfativa (sobre o preto)
const FAM: Record<string, string> = { doce: '#6b1d36', amadeirado: '#5a3b1c', fresco: '#1d5a52', floral: '#6b2a5a', especiado: '#7a3b12' }
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

// Pirâmide olfativa oficial do Pink Eclipse (peça de campanha aprovada pela marca).
const PYRAMID_ID = 'maison-alhambra-pink-eclipse-100ml'
const PYRAMID: [string, string, string][] = [
  ['Saída', 'Pera, bergamota e tangerina', 'A pera abre a fragrância.'],
  ['Coração', 'Flor de laranjeira, jasmim e neroli', 'O jasmim floresce no coração.'],
  ['Fundo', 'Baunilha, benjoim, almíscar e âmbar', 'O âmbar aquece o fundo.'],
]

function SecHead({ eyebrow, title, to, link = 'Ver todos' }: { eyebrow?: string; title: string; to?: string; link?: string }) {
  return (
    <div className="hm-head">
      <div>{eyebrow && <p className="hm-eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>
      {to && <Link to={to} className="hm-link">{link} <span aria-hidden="true">→</span></Link>}
    </div>
  )
}

function Shelf({ eyebrow, title, to, items }: { eyebrow?: string; title: string; to: string; items: Product[] }) {
  if (!items.length) return null
  return (
    <Reveal as="section" className="hm-sec">
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
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Arkyn Imports', url: origin, logo: `${origin}/brand/logo-sm.webp`, sameAs: ['https://instagram.com/arkyn_imports'],
        address: { '@type': 'PostalAddress', addressLocality: 'Coxim', addressRegion: 'MS', addressCountry: 'BR' }, telephone: `+${settings.whatsapp}` },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Arkyn Imports', url: origin, potentialAction: { '@type': 'SearchAction', target: `${origin}/catalogo?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    ],
  })
  const live = products.filter(p => p.stock > 0)
  const withPhoto = (c: Category) => live.filter(p => p.category === c && !!p.image)
  const masc = withPhoto('masculino'), fem = withPhoto('feminino')

  // Vitrines: só aparecem quando os dados sustentam (sem "mais vendidos" ou "novidades" inventados).
  const flagged = live.filter(p => p.featured)
  const featured = flagged.length >= 4 ? flagged.slice(0, 4) : [...flagged, ...live.filter(p => !!p.image && !flagged.includes(p))].slice(0, 4)
  const offers = live.filter(p => !!p.old_price && p.old_price > p.price).slice(0, 8)
  const shown = new Set([...featured, ...offers].map(p => p.id))
  const by = (list: Product[]) => [...list.filter(p => !shown.has(p.id)), ...list.filter(p => shown.has(p.id))].slice(0, 4)
  const brands = [...new Set(products.filter(p => p.category === 'masculino' || p.category === 'feminino').map(p => p.brand))].sort()

  const count = (c: Category) => products.filter(p => p.category === c).length
  const hasCut = (id: string) => products.some(p => p.id === id)
  const pyr = products.find(p => p.id === PYRAMID_ID)

  const scents = SCENTS.map(t => {
    const list = products.filter(p => p.tags?.includes(t))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1)))
    const notes = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => x)
    const thumbs = list.filter(p => p.image).slice(0, 3).map(p => p.image as string)
    return [t, list.length, notes, thumbs] as [string, number, string[], string[]]
  }).filter(([, c]) => c > 0)

  const n = settings.installments
  const perks = [
    [n > 1 ? `Parcele em até ${n}x` : 'Pix e cartão', 'Pagamento seguro pelo Mercado Pago.'],
    ['Retirada em Coxim', 'Sem custo de frete.'],
    ['Entrega', settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}.` : 'Consulte a sua cidade.'],
    ['Atendimento', 'Direto pelo WhatsApp, de gente que conhece os perfumes.'],
  ]

  return (
    <>
      <h1 className="sr-only">Arkyn Imports: perfumes árabes e importados em Coxim – MS</h1>
      <HeroStage />
      {SEASON === 'natal' && <ChristmasBand whatsapp={settings.whatsapp} />}

      <Reveal as="section" className="hm-sec hm-feat">
        <SecHead eyebrow="Seleção da loja" title="Os destaques da Arkyn" to="/catalogo" />
        <div className="grid shelf hm-four">{featured.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </Reveal>

      <Reveal as="section" className="hm-cols" aria-label="Compre por coleção">
        {([
          ['Para ele', 'Masculinos', 'Amadeirados e especiados, do dia a dia à noite.', '/catalogo?cat=masculino', 'french-avenue-vulcan-feu-100ml', count('masculino')],
          ['Para ela', 'Femininos', 'Doces, florais e marcantes.', '/catalogo?cat=feminino', 'armaf-club-de-nuit-maleka-105ml', count('feminino')],
        ] as [string, string, string, string, string, number][]).filter(c => hasCut(c[4])).map(([k, t, d, to, img, c]) => (
          <Link key={to} to={to} className="hm-col">
            <span className="hm-col-txt"><small>{k}</small><b>{t}</b><em>{d}</em><i>{c} {c === 1 ? 'perfume' : 'perfumes'} <span aria-hidden="true">→</span></i></span>
            <img src={`/hero/${img}.webp`} width="560" height="560" alt="" loading="lazy" decoding="async" />
          </Link>
        ))}
        <div className="hm-minis">
          <Link to="/catalogo?cat=splash"><b>Body Splash</b><small>{count('splash')} produtos</small><span aria-hidden="true">→</span></Link>
          <Link to="/catalogo?cat=skincare"><b>Skincare</b><small>{count('skincare')} {count('skincare') === 1 ? 'produto' : 'produtos'}</small><span aria-hidden="true">→</span></Link>
          <Link to="/quiz"><b>Qual é o seu cheiro?</b><small>Quiz de 6 perguntas</small><span aria-hidden="true">→</span></Link>
        </div>
      </Reveal>

      {pyr && (
        <Reveal as="section" className="hm-pyr" aria-labelledby="pyr-t">
          <div className="hm-pyr-img"><img src={`/hero/${pyr.id}.webp`} width="900" height="800" alt={`${pyr.brand} ${pyr.name}`} loading="lazy" decoding="async" /></div>
          <div className="hm-pyr-txt">
            <p className="hm-eyebrow">{pyr.brand} · 100 ml</p>
            <h2 id="pyr-t">Pink Eclipse, em três tempos</h2>
            <ol>
              {PYRAMID.map(([k, notes, line]) => <li key={k}><small>{k}</small><div><b>{notes}</b><span>{line}</span></div></li>)}
            </ol>
            <div className="hm-pyr-buy">
              <Link to={`/produto/${pyr.id}`} className="hx-btn">Ver o Pink Eclipse<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
              <span className="hx-price"><small>a partir de</small>{brl(pyr.price)}</span>
            </div>
          </div>
        </Reveal>
      )}

      <section className="hm-fam" aria-labelledby="fam-t">
        <Reveal className="hm-fam-head">
          <p className="hm-eyebrow">Compre pelo cheiro</p>
          <h2 id="fam-t">Escolha pela família olfativa</h2>
          <p>Doce, amadeirado, fresco, floral ou especiado. Cada família reúne os perfumes do catálogo com aquele perfil.</p>
          <Link to="/quiz" className="hx-btn hx-btn--ghost">Fazer o quiz</Link>
        </Reveal>
        <div className="hm-fam-grid">
          {scents.map(([t, count, notes, thumbs], i) => (
            <Reveal key={t} delay={i * 70}>
              <Link to={`/catalogo?tag=${t}`} className="hm-fam-c" style={{ '--fam': FAM[t] ?? '#3a2e22' } as CSSProperties}>
                <b>{cap(t)}</b>
                <small>{notes.join(' · ')}</small>
                <span className="hm-fam-th">{thumbs.map(src => <i key={src}><SizedImg src={src} size={160} width={160} height={160} alt="" loading="lazy" decoding="async" /></i>)}</span>
                <em>{count} perfumes →</em>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Shelf eyebrow="Condições especiais" title="Ofertas" to="/catalogo" items={offers} />
      <Shelf eyebrow="Para ele" title="Perfumes masculinos" to="/catalogo?cat=masculino" items={by(masc)} />
      <Shelf eyebrow="Para ela" title="Perfumes femininos" to="/catalogo?cat=feminino" items={by(fem)} />

      <Reveal as="section" className="hm-perks" aria-label="Como comprar">
        {perks.map(([t, d]) => <div key={t}><b>{t}</b><span>{d}</span></div>)}
      </Reveal>

      {SEASON === 'natal' && <Marquee items={brands} />}
      {brands.length > 0 && (
        <Reveal as="section" className="hm-brands">
          <nav aria-label="Marcas">
            <p className="hm-eyebrow">Marcas</p>
            <div>{brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
          </nav>
        </Reveal>
      )}
    </>
  )
}

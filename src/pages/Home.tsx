import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import GlobeHero from '../components/GlobeHero'
import { ChristmasBand } from '../components/Festive'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { IconCard, IconChat, IconStore, IconTruck } from '../components/Icons'
import SizedImg from '../components/SizedImg'
import { brl, useStore } from '../lib/store'
import { SEASON } from '../lib/season'
import { cutoutFor } from '../lib/cutouts'
import { usePageMeta } from '../lib/seo'
import type { Category, Product } from '../lib/types'

const SCENTS = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
// cor de aura de cada família olfativa (sobre o preto)
const FAM: Record<string, string> = { doce: '#6b1d36', amadeirado: '#5a3b1c', fresco: '#1d5a52', floral: '#6b2a5a', especiado: '#7a3b12' }
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)


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
    title: 'Arkyn Imports | Perfumes árabes e importados para todo o Brasil',
    description: 'Perfumes árabes e importados com envio para todo o Brasil. Pix ou cartão de crédito, e retirada na loja em Coxim – MS.',
    path: '/',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'Arkyn Imports', url: origin, logo: `${origin}/brand/logo-sm.webp`, sameAs: ['https://instagram.com/arkyn_imports'],
        address: { '@type': 'PostalAddress', addressLocality: 'Coxim', addressRegion: 'MS', addressCountry: 'BR' }, telephone: `+${settings.whatsapp}` },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Arkyn Imports', url: origin, potentialAction: { '@type': 'SearchAction', target: `${origin}/catalogo?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    ],
  })
  const live = products.filter(p => p.stock > 0)

  // Vitrines: só aparecem quando os dados sustentam (sem "mais vendidos" ou "novidades" inventados).
  const flagged = live.filter(p => p.featured)
  const featured = flagged.length >= 4 ? flagged.slice(0, 4) : [...flagged, ...live.filter(p => !!p.image && !flagged.includes(p))].slice(0, 4)
  const offers = live.filter(p => !!p.old_price && p.old_price > p.price).slice(0, 8)
  const brandCards = [...new Set(products.map(p => p.brand))].map(name => {
    const list = products.filter(p => p.brand === name)
    return { name, count: list.length, pics: list.map(cutoutFor).filter((x): x is string => !!x).slice(0, 3) }
  }).filter(b => b.pics.length).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const count = (c: Category) => products.filter(p => p.category === c).length
  const hasCut = (id: string) => products.some(p => p.id === id)

  const scents = SCENTS.map(t => {
    const list = products.filter(p => p.tags?.includes(t))
    const freq = new Map<string, number>()
    list.forEach(p => p.notes?.forEach(x => freq.set(x, (freq.get(x) ?? 0) + 1)))
    const notes = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => x)
    const thumbs = list.filter(p => p.image).slice(0, 3).map(p => p.image as string)
    return [t, list.length, notes, thumbs] as [string, number, string[], string[]]
  }).filter(([, c]) => c > 0)

  return (
    <>
      <GlobeHero />
      {SEASON === 'natal' && <ChristmasBand whatsapp={settings.whatsapp} />}

      {brandCards.length > 0 && (
        <section className="hm-br" aria-labelledby="br-t">
          <div className="hm-head"><h2 id="br-t">Marcas da loja</h2><Link to="/catalogo" className="hm-link">Ver todos <span aria-hidden="true">→</span></Link></div>
          <div className="hm-br-row">
            <div className="hm-br-track">
              {[0, 1].map(k => brandCards.map(b => (
                <Link key={`${k}-${b.name}`} to={`/catalogo?brand=${encodeURIComponent(b.name)}`} className="hm-br-c" aria-hidden={k === 1 || undefined} tabIndex={k === 1 ? -1 : undefined}>
                  <span className="hm-br-pics" aria-hidden="true">{b.pics.map((src, i) => <SizedImg key={src} src={src} size={160} width={160} height={160} alt="" loading="lazy" decoding="async" style={{ '--k': i - (b.pics.length - 1) / 2 } as CSSProperties} />)}</span>
                  <b>{b.name}</b>
                  <small>{b.count} {b.count === 1 ? 'produto' : 'produtos'}</small>
                </Link>
              )))}
            </div>
          </div>
        </section>
      )}

      <Reveal as="section" className="hm-sec hm-feat">
        <SecHead title="Os destaques da Arkyn" to="/catalogo" />
        <div className="grid shelf hm-four">{featured.map(p => <ProductCard key={p.id} p={p} />)}</div>
      </Reveal>

      <Reveal as="section" className="hm-cols" aria-label="Compre por coleção">
        {([
          ['Para ele', 'Masculinos', 'Amadeirados e especiados, do dia a dia à noite.', '/catalogo?cat=masculino', 'french-avenue-vulcan-feu-100ml', count('masculino')],
          ['Para ela', 'Femininos', 'Doces e florais, do dia à noite.', '/catalogo?cat=feminino', 'armaf-club-de-nuit-maleka-105ml', count('feminino')],
        ] as [string, string, string, string, string, number][]).filter(c => hasCut(c[4])).map(([k, t, d, to, img, c]) => (
          <Link key={to} to={to} className="hm-col">
            <span className="hm-col-txt"><small>{k}</small><b>{t}</b><em>{d}</em><i>{c} {c === 1 ? 'perfume' : 'perfumes'} <span aria-hidden="true">→</span></i></span>
            <img src={`/hero/${img}.webp`} width="560" height="560" alt="" loading="lazy" decoding="async" />
          </Link>
        ))}
      </Reveal>


      <section className="hm-fam" aria-labelledby="fam-t">
        <Reveal className="hm-fam-head">
          <h2 id="fam-t">Escolha pela família olfativa</h2>
          <p>Escolha o tipo de cheiro que você gosta e veja só os perfumes com esse perfil.</p>
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

      <Shelf title="Ofertas" to="/catalogo" items={offers} />
      <Reveal as="section" className="hm-info" aria-label="Como comprar">
        <div><IconCard size={24} /><b>{settings.installments > 1 ? `Pix ou até ${settings.installments}x` : 'Pix ou cartão'}</b><span>Pelo Mercado Pago</span></div>
        <div><IconStore size={24} /><b>Retirada grátis</b><span>Na loja em Coxim – MS</span></div>
        <div><IconTruck size={24} /><b>Todo o Brasil</b><span>{settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}` : 'Enviamos para a sua cidade'}</span></div>
        <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer"><IconChat size={24} /><b>WhatsApp</b><span>Tire dúvidas antes de comprar</span></a>
      </Reveal>

    </>
  )
}

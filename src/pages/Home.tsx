import { useState } from 'react'
import { Link } from 'react-router-dom'
import CheckinHero from '../components/eb/CheckinHero'
import FanHero from '../components/eb/FanHero'
import { DepartureBoard } from '../components/eb/Departures'
import { CAT_LABEL } from '../lib/search'
import { useStore } from '../lib/store'
import { usePageMeta } from '../lib/seo'
import type { Category } from '../lib/types'

// Começo com o leque de perfumes, o "descubra o seu perfume" e a vitrine com todos os perfumes da loja.
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

  const cats = (Object.keys(CAT_LABEL) as Category[]).filter(c => products.some(p => p.category === c))
  const [cat, setCat] = useState<Category | ''>('')
  const board = products
    .filter(p => !cat || p.category === cat)
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || Number(!!b.featured) - Number(!!a.featured))

  return (
    <>
      <FanHero />
      <CheckinHero />

      <section className="eb-dep" id="perfumes" aria-labelledby="perfumes-t">
        <div className="eb-dep-head">
          <h2 className="eb-dep-t" id="perfumes-t">Nossos perfumes</h2>
          <p>Originais, com envio para todo o Brasil e retirada grátis em Coxim.</p>
        </div>
        <div className="eb-gates" role="tablist" aria-label="Filtrar por categoria">
          <button type="button" role="tab" aria-selected={!cat} className={!cat ? 'on' : ''} onClick={() => setCat('')}>Todos <span>{products.length}</span></button>
          {cats.map(c => {
            const n = products.filter(p => p.category === c).length
            return <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{(l => l[0].toUpperCase() + l.slice(1))(CAT_LABEL[c].replace('Perfumes ', ''))} <span>{n}</span></button>
          })}
        </div>
        <DepartureBoard items={board} />
      </section>

    </>
  )
}

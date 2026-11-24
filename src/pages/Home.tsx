import { useState, type CSSProperties } from 'react'
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
  const [fam, setFam] = useState('')
  const [price, setPrice] = useState('')
  const [sort, setSort] = useState('')
  const PRICES: [string, string, (n: number) => boolean][] = [['ate250', 'Até R$ 250', n => n <= 250], ['ate350', 'R$ 250 a 350', n => n > 250 && n <= 350], ['mais350', 'Acima de R$ 350', n => n > 350]]
  const FAMS: [string, string, string][] = [['doce', 'Doces', 'baunilha'], ['amadeirado', 'Amadeirados', 'cedro'], ['floral', 'Florais', 'jasmim'], ['especiado', 'Especiados', 'acafrao'], ['fresco', 'Frescos', 'limao']]
  const fams = FAMS.filter(f => products.some(p => p.tags?.includes(f[0])))
  const pf = PRICES.find(x => x[0] === price)
  const board = products
    .filter(p => (!cat || p.category === cat) && (!fam || p.tags?.includes(fam)) && (!pf || pf[2](p.price)))
    .sort((a, b) => sort === 'menor' ? a.price - b.price : sort === 'maior' ? b.price - a.price : Number(b.stock > 0) - Number(a.stock > 0) || Number(!!b.featured) - Number(!!a.featured))
  const pickFam = (f: string) => { setFam(v => (v === f ? '' : f)); document.getElementById('perfumes')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const clear = () => { setCat(''); setFam(''); setPrice(''); setSort('') }

  return (
    <>
      <FanHero />
      <CheckinHero />

      <section className="vt-fams" aria-labelledby="fams-t">
        <h2 id="fams-t">Escolha pelo cheiro</h2>
        <p>Toque na família que você mais gosta.</p>
        <div style={{ '--n': fams.length } as CSSProperties}>
          {fams.map(([id, name, img]) => (
            <button key={id} type="button" className={fam === id ? 'vt-fam on' : 'vt-fam'} aria-pressed={fam === id} onClick={() => pickFam(id)}>
              <span><img src={`/notas/${img}.webp`} alt="" loading="lazy" draggable={false} /></span>
              <b>{name}</b><small>{products.filter(p => p.tags?.includes(id)).length} perfumes</small>
            </button>
          ))}
        </div>
      </section>

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
        <div className="vt-more">
          <div className="vt-chips" aria-label="Faixa de preço">
            {PRICES.map(([k, l]) => <button key={k} type="button" aria-pressed={price === k} className={price === k ? 'on' : ''} onClick={() => setPrice(v => (v === k ? '' : k))}>{l}</button>)}
          </div>
          <label className="vt-sort">Ordenar
            <select value={sort} onChange={e => setSort(e.target.value)}><option value="">Destaques</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option></select>
          </label>
        </div>
        {fam && <p className="vt-on">Família: <b>{fams.find(f => f[0] === fam)?.[1]}</b> <button type="button" onClick={() => setFam('')}>limpar ✕</button></p>}
        {board.length ? <DepartureBoard items={board} /> : <div className="vt-empty"><p>Nenhum perfume com esses filtros.</p><button type="button" onClick={clear}>Limpar filtros</button></div>}
      </section>


    </>
  )
}

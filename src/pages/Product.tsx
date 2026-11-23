import { IngredientRow } from '../components/BottleStage'
import Reviews from '../components/Reviews'
import ShipCalc from '../components/ShipCalc'
import { pushRecent } from '../lib/recent'
import { track } from '../lib/analytics'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconHeart } from '../components/Icons'
import Placeholder from '../components/Placeholder'
import SizedImg from '../components/SizedImg'
import { ProductSkeleton } from '../components/ProductCard'
import { DepartureBoard } from '../components/eb/Departures'
import NotePyramid from '../components/NotePyramid'
import { CAT_LABEL } from '../lib/search'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'
import { cutoutFor } from '../lib/cutouts'
import { flyToBag } from '../lib/fly'

const FAMILIES = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function Product() {
  const { id } = useParams()
  const { products, settings, add, ready, favs, toggleFav } = useStore()
  const [qty, setQty] = useState(1)
  const [pic, setPic] = useState(0)
  const [bar, setBar] = useState(false)
  const buyRef = useRef<HTMLButtonElement>(null)
  const [rv, setRv] = useState({ count: 0, avg: 0 })
  const p = products.find(x => x.id === id)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const abs = (s?: string) => (s ? (s.startsWith('http') ? s : origin + s) : undefined)
  usePageMeta(p ? {
    title: `${p.brand} ${p.name} | Arkyn Imports`,
    description: p.description || `${p.brand} ${p.name}${p.notes?.length ? `, com notas de ${p.notes.slice(0, 4).join(', ').toLowerCase()}` : ''}. Pix ou cartão de crédito e retirada em Coxim – MS.`,
    path: `/produto/${p.id}`, image: p.image, type: 'product',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Product', name: `${p.brand} ${p.name}`, sku: p.id, brand: { '@type': 'Brand', name: p.brand }, category: CAT_LABEL[p.category],
      ...(rv.count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rv.avg.toFixed(1), reviewCount: rv.count } } : {}),
      ...(p.image ? { image: [abs(p.image)] } : {}), ...(p.description ? { description: p.description } : {}),
      offers: { '@type': 'Offer', url: `${origin}/produto/${p.id}`, priceCurrency: 'BRL', price: p.price.toFixed(2), availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } },
  } : { title: 'Perfume não encontrado | Arkyn Imports', description: 'Este produto não está disponível.', noindex: true })

  useEffect(() => { setQty(1); setPic(0) }, [id])
  useEffect(() => { if (id) pushRecent(id) }, [id])
  useEffect(() => { const x = products.find(q => q.id === id); if (x) track.viewItem({ id: x.id, name: x.name, brand: x.brand, price: x.price }) }, [id, products])
  // barra de compra fixa no celular, quando o botão principal sai da tela
  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(el); return () => io.disconnect()
  }, [p?.id])
  useEffect(() => { document.body.classList.toggle('has-buybar', bar); return () => document.body.classList.remove('has-buybar') }, [bar])

  if (!p && !ready) return <section className="section"><div className="pdp"><div className="pdp-img ax-skel" /><div className="pdp-info"><span className="ax-skel sk-l m" /><span className="ax-skel sk-l p" /></div></div></section>
  if (!p) return <section className="section ax-empty-page"><p className="ax-eyebrow">404</p><h1>Perfume não encontrado</h1><p className="muted">Este produto pode ter saído do catálogo.</p><Link to="/catalogo" className="btn">Ver o catálogo</Link></section>

  const out = p.stock <= 0
  const sale = !!p.old_price && p.old_price > p.price
  const n = settings.installments
  const cutImg = cutoutFor(p)
  const images = (cutImg ? [cutImg] : [p.image, ...(p.images ?? [])]).filter((x, i, a): x is string => !!x && a.indexOf(x) === i)
  const family = (p.tags ?? []).filter(t => FAMILIES.includes(t))
  const when = (p.tags ?? []).filter(t => t === 'dia' || t === 'noite')
  const volume = p.name.match(/(\d+)\s?ml/i)?.[1]
  const related = products
    .filter(x => x.id !== p.id && x.category === p.category && x.stock > 0)
    .map(x => ({ x, s: (x.tags ?? []).filter(t => (p.tags ?? []).includes(t)).length + (x.brand === p.brand ? 1 : 0) }))
    .sort((a, b) => b.s - a.s).slice(0, 4).map(r => r.x)
  const pair = related.filter(x => cutoutFor(x)).sort((a, b) => a.price - b.price)[0]
    ?? products.find(x => x.id !== p.id && x.category === 'splash' && x.stock > 0 && cutoutFor(x))
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no ${p.brand} ${p.name}.`)}`
  const share = async () => {
    const url = window.location.href, text = `${p.brand} ${p.name} por ${brl(p.price)} na Arkyn Imports`
    try { if (navigator.share) { await navigator.share({ title: p.name, text, url }); return } } catch { return }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener')
  }
  const waAvise = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Quero ser avisado quando o ${p.brand} ${p.name} chegar.`)}`
  const buy = () => { flyToBag(document.querySelector<HTMLElement>('.pdp-img img:not(.pdp-word)')); add(p.id, true, qty) }
  const zoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`)
    e.currentTarget.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <section className="section pdp-page">
      <nav className="crumbs" aria-label="Você está em">
        <Link to="/">Início</Link> / <Link to={`/catalogo?cat=${p.category}`}>{CAT_LABEL[p.category]}</Link> / <Link to={`/catalogo?brand=${encodeURIComponent(p.brand)}`}>{p.brand}</Link> / <span aria-current="page">{p.name}</span>
      </nav>

      <div className="pdp">
        <div className="pdp-gallery">
          {images.length > 1 && (
            <div className="pdp-thumbs" role="tablist" aria-label="Fotos do produto">
              {images.map((src, i) => <button key={src} type="button" role="tab" aria-selected={i === pic} className={i === pic ? 'on' : ''} onClick={() => setPic(i)} aria-label={`Foto ${i + 1}`}><SizedImg src={src} size={160} alt="" width={120} height={120} loading="lazy" /></button>)}
            </div>
          )}
          <div className={`pdp-img${images[pic]?.includes('-net/') ? ' clean' : ''}${images[pic]?.startsWith('/hero/') ? ' cut' : ''}`} onMouseMove={zoom}>
            {sale && <span className="off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
            {images[pic] ? <img key={images[pic]} src={images[pic]} width={800} height={800} alt={`${p.brand} ${p.name}`} decoding="async" /> : <Placeholder brand={p.brand} />}
          </div>
        </div>

        <div className="pdp-info">
          <p className="ax-eyebrow pdp-brand">{p.brand}{volume ? ` · ${volume} ml` : ''}</p>
          <h1>{p.name.replace(/\s?\d+\s?ml$/i, '')}</h1>
          {(!!family.length || !!when.length) && <p className="pdp-prof">{[...family.map(cap), ...when.map(w => (w === 'dia' ? 'Para o dia' : 'Para a noite'))].join(' · ')}</p>}

          <div className="pdp-price">
            {!out ? <>
              <span className="pdp-now">{brl(p.price)}</span>
              {sale && <><span className="old">{brl(p.old_price!)}</span><span className="pdp-off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span></>}
            </> : <span className="pdp-now soldout">Indisponível no momento</span>}
          </div>
          {n > 1 && <p className="pdp-pay">ou {n}x de {brl(p.price / n)} sem juros</p>}

          {p.description && <p className="pdp-desc">{p.description}</p>}

          {!out && (
            <div className="pdp-buy">
              <div className="pdp-qty" role="group" aria-label="Quantidade">
                <button type="button" aria-label="Diminuir quantidade" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <output aria-live="polite">{qty}</output>
                <button type="button" aria-label="Aumentar quantidade" onClick={() => setQty(q => Math.min(p.stock, q + 1))} disabled={qty >= p.stock}>+</button>
              </div>
              <button ref={buyRef} type="button" className="btn pdp-cta" onClick={buy}>Adicionar à sacola</button>
            </div>
          )}
          {!out && pair && (
            <div className="pdp-pair">
              <p>Leve junto</p>
              <div>
                <Link to={`/produto/${pair.id}`} className="pdp-pair-img">{cutoutFor(pair) && <img src={cutoutFor(pair)} alt="" />}</Link>
                <span><small>{pair.brand}</small><b>{pair.name.replace(/\s?\d+\s?ml$/i, '')}</b><em>+ {brl(pair.price)}</em></span>
              </div>
              <button type="button" onClick={() => { add(pair.id, false); buy() }}>Levar os dois · {brl(p.price * qty + pair.price)}</button>
            </div>
          )}
          {!out && p.stock <= 3 && <p className="low">{p.stock === 1 ? 'Última unidade em estoque' : `Restam ${p.stock} unidades`}</p>}
          <div className="pdp-acc">
            {!!p.notes?.length && (
              <NotePyramid p={p} />
            )}
          </div>
          <div className="pdp-more">
            {out && <a className="btn block" href={waAvise} target="_blank" rel="noreferrer">Avisar quando chegar</a>}
            <div className="pdp-acts">
              <button type="button" className={favs.includes(p.id) ? 'on' : ''} aria-pressed={favs.includes(p.id)} onClick={() => toggleFav(p.id)}><IconHeart size={18} filled={favs.includes(p.id)} /> {favs.includes(p.id) ? 'Salvo' : 'Favoritar'}</button>
              <a href={wa} target="_blank" rel="noreferrer">Tirar dúvida</a>
              <button type="button" onClick={share}>Enviar</button>
            </div>
            <p className="pdp-ship1"><b>Retirada grátis em Coxim</b> ou envio para todo o Brasil{settings.freeShippingFrom > 0 ? ` (grátis acima de ${brl(settings.freeShippingFrom)})` : ''}.</p>
            {!out && <ShipCalc items={[{ id: p.id, qty }]} />}
          </div>
        </div>
      </div>

      {(!!related.length || !ready) && <>
        <div className="ax-sec-head pdp-rel"><div><h2>Quem leva este, também leva</h2></div></div>
        {ready ? <DepartureBoard items={related} /> : <div className="grid"><ProductSkeleton /></div>}
      </>}

      <Reviews productId={p.id} onStats={(count, avg) => setRv({ count, avg })} />


      {!out && (
        <div className={bar ? 'pdp-bar on' : 'pdp-bar'} aria-hidden={!bar}>
          <div><small>{p.brand}</small><b>{brl(p.price)}</b></div>
          <button type="button" className="btn" tabIndex={bar ? 0 : -1} onClick={buy}>Adicionar à sacola</button>
        </div>
      )}
    </section>
  )
}

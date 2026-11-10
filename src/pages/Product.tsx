import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconHeart } from '../components/Icons'
import Placeholder from '../components/Placeholder'
import ProductCard, { ProductSkeleton } from '../components/ProductCard'
import { noteGradient } from '../lib/noteColors'
import { CAT_LABEL } from '../lib/search'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'

const FAMILIES = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const GENDER = { masculino: 'Masculino', feminino: 'Feminino', unissex: 'Unissex' }
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function Product() {
  const { id } = useParams()
  const { products, settings, add, ready, favs, toggleFav } = useStore()
  const [qty, setQty] = useState(1)
  const [pic, setPic] = useState(0)
  const [bar, setBar] = useState(false)
  const buyRef = useRef<HTMLButtonElement>(null)
  const p = products.find(x => x.id === id)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const abs = (s?: string) => (s ? (s.startsWith('http') ? s : origin + s) : undefined)
  usePageMeta(p ? {
    title: `${p.brand} ${p.name} | Arkyn Imports`,
    description: p.description || `${p.brand} ${p.name}${p.notes?.length ? `, com notas de ${p.notes.slice(0, 4).join(', ').toLowerCase()}` : ''}. Pix ou cartão de crédito e retirada em Coxim – MS.`,
    path: `/produto/${p.id}`, image: p.image, type: 'product',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Product', name: `${p.brand} ${p.name}`, sku: p.id, brand: { '@type': 'Brand', name: p.brand }, category: CAT_LABEL[p.category],
      ...(p.image ? { image: [abs(p.image)] } : {}), ...(p.description ? { description: p.description } : {}),
      offers: { '@type': 'Offer', url: `${origin}/produto/${p.id}`, priceCurrency: 'BRL', price: p.price.toFixed(2), availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } },
  } : { title: 'Perfume não encontrado | Arkyn Imports', description: 'Este produto não está disponível.', noindex: true })

  useEffect(() => { setQty(1); setPic(0) }, [id])
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
  const images = [p.image, ...(p.images ?? [])].filter((x, i, a): x is string => !!x && a.indexOf(x) === i)
  const family = (p.tags ?? []).filter(t => FAMILIES.includes(t))
  const when = (p.tags ?? []).filter(t => t === 'dia' || t === 'noite')
  const volume = p.name.match(/(\d+)\s?ml/i)?.[1]
  const related = products
    .filter(x => x.id !== p.id && x.category === p.category && x.stock > 0)
    .map(x => ({ x, s: (x.tags ?? []).filter(t => (p.tags ?? []).includes(t)).length + (x.brand === p.brand ? 1 : 0) }))
    .sort((a, b) => b.s - a.s).slice(0, 4).map(r => r.x)
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no ${p.brand} ${p.name}.`)}`
  const buy = () => add(p.id, true, qty)
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
              {images.map((src, i) => <button key={src} type="button" role="tab" aria-selected={i === pic} className={i === pic ? 'on' : ''} onClick={() => setPic(i)} aria-label={`Foto ${i + 1}`}><img src={src} alt="" width="120" height="120" loading="lazy" /></button>)}
            </div>
          )}
          <div className={`pdp-img${images[pic]?.includes('-net/') ? ' clean' : ''}`} onMouseMove={zoom}>
            {sale && <span className="off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span>}
            {images[pic] ? <img key={images[pic]} src={images[pic]} width={800} height={800} alt={`${p.brand} ${p.name}`} decoding="async" /> : <Placeholder brand={p.brand} />}
          </div>
        </div>

        <div className="pdp-info">
          <p className="ax-eyebrow pdp-brand">{p.brand}{volume ? ` · ${volume} ml` : ''}</p>
          <h1>{p.name.replace(/\s?\d+\s?ml$/i, '')}</h1>

          <div className="pdp-price">
            {!out ? <>
              <span className="pdp-now">{brl(p.price)}</span>
              {sale && <><span className="old">{brl(p.old_price!)}</span><span className="pdp-off">-{Math.round((1 - p.price / p.old_price!) * 100)}%</span></>}
            </> : <span className="pdp-now soldout">Indisponível no momento</span>}
          </div>
          <p className="pdp-pay">{n > 1 ? `ou ${n}x de ${brl(p.price / n)} sem juros no cartão · ` : ''}Pix ou cartão de crédito, pelo Mercado Pago</p>

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
          {!out && p.stock <= 3 && <p className="low">{p.stock === 1 ? 'Última unidade em estoque' : `Restam ${p.stock} unidades`}</p>}
          <button type="button" className={favs.includes(p.id) ? 'btn ghost block pdp-fav on' : 'btn ghost block pdp-fav'} aria-pressed={favs.includes(p.id)} onClick={() => toggleFav(p.id)}><IconHeart size={18} filled={favs.includes(p.id)} /> {favs.includes(p.id) ? 'Nos seus favoritos' : 'Salvar nos favoritos'}</button>
          <a className="btn ghost block" href={wa} target="_blank" rel="noreferrer">Tirar dúvida no WhatsApp</a>

          <ul className="pdp-ship">
            <li><b>Retirada em Coxim</b><span>Sem custo de frete · {settings.pickupAddress}</span></li>
            <li><b>Entrega</b><span>{settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}. ` : ''}Consulte a sua cidade pelo WhatsApp</span></li>
          </ul>

          <div className="pdp-acc">
            {!!p.notes?.length && (
              <details open>
                <summary>Notas olfativas</summary>
                <ol className="pdp-notes-list">
                  {p.notes.map((nt, i) => <li key={nt}><em>{String(i + 1).padStart(2, '0')}</em><i style={{ background: noteGradient(nt) }} />{nt}</li>)}
                </ol>
              </details>
            )}
            <details open>
              <summary>Características</summary>
              <dl className="pdp-specs">
                <div><dt>Marca</dt><dd>{p.brand}</dd></div>
                <div><dt>Categoria</dt><dd>{CAT_LABEL[p.category]}</dd></div>
                {p.category !== 'skincare' && <div><dt>Público</dt><dd>{GENDER[p.gender]}</dd></div>}
                {volume && <div><dt>Volume</dt><dd>{volume} ml</dd></div>}
                {!!family.length && <div><dt>Família olfativa</dt><dd>{family.map(cap).join(' · ')}</dd></div>}
                {!!when.length && <div><dt>Ocasião</dt><dd>{when.map(cap).join(' · ')}</dd></div>}
              </dl>
            </details>
          </div>
        </div>
      </div>

      {(!!related.length || !ready) && <>
        <div className="ax-sec-head pdp-rel"><div><p className="ax-eyebrow">Continue explorando</p><h2>Você também pode gostar</h2></div></div>
        <div className="grid shelf">{ready ? related.map(r => <ProductCard key={r.id} p={r} />) : <ProductSkeleton />}</div>
      </>}

      {!out && (
        <div className={bar ? 'pdp-bar on' : 'pdp-bar'} aria-hidden={!bar}>
          <div><small>{p.brand}</small><b>{brl(p.price)}</b></div>
          <button type="button" className="btn" tabIndex={bar ? 0 : -1} onClick={buy}>Adicionar à sacola</button>
        </div>
      )}
    </section>
  )
}

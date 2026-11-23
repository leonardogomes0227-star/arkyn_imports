import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cutoutFor } from '../lib/cutouts'
import { brl, CAT_LABEL, famOf, shortName, useStore, waLink } from '../lib/store'
import { IBag, IChat, IChevron, IClose, IHeart, IMenu, ISearch } from './Icons'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Announce() {
  const { settings } = useStore()
  const msgs = [
    'Envio para todo o Brasil',
    settings.installments > 1 ? `Parcele em até ${settings.installments}x no cartão` : 'Pix ou cartão de crédito pelo Mercado Pago',
    'Retirada grátis na loja em Coxim – MS',
  ]
  const [i, setI] = useState(0)
  useEffect(() => { const t = window.setInterval(() => setI(v => (v + 1) % msgs.length), 4200); return () => window.clearInterval(t) }, [msgs.length])
  return (
    <div className="nv-ann" aria-label="Avisos da loja">
      <div className="nv-ann-in">
        {msgs.map((m, k) => <span key={m} className={k === i ? 'on' : ''} aria-hidden={k !== i}>{m}</span>)}
      </div>
    </div>
  )
}

function Search({ onDone }: { onDone?: () => void }) {
  const { products } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLFormElement>(null)
  const hits = useMemo(() => {
    const t = norm(q.trim())
    if (t.length < 2) return []
    return products.filter(p => norm([p.name, p.brand, ...(p.notes ?? []), ...(p.tags ?? [])].join(' ')).includes(t)).slice(0, 5)
  }, [q, products])
  useEffect(() => {
    const out = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', out); return () => document.removeEventListener('mousedown', out)
  }, [])
  const go = (e: React.FormEvent) => { e.preventDefault(); if (!q.trim()) return; setOpen(false); onDone?.(); nav(`/perfumes?q=${encodeURIComponent(q.trim())}`) }
  return (
    <form className="nv-search" ref={box} onSubmit={go} role="search">
      <ISearch width={19} height={19} />
      <input value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Busque por perfume, marca ou nota" aria-label="Buscar" />
      {q && <button type="button" className="nv-search-x" aria-label="Limpar busca" onClick={() => setQ('')}><IClose width={16} height={16} /></button>}
      {open && q.trim().length >= 2 && (
        <div className="nv-sugg">
          {hits.length ? hits.map(p => (
            <Link key={p.id} to={`/produto/${p.id}`} onClick={() => { setOpen(false); setQ(''); onDone?.() }}>
              <span className="nv-sugg-img">{cutoutFor(p) && <img src={cutoutFor(p)} alt="" />}</span>
              <span><b>{shortName(p.name)}</b><small>{p.brand}{famOf(p) && ` · ${famOf(p)}`}</small></span>
              <em>{brl(p.price)}</em>
            </Link>
          )) : <p>Nenhum perfume para “{q}”.</p>}
          {hits.length > 0 && <button type="submit" className="nv-sugg-all">Ver todos os resultados</button>}
        </div>
      )}
    </form>
  )
}

const FAM_LINKS: [string, string][] = [['Doces', 'doce'], ['Amadeirados', 'amadeirado'], ['Florais', 'floral'], ['Especiados', 'especiado'], ['Frescos', 'fresco']]

function Mega({ cat }: { cat: string }) {
  const { products } = useStore()
  const list = products.filter(p => p.category === cat)
  const brands = [...new Set(list.map(p => p.brand))].sort()
  const star = list.find(p => p.featured && cutoutFor(p)) ?? list.find(p => cutoutFor(p))
  const fams = FAM_LINKS.filter(([, t]) => list.some(p => p.tags?.includes(t)))
  return (
    <div className="nv-mega" role="region" aria-label={CAT_LABEL[cat]}>
      <div className="nv-mega-in">
        <div><b>Ver por família</b>{fams.length ? fams.map(([l, t]) => <Link key={t} to={`/perfumes?cat=${cat}&fam=${t}`}>{l}</Link>) : <Link to={`/perfumes?cat=${cat}`}>Todos</Link>}</div>
        <div><b>Marcas</b>{brands.map(b => <Link key={b} to={`/perfumes?cat=${cat}&marca=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
        <div><b>Atalhos</b><Link to={`/perfumes?cat=${cat}`}>Ver todos os {CAT_LABEL[cat].toLowerCase()}</Link><Link to={`/perfumes?cat=${cat}&ordem=menor`}>Menor preço</Link><Link to="/quiz">Descobrir meu perfume</Link></div>
        {star && (
          <Link to={`/produto/${star.id}`} className="nv-mega-star">
            <span className="nv-mega-img"><img src={cutoutFor(star)} alt="" /></span>
            <span><small>Em destaque</small><b>{shortName(star.name)}</b><em>{brl(star.price)}</em></span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Header() {
  const { count, favs, settings, setBag, products } = useStore()
  const loc = useLocation()
  const [drawer, setDrawer] = useState(false)
  const [mega, setMega] = useState<string | null>(null)
  const [stuck, setStuck] = useState(false)
  const cats = Object.keys(CAT_LABEL).filter(c => products.some(p => p.category === c))
  useEffect(() => { setDrawer(false); setMega(null) }, [loc.pathname, loc.search])
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : '' }, [drawer])
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [])
  const wa = waLink(settings.whatsapp)

  return (
    <>
      <Announce />
      <header className={stuck ? 'nv-head stuck' : 'nv-head'} onMouseLeave={() => setMega(null)}>
        <div className="nv-head-in">
          <button type="button" className="nv-ico nv-burger" aria-label="Abrir menu" onClick={() => setDrawer(true)}><IMenu /></button>
          <Link to="/" className="nv-logo" aria-label="Arkyn Imports, página inicial"><img src="/brand/logo-xs.webp" alt="Arkyn Imports" width="360" height="212" /></Link>
          <Search />
          <div className="nv-acts">
            <a className="nv-help" href={wa} target="_blank" rel="noreferrer"><IChat width={20} height={20} /><span><small>Atendimento</small>WhatsApp</span></a>
            <Link to="/favoritos" className="nv-ico" aria-label={`Favoritos${favs.length ? `, ${favs.length}` : ''}`}><IHeart />{favs.length > 0 && <em>{favs.length}</em>}</Link>
            <button type="button" className="nv-ico" aria-label={`Sacola${count ? `, ${count} itens` : ''}`} onClick={() => setBag(true)}><IBag />{count > 0 && <em key={count}>{count}</em>}</button>
          </div>
        </div>
        <nav className="nv-nav" aria-label="Categorias">
          <div className="nv-nav-in">
            {cats.map(c => (
              <div key={c} className={mega === c ? 'nv-nav-i on' : 'nv-nav-i'} onMouseEnter={() => setMega(c)}>
                <Link to={`/perfumes?cat=${c}`} onFocus={() => setMega(c)}>{CAT_LABEL[c]}<IChevron dir="down" width={14} height={14} /></Link>
              </div>
            ))}
            <div className="nv-nav-i" onMouseEnter={() => setMega(null)}><Link to="/marcas">Marcas</Link></div>
            <div className="nv-nav-i" onMouseEnter={() => setMega(null)}><Link to="/perfumes?promo=1">Ofertas</Link></div>
            <div className="nv-nav-i nv-nav-quiz" onMouseEnter={() => setMega(null)}><Link to="/quiz">Descubra seu perfume</Link></div>
          </div>
          {mega && <Mega cat={mega} />}
        </nav>
      </header>
      <div className="nv-mob-search"><Search /></div>

      <div className={drawer ? 'nv-scrim on' : 'nv-scrim'} onClick={() => setDrawer(false)} />
      <aside className={drawer ? 'nv-drawer on' : 'nv-drawer'} aria-hidden={!drawer} aria-label="Menu">
        <div className="nv-drawer-head"><img src="/brand/logo-xs.webp" alt="Arkyn Imports" /><button type="button" className="nv-ico" aria-label="Fechar menu" onClick={() => setDrawer(false)}><IClose /></button></div>
        <nav>
          {cats.map(c => <Link key={c} to={`/perfumes?cat=${c}`}>{CAT_LABEL[c]}<IChevron width={16} height={16} /></Link>)}
          <Link to="/marcas">Marcas<IChevron width={16} height={16} /></Link>
          <Link to="/perfumes?promo=1">Ofertas<IChevron width={16} height={16} /></Link>
          <Link to="/quiz" className="hl">Descubra seu perfume<IChevron width={16} height={16} /></Link>
        </nav>
        <div className="nv-drawer-fams"><b>Por família</b><div>{FAM_LINKS.map(([l, t]) => <Link key={t} to={`/perfumes?fam=${t}`}>{l}</Link>)}</div></div>
        <a className="nv-btn" href={wa} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
      </aside>
    </>
  )
}

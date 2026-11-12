import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import Newsletter from './Newsletter'
import SearchOverlay from './SearchOverlay'
import { IconBag, IconHeart, IconSearch } from './Icons'
import { brl, useStore } from '../lib/store'

export function Logo({ className = 'ax-logo' }: { className?: string }) {
  return (
    <Link to="/" className={className} aria-label="Arkyn Imports, página inicial">
      <img src="/logo-xs.webp" width="260" height="211" alt="Arkyn Imports" />
    </Link>
  )
}

const NAV: [string, string][] = [
  ['Feminino', '/catalogo?cat=feminino'],
  ['Masculino', '/catalogo?cat=masculino'],
  ['Unissex', '/catalogo?col=unissex'],
  ['Árabes', '/catalogo?col=arabe'],
  ['Kits e presentes', '/catalogo?col=presente'],
  ['Ofertas', '/catalogo?col=oferta'],
  ['Miniaturas', '/catalogo?cat=splash'],
]

const phone = (n: string) => (/^55\d{2}9?\d{8}$/.test(n) ? `(${n.slice(2, 4)}) ${n.slice(4, n.length - 4)}-${n.slice(-4)}` : n)

export default function Layout({ children }: { children: ReactNode }) {
  const { count, settings, setOpen, favs } = useStore()
  const loc = useLocation()
  const go = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const pix = settings.pixDiscount ?? 0
  const n = settings.installments
  const msgs = settings.announcement
    ? [settings.announcement]
    : [
        'Enviamos para todo o Brasil',
        'Originais e lacrados',
        n > 1 ? `Parcele em até ${n}x no cartão` : 'Cartão de crédito',
        pix > 0 ? `${pix}% de desconto no Pix` : 'Pague no Pix',
        'Retirada em Coxim – MS',
      ]

  // cabeçalho compacto ao rolar
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24)) }
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  // ao trocar de página: volta ao topo e fecha menu/busca
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); setSearch(false) }, [loc.pathname, loc.search])
  useEffect(() => {
    document.body.classList.toggle('page-checkout', loc.pathname === '/carrinho')
    document.body.classList.toggle('page-product', loc.pathname.startsWith('/produto/'))
    return () => document.body.classList.remove('page-checkout', 'page-product')
  }, [loc.pathname])
  // trava a rolagem do fundo com menu/busca abertos; atalhos: "/" e Ctrl/⌘+K abrem a busca
  useEffect(() => { document.body.style.overflow = menu || search ? 'hidden' : '' }, [menu, search])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); setSearch(true) }
      if (e.key === 'Escape') setMenu(false)
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])

  const here = loc.pathname + loc.search
  const active = (to: string) => here === to
  const wa = `https://wa.me/${settings.whatsapp}`

  return (
    <>
      <a className="ax-skip" href="#conteudo">Pular para o conteúdo</a>
      <header className={scrolled ? 'ax-header is-scrolled' : 'ax-header'}>
        <div className="ax-topbar" aria-label="Avisos da loja"><div className="ax-marquee">{[...msgs, ...msgs, ...msgs, ...msgs].map((m, i) => <span key={i} data-d={i >= msgs.length ? '' : undefined} aria-hidden={i >= msgs.length ? true : undefined}>{m}</span>)}</div></div>
        <div className="ax-head">
          <div className="ax-left">
            <button type="button" className="ax-burger" aria-label="Abrir menu" aria-expanded={menu} aria-controls="ax-menu" onClick={() => setMenu(true)}><span /><span /><span /></button>
            <button type="button" className="ax-icon ax-find" aria-label="Buscar perfumes" onClick={() => setSearch(true)}><IconSearch size={21} /><span>Buscar</span></button>
          </div>
          <Logo className="ax-logo ak-mark" />
          <form className="ax-q" role="search" onSubmit={e => { e.preventDefault(); const term = q.trim(); if (!term) { setSearch(true); return } setSearch(false); go(`/catalogo?q=${encodeURIComponent(term)}`); setQ('') }}>
            <IconSearch size={18} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar perfume" aria-label="Buscar perfumes" />
          </form>
          <div className="ax-actions">
            <Link to="/quiz" className="ax-quiz" aria-current={loc.pathname === '/quiz' ? 'page' : undefined}>Me ajuda a escolher</Link>
            <Link to="/favoritos" className="ax-icon ax-fav" aria-label={favs.length ? `Favoritos, ${favs.length}` : 'Favoritos'}><IconHeart size={21} />{favs.length > 0 && <em>{favs.length}</em>}</Link>
            <button type="button" className="ax-icon ax-bag" aria-label={count ? `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Abrir sacola'} onClick={() => setOpen(true)}>
              <IconBag size={21} />{count > 0 && <em key={count}>{count}</em>}
            </button>
          </div>
        </div>
        <nav className="ax-nav" aria-label="Principal">
          {NAV.map(([label, to]) => <Link key={to} to={to} aria-current={active(to) ? 'page' : undefined}>{label}</Link>)}
        </nav>
        <SearchOverlay open={search} onClose={() => setSearch(false)} />
      </header>

      <div className={menu ? 'ax-menu-scrim on' : 'ax-menu-scrim'} onClick={() => setMenu(false)} />
      <aside id="ax-menu" className={menu ? 'ax-menu on' : 'ax-menu'} aria-hidden={!menu} aria-label="Menu">
        <div className="ax-menu-head">
          <Logo className="ax-menu-logo" />
          <button type="button" className="ax-menu-x" aria-label="Fechar menu" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}>✕</button>
        </div>
        <button type="button" className="ax-menu-search" tabIndex={menu ? 0 : -1} onClick={() => { setMenu(false); setSearch(true) }}><IconSearch size={19} /> Buscar perfume, marca ou nota</button>
        <nav className="ax-menu-nav" aria-label="Categorias">
          {NAV.map(([label, to]) => <Link key={to} to={to} tabIndex={menu ? 0 : -1} aria-current={active(to) ? 'page' : undefined}>{label}</Link>)}
          <Link to="/quiz" className="hl" tabIndex={menu ? 0 : -1}>Me ajuda a escolher</Link>
          <Link to="/catalogo" tabIndex={menu ? 0 : -1}>Todos os perfumes</Link>
        </nav>
        <a className="btn ax-menu-wa" href={wa} target="_blank" rel="noreferrer" tabIndex={menu ? 0 : -1}>Falar no WhatsApp</a>
      </aside>

      <main id="conteudo" key={loc.pathname} className="ax-page">{children}</main>
      <CartDrawer />

      <footer className="ax-footer">
        <div className="ax-footer-in">
          <div className="ax-foot-brand">
            <Logo className="ax-foot-logo ak-mark" />
            <p>Perfumes árabes e importados, originais e lacrados. Enviamos para todo o Brasil e também retiramos em Coxim – MS.</p>
            <a className="ax-foot-ig" href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">@arkyn_imports no Instagram</a>
          </div>
          <div>
            <h4>Comprar</h4>
            {NAV.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
            <Link to="/catalogo">Todos os perfumes</Link>
            <Link to="/catalogo?cat=skincare">Skincare</Link>
            <Link to="/quiz">Me ajuda a escolher</Link>
            <Link to="/favoritos">Favoritos</Link>
          </div>
          <div>
            <h4>Atendimento</h4>
            <a href={wa} target="_blank" rel="noreferrer">WhatsApp {phone(settings.whatsapp)}</a>
            <span>Retirada: {settings.pickupAddress}</span>
            <span>{settings.freeShippingFrom > 0 ? `Frete grátis acima de ${brl(settings.freeShippingFrom)}` : 'Envio para todo o Brasil'}</span>
            <Link to="/carrinho">Ver sacola</Link>
          </div>
          <div>
            <h4>Pagamento</h4>
            <span>{pix > 0 ? `${pix}% de desconto no Pix` : 'Pix'}</span>
            <span>{n > 1 ? `Cartão em até ${n}x` : 'Cartão de crédito'}</span>
            <span>Pagamento seguro pelo Mercado Pago</span>
            <div className="ax-pay"><i>Pix</i><i>Cartão</i><i>Mercado Pago</i></div>
            <Newsletter variant="compact" />
          </div>
        </div>
        <p className="ax-copy"><span>© {new Date().getFullYear()} Arkyn Imports · Coxim – MS</span><Link to="/admin">Área do lojista</Link></p>
      </footer>

      <a className="wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" /></svg>
        <span>WhatsApp</span>
      </a>
    </>
  )
}

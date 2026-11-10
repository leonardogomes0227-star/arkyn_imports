import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import { IconBag, IconSearch } from './Icons'
import { useStore } from '../lib/store'

export function Logo({ className = 'ax-logo' }: { className?: string }) {
  return (
    <Link to="/" className={className} aria-label="Arkyn Imports, página inicial">
      <img src="/logo-xs.webp" width="260" height="211" alt="Arkyn Imports" />
    </Link>
  )
}

const NAV: [string, string][] = [
  ['Masculinos', '/catalogo?cat=masculino'],
  ['Femininos', '/catalogo?cat=feminino'],
  ['Splash e miniaturas', '/catalogo?cat=splash'],
  ['Skincare', '/catalogo?cat=skincare'],
  ['Todos os perfumes', '/catalogo'],
]

const phone = (n: string) => (/^55\d{2}9?\d{8}$/.test(n) ? `(${n.slice(2, 4)}) ${n.slice(4, n.length - 4)}-${n.slice(-4)}` : n)

export default function Layout({ children }: { children: ReactNode }) {
  const { count, settings, setOpen } = useStore()
  const loc = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const msgs = settings.announcement ? [settings.announcement] : ['Pague com Pix ou cartão de crédito', 'Retirada em Coxim – MS', 'Atendimento pelo WhatsApp']

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
        <div className="ax-topbar" aria-label="Avisos da loja"><div className="ax-marquee">{[...msgs, ...msgs, ...msgs, ...msgs].map((m, i) => <span key={i}>{m}</span>)}</div></div>
        <div className="ax-head">
          <button type="button" className="ax-burger" aria-label="Abrir menu" aria-expanded={menu} aria-controls="ax-menu" onClick={() => setMenu(true)}><span /><span /><span /></button>
          <nav className="ax-nav" aria-label="Principal">
            {NAV.map(([label, to]) => <Link key={to} to={to} aria-current={active(to) ? 'page' : undefined}>{label}</Link>)}
          </nav>
          <Logo />
          <div className="ax-actions">
            <Link to="/quiz" className="ax-quiz" aria-current={loc.pathname === '/quiz' ? 'page' : undefined}>Qual é o seu cheiro?</Link>
            <button type="button" className="ax-icon" aria-label="Buscar perfumes" onClick={() => setSearch(true)}><IconSearch size={21} /></button>
            <button type="button" className="ax-icon ax-bag" aria-label={count ? `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Abrir sacola'} onClick={() => setOpen(true)}>
              <IconBag size={21} />{count > 0 && <em key={count}>{count}</em>}
            </button>
          </div>
        </div>
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
          <Link to="/quiz" className="hl" tabIndex={menu ? 0 : -1}>Qual é o seu cheiro?</Link>
        </nav>
        <a className="btn ax-menu-wa" href={wa} target="_blank" rel="noreferrer" tabIndex={menu ? 0 : -1}>Falar no WhatsApp</a>
      </aside>

      <main id="conteudo" key={loc.pathname} className="ax-page">{children}</main>
      <CartDrawer />

      <footer className="ax-footer">
        <div className="ax-footer-in">
          <div className="ax-foot-brand">
            <Logo className="ax-foot-logo" />
            <p>Perfumaria árabe e importada em Coxim – MS.</p>
            <a className="ax-foot-ig" href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">@arkyn_imports no Instagram</a>
          </div>
          <div>
            <h4>Comprar</h4>
            {NAV.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
            <Link to="/quiz">Qual é o seu cheiro?</Link>
          </div>
          <div>
            <h4>Atendimento</h4>
            <a href={wa} target="_blank" rel="noreferrer">WhatsApp {phone(settings.whatsapp)}</a>
            <span>Retirada: {settings.pickupAddress}</span>
            <Link to="/carrinho">Minha sacola</Link>
          </div>
          <div>
            <h4>Pagamento</h4>
            <span>Pix e cartão de crédito</span>
            <span>Pagamento seguro pelo Mercado Pago</span>
            <div className="ax-pay"><i>Pix</i><i>Cartão</i></div>
          </div>
        </div>
        <p className="ax-copy">© {new Date().getFullYear()} Arkyn Imports · Coxim – MS · <Link to="/admin">Área do lojista</Link></p>
      </footer>

      <a className="wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" /></svg>
      </a>
    </>
  )
}

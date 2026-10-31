import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import { IconBag, IconSearch, IconUser } from './Icons'
import { useStore } from '../lib/store'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Arkyn Imports, página inicial">
      <img src="/logo.jpg" alt="" />
      <span><b>ARKYN</b><small>IMPORTS</small></span>
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { count, settings, setOpen } = useStore()
  const go = useNavigate()
  const [term, setTerm] = useState('')
  const msgs = settings.announcement ? [settings.announcement] : ['Pague com Pix ou cartão de crédito', 'Retirada em Coxim – MS', 'Atendimento pelo WhatsApp']
  return (
    <>
      <div className="topbar"><div className="marquee">{[...msgs, ...msgs].map((m, i) => <span key={i}>{m}</span>)}</div></div>
      <header className="header">
        <Logo />
        <form className="search" role="search" onSubmit={e => { e.preventDefault(); go(`/catalogo?q=${encodeURIComponent(term.trim())}`) }}>
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="O que você procura?" aria-label="Buscar perfumes" />
          <button aria-label="Buscar"><IconSearch size={20} /></button>
        </form>
        <div className="head-r">
          <Link to="/admin" className="icon-btn" title="Área do lojista"><IconUser /><span>Lojista</span></Link>
          <button className="icon-btn" aria-label="Abrir sacola" onClick={() => setOpen(true)}><IconBag />{count > 0 && <em>{count}</em>}<span>Sacola</span></button>
        </div>
      </header>
      <nav className="catnav">
        <Link to="/catalogo?cat=masculino">Masculinos</Link>
        <Link to="/catalogo?cat=feminino">Femininos</Link>
        <Link to="/catalogo?cat=splash">Splash e miniaturas</Link>
        <Link to="/catalogo?cat=skincare">Skincare</Link>
        <Link to="/catalogo">Todos os perfumes</Link>
        <Link to="/quiz" className="hl">Qual é o seu cheiro?</Link>
      </nav>
      <main>{children}</main>
      <CartDrawer />
      <footer className="footer">
        <div className="footer-in">
          <div className="brandcol">
            <span className="wordmark">ARKYN</span><span className="wm-sub">IMPORTS</span>
            <p>Perfumaria árabe e importada em Coxim – MS.</p>
          </div>
          <div><h4>Perfumes</h4><Link to="/catalogo?cat=masculino">Masculinos</Link><Link to="/catalogo?cat=feminino">Femininos</Link><Link to="/catalogo?cat=splash">Splash e miniaturas</Link><Link to="/catalogo?cat=skincare">Skincare</Link></div>
          <div><h4>Ajuda</h4><Link to="/quiz">Qual é o seu cheiro?</Link><Link to="/carrinho">Minha sacola</Link><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">Fale no WhatsApp</a></div>
          <div><h4>Siga</h4><a href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">Instagram @arkyn_imports</a><h4 style={{ marginTop: 18 }}>Pagamento</h4><span>Pix e cartão de crédito</span></div>
        </div>
        <p className="copy">© Arkyn Imports · Coxim – MS · <Link to="/admin">Área do lojista</Link></p>
      </footer>
      <a className="wa-float" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" /></svg>
      </a>
    </>
  )
}

import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import { useStore } from '../lib/store'

export function Logo({ light = false }: { light?: boolean }) {
  const [ok, setOk] = useState(true)
  return (
    <Link to="/" className={light ? 'logo light' : 'logo'}>
      {ok && <img src="/logo.jpg" alt="" onError={() => setOk(false)} />}
      <span><b>ARKYN</b><small>IMPORTS</small></span>
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { count, settings, setOpen } = useStore()
  return (
    <>
      <div className="topbar">{settings.announcement || 'Pix e cartão de crédito · Atendimento em Coxim – MS'}</div>
      <header className="header">
        <Logo />
        <nav>
          <Link to="/catalogo">Coleção</Link>
          <Link to="/catalogo?cat=masculino">Masculinos</Link>
          <Link to="/catalogo?cat=feminino">Femininos</Link>
          <Link to="/catalogo?cat=splash">Splash</Link>
          <Link to="/quiz">Qual é o seu cheiro?</Link>
        </nav>
        <div className="head-r">
          <Link to="/admin" className="adm-btn">Admin</Link>
          <button className="cart-link" aria-label="Abrir sacola" onClick={() => setOpen(true)}>Sacola{count > 0 && <em>{count}</em>}</button>
        </div>
      </header>
      <main>{children}</main>
      <CartDrawer />
      <footer className="footer">
        <div className="footer-in">
          <div className="brandcol">
            <span className="wordmark">ARKYN</span>
            <span className="wm-sub">IMPORTS</span>
            <p>Perfumaria árabe e importada.<br />Coxim – MS</p>
          </div>
          <div><h4>Coleção</h4><Link to="/catalogo">Todos os perfumes</Link><Link to="/catalogo?cat=masculino">Masculinos</Link><Link to="/catalogo?cat=feminino">Femininos</Link><Link to="/catalogo?cat=skincare">Skincare</Link></div>
          <div><h4>Atendimento</h4><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a><a href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">@arkyn_imports</a><span>Pix e cartão de crédito</span></div>
        </div>
        <p className="copy">© Arkyn Imports · <Link to="/admin">Área do lojista</Link></p>
      </footer>
      <a className="wa-float" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" /></svg>
      </a>
    </>
  )
}

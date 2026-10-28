import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

export function Logo({ light = false }: { light?: boolean }) {
  const [ok, setOk] = useState(true)
  return (
    <Link to="/" className={light ? 'logo light' : 'logo'}>
      {ok && <img src="/logo.jpg" alt="Arkyn Imports" onError={() => setOk(false)} />}
      <span><b>ARKYN</b><small>IMPORTS</small></span>
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { count, settings } = useStore()
  return (
    <>
      <div className="topbar">Pix e cartão de crédito &nbsp;|&nbsp; Atendimento em Coxim - MS</div>
      <header className="header">
        <Logo />
        <nav>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/catalogo?cat=masculino">Masculinos</Link>
          <Link to="/catalogo?cat=feminino">Femininos</Link>
          <Link to="/catalogo?cat=splash">Splash</Link>
          <Link to="/quiz">Qual é o seu cheiro?</Link>
        </nav>
        <Link to="/admin" className="adm-btn">ADMIN</Link>
        <Link to="/carrinho" className="cart-link" aria-label="Carrinho">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
          {count > 0 && <em>{count}</em>}
        </Link>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-in">
          <div><Logo light /><p>Perfumes árabes e importados.<br />Coxim - MS</p></div>
          <div><h4>Loja</h4><Link to="/catalogo">Todos os perfumes</Link><Link to="/catalogo?cat=masculino">Masculinos</Link><Link to="/catalogo?cat=feminino">Femininos</Link><Link to="/catalogo?cat=skincare">Skincare</Link></div>
          <div><h4>Contato</h4><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a><a href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">@arkyn_imports</a></div>
        </div>
        <p className="copy">© Arkyn Imports. Todos os direitos reservados. · <Link to="/admin">Área do lojista</Link></p>
      </footer>
      <a className="wa-float" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.300 2.400 1.500.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.900.9c.3.1.5.2.5.3.1.100.1.6-.1 1.200z"/></svg>
      </a>
    </>
  )
}

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
        <p className="copy">© Arkyn Imports. Todos os direitos reservados.</p>
      </footer>
    </>
  )
}

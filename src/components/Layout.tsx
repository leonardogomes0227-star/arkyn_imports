import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

export function Logo() {
  const [ok, setOk] = useState(true)
  return (
    <Link to="/" className="logo">
      {ok && <img src="/logo.jpg" alt="Arkyn Imports" onError={() => setOk(false)} />}
      <span><b>Arkyn</b><small>IMPORTS</small></span>
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { count, settings } = useStore()
  return (
    <>
      <header className="header">
        <Logo />
        <nav>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/carrinho" className="cart-link">Carrinho{count > 0 && <em>{count}</em>}</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <p>Arkyn Imports · Coxim - MS · Pix e cartão de crédito</p>
        <p><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a> · <a href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">@arkyn_imports</a></p>
      </footer>
    </>
  )
}

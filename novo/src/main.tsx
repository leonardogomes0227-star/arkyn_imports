import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import BagDrawer from './components/BagDrawer'
import Footer from './components/Footer'
import Header from './components/Header'
import { StoreProvider } from './lib/store'
import Home from './pages/Home'
import './fonts.css'
import './site.css'

function Soon() {
  return (
    <section className="nv-soon">
      <small>Próxima etapa</small>
      <h1>Esta página entra na próxima etapa do site novo</h1>
      <p>Primeiro aprovamos a página inicial; depois vêm catálogo, produto, sacola e quiz.</p>
      <Link to="/" className="nv-btn">Voltar ao início</Link>
    </section>
  )
}

function Top() { const { pathname, search } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname, search]); return null }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Top />
        <Header />
        <main><Routes><Route path="/" element={<Home />} /><Route path="*" element={<Soon />} /></Routes></main>
        <Footer />
        <BagDrawer />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)

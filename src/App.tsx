import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Product from './pages/Product'
import Quiz from './pages/Quiz'
import Admin from './pages/Admin'

export default function App() {
  if (useLocation().pathname.startsWith('/admin')) return <Admin />
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/produto/:id" element={<Product />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  )
}

import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
const Catalog = lazy(() => import('./pages/Catalog'))
const Cart = lazy(() => import('./pages/Cart'))
const Product = lazy(() => import('./pages/Product'))
const Quiz = lazy(() => import('./pages/Quiz'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const loc = useLocation()
  if (loc.pathname.startsWith('/admin')) return <Suspense fallback={null}><Admin /></Suspense>
  return (
    <Layout>
      <Suspense fallback={<div className="route-fallback" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog key={loc.search} />} />
        <Route path="/produto/:id" element={<Product />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Layout>
  )
}

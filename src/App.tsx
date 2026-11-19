import { lazy, Suspense, useEffect } from 'react'
import { track } from './lib/analytics'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
const Catalog = lazy(() => import('./pages/Catalog'))
const Cart = lazy(() => import('./pages/Cart'))
const Product = lazy(() => import('./pages/Product'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Compare = lazy(() => import('./pages/Compare'))
const Order = lazy(() => import('./pages/Order'))
const Policy = lazy(() => import('./pages/Policy'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const loc = useLocation()
  useEffect(() => { track.page() }, [loc.pathname])
  if (loc.pathname.startsWith('/admin')) return <Suspense fallback={null}><Admin /></Suspense>
  return (
    <Layout>
      <Suspense fallback={<div className="route-fallback" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog key={loc.search} />} />
        <Route path="/produto/:id" element={<Product />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/comparar" element={<Compare />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/pedido" element={<Order />} />
        <Route path="/politica/:slug" element={<Policy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Layout>
  )
}

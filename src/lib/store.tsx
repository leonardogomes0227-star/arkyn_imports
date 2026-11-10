import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { key, url } from './env'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from './seed'
import type { CartItem, Product, Settings } from './types'

interface Ctx {
  products: Product[]
  settings: Settings
  cart: CartItem[]
  add: (id: string, openCart?: boolean, qty?: number) => void
  ready: boolean
  setQty: (id: string, qty: number) => void
  clear: () => void
  count: number
  open: boolean
  setOpen: (v: boolean) => void
}
const StoreCtx = createContext<Ctx>(null!)
export const useStore = () => useContext(StoreCtx)
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(!(url && key)) // sem banco configurado, os dados de exemplo já são os finais
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
  })

  // A vitrine só lê dados públicos: fetch direto na API REST (evita carregar a biblioteca inteira do Supabase)
  useEffect(() => {
    if (!url || !key) return
    const headers = { apikey: key, Authorization: `Bearer ${key}` }
    const get = (path: string) => fetch(`${url}/rest/v1/${path}`, { headers }).then(r => (r.ok ? r.json() : null)).catch(() => null)
    const timer = window.setTimeout(() => setReady(true), 4000) // se a conexão demorar, mostra o que já temos
    Promise.all([
      get('products?select=*').then((data: Product[] | null) => { if (data?.length) setProducts(data.filter(p => p.active !== false)) }),
      get('settings?id=eq.1&select=value').then((data: { value: Settings }[] | null) => { if (data?.[0]?.value) setSettings({ ...DEFAULT_SETTINGS, ...data[0].value }) }),
    ]).finally(() => { window.clearTimeout(timer); setReady(true) })
  }, [])

  useEffect(() => { try { localStorage.setItem('cart', JSON.stringify(cart)) } catch { /* ignore */ } }, [cart])

  const value = useMemo<Ctx>(() => ({
    products, settings, cart,
    open, setOpen,
    add: (id, openCart = true, qty = 1) => {
      if (openCart) setOpen(true)
      const max = products.find(p => p.id === id)?.stock ?? Infinity
      setCart(c => c.some(i => i.id === id) ? c.map(i => i.id === id ? { ...i, qty: Math.min(i.qty + qty, max) } : i) : [...c, { id, qty: Math.min(qty, max) }])
    },
    ready,
    setQty: (id, qty) => setCart(c => qty <= 0 ? c.filter(i => i.id !== id) : c.map(i => i.id === id ? { ...i, qty } : i)),
    clear: () => setCart([]),
    count: cart.reduce((s, i) => s + i.qty, 0),
  }), [products, settings, cart, open, ready])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

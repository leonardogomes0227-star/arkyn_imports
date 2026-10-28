import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from './seed'
import type { CartItem, Product, Settings } from './types'

interface Ctx {
  products: Product[]
  settings: Settings
  cart: CartItem[]
  add: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  count: number
}
const StoreCtx = createContext<Ctx>(null!)
export const useStore = () => useContext(StoreCtx)
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    if (!supabase) return
    supabase.from('products').select('*').then(({ data }) => { if (data?.length) setProducts(data as Product[]) })
    supabase.from('settings').select('value').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data?.value) setSettings({ ...DEFAULT_SETTINGS, ...(data.value as Settings) })
    })
  }, [])

  useEffect(() => { try { localStorage.setItem('cart', JSON.stringify(cart)) } catch { /* ignore */ } }, [cart])

  const value = useMemo<Ctx>(() => ({
    products, settings, cart,
    add: id => setCart(c => c.some(i => i.id === id) ? c.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...c, { id, qty: 1 }]),
    setQty: (id, qty) => setCart(c => qty <= 0 ? c.filter(i => i.id !== id) : c.map(i => i.id === id ? { ...i, qty } : i)),
    clear: () => setCart([]),
    count: cart.reduce((s, i) => s + i.qty, 0),
  }), [products, settings, cart])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from './seed'
import type { Product, Settings } from './types'

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Item { id: string; qty: number }
interface Ctx {
  products: Product[]; settings: Settings
  cart: Item[]; count: number; total: number
  add: (id: string, qty?: number) => void; setQty: (id: string, qty: number) => void
  favs: string[]; toggleFav: (id: string) => void
  bag: boolean; setBag: (v: boolean) => void
}
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)

const read = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || ''); return v ?? d } catch { return d } }

export function StoreProvider({ children }: { children: ReactNode }) {
  const products = SEED_PRODUCTS.filter(p => p.active !== false)
  const [cart, setCart] = useState<Item[]>(() => read('nv-cart', []))
  const [favs, setFavs] = useState<string[]>(() => read('nv-favs', []))
  const [bag, setBag] = useState(false)
  useEffect(() => { try { localStorage.setItem('nv-cart', JSON.stringify(cart)) } catch { /* sem armazenamento */ } }, [cart])
  useEffect(() => { try { localStorage.setItem('nv-favs', JSON.stringify(favs)) } catch { /* sem armazenamento */ } }, [favs])

  const value = useMemo<Ctx>(() => {
    const price = (id: string) => products.find(p => p.id === id)?.price ?? 0
    return {
      products, settings: DEFAULT_SETTINGS, cart,
      count: cart.reduce((s, i) => s + i.qty, 0),
      total: cart.reduce((s, i) => s + i.qty * price(i.id), 0),
      add: (id, qty = 1) => setCart(c => c.some(i => i.id === id) ? c.map(i => i.id === id ? { ...i, qty: i.qty + qty } : i) : [...c, { id, qty }]),
      setQty: (id, qty) => setCart(c => qty <= 0 ? c.filter(i => i.id !== id) : c.map(i => i.id === id ? { ...i, qty } : i)),
      favs, toggleFav: id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]),
      bag, setBag,
    }
  }, [cart, favs, bag]) // eslint-disable-line react-hooks/exhaustive-deps
  return <C.Provider value={value}>{children}</C.Provider>
}

// ----- vocabulário da loja -----
const FAMS = ['doce', 'amadeirado', 'floral', 'especiado', 'fresco']
export const famOf = (p: Pick<Product, 'tags'>) => { const f = (p.tags ?? []).find(t => FAMS.includes(t)); return f ? f[0].toUpperCase() + f.slice(1) : '' }
export const shortName = (n: string) => n.replace(/\s?\d+\s?ml$/i, '')
export const CAT_LABEL: Record<string, string> = { masculino: 'Masculinos', feminino: 'Femininos', splash: 'Body Splash', skincare: 'Skincare' }
export const waLink = (phone: string, text?: string) => `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`

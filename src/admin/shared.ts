import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'

export interface Order {
  id: number; customer_name: string; phone: string | null; delivery: string
  items: { id: string; qty: number }[]; total: number; status: string; created_at: string
  notes?: string | null; tracking?: string | null; payment?: string | null; source?: string | null; shipping?: number | null; discount?: number | null; coupon?: string | null
  address?: { cep?: string; street?: string; number?: string; complement?: string; district?: string; city?: string; uf?: string } | null; shipping_service?: string | null
}
export interface Coupon { code: string; type: 'percent' | 'fixed'; value: number; min_total: number; active: boolean; max_uses: number | null; uses: number; expires_at: string | null }

export const STATUS: [string, string][] = [
  ['pending', 'Aguardando pagamento'], ['paid', 'Pago'], ['separating', 'Separando'],
  ['shipped', 'Enviado / pronto p/ retirada'], ['delivered', 'Concluído'], ['canceled', 'Cancelado'],
]
export const statusLabel = (s: string) => STATUS.find(x => x[0] === s)?.[1] ?? s
export const PAID = ['paid', 'separating', 'shipped', 'delivered']
export const LOW_STOCK = 3

export const money = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); return true } catch { return false } }
export const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const list = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)
export const digits = (s: string) => s.replace(/\D/g, '')
export const waLink = (phone: string | null, text = '') => `https://wa.me/55${digits(phone ?? '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`


export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    const { data } = await supabase!.from('orders').select('*').order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? []); setLoading(false)
  }, [])
  useEffect(() => { reload() }, [reload])
  return { orders, setOrders, loading, reload }
}

export function useAllProducts() {
  const [items, setItems] = useState<Product[]>([])
  const reload = useCallback(async () => {
    const { data } = await supabase!.from('products').select('*').order('brand')
    setItems((data as Product[]) ?? [])
  }, [])
  useEffect(() => { reload() }, [reload])
  return { items, setItems, reload }
}

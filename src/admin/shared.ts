import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'

export interface Order {
  id: number; customer_name: string; phone: string; delivery: string
  items: { id: string; qty: number }[]; total: number; status: string; created_at: string
  notes?: string | null; tracking?: string | null; shipping?: number | null; discount?: number | null; coupon?: string | null
}
export interface Coupon { code: string; type: 'percent' | 'fixed'; value: number; min_total: number; active: boolean; max_uses: number | null; uses: number; expires_at: string | null }

export const STATUS: [string, string][] = [
  ['pending', 'Aguardando pagamento'], ['paid', 'Pago'], ['separating', 'Separando'],
  ['shipped', 'Enviado / pronto p/ retirada'], ['delivered', 'Concluído'], ['canceled', 'Cancelado'],
]
export const statusLabel = (s: string) => STATUS.find(x => x[0] === s)?.[1] ?? s
export const PAID = ['paid', 'separating', 'shipped', 'delivered']
export const LOW_STOCK = 3

export const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const list = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)
export const digits = (s: string) => s.replace(/\D/g, '')
export const waLink = (phone: string, text = '') => `https://wa.me/55${digits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export function downloadCsv(name: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const blob = new Blob(['﻿' + rows.map(r => r.map(esc).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = name; a.click()
  URL.revokeObjectURL(a.href)
}

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

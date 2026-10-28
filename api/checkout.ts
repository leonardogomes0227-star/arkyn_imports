import type { VercelRequest, VercelResponse } from '@vercel/node'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from '../src/lib/seed'
import type { Product, Settings } from '../src/lib/types'
import { validateCoupon } from './coupon'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const sb = (path: string, init?: RequestInit) =>
  fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: SK!, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init?.headers } })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método inválido' })
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' })

  const { items, name, phone, method, coupon } = req.body as { items: { id: string; qty: number }[]; name: string; phone: string; method: string; coupon?: string }
  let products: Product[] = SEED_PRODUCTS
  let settings: Settings = DEFAULT_SETTINGS
  if (SB && SK) {
    const p = await (await sb('products?select=*')).json()
    if (Array.isArray(p) && p.length) products = p
    const s = await (await sb('settings?id=eq.1&select=value')).json()
    if (s?.[0]?.value) settings = { ...DEFAULT_SETTINGS, ...s[0].value }
  }

  const lines = (items || []).flatMap(i => {
    const p = products.find(x => x.id === i.id)
    return p && i.qty > 0 && i.qty <= p.stock ? [{ p, qty: i.qty }] : []
  })
  if (!lines.length) return res.status(400).json({ error: 'Carrinho inválido ou sem estoque' })

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const city = settings.shipping.find(s => s.city === method)
  const free = settings.freeShippingFrom > 0 && subtotal >= settings.freeShippingFrom
  const shipping = method === 'pickup' || free ? 0 : city?.price ?? 0

  const cp = coupon ? await validateCoupon(coupon, subtotal) : null
  const discount = cp?.ok ? cp.discount : 0
  const total = Math.round((subtotal - discount + shipping) * 100) / 100

  let orderId = `pedido-${Date.now()}`
  if (SB && SK) {
    const base = { customer_name: name, phone, delivery: method, items, total, status: 'pending' }
    let r = await sb('orders', { method: 'POST', body: JSON.stringify({ ...base, subtotal, shipping, discount, coupon: cp?.ok ? coupon!.trim().toUpperCase() : null }) })
    if (!r.ok) r = await sb('orders', { method: 'POST', body: JSON.stringify(base) }) // banco sem a migração do painel
    const o = await r.json()
    if (o?.[0]?.id) orderId = String(o[0].id)
  }

  const site = process.env.SITE_URL || `https://${req.headers.host}`
  const factor = subtotal > 0 ? (subtotal - discount) / subtotal : 1
  const mpItems = lines.map(l => ({ title: `${l.p.brand} ${l.p.name}`, quantity: l.qty, unit_price: Math.round(l.p.price * factor * 100) / 100, currency_id: 'BRL' }))
  // ajusta centavos de arredondamento no primeiro item para o total bater
  const diff = Math.round((subtotal - discount - mpItems.reduce((a, i) => a + i.unit_price * i.quantity, 0)) * 100) / 100
  if (diff !== 0 && mpItems[0]?.quantity === 1) mpItems[0].unit_price = Math.round((mpItems[0].unit_price + diff) * 100) / 100
  if (shipping > 0) mpItems.push({ title: 'Frete', quantity: 1, unit_price: shipping, currency_id: 'BRL' })

  const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: mpItems, external_reference: orderId, payer: { name },
      back_urls: { success: site, failure: `${site}/carrinho`, pending: site }, auto_return: 'approved',
      payment_methods: settings.installments > 1 ? { installments: settings.installments } : undefined,
      notification_url: `${site}/api/webhook`,
    }),
  })
  const pref = await mp.json()
  if (!mp.ok) return res.status(502).json({ error: pref.message || 'Erro no Mercado Pago' })
  res.json({ url: pref.init_point })
}

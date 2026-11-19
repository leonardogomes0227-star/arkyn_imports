import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { ShipAddress } from '../src/lib/types'
import { validateCoupon } from './coupon.js'
import { loadCatalog } from './shipping.js'
import { onlyDigits, quoteShipping } from './_shipping.js'

const SB = process.env.SUPABASE_URL
const SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const sb = (path: string, init?: RequestInit) =>
  fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: SK!, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init?.headers } })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método inválido' })
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' })

  const body = (req.body ?? {}) as { items?: { id: string; qty: number }[]; name?: string; phone?: string; method?: string; coupon?: string; address?: Partial<ShipAddress>; shippingId?: string }
  // entrada do navegador: corta tamanhos e ignora o que não for válido (preço e total são sempre recalculados aqui)
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : []
  const name = String(body.name ?? '').trim().slice(0, 80)
  const phone = String(body.phone ?? '').trim().slice(0, 25)
  const method = String(body.method ?? '').slice(0, 60)
  const coupon = body.coupon ? String(body.coupon).slice(0, 40) : undefined
  const address = body.address && typeof body.address === 'object' ? body.address : undefined
  const shippingId = body.shippingId ? String(body.shippingId).slice(0, 40) : undefined
  if (name.length < 2 || phone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Confira nome e telefone' })
  const { products, settings } = await loadCatalog()

  const lines = items.flatMap(i => {
    const p = products.find(x => x.id === i.id)
    return p && p.active !== false && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= p.stock ? [{ p, qty: i.qty }] : []
  })
  if (!lines.length) return res.status(400).json({ error: 'Carrinho inválido ou sem estoque' })

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  // frete sempre recalculado aqui: o valor que a tela mostra nunca é confiado
  const addr = address ? {
    cep: onlyDigits(address.cep), street: String(address.street || '').trim(), number: String(address.number || '').trim(),
    complement: String(address.complement || '').trim(), district: String(address.district || '').trim(),
    city: String(address.city || '').trim(), uf: String(address.uf || '').trim().toUpperCase(),
  } : null
  let shipping = 0
  let shipLabel = method === 'pickup' ? 'Retirada' : ''
  if (method !== 'pickup') {
    if (!addr || !addr.street || !addr.number) return res.status(400).json({ error: 'Informe rua e número para a entrega.' })
    if (method === 'ship') {
      const q = await quoteShipping(addr.cep, lines, settings)
      if (!q.ok) return res.status(400).json({ error: q.error || 'Não foi possível calcular o frete.' })
      if (q.local) return res.status(400).json({ error: `Esse CEP é de ${q.local}. Escolha "Entrega em ${q.local}".` })
      const opt = q.options?.find(o => o.id === shippingId)
      if (!opt) return res.status(400).json({ error: 'Escolha uma opção de frete.' })
      shipping = opt.price
      shipLabel = `${opt.label} (${addr.city}/${addr.uf})`
    } else {
      const city = settings.shipping.find(s => s.city === method)
      if (!city) return res.status(400).json({ error: 'Forma de entrega inválida.' })
      const free = settings.freeShippingFrom > 0 && subtotal >= settings.freeShippingFrom
      shipping = free ? 0 : city.price
      shipLabel = `Entrega em ${city.city}`
    }
  }

  const cp = coupon ? await validateCoupon(coupon, subtotal) : null
  const discount = cp?.ok ? cp.discount : 0
  const total = Math.round((subtotal - discount + shipping) * 100) / 100

  let orderId = `pedido-${Date.now()}`
  if (SB && SK) {
    const delivery = method === 'ship' ? `${addr!.city}/${addr!.uf}` : method
    const addrText = addr ? `${shipLabel} · ${addr.street}, ${addr.number}${addr.complement ? ' ' + addr.complement : ''} · ${addr.district} · ${addr.city}/${addr.uf} · CEP ${addr.cep}` : ''
    const base = { customer_name: name, phone, delivery, items, total, status: 'pending' }
    const extra = { subtotal, shipping, discount, coupon: cp?.ok ? coupon!.trim().toUpperCase() : null }
    let r = await sb('orders', { method: 'POST', body: JSON.stringify({ ...base, ...extra, address: addr, shipping_service: shipLabel }) })
    // bancos sem a migração do frete (supabase/frete.sql): guarda o endereço em "notes"
    if (!r.ok) r = await sb('orders', { method: 'POST', body: JSON.stringify({ ...base, ...extra, notes: addrText }) })
    if (!r.ok) r = await sb('orders', { method: 'POST', body: JSON.stringify({ ...base, notes: addrText }) })
    if (!r.ok) r = await sb('orders', { method: 'POST', body: JSON.stringify(base) })
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
      back_urls: { success: `${site}/pedido`, failure: `${site}/carrinho`, pending: `${site}/pedido` }, auto_return: 'approved',
      payment_methods: settings.installments > 1 ? { installments: settings.installments } : undefined,
      notification_url: `${site}/api/webhook`,
    }),
  })
  const pref = await mp.json()
  if (!mp.ok) return res.status(502).json({ error: pref.message || 'Erro no Mercado Pago' })
  if (SB && SK) fetch(`${SB}/rest/v1/leads?phone=eq.${phone.replace(/\D/g, '')}`, { method: 'DELETE', headers: { apikey: SK, Authorization: `Bearer ${SK}` } }).catch(() => null)
  res.json({ url: pref.init_point, orderId })
}

import './env'
import test from 'node:test'
import assert from 'node:assert/strict'
import { bundleDiscount } from '../src/lib/pricing'
import { quoteShipping } from '../api/_shipping'
import checkout from '../api/checkout'
import webhook from '../api/webhook'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from '../src/lib/seed'

const CEPS: Record<string, object> = {
  '79400000': { localidade: 'Coxim', uf: 'MS', logradouro: 'Rua A', bairro: 'Centro' },
  '01001000': { localidade: 'São Paulo', uf: 'SP', logradouro: 'Praça da Sé', bairro: 'Sé' },
}
let mpBody: { items: { quantity: number; unit_price: number; title: string }[] } | null = null
globalThis.fetch = (async (u: string, init?: { body?: string }) => {
  if (u.includes('viacep')) { const d = CEPS[u.match(/ws\/(\d+)/)![1]]; return { ok: true, json: async () => d ?? { erro: true } } }
  if (u.includes('mercadopago')) { mpBody = JSON.parse(init!.body!); return { ok: true, json: async () => ({ init_point: 'https://mp.test/pay' }) } }
  return { ok: false, json: async () => ({}) }
}) as unknown as typeof fetch
process.env.MP_ACCESS_TOKEN = 'test'

const prod = SEED_PRODUCTS.find(p => p.stock > 0)!
const call = async (body: object) => {
  let status = 200; let out: any
  const res: any = { status(c: number) { status = c; return res }, json(o: unknown) { out = o; return res } }
  await checkout({ method: 'POST', body, headers: { host: 'x.test' } } as any, res)
  return { status, out }
}
const sum = () => Math.round(mpBody!.items.reduce((s, i) => s + i.unit_price * i.quantity, 0) * 100) / 100
const base = { items: [{ id: prod.id, qty: 1 }], name: 'Teste Silva', phone: '67999991234' }
const addr = { cep: '01001000', street: 'Praça da Sé', number: '1', district: 'Sé', city: 'São Paulo', uf: 'SP', complement: '' }

test('desconto por quantidade: só a partir do mínimo e com teto de 50%', () => {
  assert.equal(bundleDiscount(500, 1, { bundleMinQty: 2, bundlePercent: 10 }), 0)
  assert.equal(bundleDiscount(500, 2, { bundleMinQty: 2, bundlePercent: 10 }), 50)
  assert.equal(bundleDiscount(500, 3, {}), 0)
  assert.equal(bundleDiscount(500, 3, { bundleMinQty: 2, bundlePercent: 90 }), 250)
})

test('frete: CEP de Coxim vira entrega local, de fora usa a tabela, CEP ruim dá erro', async () => {
  const lines = [{ p: prod, qty: 1 }]
  assert.equal((await quoteShipping('79400-000', lines, DEFAULT_SETTINGS)).local, 'Coxim')
  const sp = await quoteShipping('01001000', lines, DEFAULT_SETTINGS)
  assert.ok(sp.ok && sp.options!.length > 0 && sp.options![0].price > 0)
  assert.equal((await quoteShipping('00000000', lines, DEFAULT_SETTINGS)).ok, false)
  assert.equal((await quoteShipping('123', lines, DEFAULT_SETTINGS)).ok, false)
})

test('checkout: retirada cobra só os produtos', async () => {
  const r = await call({ ...base, method: 'pickup' })
  assert.equal(r.status, 200); assert.equal(sum(), prod.price)
})

test('checkout: envio para fora soma o frete calculado no servidor', async () => {
  const q = await quoteShipping('01001000', [{ p: prod, qty: 1 }], DEFAULT_SETTINGS)
  const opt = q.options![0]
  const r = await call({ ...base, method: 'ship', address: addr, shippingId: opt.id, shipping: 0, total: 1 })
  assert.equal(r.status, 200); assert.equal(sum(), Math.round((prod.price + opt.price) * 100) / 100)
})

test('checkout: recusa frete inventado, endereço faltando e CEP de entrega local', async () => {
  assert.equal((await call({ ...base, method: 'ship', address: addr, shippingId: 'gratis' })).status, 400)
  assert.equal((await call({ ...base, method: 'ship', shippingId: 'tabela' })).status, 400)
  assert.equal((await call({ ...base, method: 'ship', address: { ...addr, cep: '79400000' }, shippingId: 'tabela' })).status, 400)
  assert.equal((await call({ ...base, method: 'Coxim' })).status, 400) // entrega local também exige endereço
})

test('checkout: recusa nome/telefone inválidos e quantidade acima do estoque', async () => {
  assert.equal((await call({ ...base, name: 'A', method: 'pickup' })).status, 400)
  assert.equal((await call({ ...base, items: [{ id: prod.id, qty: prod.stock + 1 }], method: 'pickup' })).status, 400)
})

test('webhook: só confirma o pedido se o valor pago bate com o total', async () => {
  const patches: string[] = []
  const run = async (paid: number) => {
    const prev = globalThis.fetch
    globalThis.fetch = (async (u: string, init?: { method?: string; body?: string }) => {
      const url = String(u)
      if (url.includes('/v1/payments/')) return { ok: true, json: async () => ({ status: 'approved', external_reference: '7', transaction_amount: paid }) }
      if (url.includes('/rest/v1/orders?id=eq.7') && init?.method === 'PATCH') { patches.push(init.body!); return { ok: true, json: async () => [] } }
      if (url.includes('/rest/v1/orders')) return { ok: true, json: async () => [{ items: [], coupon: null, status: 'pending', total: 100 }] }
      return { ok: true, json: async () => [] }
    }) as unknown as typeof fetch
    await webhook({ method: 'POST', body: { data: { id: '1' } }, query: {} } as any, { status() { return { end() {} } } } as any)
    globalThis.fetch = prev
  }
  await run(40); assert.equal(patches.length, 0)
  await run(100); assert.equal(patches.length, 1)
})

test('checkout: estoque segurado por pedido pendente de outro cliente (e não do próprio)', async () => {
  const one = { ...prod, stock: 1 }
  let pending: { items: { id: string; qty: number }[]; phone: string }[] = [{ items: [{ id: one.id, qty: 1 }], phone: '(67) 98888-0000' }]
  const prev = globalThis.fetch
  globalThis.fetch = (async (u: string, init?: { method?: string; body?: string }) => {
    const url = String(u)
    if (url.includes('/rest/v1/products')) return { ok: true, json: async () => [one] }
    if (url.includes('/rest/v1/settings')) return { ok: true, json: async () => [] }
    if (url.includes('status=eq.pending')) return { ok: true, json: async () => pending }
    if (url.includes('/rest/v1/orders') && init?.method === 'POST') return { ok: true, json: async () => [{ id: 9 }] }
    if (url.includes('mercadopago')) return { ok: true, json: async () => ({ init_point: 'https://mp.test/pay' }) }
    return { ok: true, json: async () => [] }
  }) as unknown as typeof fetch
  try {
    const other = await call({ items: [{ id: one.id, qty: 1 }], name: 'Outro Cliente', phone: '67977770000', method: 'pickup' })
    assert.equal(other.status, 400); assert.match(other.out.error, /reservado/)
    const same = await call({ items: [{ id: one.id, qty: 1 }], name: 'Mesmo Cliente', phone: '(67) 98888-0000', method: 'pickup' })
    assert.equal(same.status, 200)
    pending = []
    assert.equal((await call({ items: [{ id: one.id, qty: 1 }], name: 'Outro Cliente', phone: '67977770000', method: 'pickup' })).status, 200)
  } finally { globalThis.fetch = prev }
})

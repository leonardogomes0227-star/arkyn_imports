import type { Product, Settings, ShipAddress, ShipOption, ShipQuote } from '../src/lib/types'
import { DEFAULT_SETTINGS } from '../src/lib/seed.js'

const REGION: Record<string, string> = {
  MS: 'MS', GO: 'CO', MT: 'CO', DF: 'CO',
  SP: 'SE', RJ: 'SE', MG: 'SE', ES: 'SE',
  PR: 'S', SC: 'S', RS: 'S',
  BA: 'NE', SE: 'NE', AL: 'NE', PE: 'NE', PB: 'NE', RN: 'NE', CE: 'NE', PI: 'NE', MA: 'NE',
  AM: 'N', PA: 'N', AC: 'N', RO: 'N', RR: 'N', AP: 'N', TO: 'N',
}

export const onlyDigits = (v: unknown) => String(v ?? '').replace(/\D/g, '')
const norm = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
const round2 = (n: number) => Math.round(n * 100) / 100

export interface QLine { p: Product; qty: number }

/** Endereço pelo CEP (ViaCEP, com BrasilAPI de reserva). */
export async function lookupCep(cep: string): Promise<Partial<ShipAddress> | null> {
  const get = async (url: string) => {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) })
    return r.ok ? await r.json() : null
  }
  try {
    const d = await get(`https://viacep.com.br/ws/${cep}/json/`)
    if (d && !d.erro && d.uf) return { cep, street: d.logradouro || '', district: d.bairro || '', city: d.localidade || '', uf: d.uf }
  } catch { /* tenta a reserva */ }
  try {
    const d = await get(`https://brasilapi.com.br/api/cep/v2/${cep}`)
    if (d?.state) return { cep, street: d.street || '', district: d.neighborhood || '', city: d.city || '', uf: d.state }
  } catch { /* sem resposta */ }
  return null
}

function tableOptions(uf: string, lines: QLine[], s: Settings): ShipOption[] {
  const regions = s.shipRegions?.length ? s.shipRegions : DEFAULT_SETTINGS.shipRegions!
  const r = regions.find(x => x.key === (REGION[uf] ?? 'N')) ?? regions[regions.length - 1]
  const kg = Math.max(1, Math.ceil(weightG(lines, s) / 1000))
  // cada kg adicional custa +35% do valor base (os Correios sobem nessa faixa); a embalagem soma por cima
  const price = Math.ceil(r.price + (kg - 1) * r.price * 0.35 + (s.shipHandlingFee ?? 0))
  return [{ id: 'tabela', label: 'Envio padrão', price, days: r.days, estimated: true }]
}

function weightG(lines: QLine[], s: Settings) {
  return lines.reduce((t, l) => t + l.qty, 0) * (s.itemWeightG || 450)
}

async function melhorEnvio(toCep: string, lines: QLine[], s: Settings): Promise<ShipOption[] | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  if (!token) return null
  const host = process.env.MELHOR_ENVIO_SANDBOX === '1' ? 'sandbox.melhorenvio.com.br' : 'melhorenvio.com.br'
  const per = (s.itemWeightG || 450) / 1000
  try {
    const r = await fetch(`https://${host}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json',
        'User-Agent': `Arkyn Imports (${process.env.MELHOR_ENVIO_CONTACT || 'contato da loja'})`,
      },
      body: JSON.stringify({
        from: { postal_code: onlyDigits(s.originCep) || '79400000' },
        to: { postal_code: toCep },
        products: lines.map(l => ({ id: l.p.id, width: 15, height: 12, length: 20, weight: per, insurance_value: round2(l.p.price), quantity: l.qty })),
        options: { receipt: false, own_hand: false },
      }),
    })
    if (!r.ok) return null
    const list = await r.json()
    if (!Array.isArray(list)) return null
    const opts: ShipOption[] = list
      .filter((x: { error?: unknown; price?: unknown; custom_price?: unknown }) => !x.error && Number(x.custom_price ?? x.price) > 0)
      .map((x: { id: number; name: string; company?: { name?: string }; price: string; custom_price?: string; custom_delivery_time?: number; delivery_time?: number }) => ({
        id: `me-${x.id}`,
        label: `${x.company?.name && !x.name.includes(x.company.name) ? x.company.name + ' ' : ''}${x.name}`,
        price: round2(Number(x.custom_price ?? x.price) + (s.shipHandlingFee ?? 0)),
        days: Number(x.custom_delivery_time ?? x.delivery_time) || 0,
      }))
      .sort((a: ShipOption, b: ShipOption) => a.price - b.price)
    return opts.length ? opts.slice(0, 4) : null
  } catch { return null }
}

/** Cota o frete para um CEP. Usada pela tela (/api/shipping) e pelo checkout, que refaz a conta no servidor. */
export async function quoteShipping(cepRaw: unknown, lines: QLine[], s: Settings): Promise<ShipQuote> {
  const cep = onlyDigits(cepRaw)
  if (cep.length !== 8) return { ok: false, error: 'Informe um CEP com 8 números.' }
  if (!lines.length) return { ok: false, error: 'Sacola vazia.' }

  const address = await lookupCep(cep)
  if (!address?.uf) return { ok: false, error: 'CEP não encontrado. Confira os números.' }

  const local = s.shipping.find(x => norm(x.city) === norm(address.city || '') && address.uf === 'MS')
  if (local) return { ok: true, local: local.city, address }

  let options = await melhorEnvio(cep, lines, s)
  let estimated = false
  if (!options) { options = tableOptions(address.uf, lines, s); estimated = true }

  const subtotal = lines.reduce((t, l) => t + l.p.price * l.qty, 0)
  if ((s.freeShippingOutsideFrom ?? 0) > 0 && subtotal >= s.freeShippingOutsideFrom!) {
    const cheapest = options.reduce((a, b) => (b.price < a.price ? b : a))
    options = options.map(o => (o === cheapest ? { ...o, price: 0, label: `${o.label} (frete grátis)` } : o))
  }
  return { ok: true, address, options, estimated }
}

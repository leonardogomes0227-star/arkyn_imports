import type { ShipAddress, ShipQuote } from './types'

export const maskCep = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export const emptyAddress: ShipAddress = { cep: '', street: '', number: '', complement: '', district: '', city: '', uf: '' }

export async function fetchQuote(cep: string, items: { id: string; qty: number }[]): Promise<ShipQuote> {
  try {
    const r = await fetch('/api/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cep, items }) })
    return await r.json()
  } catch {
    return { ok: false, error: 'Não foi possível calcular o frete agora. Tente novamente ou fale pelo WhatsApp.' }
  }
}

export const savedCep = () => { try { return localStorage.getItem('cep') || '' } catch { return '' } }
export const saveCep = (c: string) => { try { localStorage.setItem('cep', c) } catch { /* ignore */ } }

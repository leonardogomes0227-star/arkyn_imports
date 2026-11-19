import { useState } from 'react'
import { brl } from '../lib/store'
import { fetchQuote, maskCep, savedCep, saveCep } from '../lib/shipping'
import type { ShipQuote } from '../lib/types'

/** Calculadora de frete por CEP (página do produto). */
export default function ShipCalc({ items }: { items: { id: string; qty: number }[] }) {
  const [cep, setCep] = useState(() => maskCep(savedCep()))
  const [q, setQ] = useState<ShipQuote | null>(null)
  const [busy, setBusy] = useState(false)
  const go = async () => {
    const d = cep.replace(/\D/g, '')
    if (d.length !== 8) return setQ({ ok: false, error: 'Informe um CEP com 8 números.' })
    setBusy(true); const r = await fetchQuote(d, items); setQ(r); setBusy(false); if (r.ok) saveCep(d)
  }
  return (
    <div className="shipcalc">
      <b>Calcular frete e prazo</b>
      <div className="ax-cep">
        <input value={cep} inputMode="numeric" autoComplete="postal-code" placeholder="Seu CEP" aria-label="CEP para calcular o frete"
          onChange={e => { setCep(maskCep(e.target.value)); setQ(null) }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); go() } }} />
        <button type="button" className={busy ? 'btn ghost is-busy' : 'btn ghost'} onClick={go} disabled={busy}>{busy ? '…' : 'Calcular'}</button>
      </div>
      <p className="ax-cep-res" role="status">
        {q && !q.ok && q.error}
        {q?.ok && q.local && <>Entrega em <b>{q.local}</b> ou retirada grátis na loja.</>}
        {q?.ok && q.options && <>{q.address?.city}/{q.address?.uf}: {q.options.map(o => <span key={o.id}><b>{o.price ? brl(o.price) : 'Grátis'}</b>{o.days ? ` em ~${o.days} dias úteis` : ''} ({o.label}){'  '}</span>)}</>}
      </p>
    </div>
  )
}

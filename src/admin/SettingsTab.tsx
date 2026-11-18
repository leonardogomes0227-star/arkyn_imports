import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_SETTINGS } from '../lib/seed'
import type { Settings } from '../lib/types'

export default function SettingsTab() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS)
  const [msg, setMsg] = useState('')
  useEffect(() => { supabase!.from('settings').select('value').eq('id', 1).maybeSingle().then(({ data }) => data?.value && setS({ ...DEFAULT_SETTINGS, ...(data.value as Settings) })) }, [])
  async function save(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase!.from('settings').upsert({ id: 1, value: s })
    setMsg(error ? error.message : 'Configurações salvas. Já valem na loja.')
  }
  const city = (i: number, patch: Partial<Settings['shipping'][number]>) => setS({ ...s, shipping: s.shipping.map((y, j) => j === i ? { ...y, ...patch } : y) })
  return (
    <form className="adm-form" onSubmit={save}>
      <h3>Loja</h3>
      <label>Faixa do topo (aviso)<input placeholder="Pix e cartão de crédito | Atendimento em Coxim - MS" value={s.announcement ?? ''} onChange={e => setS({ ...s, announcement: e.target.value })} /></label>
      <label>Título da Home<input placeholder="Seu cheiro, do jeito que você quer ser lembrado." value={s.heroTitle ?? ''} onChange={e => setS({ ...s, heroTitle: e.target.value })} /></label>
      <label>WhatsApp (com DDI e DDD)<input value={s.whatsapp} onChange={e => setS({ ...s, whatsapp: e.target.value })} /></label>
      <h3>Entrega e pagamento</h3>
      <label>Endereço de retirada<input value={s.pickupAddress} onChange={e => setS({ ...s, pickupAddress: e.target.value })} /></label>
      <label>Frete grátis a partir de R$ (0 = desativado)<input type="number" min="0" step="0.01" value={s.freeShippingFrom} onChange={e => setS({ ...s, freeShippingFrom: Number(e.target.value) })} /></label>
      <label>Parcelas máximas no cartão (1 = sem parcelamento)<input type="number" min="1" max="12" value={s.installments} onChange={e => setS({ ...s, installments: Number(e.target.value) || 1 })} /></label>
      <h4>Entrega por cidade</h4>
      {s.shipping.map((x, i) => (
        <div className="adm-row" key={i}>
          <input placeholder="Cidade" value={x.city} onChange={e => city(i, { city: e.target.value })} />
          <input type="number" min="0" step="0.01" placeholder="Valor" value={x.price} onChange={e => city(i, { price: Number(e.target.value) })} />
          <button type="button" className="link" onClick={() => setS({ ...s, shipping: s.shipping.filter((_, j) => j !== i) })}>Remover</button>
        </div>
      ))}
      <button type="button" className="btn ghost" onClick={() => setS({ ...s, shipping: [...s.shipping, { city: '', price: 0 }] })}>+ ADICIONAR CIDADE</button>
      <h4>Envio para fora da cidade</h4>
      <p className="muted">Com o token do Melhor Envio configurado na Vercel, o valor vem dos Correios em tempo real. A tabela abaixo é a reserva (e vale se o token não estiver ativo).</p>
      <label>CEP de origem (de onde sai o pedido)<input inputMode="numeric" value={s.originCep ?? ''} onChange={e => setS({ ...s, originCep: e.target.value.replace(/\D/g, '').slice(0, 8) })} /></label>
      <label>Peso médio de cada item embalado (gramas)<input type="number" min="50" step="10" value={s.itemWeightG ?? 450} onChange={e => setS({ ...s, itemWeightG: Number(e.target.value) || 450 })} /></label>
      <label>Embalagem/manuseio somado ao frete (R$)<input type="number" min="0" step="0.5" value={s.shipHandlingFee ?? 0} onChange={e => setS({ ...s, shipHandlingFee: Number(e.target.value) })} /></label>
      <label>Frete grátis para fora a partir de R$ (0 = desativado)<input type="number" min="0" step="0.01" value={s.freeShippingOutsideFrom ?? 0} onChange={e => setS({ ...s, freeShippingOutsideFrom: Number(e.target.value) })} /></label>
      {(s.shipRegions ?? []).map((r, i) => (
        <div className="adm-row" key={r.key}>
          <span style={{ flex: 2 }}>{r.label}</span>
          <input type="number" min="0" step="0.01" aria-label={`Valor ${r.label}`} placeholder="R$ (1 kg)" value={r.price} onChange={e => setS({ ...s, shipRegions: s.shipRegions!.map((y, j) => j === i ? { ...y, price: Number(e.target.value) } : y) })} />
          <input type="number" min="1" aria-label={`Dias ${r.label}`} placeholder="Dias" value={r.days} onChange={e => setS({ ...s, shipRegions: s.shipRegions!.map((y, j) => j === i ? { ...y, days: Number(e.target.value) } : y) })} />
        </div>
      ))}
      {msg && <p className="muted">{msg}</p>}
      <button className="btn">SALVAR</button>
    </form>
  )
}

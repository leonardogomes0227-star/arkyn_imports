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
      {msg && <p className="muted">{msg}</p>}
      <button className="btn">SALVAR</button>
    </form>
  )
}

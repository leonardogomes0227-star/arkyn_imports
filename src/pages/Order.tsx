import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { track } from '../lib/analytics'
import { brl, useStore } from '../lib/store'

interface OrderInfo { id: number; status: string; tracking: string | null; total: number; shipping: number; service: string; created_at: string; items: { name: string; qty: number }[] }

const STEPS: [string, string][] = [['pending', 'Aguardando pagamento'], ['paid', 'Pagamento confirmado'], ['separating', 'Separando o pedido'], ['shipped', 'Enviado'], ['delivered', 'Entregue']]
const maskPhone = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length > 10 ? 7 : 6)}-${d.slice(d.length > 10 ? 7 : 6)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d }

export default function Order() {
  usePageMeta({ title: 'Acompanhar pedido | Arkyn Imports', description: 'Acompanhe o status e o rastreio do seu pedido.', noindex: true })
  const { settings, clear } = useStore()
  const [sp] = useSearchParams()
  let last: { id?: string; phone?: string } = {}
  try { last = JSON.parse(localStorage.getItem('lastOrder') || '{}') } catch { /* ignore */ }
  const [id, setId] = useState(sp.get('external_reference') || last.id || '')
  const [phone, setPhone] = useState(last.phone ? maskPhone(last.phone) : '')
  const [o, setO] = useState<OrderInfo | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const mp = sp.get('collection_status') || sp.get('status')

  async function find(e?: FormEvent) {
    e?.preventDefault(); setErr(''); setBusy(true)
    try {
      const d = await (await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, phone }) })).json()
      if (d.ok) { setO(d.order); if (mp === 'approved' || ['paid', 'separating', 'shipped', 'delivered'].includes(d.order.status)) { track.purchase(String(d.order.id), d.order.total) } } else setErr(d.error || 'Não foi possível consultar.')
    } catch { setErr('Não foi possível consultar agora. Tente de novo ou fale pelo WhatsApp.') }
    setBusy(false)
  }
  useEffect(() => { if (mp === 'approved' || mp === 'pending' || mp === 'in_process') clear(); if (id && phone.replace(/\D/g, '').length >= 10) find() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  const idx = o ? STEPS.findIndex(s => s[0] === o.status) : -1
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Quero falar sobre o pedido${id ? ' #' + id : ''}.`)}`
  return (
    <section className="section ck order-page">
      <h1 className="ck-title">{mp === 'approved' ? 'Obrigado pela compra!' : 'Acompanhar pedido'}</h1>
      {mp === 'approved' && <p className="muted">Recebemos o seu pagamento. Você pode acompanhar tudo por aqui.</p>}
      {mp === 'pending' && <p className="muted">Pagamento em análise. Assim que for confirmado, o status muda aqui.</p>}
      {!o ? (
        <form className="ck-card" onSubmit={find}>
          <label className="ck-f">Número do pedido<input value={id} inputMode="numeric" onChange={e => setId(e.target.value.replace(/\D/g, ''))} placeholder="Ex.: 123" /></label>
          <label className="ck-f">Telefone usado na compra<input value={phone} inputMode="tel" onChange={e => setPhone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" /></label>
          {err && <p className="ck-err ck-err-box" role="alert">{err}</p>}
          <button className={busy ? 'btn is-busy' : 'btn'} disabled={busy || !id || phone.replace(/\D/g, '').length < 10}>{busy ? 'Buscando…' : 'Consultar pedido'}</button>
          <a className="btn ghost" href={wa} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
        </form>
      ) : (
        <div className="ck-card">
          <p><b>Pedido #{o.id}</b> · {new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
          {o.status === 'cancelled' ? <p className="ck-err-box">Pedido cancelado.</p> : (
            <ol className="ord-steps">{STEPS.map(([k, l], i) => <li key={k} className={i <= idx ? 'on' : ''}>{l}</li>)}</ol>
          )}
          {o.tracking && <p>Código de rastreio: <b>{o.tracking}</b> · <a href={`https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(o.tracking)}`} target="_blank" rel="noreferrer">Rastrear nos Correios</a></p>}
          <p className="muted">{o.service}</p>
          <ul>{o.items.map((i, k) => <li key={k}>{i.qty}x {i.name}</li>)}</ul>
          <p>{o.shipping ? `Frete ${brl(o.shipping)} · ` : ''}<b>Total {brl(o.total)}</b></p>
          <a className="btn ghost" href={wa} target="_blank" rel="noreferrer">Falar sobre este pedido</a>
          <Link to="/catalogo" className="link">Continuar comprando</Link>
        </div>
      )}
    </section>
  )
}

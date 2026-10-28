import { useState } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'

export default function Cart() {
  const { cart, products, settings, setQty, clear } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('pickup')
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [cp, setCp] = useState<{ code: string; discount: number; label: string } | null>(null)
  const [cpErr, setCpErr] = useState('')
  const [err, setErr] = useState('')

  const lines = cart.flatMap(i => { const p = products.find(x => x.id === i.id); return p ? [{ p, qty: i.qty }] : [] })
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const city = settings.shipping.find(s => s.city === method)
  const free = settings.freeShippingFrom > 0 && subtotal >= settings.freeShippingFrom
  const shipping = method === 'pickup' || free ? 0 : city?.price ?? 0
  const discount = cp ? Math.min(cp.discount, subtotal) : 0
  const total = subtotal - discount + shipping

  if (!lines.length) return <section className="section"><h2>Carrinho</h2><p className="muted">Seu carrinho está vazio.</p><Link to="/catalogo" className="btn">Ver catálogo</Link></section>

  const summary = lines.map(l => `${l.qty}x ${l.p.brand} ${l.p.name}`).join('\n')
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Quero comprar:\n${summary}\nTotal: ${brl(total)}\nEntrega: ${method === 'pickup' ? 'Retirada' : method}\nNome: ${name}`)}`

  async function applyCoupon() {
    setCpErr('')
    try {
      const r = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) })
      const d = await r.json()
      if (d.ok) setCp({ code: code.trim().toUpperCase(), discount: d.discount, label: d.label }); else { setCp(null); setCpErr(d.error || 'Cupom inválido') }
    } catch { setCpErr('Não foi possível validar o cupom agora.') }
  }

  async function pay() {
    if (!name.trim() || !phone.trim()) return setErr('Preencha nome e telefone.')
    setErr(''); setBusy(true)
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, name, phone, method, coupon: cp?.code }),
      })
      const d = await r.json()
      if (!r.ok || !d.url) throw new Error(d.error || 'Falha ao iniciar pagamento')
      clear(); window.location.href = d.url
    } catch (e) { setErr((e as Error).message); setBusy(false) }
  }

  return (
    <section className="section">
      <h2>Carrinho</h2>
      {lines.map(({ p, qty }) => (
        <div className="line" key={p.id}>
          <div><small>{p.brand}</small><h3>{p.name}</h3></div>
          <div className="qty"><button onClick={() => setQty(p.id, qty - 1)}>−</button><span>{qty}</span><button onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))}>+</button></div>
          <strong>{brl(p.price * qty)}</strong>
        </div>
      ))}
      <div className="form">
        <input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Telefone / WhatsApp" value={phone} onChange={e => setPhone(e.target.value)} />
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option value="pickup">Retirada: {settings.pickupAddress}</option>
          {settings.shipping.map(s => <option key={s.city} value={s.city}>Entrega em {s.city} ({brl(s.price)})</option>)}
        </select>
        <div className="adm-row" style={{ marginBottom: 0 }}>
          <input placeholder="Cupom de desconto" value={code} onChange={e => setCode(e.target.value)} style={{ flex: 1 }} />
          <button type="button" className="btn ghost" onClick={applyCoupon} disabled={!code.trim()}>APLICAR</button>
        </div>
        {cpErr && <p className="err">{cpErr}</p>}
        {cp && <p className="muted">Cupom {cp.code}: {cp.label} (−{brl(discount)})</p>}
        <p className="muted">Subtotal {brl(subtotal)}{discount ? ` · Desconto −${brl(discount)}` : ''} · Frete {shipping ? brl(shipping) : 'grátis'}</p>
        <h3 className="total">Total {brl(total)}</h3>
        {err && <p className="err">{err}</p>}
        <button className="btn" disabled={busy} onClick={pay}>{busy ? 'Aguarde...' : 'Pagar com Pix ou cartão'}</button>
        <a className="btn ghost" href={wa} target="_blank" rel="noreferrer">Finalizar pelo WhatsApp</a>
      </div>
    </section>
  )
}

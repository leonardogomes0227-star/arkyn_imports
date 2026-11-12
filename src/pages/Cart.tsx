import SizedImg from '../components/SizedImg'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function Cart() {
  const { cart, products, settings, setQty, clear } = useStore()
  const { toast } = useToast()
  usePageMeta({ title: 'Finalizar compra | Arkyn Imports', description: 'Finalize sua compra com Pix ou cartão de crédito.', noindex: true })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState({ name: false, phone: false })
  const [method, setMethod] = useState('pickup')
  const [pay, setPay] = useState<'pix' | 'card'>('pix')
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [cp, setCp] = useState<{ code: string; discount: number; label: string } | null>(null)
  const [cpErr, setCpErr] = useState('')
  const [cpBusy, setCpBusy] = useState(false)
  const [err, setErr] = useState('')

  const lines = cart.flatMap(i => { const p = products.find(x => x.id === i.id); return p ? [{ p, qty: i.qty }] : [] })
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const city = settings.shipping.find(s => s.city === method)
  const free = settings.freeShippingFrom > 0 && subtotal >= settings.freeShippingFrom
  const shipping = method === 'pickup' || free ? 0 : city?.price ?? 0
  const discount = cp ? Math.min(cp.discount, subtotal) : 0
  const pixOff = pay === 'pix' ? Math.round(subtotal * ((settings.pixDiscount ?? 0) / 100) * 100) / 100 : 0
  const total = Math.max(0, subtotal - discount - pixOff) + shipping
  const cardTotal = Math.max(0, subtotal - discount) + shipping
  const pixTotal = Math.max(0, subtotal - discount - Math.round(subtotal * ((settings.pixDiscount ?? 0) / 100) * 100) / 100) + shipping

  const nameErr = name.trim().length < 2 ? 'Informe seu nome.' : ''
  const phoneErr = phone.replace(/\D/g, '').length < 10 ? 'Informe um telefone com DDD.' : ''

  if (!lines.length) return (
    <section className="section ax-empty-page">
      <p className="ax-eyebrow">Sacola</p><h1>Sua sacola está vazia</h1>
      <p className="muted">Explore o catálogo e escolha o perfume ideal.</p>
      <Link to="/catalogo" className="btn">Ver o catálogo</Link>
    </section>
  )

  const summary = lines.map(l => `${l.qty}x ${l.p.brand} ${l.p.name}`).join('\n')
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Quero comprar:\n${summary}\nTotal: ${brl(total)}\nEntrega: ${method === 'pickup' ? 'Retirada' : method}\nNome: ${name}`)}`

  async function applyCoupon() {
    setCpErr(''); setCpBusy(true)
    try {
      const r = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) })
      const d = await r.json()
      if (d.ok) { setCp({ code: code.trim().toUpperCase(), discount: d.discount, label: d.label }); toast(`Cupom ${code.trim().toUpperCase()} aplicado`) } else { setCp(null); setCpErr(d.error || 'Cupom inválido') }
    } catch { setCpErr('Não foi possível validar o cupom agora.') }
    setCpBusy(false)
  }

  async function checkout() {
    setTouched({ name: true, phone: true })
    if (nameErr || phoneErr) return setErr('Confira os dados destacados para continuar.')
    setErr(''); setBusy(true)
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, name, phone, method, coupon: cp?.code, pay }),
      })
      const d = await r.json()
      if (!r.ok || !d.url) throw new Error(d.error || 'Falha ao iniciar pagamento')
      clear(); window.location.href = d.url
    } catch (e) {
      const msg = (e as Error).message
      // erro de configuração do pagamento: não mostra texto técnico ao cliente
      setErr(/MP_ACCESS_TOKEN|Mercado Pago|Unexpected token|Failed to fetch/i.test(msg) ? 'O pagamento online está indisponível no momento. Você pode finalizar pelo WhatsApp, é rápido.' : msg)
      setBusy(false)
    }
  }

  return (
    <section className="section ck">
      <nav className="crumbs" aria-label="Você está em"><Link to="/catalogo">Catálogo</Link> / <span aria-current="page">Finalizar compra</span></nav>
      <h1 className="ck-title">Finalizar compra</h1>

      <div className="ck-grid">
        <div className="ck-main">
          <fieldset className="ck-card">
            <legend><i>1</i> Seus dados</legend>
            <label className="ck-f">Nome completo
              <input value={name} autoComplete="name" onChange={e => setName(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: true }))} aria-invalid={touched.name && !!nameErr} aria-describedby="e-name" placeholder="Como devemos te chamar" />
              <span id="e-name" className="ck-err" role="alert">{touched.name ? nameErr : ''}</span>
            </label>
            <label className="ck-f">Telefone / WhatsApp
              <input value={phone} inputMode="tel" autoComplete="tel" onChange={e => setPhone(maskPhone(e.target.value))} onBlur={() => setTouched(t => ({ ...t, phone: true }))} aria-invalid={touched.phone && !!phoneErr} aria-describedby="e-phone" placeholder="(00) 00000-0000" />
              <span id="e-phone" className="ck-err" role="alert">{touched.phone ? phoneErr : ''}</span>
            </label>
          </fieldset>

          <fieldset className="ck-card">
            <legend><i>2</i> Entrega</legend>
            <label className={method === 'pickup' ? 'ck-opt on' : 'ck-opt'}>
              <input type="radio" name="method" checked={method === 'pickup'} onChange={() => setMethod('pickup')} />
              <span><b>Retirada</b><small>{settings.pickupAddress}</small></span><em>Grátis</em>
            </label>
            {settings.shipping.map(s => (
              <label key={s.city} className={method === s.city ? 'ck-opt on' : 'ck-opt'}>
                <input type="radio" name="method" checked={method === s.city} onChange={() => setMethod(s.city)} />
                <span><b>Entrega em {s.city}</b></span><em>{free || s.price === 0 ? 'Grátis' : brl(s.price)}</em>
              </label>
            ))}
          </fieldset>

          <fieldset className="ck-card">
            <legend><i>3</i> Pagamento</legend>
            <label className={pay === 'pix' ? 'ck-opt on' : 'ck-opt'}>
              <input type="radio" name="pay" checked={pay === 'pix'} onChange={() => setPay('pix')} />
              <span><b>Pix</b><small>{(settings.pixDiscount ?? 0) > 0 ? `${settings.pixDiscount}% de desconto` : 'Aprovação na hora'}</small></span>
              <em>{brl(pixTotal)}</em>
            </label>
            <label className={pay === 'card' ? 'ck-opt on' : 'ck-opt'}>
              <input type="radio" name="pay" checked={pay === 'card'} onChange={() => setPay('card')} />
              <span><b>Cartão de crédito</b><small>{settings.installments > 1 ? `até ${settings.installments}x de ${brl(cardTotal / settings.installments)}` : 'Pelo Mercado Pago'}</small></span>
              <em>{brl(cardTotal)}</em>
            </label>
          </fieldset>

          <fieldset className="ck-card">
            <legend><i>4</i> Cupom de desconto</legend>
            {cp ? (
              <p className="ck-coupon-ok"><b>{cp.code}</b> · {cp.label} (−{brl(discount)}) <button type="button" className="link" onClick={() => { setCp(null); setCode('') }}>Remover</button></p>
            ) : (
              <div className="ck-coupon">
                <input placeholder="Digite o código" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && code.trim()) { e.preventDefault(); applyCoupon() } }} aria-label="Código do cupom" autoCapitalize="characters" />
                <button type="button" className={cpBusy ? 'btn ghost is-busy' : 'btn ghost'} onClick={applyCoupon} disabled={!code.trim()}>{cpBusy ? 'Validando…' : 'Aplicar'}</button>
              </div>
            )}
            {cpErr && <p className="ck-err" role="alert">{cpErr}</p>}
          </fieldset>
        </div>

        <aside className="ck-sum" aria-label="Resumo do pedido">
          <h2>Resumo do pedido</h2>
          <ul className="ck-items">
            {lines.map(({ p, qty }) => (
              <li key={p.id}>
                <Link to={`/produto/${p.id}`} className="ck-img">{p.image ? <SizedImg src={p.image} size={160} alt="" width={160} height={160} /> : null}</Link>
                <div>
                  <small>{p.brand}</small>
                  <Link to={`/produto/${p.id}`} className="ck-name">{p.name}</Link>
                  <div className="ax-line-row">
                    <div className="ax-step" role="group" aria-label={`Quantidade de ${p.name}`}>
                      <button type="button" onClick={() => setQty(p.id, qty - 1)} aria-label="Diminuir">−</button>
                      <output>{qty}</output>
                      <button type="button" onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))} aria-label="Aumentar" disabled={qty >= p.stock}>+</button>
                    </div>
                    <b>{brl(p.price * qty)}</b>
                  </div>
                  <button type="button" className="ax-remove" onClick={() => setQty(p.id, 0)}>Remover</button>
                </div>
              </li>
            ))}
          </ul>
          <dl className="ck-totals">
            <div><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
            {discount > 0 && <div><dt>Cupom</dt><dd>−{brl(discount)}</dd></div>}
            {pixOff > 0 && <div><dt>Desconto Pix</dt><dd>−{brl(pixOff)}</dd></div>}
            <div><dt>Frete</dt><dd>{shipping ? brl(shipping) : 'Grátis'}</dd></div>
            <div className="ck-total"><dt>Total</dt><dd>{brl(total)}</dd></div>
          </dl>
          {err && <p className="ck-err ck-err-box" role="alert">{err}</p>}
          <button type="button" className={busy ? 'btn block is-busy' : 'btn block'} disabled={busy} onClick={checkout}>{busy ? 'Aguarde…' : pay === 'pix' ? `Pagar ${brl(total)} no Pix` : `Pagar ${brl(total)} no cartão`}</button>
          <a className="btn ghost block" href={wa} target="_blank" rel="noreferrer">Finalizar pelo WhatsApp</a>
          <p className="ck-secure">Pagamento seguro pelo Mercado Pago. Você será levado ao ambiente deles para concluir.</p>
        </aside>
      </div>
    </section>
  )
}

import SizedImg from '../components/SizedImg'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'
import { bundleDiscount } from '../lib/pricing'
import { track } from '../lib/analytics'
import { emptyAddress, fetchQuote, maskCep, savedCep, saveCep } from '../lib/shipping'
import type { ShipAddress, ShipQuote } from '../lib/types'
import { photoOf } from '../lib/cutouts'

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
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [cp, setCp] = useState<{ code: string; discount: number; label: string } | null>(null)
  const [cpErr, setCpErr] = useState('')
  const [cpBusy, setCpBusy] = useState(false)
  const [err, setErr] = useState('')
  const [addr, setAddr] = useState<ShipAddress>({ ...emptyAddress, cep: maskCep(savedCep()) })
  const [quote, setQuote] = useState<ShipQuote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [shipId, setShipId] = useState('')
  const [triedPay, setTriedPay] = useState(false)
  const [isGift, setIsGift] = useState(false)
  const [gift, setGift] = useState('')
  const setA = (patch: Partial<ShipAddress>) => setAddr(a => ({ ...a, ...patch }))

  const lines = cart.flatMap(i => { const p = products.find(x => x.id === i.id); return p ? [{ p, qty: i.qty }] : [] })
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const city = settings.shipping.find(s => s.city === method)
  const free = settings.freeShippingFrom > 0 && subtotal >= settings.freeShippingFrom
  const shipOpt = method === 'ship' ? quote?.options?.find(o => o.id === shipId) : undefined
  const shipping = method === 'pickup' ? 0 : method === 'ship' ? shipOpt?.price ?? 0 : free ? 0 : city?.price ?? 0
  const needShip = method === 'ship' && !shipOpt
  const freeOutLeft = (settings.freeShippingOutsideFrom ?? 0) - subtotal
  const cartKey = cart.map(i => `${i.id}:${i.qty}`).join(',')

  // consulta o frete assim que o CEP estiver completo (e de novo se a sacola mudar)
  useEffect(() => {
    const digits = addr.cep.replace(/\D/g, '')
    if (method !== 'ship' || digits.length !== 8 || !cart.length) { setQuote(null); return }
    let alive = true
    setQuoting(true)
    const t = window.setTimeout(async () => {
      const q = await fetchQuote(digits, cart)
      if (!alive) return
      setQuote(q); setQuoting(false); saveCep(digits)
      if (q.ok && q.options?.length) {
        setShipId(cur => (q.options!.some(o => o.id === cur) ? cur : q.options![0].id))
        setAddr(a => ({ ...a, street: a.street || q.address?.street || '', district: a.district || q.address?.district || '', city: q.address?.city || a.city, uf: q.address?.uf || a.uf }))
      }
    }, 250)
    return () => { alive = false; window.clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, addr.cep, cartKey])

  useEffect(() => { track.beginCheckout(lines.map(l => ({ id: l.p.id, name: l.p.name, brand: l.p.brand, price: l.p.price, qty: l.qty }))) /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  // guarda o carrinho de quem já informou o telefone (a loja pode chamar no WhatsApp se não finalizar)
  useEffect(() => {
    if (phone.replace(/\D/g, '').length < 10 || !cart.length) return
    const t = window.setTimeout(() => { fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, items: cart }) }).catch(() => null) }, 1500)
    return () => window.clearTimeout(t)
  }, [phone, name, cartKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const needAddr = method !== 'pickup'
  const addrErr = needAddr && (!addr.street.trim() || !addr.number.trim() || !addr.district.trim()) ? 'Preencha rua, número e bairro.' : ''
  const qtyTotal = lines.reduce((t, l) => t + l.qty, 0)
  const bundle = bundleDiscount(subtotal, qtyTotal, settings)
  const discount = Math.min(subtotal, (cp ? cp.discount : 0) + bundle)
  const total = subtotal - discount + shipping

  const nameErr = name.trim().length < 2 ? 'Informe seu nome.' : ''
  const phoneErr = phone.replace(/\D/g, '').length < 10 ? 'Informe um telefone com DDD.' : ''

  if (!lines.length) return (
    <section className="section ax-empty-page">
      <p className="ax-eyebrow">Sacola</p><h1>Sua sacola está vazia</h1>
      <p className="muted">Explore o catálogo e escolha o perfume ideal.</p>
      <Link to="/catalogo" className="btn">Ver o catálogo</Link>
    </section>
  )

  const addrLine = needAddr ? `${addr.street}, ${addr.number}${addr.complement ? ' ' + addr.complement : ''} - ${addr.district}${addr.city ? ` - ${addr.city}/${addr.uf}` : ''}${addr.cep ? ` - CEP ${addr.cep}` : ''}` : ''
  const summary = lines.map(l => `${l.qty}x ${l.p.brand} ${l.p.name}`).join('\n')
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Quero comprar:\n${summary}\nTotal: ${brl(total)}\nEntrega: ${method === 'pickup' ? 'Retirada' : method === 'ship' ? `${shipOpt?.label ?? 'Envio'} (${shipOpt ? brl(shipOpt.price) : 'a calcular'})` : method}${addrLine ? `\nEndereço: ${addrLine}` : ''}\n${isGift ? `\nPresente: ${gift || 'sim'}` : ''}\nNome: ${name}`)}`

  async function applyCoupon() {
    setCpErr(''); setCpBusy(true)
    try {
      const r = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) })
      const d = await r.json()
      if (d.ok) { setCp({ code: code.trim().toUpperCase(), discount: d.discount, label: d.label }); toast(`Cupom ${code.trim().toUpperCase()} aplicado`) } else { setCp(null); setCpErr(d.error || 'Cupom inválido') }
    } catch { setCpErr('Não foi possível validar o cupom agora.') }
    setCpBusy(false)
  }

  async function pay() {
    setTouched({ name: true, phone: true }); setTriedPay(true)
    if (nameErr || phoneErr) return setErr('Confira os dados destacados para continuar.')
    if (method === 'ship' && !shipOpt) return setErr('Informe o CEP e escolha uma opção de frete.')
    if (addrErr) return setErr(addrErr)
    setErr(''); setBusy(true)
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, name, phone, method, coupon: cp?.code, gift: isGift ? gift : undefined, address: needAddr ? { ...addr, cep: addr.cep.replace(/\D/g, '') } : undefined, shippingId: method === 'ship' ? shipId : undefined }),
      })
      const d = await r.json()
      if (!r.ok || !d.url) throw new Error(d.error || 'Falha ao iniciar pagamento')
      try { localStorage.setItem('lastOrder', JSON.stringify({ id: d.orderId, phone })) } catch { /* ignore */ }
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
      <ol className="ck-steps" aria-label="Etapas">
        <li className={nameErr || phoneErr ? 'on' : 'done'}>Dados</li>
        <li className={!nameErr && !phoneErr && (needShip || addrErr) ? 'on' : !nameErr && !phoneErr ? 'done' : ''}>Entrega</li>
        <li className={!nameErr && !phoneErr && !needShip && !addrErr ? 'on' : ''}>Pagamento</li>
      </ol>

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
                <span><b>Entrega em {s.city}</b><small>Receba em casa</small></span><em>{free || s.price === 0 ? 'Grátis' : brl(s.price)}</em>
              </label>
            ))}
            <label className={method === 'ship' ? 'ck-opt on' : 'ck-opt'}>
              <input type="radio" name="method" checked={method === 'ship'} onChange={() => setMethod('ship')} />
              <span><b>Enviar para outra cidade ou estado</b><small>Correios / transportadora, calculado pelo CEP{freeOutLeft > 0 && (settings.freeShippingOutsideFrom ?? 0) > 0 ? ` · frete grátis acima de ${brl(settings.freeShippingOutsideFrom!)}` : ''}</small></span><em>{shipOpt ? (shipOpt.price ? brl(shipOpt.price) : 'Grátis') : 'Por CEP'}</em>
            </label>

            {needAddr && (
              <div className="ck-addr">
                {method === 'ship' && (
                  <label className="ck-f ck-cep">CEP
                    <input value={addr.cep} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" onChange={e => setA({ cep: maskCep(e.target.value) })} />
                    <span className="ck-hint">{quoting ? 'Calculando o frete…' : <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei meu CEP</a>}</span>
                  </label>
                )}
                {method === 'ship' && quote && !quote.ok && <p className="ck-err" role="alert">{quote.error}</p>}
                {method === 'ship' && quote?.ok && quote.local && (
                  <p className="ck-coupon-ok">Esse CEP é de {quote.local}. <button type="button" className="link" onClick={() => setMethod(quote.local!)}>Usar entrega em {quote.local}</button></p>
                )}
                {method === 'ship' && quote?.ok && quote.options && (
                  <div className="ck-ship-opts" role="radiogroup" aria-label="Opções de frete">
                    {quote.options.map(o => (
                      <label key={o.id} className={shipId === o.id ? 'ck-opt on' : 'ck-opt'}>
                        <input type="radio" name="shipopt" checked={shipId === o.id} onChange={() => setShipId(o.id)} />
                        <span><b>{o.label}</b>{o.days > 0 && <small>{quote.estimated ? 'Prazo estimado: ' : 'Chega em '}{o.days} {o.days === 1 ? 'dia útil' : 'dias úteis'} após a postagem</small>}</span>
                        <em>{o.price ? brl(o.price) : 'Grátis'}</em>
                      </label>
                    ))}
                    {quote.estimated && <p className="ck-hint">Valor estimado para a sua região. Se houver diferença, avisamos antes de enviar.</p>}
                  </div>
                )}
                {(method !== 'ship' || quote?.ok) && !quote?.local && (
                  <div className="ck-addr-grid">
                    <label className="ck-f ck-span">Rua / Avenida
                      <input value={addr.street} autoComplete="address-line1" onChange={e => setA({ street: e.target.value })} aria-invalid={triedPay && !addr.street.trim()} />
                    </label>
                    <label className="ck-f">Número
                      <input value={addr.number} inputMode="numeric" autoComplete="off" onChange={e => setA({ number: e.target.value })} aria-invalid={triedPay && !addr.number.trim()} placeholder="S/N se não houver" />
                    </label>
                    <label className="ck-f">Complemento
                      <input value={addr.complement} autoComplete="address-line2" onChange={e => setA({ complement: e.target.value })} placeholder="Apto, bloco (opcional)" />
                    </label>
                    <label className="ck-f ck-span">Bairro
                      <input value={addr.district} onChange={e => setA({ district: e.target.value })} aria-invalid={triedPay && !addr.district.trim()} />
                    </label>
                    {method === 'ship' && addr.city && <p className="ck-hint ck-span">Entrega em <b>{addr.city}/{addr.uf}</b></p>}
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="ck-card">
            <legend><i>3</i> Presente e cupom</legend>
            <label className="ck-gift"><input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} /> É presente? Enviamos sem o preço e com um cartão</label>
            {isGift && <label className="ck-f">Mensagem do cartão<textarea rows={3} maxLength={200} value={gift} onChange={e => setGift(e.target.value)} placeholder="Escreva a mensagem (opcional)" /></label>}
            {(settings.bundleMinQty ?? 0) >= 2 && (settings.bundlePercent ?? 0) > 0 && (
              <p className="ck-hint">{bundle > 0 ? `Desconto de ${settings.bundlePercent}% por levar ${settings.bundleMinQty} ou mais itens aplicado.` : `Leve ${settings.bundleMinQty} itens e ganhe ${settings.bundlePercent}% de desconto.`}</p>
            )}
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
                <Link to={`/produto/${p.id}`} className="ck-img">{photoOf(p) ? <SizedImg src={photoOf(p)!} size={160} alt="" width={160} height={160} /> : null}</Link>
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
            {bundle > 0 && <div><dt>Desconto por quantidade</dt><dd>−{brl(bundle)}</dd></div>}
            {cp && <div><dt>Cupom</dt><dd>−{brl(Math.min(cp.discount, subtotal))}</dd></div>}
            <div><dt>Frete</dt><dd>{needShip ? 'Informe o CEP' : shipping ? brl(shipping) : 'Grátis'}</dd></div>
            <div className="ck-total"><dt>Total</dt><dd>{brl(total)}</dd></div>
          </dl>
          {err && <p className="ck-err ck-err-box" role="alert">{err}</p>}
          <button type="button" className={busy ? 'btn block is-busy' : 'btn block'} disabled={busy || needShip} onClick={pay}>{busy ? 'Aguarde…' : 'Pagar com Pix ou cartão'}</button>
          <a className="btn ghost block" href={wa} target="_blank" rel="noreferrer">Finalizar pelo WhatsApp</a>
          <ul className="ck-trust">
            <li>Pagamento seguro</li><li>Envio para todo o Brasil</li><li><Link to="/politica/trocas">Troca e devolução</Link></li>
          </ul>
          <p className="ck-secure">Pagamento seguro pelo Mercado Pago. Você será levado ao ambiente deles para concluir.</p>
        </aside>
      </div>
      <div className="ck-bar">
        <div><small>Total</small><b>{brl(total)}</b></div>
        <button type="button" className={busy ? 'btn is-busy' : 'btn'} disabled={busy || needShip} onClick={pay}>{busy ? 'Aguarde…' : needShip ? 'Informe o CEP' : 'Pagar'}</button>
      </div>
    </section>
  )
}

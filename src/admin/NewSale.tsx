import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money, useAllProducts } from './shared'

const PAY = ['Pix', 'Dinheiro', 'Cartão', 'Transferência', 'Outro']

export default function NewSale() {
  const { items, reload } = useAllProducts()
  const [q, setQ] = useState('')
  const [lines, setLines] = useState<{ id: string; qty: number }[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [delivery, setDelivery] = useState('pickup')
  const [payment, setPayment] = useState('Pix')
  const [paid, setPaid] = useState(true)
  const [shipping, setShipping] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const found = useMemo(() => q.trim() ? items.filter(p => p.stock > 0 && `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [], [items, q])
  const by = (id: string) => items.find(p => p.id === id)
  const subtotal = lines.reduce((s, l) => s + (by(l.id)?.price ?? 0) * l.qty, 0)
  const total = Math.max(0, subtotal - discount + shipping)

  const add = (id: string) => { setLines(ls => ls.some(l => l.id === id) ? ls.map(l => l.id === id ? { ...l, qty: l.qty + 1 } : l) : [...ls, { id, qty: 1 }]); setQ('') }
  const setQty = (id: string, qty: number) => setLines(ls => qty <= 0 ? ls.filter(l => l.id !== id) : ls.map(l => l.id === id ? { ...l, qty } : l))

  async function save() {
    if (!lines.length) return setMsg('Adicione pelo menos um produto.')
    if (!name.trim()) return setMsg('Informe o nome do cliente.')
    const over = lines.find(l => l.qty > (by(l.id)?.stock ?? 0))
    if (over) return setMsg(`Estoque insuficiente de ${by(over.id)?.name}.`)
    setBusy(true); setMsg('')
    const { error } = await supabase!.from('orders').insert({
      customer_name: name.trim(), phone: phone.trim(), delivery, items: lines, total, status: paid ? 'paid' : 'pending',
      subtotal, shipping, discount, payment, source: 'manual',
    })
    if (error) { setBusy(false); return setMsg(error.message + ' — rode supabase/ferramentas.sql no Supabase.') }
    if (paid) for (const l of lines) { const p = by(l.id)!; await supabase!.from('products').update({ stock: Math.max(0, p.stock - l.qty) }).eq('id', p.id) }
    setBusy(false); setLines([]); setName(''); setPhone(''); setShipping(0); setDiscount(0); reload()
    setMsg(`Venda registrada (${money(total)})${paid ? ' e estoque atualizado.' : '. O estoque baixa quando você marcar o pedido como pago, na aba Pedidos.'}`)
  }

  return (
    <div className="adm-form" style={{ maxWidth: 760 }}>
      <h3>Registrar venda (WhatsApp, Instagram ou balcão)</h3>
      <p className="muted">Use quando o cliente comprar fora do site. A venda entra nos pedidos, no faturamento e baixa o estoque.</p>
      <label>Buscar produto<input placeholder="Digite o nome ou a marca" value={q} onChange={e => setQ(e.target.value)} /></label>
      {found.map(p => <div className="adm-line" key={p.id}><div className="grow">{p.brand} {p.name} <span className="muted">· {money(p.price)} · {p.stock} em estoque</span></div><button className="btn ghost" onClick={() => add(p.id)}>ADICIONAR</button></div>)}
      {lines.map(l => { const p = by(l.id); return (
        <div className="adm-line" key={l.id}>
          <div className="grow">{p ? `${p.brand} ${p.name}` : l.id}</div>
          <label>Qtd<input type="number" min="0" value={l.qty} onChange={e => setQty(l.id, Number(e.target.value))} /></label>
          <b>{money((p?.price ?? 0) * l.qty)}</b>
        </div>) })}
      <div className="adm-grid">
        <label>Cliente<input value={name} onChange={e => setName(e.target.value)} /></label>
        <label>WhatsApp<input value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <label>Entrega<input value={delivery === 'pickup' ? 'pickup' : delivery} onChange={e => setDelivery(e.target.value || 'pickup')} placeholder="pickup = retirada, ou a cidade" /></label>
        <label>Pagamento<select value={payment} onChange={e => setPayment(e.target.value)}>{PAY.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Frete (R$)<input type="number" min="0" step="0.01" value={shipping} onChange={e => setShipping(Number(e.target.value))} /></label>
        <label>Desconto (R$)<input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></label>
      </div>
      <label className="chk"><input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} /> Já foi pago (baixa o estoque agora)</label>
      <h3>Total: {money(total)}</h3>
      {msg && <p className={msg.startsWith('Venda') ? 'muted' : 'err'}>{msg}</p>}
      <button className="btn" disabled={busy} onClick={save}>{busy ? 'SALVANDO…' : 'REGISTRAR VENDA'}</button>
    </div>
  )
}

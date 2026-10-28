import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../lib/store'
import { downloadCsv, STATUS, statusLabel, useAllProducts, useOrders, waLink, type Order } from './shared'

export default function OrdersTab() {
  const { orders, setOrders, loading, reload } = useOrders()
  const { items: products } = useAllProducts()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<number | null>(null)
  const name = (id: string) => { const p = products.find(x => x.id === id); return p ? `${p.brand} ${p.name}` : id }

  const shown = useMemo(() => orders.filter(o =>
    (!status || o.status === status) &&
    `${o.id} ${o.customer_name} ${o.phone}`.toLowerCase().includes(q.toLowerCase())), [orders, status, q])

  async function patch(o: Order, p: Partial<Order>) {
    await supabase!.from('orders').update(p).eq('id', o.id)
    setOrders(os => os.map(x => x.id === o.id ? { ...x, ...p } : x))
  }
  function exportCsv() {
    downloadCsv('pedidos.csv', [
      ['Pedido', 'Data', 'Cliente', 'Telefone', 'Entrega', 'Itens', 'Subtotal', 'Frete', 'Desconto', 'Cupom', 'Total', 'Status', 'Rastreio'],
      ...shown.map(o => [o.id, new Date(o.created_at).toLocaleString('pt-BR'), o.customer_name, o.phone, o.delivery === 'pickup' ? 'Retirada' : o.delivery,
        o.items.map(i => `${i.qty}x ${name(i.id)}`).join(' | '), (Number(o.total) - Number(o.shipping || 0) + Number(o.discount || 0)).toFixed(2), Number(o.shipping || 0).toFixed(2), Number(o.discount || 0).toFixed(2), o.coupon, Number(o.total).toFixed(2), statusLabel(o.status), o.tracking])])
  }

  if (loading) return <p className="muted">Carregando…</p>
  return (
    <>
      <div className="adm-row">
        <div className="adm-row" style={{ marginBottom: 0 }}>
          <input placeholder="Buscar por nome, telefone ou nº" value={q} onChange={e => setQ(e.target.value)} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS.map(([v, l]) => <option key={v} value={v}>{l} ({orders.filter(o => o.status === v).length})</option>)}
          </select>
        </div>
        <span><button className="btn ghost" onClick={reload}>ATUALIZAR</button> <button className="btn ghost" onClick={exportCsv}>EXPORTAR CSV</button></span>
      </div>
      {!shown.length && <p className="muted">Nenhum pedido encontrado.</p>}
      {shown.map(o => (
        <div className="adm-card" key={o.id}>
          <div className="adm-row" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => setOpen(open === o.id ? null : o.id)}>
            <b>#{o.id} · {o.customer_name}</b>
            <span className="muted">{new Date(o.created_at).toLocaleString('pt-BR')} · <b>{brl(Number(o.total))}</b> · <span className={`pill s-${o.status}`}>{statusLabel(o.status)}</span></span>
          </div>
          {open === o.id && (
            <>
              <p><a href={waLink(o.phone, `Olá ${o.customer_name}! Sobre o seu pedido #${o.id} na Arkyn Imports: `)} target="_blank" rel="noreferrer">{o.phone}</a> · {o.delivery === 'pickup' ? 'Retirada' : `Entrega em ${o.delivery}`}</p>
              <ul>{o.items.map(i => <li key={i.id}>{i.qty}x {name(i.id)}</li>)}</ul>
              <p className="muted">
                {o.shipping ? `Frete ${brl(Number(o.shipping))} · ` : ''}{o.discount ? `Desconto ${brl(Number(o.discount))}${o.coupon ? ` (${o.coupon})` : ''} · ` : ''}Total {brl(Number(o.total))}
              </p>
              <div className="adm-grid">
                <label className="lbl">Status<select value={o.status} onChange={e => patch(o, { status: e.target.value })}>{STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                <label className="lbl">Código de rastreio<input defaultValue={o.tracking ?? ''} onBlur={e => e.target.value !== (o.tracking ?? '') && patch(o, { tracking: e.target.value })} /></label>
              </div>
              <label className="lbl">Observação interna<textarea rows={2} defaultValue={o.notes ?? ''} onBlur={e => e.target.value !== (o.notes ?? '') && patch(o, { notes: e.target.value })} /></label>
              <p className="muted" style={{ fontSize: 12 }}>Ao cancelar, o estoque não volta sozinho: ajuste na aba Estoque.</p>
            </>
          )}
        </div>
      ))}
    </>
  )
}

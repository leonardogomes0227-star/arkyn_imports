import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../lib/store'
import { downloadCsv, PAID, STATUS, statusLabel, useAllProducts, useOrders, waLink, type Order } from './shared'

export default function OrdersTab() {
  const { orders, setOrders, loading, reload } = useOrders()
  const { items: products, reload: reloadProducts } = useAllProducts()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<number | null>(null)
  const name = (id: string) => { const p = products.find(x => x.id === id); return p ? `${p.brand} ${p.name}` : id }

  const shown = useMemo(() => orders.filter(o =>
    (!status || o.status === status) &&
    `${o.id} ${o.customer_name} ${o.phone}`.toLowerCase().includes(q.toLowerCase())), [orders, status, q])

  async function changeStatus(o: Order, next: string) {
    const was = PAID.includes(o.status), now = PAID.includes(next)
    if (!was && now) {
      for (const i of o.items) { const pr = products.find(x => x.id === i.id); if (pr) await supabase!.from('products').update({ stock: Math.max(0, pr.stock - i.qty) }).eq('id', pr.id) }
    } else if (was && !now && confirm('Devolver os itens deste pedido ao estoque?')) {
      for (const i of o.items) { const pr = products.find(x => x.id === i.id); if (pr) await supabase!.from('products').update({ stock: pr.stock + i.qty }).eq('id', pr.id) }
    }
    await patch(o, { status: next })
    reloadProducts()
  }
  function printOrder(o: Order) {
    const w = window.open('', '_blank'); if (!w) return
    const rows = o.items.map(i => `<tr><td>${i.qty}x</td><td>${name(i.id)}</td></tr>`).join('')
    w.document.write(`<html><head><title>Pedido #${o.id}</title><style>body{font-family:sans-serif;padding:24px;max-width:480px}table{width:100%;border-collapse:collapse}td{padding:6px 0;border-bottom:1px solid #ddd}h2{margin:0 0 4px}</style></head><body><h2>Arkyn Imports · Pedido #${o.id}</h2><p>${new Date(o.created_at).toLocaleString('pt-BR')}</p><p><b>${o.customer_name}</b><br>${o.phone}<br>${o.delivery === 'pickup' ? 'Retirada' : 'Entrega: ' + o.delivery}</p><table>${rows}</table><p><b>Total: ${brl(Number(o.total))}</b>${o.payment ? ' · ' + o.payment : ''}</p>${o.notes ? '<p>Obs: ' + o.notes + '</p>' : ''}</body></html>`)
    w.document.close(); w.print()
  }

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
              <p>{o.phone} · {o.delivery === 'pickup' ? 'Retirada' : `Entrega em ${o.delivery}`}{o.payment ? ` · ${o.payment}` : ''}{o.source === 'manual' ? ' · venda manual' : ''}</p>
              <div className="adm-row" style={{ gap: 6, justifyContent: 'flex-start' }}>
                {([
                  ['Confirmar pedido', `Olá ${o.customer_name}! Recebemos o seu pedido #${o.id} na Arkyn Imports (${brl(Number(o.total))}). Já estamos separando. Obrigado!`],
                  ['Cobrar pagamento', `Olá ${o.customer_name}! Seu pedido #${o.id} (${brl(Number(o.total))}) está aguardando o pagamento. Posso te ajudar a finalizar?`],
                  ['Pronto p/ retirada', `Olá ${o.customer_name}! Seu pedido #${o.id} já está pronto para retirada. Pode vir buscar quando quiser!`],
                  ['Saiu para entrega', `Olá ${o.customer_name}! Seu pedido #${o.id} saiu para entrega${o.tracking ? ` (rastreio: ${o.tracking})` : ''}.`],
                ] as const).map(([l, t]) => <a key={l} className="btn ghost" style={{ padding: '6px 10px', fontSize: 11 }} href={waLink(o.phone, t)} target="_blank" rel="noreferrer">{l}</a>)}
                <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => printOrder(o)}>IMPRIMIR</button>
              </div>
              <ul>{o.items.map(i => <li key={i.id}>{i.qty}x {name(i.id)}</li>)}</ul>
              <p className="muted">
                {o.shipping ? `Frete ${brl(Number(o.shipping))} · ` : ''}{o.discount ? `Desconto ${brl(Number(o.discount))}${o.coupon ? ` (${o.coupon})` : ''} · ` : ''}Total {brl(Number(o.total))}
              </p>
              <div className="adm-grid">
                <label className="lbl">Status<select value={o.status} onChange={e => changeStatus(o, e.target.value)}>{STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                <label className="lbl">Código de rastreio<input defaultValue={o.tracking ?? ''} onBlur={e => e.target.value !== (o.tracking ?? '') && patch(o, { tracking: e.target.value })} /></label>
              </div>
              <label className="lbl">Observação interna<textarea rows={2} defaultValue={o.notes ?? ''} onBlur={e => e.target.value !== (o.notes ?? '') && patch(o, { notes: e.target.value })} /></label>
              <p className="muted" style={{ fontSize: 12 }}>Ao marcar como pago o estoque baixa; ao cancelar um pedido pago, o painel pergunta se devolve ao estoque.</p>
            </>
          )}
        </div>
      ))}
    </>
  )
}

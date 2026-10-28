import { useMemo, useState } from 'react'
import { brl } from '../lib/store'
import { LOW_STOCK, PAID, statusLabel, useAllProducts, useOrders } from './shared'

export default function Dashboard({ go }: { go: (t: string) => void }) {
  const { orders, loading } = useOrders()
  const { items: products } = useAllProducts()
  const [days, setDays] = useState(30)

  const d = useMemo(() => {
    const since = Date.now() - days * 86400000
    const inRange = orders.filter(o => new Date(o.created_at).getTime() >= since)
    const paid = inRange.filter(o => PAID.includes(o.status))
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0)
    const byDay: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) byDay[new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)] = 0
    paid.forEach(o => { const k = o.created_at.slice(0, 10); if (k in byDay) byDay[k] += Number(o.total) })
    const qty: Record<string, number> = {}
    paid.forEach(o => o.items.forEach(i => { qty[i.id] = (qty[i.id] ?? 0) + i.qty }))
    const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5)
    return { inRange, paid, revenue, byDay, top, pending: inRange.filter(o => o.status === 'pending').length, toShip: orders.filter(o => o.status === 'paid' || o.status === 'separating').length }
  }, [orders, days])

  const out = products.filter(p => p.stock <= 0 && p.active !== false)
  const low = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK && p.active !== false)
  const max = Math.max(1, ...Object.values(d.byDay))
  const name = (id: string) => { const p = products.find(x => x.id === id); return p ? `${p.brand} ${p.name}` : id }

  if (loading) return <p className="muted">Carregando…</p>
  return (
    <>
      <div className="adm-row">
        <h3>Visão geral</h3>
        <select value={days} onChange={e => setDays(Number(e.target.value))}>
          <option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option>
        </select>
      </div>
      <div className="adm-stats">
        <div><small>Faturamento (pago)</small><b>{brl(d.revenue)}</b></div>
        <div><small>Pedidos pagos</small><b>{d.paid.length}</b></div>
        <div><small>Ticket médio</small><b>{brl(d.paid.length ? d.revenue / d.paid.length : 0)}</b></div>
        <div><small>Aguardando pagamento</small><b>{d.pending}</b></div>
        <div onClick={() => go('orders')} className="clk"><small>A separar / enviar</small><b>{d.toShip}</b></div>
        <div onClick={() => go('stock')} className="clk"><small>Sem estoque / estoque baixo</small><b>{out.length} / {low.length}</b></div>
      </div>

      <div className="adm-card">
        <b>Vendas por dia</b>
        <div className="chart">
          {Object.entries(d.byDay).map(([k, v]) => (
            <div key={k} className="col" title={`${k.split('-').reverse().join('/')}: ${brl(v)}`}>
              <span style={{ height: `${(v / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="adm-row muted" style={{ fontSize: 11, marginBottom: 0 }}><span>{Object.keys(d.byDay)[0].split('-').reverse().join('/')}</span><span>hoje</span></div>
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <b>Mais vendidos</b>
          {!d.top.length && <p className="muted">Sem vendas no período.</p>}
          {d.top.map(([id, q]) => <div className="adm-row" key={id} style={{ marginBottom: 4 }}><span>{name(id)}</span><b>{q} un.</b></div>)}
        </div>
        <div className="adm-card">
          <b>Pedidos recentes</b>
          {!orders.length && <p className="muted">Nenhum pedido ainda.</p>}
          {orders.slice(0, 5).map(o => <div className="adm-row" key={o.id} style={{ marginBottom: 4 }}><span>#{o.id} · {o.customer_name}</span><span className="muted">{statusLabel(o.status)} · {brl(Number(o.total))}</span></div>)}
        </div>
      </div>

      {(out.length > 0 || low.length > 0) && (
        <div className="adm-card">
          <b>Atenção no estoque</b>
          {[...out, ...low].slice(0, 8).map(p => <div className="adm-row" key={p.id} style={{ marginBottom: 4 }}><span>{p.brand} {p.name}</span><b style={{ color: p.stock <= 0 ? '#b3261e' : '#a15c00' }}>{p.stock <= 0 ? 'Esgotado' : `Restam ${p.stock}`}</b></div>)}
        </div>
      )}
    </>
  )
}

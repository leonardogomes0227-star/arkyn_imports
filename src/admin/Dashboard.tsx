import { useMemo, useState } from 'react'
import { brl } from '../lib/store'
import { photoOf } from '../lib/cutouts'
import { LOW_STOCK, PAID, statusLabel, useAllProducts, useOrders } from './shared'

const pct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : a > 0 ? 100 : 0)
const Delta = ({ now, before }: { now: number; before: number }) => {
  const d = pct(now, before)
  return <em className={d > 0 ? 'dl up' : d < 0 ? 'dl down' : 'dl'}>{d > 0 ? '▲' : d < 0 ? '▼' : '•'} {Math.abs(d)}% <i>vs. período anterior</i></em>
}

export default function Dashboard({ go }: { go: (t: string) => void }) {
  const { orders, loading } = useOrders()
  const { items: products } = useAllProducts()
  const [days, setDays] = useState(30)

  const d = useMemo(() => {
    const now = Date.now(), since = now - days * 86400000, before = since - days * 86400000
    const inRange = orders.filter(o => new Date(o.created_at).getTime() >= since)
    const prev = orders.filter(o => { const t = new Date(o.created_at).getTime(); return t >= before && t < since })
    const paid = inRange.filter(o => PAID.includes(o.status))
    const paidPrev = prev.filter(o => PAID.includes(o.status))
    const sum = (l: typeof paid) => l.reduce((s, o) => s + Number(o.total), 0)
    const revenue = sum(paid), revenuePrev = sum(paidPrev)
    const byDay: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) byDay[new Date(now - i * 86400000).toISOString().slice(0, 10)] = 0
    paid.forEach(o => { const k = o.created_at.slice(0, 10); if (k in byDay) byDay[k] += Number(o.total) })
    const qty: Record<string, number> = {}
    paid.forEach(o => o.items.forEach(i => { qty[i.id] = (qty[i.id] ?? 0) + i.qty }))
    let cost = 0
    const noCost = new Set<string>()
    paid.forEach(o => o.items.forEach(i => { const c = products.find(x => x.id === i.id)?.cost; if (c) cost += c * i.qty; else noCost.add(i.id) }))
    const itemsRevenue = paid.reduce((s, o) => s + Number(o.total) - Number(o.shipping || 0), 0)
    const today = new Date().toISOString().slice(0, 10)
    const todayPaid = orders.filter(o => o.created_at.slice(0, 10) === today && PAID.includes(o.status))
    return {
      revenue, revenuePrev, paid, paidPrev, byDay, today: sum(todayPaid), todayN: todayPaid.length,
      top: Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5), profit: itemsRevenue - cost, noCost: noCost.size,
      pending: inRange.filter(o => o.status === 'pending').length,
      toShip: orders.filter(o => o.status === 'paid' || o.status === 'separating').length,
    }
  }, [orders, products, days])

  const out = products.filter(p => p.stock <= 0 && p.active !== false)
  const low = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK && p.active !== false)
  const max = Math.max(1, ...Object.values(d.byDay))
  const prod = (id: string) => products.find(x => x.id === id)
  const hour = new Date().getHours()
  const hi = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const keys = Object.keys(d.byDay)
  const ticket = d.paid.length ? d.revenue / d.paid.length : 0

  if (loading) return <p className="muted">Carregando…</p>
  return (
    <div className="dsh">
      <div className="dsh-hello">
        <div>
          <h2>{hi}! 👋</h2>
          <p className="muted">Hoje: <b>{brl(d.today)}</b> em {d.todayN} {d.todayN === 1 ? 'pedido pago' : 'pedidos pagos'} · {products.filter(p => p.active !== false).length} perfumes na loja</p>
        </div>
        <div className="dsh-range" role="tablist" aria-label="Período">
          {[7, 30, 90].map(n => <button key={n} type="button" className={days === n ? 'on' : ''} onClick={() => setDays(n)}>{n} dias</button>)}
        </div>
      </div>

      <div className="dsh-quick">
        <button type="button" onClick={() => go('sale')}><span>🛒</span>Nova venda</button>
        <button type="button" onClick={() => go('products')}><span>➕</span>Produtos</button>
        <button type="button" onClick={() => go('orders')}><span>🧾</span>Pedidos{d.toShip > 0 && <i>{d.toShip}</i>}</button>
        <button type="button" onClick={() => go('coupons')}><span>🏷️</span>Cupons</button>
        <button type="button" onClick={() => go('stock')}><span>📦</span>Estoque{out.length + low.length > 0 && <i>{out.length + low.length}</i>}</button>
      </div>

      <div className="dsh-stats">
        <div className="hero">
          <small>Faturamento</small><b>{brl(d.revenue)}</b>
          <Delta now={d.revenue} before={d.revenuePrev} />
        </div>
        <div><small>Pedidos pagos</small><b>{d.paid.length}</b><Delta now={d.paid.length} before={d.paidPrev.length} /></div>
        <div><small>Ticket médio</small><b>{brl(ticket)}</b><em className="dl">por pedido pago</em></div>
        <div><small>Lucro estimado</small><b>{brl(d.profit)}</b><em className="dl">{d.noCost > 0 ? `${d.noCost} produto(s) sem custo` : 'com base no custo'}</em></div>
        <div className="clk" onClick={() => go('orders')}><small>A separar / enviar</small><b>{d.toShip}</b><em className="dl">{d.pending} aguardando pagamento</em></div>
        <div className="clk" onClick={() => go('stock')}><small>Sem estoque · baixo</small><b>{out.length} · {low.length}</b><em className="dl">toque para repor</em></div>
      </div>

      <div className="adm-card">
        <div className="adm-row"><b>Vendas por dia</b><span className="muted" style={{ fontSize: 12 }}>maior dia: {brl(max === 1 && !d.revenue ? 0 : max)}</span></div>
        <div className="chart">
          {Object.entries(d.byDay).map(([k, v]) => (
            <div key={k} className="col" data-tip={`${k.split('-').reverse().slice(0, 2).join('/')}: ${brl(v)}`}>
              <span style={{ height: `${Math.max(2, (v / max) * 100)}%` }} className={v > 0 ? 'has' : ''} />
            </div>
          ))}
        </div>
        <div className="adm-row muted" style={{ fontSize: 11, marginBottom: 0 }}><span>{keys[0].split('-').reverse().slice(0, 2).join('/')}</span><span>hoje</span></div>
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <b>Mais vendidos</b>
          {!d.top.length && <p className="muted">Sem vendas no período.</p>}
          <ol className="dsh-top">
            {d.top.map(([id, q], i) => {
              const p = prod(id); const img = p && photoOf(p)
              return <li key={id}><span className="n">{i + 1}</span>{img ? <img src={img} alt="" /> : <span className="ph" />}<span className="nm"><b>{p?.name ?? id}</b><small>{p?.brand}</small></span><b>{q} un.</b></li>
            })}
          </ol>
        </div>
        <div className="adm-card">
          <b>Pedidos recentes</b>
          {!orders.length && <p className="muted">Nenhum pedido ainda. Quando o primeiro chegar, ele aparece aqui.</p>}
          <ul className="dsh-ord">
            {orders.slice(0, 6).map(o => (
              <li key={o.id} onClick={() => go('orders')}><span><b>#{o.id} · {o.customer_name}</b><small>{new Date(o.created_at).toLocaleDateString('pt-BR')}</small></span><span className={`pill s-${o.status}`}>{statusLabel(o.status)}</span><b>{brl(Number(o.total))}</b></li>
            ))}
          </ul>
        </div>
      </div>

      {(out.length > 0 || low.length > 0) && (
        <div className="adm-card">
          <div className="adm-row"><b>Atenção no estoque</b><button type="button" className="link" onClick={() => go('stock')}>Ver estoque →</button></div>
          <div className="dsh-stock">
            {[...out, ...low].slice(0, 8).map(p => {
              const img = photoOf(p)
              return <div key={p.id} className={p.stock <= 0 ? 'out' : 'low'}>{img && <img src={img} alt="" />}<span><b>{p.name}</b><small>{p.stock <= 0 ? 'Esgotado' : `Restam ${p.stock}`}</small></span></div>
            })}
          </div>
        </div>
      )}
    </div>
  )
}

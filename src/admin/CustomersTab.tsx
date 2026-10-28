import { useMemo, useState } from 'react'
import { brl } from '../lib/store'
import { digits, downloadCsv, PAID, useOrders, waLink } from './shared'

export default function CustomersTab() {
  const { orders, loading } = useOrders()
  const [q, setQ] = useState('')
  const customers = useMemo(() => {
    const m = new Map<string, { name: string; phone: string; orders: number; spent: number; last: string }>()
    orders.forEach(o => {
      const k = digits(o.phone) || o.customer_name
      const c = m.get(k) ?? { name: o.customer_name, phone: o.phone, orders: 0, spent: 0, last: o.created_at }
      c.orders += 1
      if (PAID.includes(o.status)) c.spent += Number(o.total)
      if (o.created_at > c.last) c.last = o.created_at
      m.set(k, c)
    })
    return [...m.values()].sort((a, b) => b.spent - a.spent)
  }, [orders])
  const shown = customers.filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase()))
  if (loading) return <p className="muted">Carregando…</p>
  return (
    <>
      <div className="adm-row">
        <input placeholder="Buscar cliente" value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn ghost" onClick={() => downloadCsv('clientes.csv', [['Nome', 'Telefone', 'Pedidos', 'Total gasto', 'Último pedido'], ...shown.map(c => [c.name, c.phone, c.orders, c.spent.toFixed(2), new Date(c.last).toLocaleDateString('pt-BR')])])}>EXPORTAR CSV</button>
      </div>
      {!shown.length && <p className="muted">Nenhum cliente ainda. Eles aparecem aqui a partir dos pedidos.</p>}
      <div className="adm-table">
        {shown.map(c => (
          <div className="adm-line" key={c.phone + c.name}>
            <div className="grow"><b>{c.name}</b><div className="muted">{c.orders} pedido{c.orders > 1 ? 's' : ''} · último em {new Date(c.last).toLocaleDateString('pt-BR')}</div></div>
            <b>{brl(c.spent)}</b>
            <a className="btn ghost" href={waLink(c.phone)} target="_blank" rel="noreferrer">WHATSAPP</a>
          </div>
        ))}
      </div>
    </>
  )
}

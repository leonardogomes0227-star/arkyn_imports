import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'
import { LOW_STOCK, money, useAllProducts } from './shared'

type Filtro = 'todos' | 'acabando' | 'esgotado'

/** Estoque simples: quanto tem de cada perfume, quanto vale tudo e botões − / + para ajustar na hora. */
export default function StockTab() {
  const { items, setItems, reload } = useAllProducts()
  const [q, setQ] = useState('')
  const [f, setF] = useState<Filtro>('todos')
  const [erro, setErro] = useState('')

  const total = useMemo(() => ({
    frascos: items.reduce((t, p) => t + p.stock, 0),
    venda: items.reduce((t, p) => t + p.stock * p.price, 0),
    custo: items.reduce((t, p) => t + p.stock * (p.cost ?? 0), 0),
    temCusto: items.some(p => p.cost),
    esgotados: items.filter(p => p.stock <= 0).length,
    acabando: items.filter(p => p.stock > 0 && p.stock <= LOW_STOCK).length,
  }), [items])

  const shown = useMemo(() => items
    .filter(p => `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase()))
    .filter(p => f === 'todos' || (f === 'esgotado' ? p.stock <= 0 : p.stock > 0 && p.stock <= LOW_STOCK))
    .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)), [items, q, f])

  async function set(p: Product, n: number, force = false) {
    const stock = Math.max(0, Math.min(9999, Math.round(n) || 0))
    if (stock === p.stock && !force) return
    setItems(list => list.map(x => (x.id === p.id ? { ...x, stock } : x)))
    const { error } = await supabase!.from('products').update({ stock }).eq('id', p.id)
    if (error) { setErro('Não salvou: ' + error.message); reload() } else setErro('')
  }

  return (
    <div className="stk">
      <div className="stk-sum">
        <div className="hero"><small>Valor do estoque (preço de venda)</small><b>{money(total.venda)}</b><span>{total.frascos} frascos · {items.length} perfumes</span></div>
        {total.temCusto && <div><small>Quanto custou</small><b>{money(total.custo)}</b><span>lucro previsto {money(total.venda - total.custo)}</span></div>}
        <button className={f === 'acabando' ? 'on' : ''} onClick={() => setF(f === 'acabando' ? 'todos' : 'acabando')}><small>Acabando</small><b>{total.acabando}</b><span>até {LOW_STOCK} frascos</span></button>
        <button className={f === 'esgotado' ? 'on' : ''} onClick={() => setF(f === 'esgotado' ? 'todos' : 'esgotado')}><small>Esgotados</small><b>{total.esgotados}</b><span>fora da venda</span></button>
      </div>
      <input className="stk-q" type="search" placeholder="Buscar perfume" value={q} onChange={e => setQ(e.target.value)} />
      {erro && <p className="err">{erro}</p>}
      <ul className="stk-list">
        {shown.map(p => (
          <li key={p.id} className={p.stock <= 0 ? 'out' : p.stock <= LOW_STOCK ? 'low' : ''}>
            {p.image ? <img src={p.image} alt="" loading="lazy" draggable={false} /> : <i />}
            <div className="nm"><small>{p.brand}</small><b>{p.name}</b><span>{money(p.price)} · vale {money(p.price * p.stock)}</span></div>
            <div className="qty">
              <button type="button" aria-label="Tirar 1" onClick={() => set(p, p.stock - 1)} disabled={p.stock <= 0}>−</button>
              <input type="number" inputMode="numeric" min="0" value={p.stock} aria-label={`Estoque de ${p.name}`} onChange={e => setItems(l => l.map(x => (x.id === p.id ? { ...x, stock: Number(e.target.value) } : x)))} onBlur={e => set(p, Number(e.target.value), true)} />
              <button type="button" aria-label="Colocar 1" onClick={() => set(p, p.stock + 1)}>+</button>
            </div>
          </li>
        ))}
        {!shown.length && <li className="none">Nenhum perfume nesse filtro.</li>}
      </ul>
    </div>
  )
}

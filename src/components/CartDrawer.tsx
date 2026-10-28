import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'

export default function CartDrawer() {
  const { open, setOpen, cart, products, settings, setQty } = useStore()
  const lines = cart.flatMap(i => { const p = products.find(x => x.id === i.id); return p ? [{ p, qty: i.qty }] : [] })
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const goal = settings.freeShippingFrom
  return (
    <>
      <div className={open ? 'scrim on' : 'scrim'} onClick={() => setOpen(false)} />
      <aside className={open ? 'drawer on' : 'drawer'} aria-hidden={!open}>
        <div className="drawer-head"><b>Seu carrinho</b><button className="link" onClick={() => setOpen(false)}>Fechar ✕</button></div>
        {goal > 0 && lines.length > 0 && (
          <div className="ship">
            <p>{subtotal >= goal ? 'Você ganhou frete grátis!' : `Faltam ${brl(goal - subtotal)} para você ganhar frete grátis.`}</p>
            <div className="bar"><span style={{ width: `${Math.min(100, (subtotal / goal) * 100)}%` }} /></div>
          </div>
        )}
        <div className="drawer-body">
          {!lines.length && <p className="muted">Seu carrinho está vazio.</p>}
          {lines.map(({ p, qty }) => (
            <div className="dline" key={p.id}>
              {p.image ? <img src={p.image} alt="" /> : <div className="ph" />}
              <div className="grow"><small>{p.brand}</small><div>{p.name}</div><b>{brl(p.price * qty)}</b></div>
              <div className="qty"><button onClick={() => setQty(p.id, qty - 1)}>−</button><span>{qty}</span><button onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))}>+</button></div>
            </div>
          ))}
        </div>
        {!!lines.length && (
          <div className="drawer-foot">
            <div className="adm-row"><span>Subtotal</span><b>{brl(subtotal)}</b></div>
            <Link to="/carrinho" className="btn" onClick={() => setOpen(false)}>FINALIZAR COMPRA</Link>
            <button className="btn ghost" onClick={() => setOpen(false)}>CONTINUAR COMPRANDO</button>
          </div>
        )}
      </aside>
    </>
  )
}

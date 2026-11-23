import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cutoutFor } from '../lib/cutouts'
import { brl, shortName, useStore, waLink } from '../lib/store'
import { IClose } from './Icons'

export default function BagDrawer() {
  const { bag, setBag, cart, products, setQty, total, count, settings } = useStore()
  useEffect(() => { if (bag) document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [bag])
  const items = cart.map(i => ({ ...i, p: products.find(p => p.id === i.id)! })).filter(i => i.p)
  const msg = `Olá! Quero finalizar meu pedido:\n${items.map(i => `• ${i.qty}x ${i.p.name} (${brl(i.p.price)})`).join('\n')}\nTotal: ${brl(total)}`
  return (
    <>
      <div className={bag ? 'nv-scrim on' : 'nv-scrim'} onClick={() => setBag(false)} />
      <aside className={bag ? 'nv-bag on' : 'nv-bag'} aria-hidden={!bag} aria-label="Sacola">
        <div className="nv-bag-head"><b>Sacola {count > 0 && <span>({count})</span>}</b><button type="button" className="nv-ico" aria-label="Fechar sacola" onClick={() => setBag(false)}><IClose /></button></div>
        {items.length ? <>
          <ul className="nv-bag-list">
            {items.map(({ p, qty }) => (
              <li key={p.id}>
                <span className="nv-bag-img">{cutoutFor(p) && <img src={cutoutFor(p)} alt="" />}</span>
                <span className="nv-bag-info">
                  <small>{p.brand}</small><b>{shortName(p.name)}</b>
                  <span className="nv-qty"><button type="button" aria-label="Diminuir" onClick={() => setQty(p.id, qty - 1)}>−</button><output>{qty}</output><button type="button" aria-label="Aumentar" onClick={() => setQty(p.id, qty + 1)}>+</button></span>
                </span>
                <span className="nv-bag-price"><b>{brl(p.price * qty)}</b><button type="button" onClick={() => setQty(p.id, 0)}>Remover</button></span>
              </li>
            ))}
          </ul>
          <div className="nv-bag-foot">
            <div className="nv-bag-total"><span>Subtotal</span><b>{brl(total)}</b></div>
            <small>Frete calculado na finalização. Retirada grátis em Coxim – MS.</small>
            <a className="nv-btn" href={waLink(settings.whatsapp, msg)} target="_blank" rel="noreferrer">Finalizar compra</a>
            <button type="button" className="nv-link" onClick={() => setBag(false)}>Continuar comprando</button>
          </div>
        </> : (
          <div className="nv-bag-empty"><b>Sua sacola está vazia</b><p>Explore os perfumes e adicione os seus favoritos.</p><Link to="/perfumes" className="nv-btn" onClick={() => setBag(false)}>Ver perfumes</Link></div>
        )}
      </aside>
    </>
  )
}

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { brl, useStore } from '../lib/store'

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex="-1"])'

export default function CartDrawer() {
  const { open, setOpen, cart, products, settings, setQty } = useStore()
  const box = useRef<HTMLElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const lines = cart.flatMap(i => { const p = products.find(x => x.id === i.id); return p ? [{ p, qty: i.qty }] : [] })
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const items = lines.reduce((s, l) => s + l.qty, 0)
  const goal = settings.freeShippingFrom
  const close = () => setOpen(false)

  // acessibilidade: foco entra na sacola, Tab fica preso nela, Esc fecha, fundo não rola, foco volta ao fechar
  useEffect(() => {
    const el = box.current
    if (!el) return
    ;(el as HTMLElement & { inert: boolean }).inert = !open
    if (!open) return
    lastFocus.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => el.querySelector<HTMLElement>('.ax-drawer-x')?.focus(), 80)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setOpen(false)
      if (e.key !== 'Tab') return
      const f = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(x => x.offsetParent !== null)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', key)
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', key); document.body.style.overflow = ''; lastFocus.current?.focus?.() }
  }, [open, setOpen])

  return (
    <>
      <div className={open ? 'scrim on' : 'scrim'} onClick={close} />
      <aside ref={box} className={open ? 'ax-drawer on' : 'ax-drawer'} role="dialog" aria-modal="true" aria-label="Sua sacola" aria-hidden={!open}>
        <div className="ax-drawer-head">
          <h2>Sua sacola{items > 0 && <small>{items} {items === 1 ? 'item' : 'itens'}</small>}</h2>
          <button type="button" className="ax-drawer-x" onClick={close} aria-label="Fechar sacola">✕</button>
        </div>

        {goal > 0 && lines.length > 0 && (
          <div className="ax-ship">
            <p>{subtotal >= goal ? 'Você ganhou frete grátis!' : <>Faltam <b>{brl(goal - subtotal)}</b> para ganhar frete grátis.</>}</p>
            <div className="ax-ship-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round((subtotal / goal) * 100))}><span style={{ width: `${Math.min(100, (subtotal / goal) * 100)}%` }} /></div>
          </div>
        )}

        <div className="ax-drawer-body">
          {!lines.length ? (
            <div className="ax-cart-empty">
              <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
              <h3>Sua sacola está vazia</h3>
              <p className="muted">Explore o catálogo e escolha o perfume ideal.</p>
              <Link to="/catalogo" className="btn" onClick={close}>Explorar o catálogo</Link>
            </div>
          ) : (
            <ul className="ax-lines">
              {lines.map(({ p, qty }) => (
                <li key={p.id}>
                  <Link to={`/produto/${p.id}`} className="ax-line-img" onClick={close} tabIndex={open ? 0 : -1}>{p.image ? <img src={p.image} alt="" width="160" height="160" /> : null}</Link>
                  <div className="ax-line-t">
                    <small>{p.brand}</small>
                    <Link to={`/produto/${p.id}`} onClick={close} tabIndex={open ? 0 : -1}>{p.name}</Link>
                    <div className="ax-line-row">
                      <div className="ax-step" role="group" aria-label={`Quantidade de ${p.name}`}>
                        <button type="button" onClick={() => setQty(p.id, qty - 1)} aria-label="Diminuir" tabIndex={open ? 0 : -1}>−</button>
                        <output>{qty}</output>
                        <button type="button" onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))} aria-label="Aumentar" disabled={qty >= p.stock} tabIndex={open ? 0 : -1}>+</button>
                      </div>
                      <b>{brl(p.price * qty)}</b>
                    </div>
                    <button type="button" className="ax-remove" onClick={() => setQty(p.id, 0)} tabIndex={open ? 0 : -1}>Remover</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!!lines.length && (
          <div className="ax-drawer-foot">
            <div className="ax-tot"><span>Subtotal</span><b>{brl(subtotal)}</b></div>
            <p className="ax-note">Frete e cupom são calculados na finalização.</p>
            <Link to="/carrinho" className="btn block" onClick={close} tabIndex={open ? 0 : -1}>Finalizar compra</Link>
            <button type="button" className="btn ghost block" onClick={close} tabIndex={open ? 0 : -1}>Continuar comprando</button>
          </div>
        )}
      </aside>
    </>
  )
}

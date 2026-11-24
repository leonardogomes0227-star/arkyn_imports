import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SizedImg from './SizedImg'
import { brl, useStore } from '../lib/store'
import { bundleDiscount } from '../lib/pricing'
import { photoOf } from '../lib/cutouts'

const FOCUSABLE = 'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])'
const short = (n: string) => n.replace(/\s?\d+\s?ml$/i, '')

/** Sacola lateral no estilo bilhete: itens sempre visíveis, incentivo para levar mais e finalização em um toque. */
export default function CartDrawer() {
  const { open, setOpen, cart, products, settings, setQty, add } = useStore()
  const box = useRef<HTMLElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const lines = cart.flatMap(i => { const p = products.find(x => x.id === i.id); return p ? [{ p, qty: i.qty }] : [] })
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const items = lines.reduce((s, l) => s + l.qty, 0)
  const bundle = bundleDiscount(subtotal, items, settings)
  const close = () => setOpen(false)

  // incentivo para levar mais: a oferta que estiver ligada no painel (leve N e ganhe %, ou frete grátis)
  const bMin = settings.bundleMinQty ?? 0, bPct = settings.bundlePercent ?? 0, goal = settings.freeShippingFrom
  const perk = bMin >= 2 && bPct > 0
    ? { done: items >= bMin, pct: Math.min(100, (items / bMin) * 100), text: items >= bMin ? <>Você ganhou <b>{bPct}% de desconto</b> por levar {bMin} ou mais.</> : <>Leve mais <b>{bMin - items} {bMin - items === 1 ? 'item' : 'itens'}</b> e ganhe <b>{bPct}% de desconto</b>.</> }
    : goal > 0
      ? { done: subtotal >= goal, pct: Math.min(100, (subtotal / goal) * 100), text: subtotal >= goal ? <>Você ganhou <b>frete grátis</b>.</> : <>Faltam <b>{brl(goal - subtotal)}</b> para ganhar <b>frete grátis</b>.</> }
      : null

  // "leve junto": perfumes que combinam com o que está na sacola (mesmo perfil ou mesma casa)
  const inCart = new Set(lines.map(l => l.p.id))
  const tags = new Set(lines.flatMap(l => l.p.tags ?? []))
  const brandsIn = new Set(lines.map(l => l.p.brand))
  const suggest = lines.length ? products
    .filter(x => !inCart.has(x.id) && x.stock > 0 && !!photoOf(x) && x.category !== 'skincare')
    .map(x => ({ x, s: (x.tags ?? []).filter(t => tags.has(t)).length + (brandsIn.has(x.brand) ? 1 : 0) + (x.category === 'splash' ? 0.5 : 0) }))
    .sort((a, b) => b.s - a.s).slice(0, 2).map(r => r.x) : []

  useEffect(() => {
    const el = box.current
    if (!el) return
    ;(el as HTMLElement & { inert: boolean }).inert = !open
    document.body.classList.toggle('bag-open', open)
    if (!open) return
    lastFocus.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => el.querySelector<HTMLElement>('.bg-x')?.focus(), 80)
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
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', key); document.body.style.overflow = ''; document.body.classList.remove('bag-open'); lastFocus.current?.focus?.() }
  }, [open, setOpen])

  return (
    <>
      <div className={open ? 'bg-scrim on' : 'bg-scrim'} onClick={close} />
      <aside ref={box} className={open ? 'bg on' : 'bg'} role="dialog" aria-modal="true" aria-label="Sua sacola" aria-hidden={!open}>
        <header className="bg-head">
          <div><small>Seu pedido</small><h2>Sacola{items > 0 && <span> · {items} {items === 1 ? 'item' : 'itens'}</span>}</h2></div>
          <button type="button" className="bg-x" onClick={close} aria-label="Fechar sacola">✕</button>
        </header>

        {!lines.length ? (
          <div className="bg-empty">
            <img src="/intro/aviao.webp" alt="" />
            <b>Sua sacola está vazia</b>
            <p>Descubra o seu perfume ou escolha um na vitrine.</p>
            <Link to="/" className="bg-btn" onClick={close}>Ver os perfumes</Link>
          </div>
        ) : <>
          {perk && (
            <div className={perk.done ? 'bg-perk done' : 'bg-perk'}>
              <p>{perk.text}</p>
              <div className="bg-perk-bar"><i style={{ width: `${perk.pct}%` }} /><img src="/intro/aviao.webp" alt="" style={{ left: `${perk.pct}%` }} /></div>
            </div>
          )}

          <ul className="bg-list">
            {lines.map(({ p, qty }) => (
              <li key={p.id}>
                <Link to={`/produto/${p.id}`} className="bg-img" onClick={close} tabIndex={open ? 0 : -1} aria-label={p.name}>{photoOf(p) && <SizedImg src={photoOf(p)!} size={160} alt="" width={160} height={160} />}</Link>
                <div className="bg-info">
                  <small>{p.brand}</small>
                  <Link to={`/produto/${p.id}`} onClick={close} tabIndex={open ? 0 : -1}>{short(p.name)}</Link>
                  <div className="bg-row">
                    <div className="bg-step" role="group" aria-label={`Quantidade de ${p.name}`}>
                      <button type="button" onClick={() => setQty(p.id, qty - 1)} aria-label={qty === 1 ? 'Remover' : 'Diminuir'} tabIndex={open ? 0 : -1}>{qty === 1 ? '×' : '−'}</button>
                      <output>{qty}</output>
                      <button type="button" onClick={() => setQty(p.id, Math.min(qty + 1, p.stock))} aria-label="Aumentar" disabled={qty >= p.stock} tabIndex={open ? 0 : -1}>+</button>
                    </div>
                    <b>{brl(p.price * qty)}</b>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {suggest.length > 0 && (
            <div className="bg-sug">
              <p>Leve junto</p>
              <div>
                {suggest.map(x => (
                  <button key={x.id} type="button" className="bg-sug-c" tabIndex={open ? 0 : -1} onClick={() => add(x.id, false)} aria-label={`Adicionar ${x.name}`}>
                    {photoOf(x) && <SizedImg src={photoOf(x)!} size={160} alt="" width={80} height={80} loading="lazy" />}
                    <span><b>{short(x.name)}</b><em>{brl(x.price)}</em></span>
                    <i aria-hidden="true">+</i>
                  </button>
                ))}
              </div>
            </div>
          )}

          <footer className="bg-foot">
            {bundle > 0 && <div className="bg-tot sm"><span>Desconto</span><b>−{brl(bundle)}</b></div>}
            <div className="bg-tot"><span>Subtotal</span><b>{brl(subtotal - bundle)}</b></div>
            <small>Frete e cupom na próxima tela · Retirada grátis em Coxim</small>
            <Link to="/carrinho" className="bg-btn" onClick={close} tabIndex={open ? 0 : -1}>Finalizar compra <span aria-hidden="true">→</span></Link>
            <button type="button" className="bg-more" onClick={close} tabIndex={open ? 0 : -1}>Continuar comprando</button>
          </footer>
        </>}
      </aside>
    </>
  )
}

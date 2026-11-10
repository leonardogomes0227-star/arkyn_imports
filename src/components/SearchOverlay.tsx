import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconSearch } from './Icons'
import { brl, useStore } from '../lib/store'
import { CAT_LABEL, norm, searchProducts } from '../lib/search'
import type { Category } from '../lib/types'

const FAMILIES = ['doce', 'amadeirado', 'fresco', 'floral', 'especiado']
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useStore()
  const go = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [cur, setCur] = useState(-1)

  const results = useMemo(() => searchProducts(products, q, 6), [products, q])
  const nq = norm(q)
  const cats = (Object.keys(CAT_LABEL) as Category[]).filter(c => nq && norm(CAT_LABEL[c]).includes(nq))
  const brands = [...new Set(products.map(p => p.brand))].sort()
  const brandHits = nq ? brands.filter(b => norm(b).includes(nq)).slice(0, 3) : []

  useEffect(() => {
    if (open) { setQ(''); setCur(-1); window.setTimeout(() => input.current?.focus(), 60) }
  }, [open])
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  const submit = (term = q) => { onClose(); go(`/catalogo?q=${encodeURIComponent(term.trim())}`) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCur(c => Math.min(c + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCur(c => Math.max(c - 1, -1)) }
    if (e.key === 'Enter') { e.preventDefault(); if (cur >= 0 && results[cur]) { onClose(); go(`/produto/${results[cur].id}`) } else if (q.trim()) submit() }
  }

  return (
    <div className={open ? 'ax-search on' : 'ax-search'} role="dialog" aria-modal="true" aria-label="Buscar perfumes" aria-hidden={!open}>
      <div className="ax-search-scrim" onClick={onClose} />
      <div className="ax-search-panel">
        <form className="ax-search-form" role="search" onSubmit={e => { e.preventDefault(); if (q.trim()) submit() }}>
          <IconSearch size={22} />
          <input ref={input} value={q} onChange={e => { setQ(e.target.value); setCur(-1) }} onKeyDown={onKey} tabIndex={open ? 0 : -1}
            placeholder="Busque por perfume, marca ou nota" aria-label="Buscar perfumes" autoComplete="off" enterKeyHint="search" role="combobox" aria-expanded={!!results.length} aria-controls="ax-results" />
          <button type="button" className="ax-search-x" onClick={onClose} tabIndex={open ? 0 : -1}>Fechar</button>
        </form>

        <div className="ax-search-body" id="ax-results">
          {!nq && (
            <div className="ax-sug">
              <p className="ax-eyebrow">Categorias</p>
              <div className="ax-chips">{(Object.keys(CAT_LABEL) as Category[]).map(c => <Link key={c} to={`/catalogo?cat=${c}`} onClick={onClose} tabIndex={open ? 0 : -1}>{CAT_LABEL[c]}</Link>)}</div>
              <p className="ax-eyebrow">Famílias olfativas</p>
              <div className="ax-chips">{FAMILIES.map(f => <Link key={f} to={`/catalogo?tag=${f}`} onClick={onClose} tabIndex={open ? 0 : -1}>{cap(f)}</Link>)}</div>
              <p className="ax-eyebrow">Marcas</p>
              <div className="ax-chips">{brands.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`} onClick={onClose} tabIndex={open ? 0 : -1}>{b}</Link>)}</div>
            </div>
          )}

          {!!nq && (cats.length > 0 || brandHits.length > 0) && (
            <div className="ax-chips ax-sug-row">
              {cats.map(c => <Link key={c} to={`/catalogo?cat=${c}`} onClick={onClose} tabIndex={open ? 0 : -1}>{CAT_LABEL[c]} →</Link>)}
              {brandHits.map(b => <Link key={b} to={`/catalogo?brand=${encodeURIComponent(b)}`} onClick={onClose} tabIndex={open ? 0 : -1}>{b} →</Link>)}
            </div>
          )}

          {!!nq && results.length > 0 && (
            <ul className="ax-hits" role="listbox">
              {results.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === cur} className={i === cur ? 'on' : ''}>
                  <Link to={`/produto/${p.id}`} onClick={onClose} tabIndex={open ? 0 : -1}>
                    <span className="ax-hit-img">{p.image ? <img src={p.image} alt="" loading="lazy" /> : null}</span>
                    <span className="ax-hit-t"><small>{p.brand}</small><b>{p.name}</b></span>
                    <span className="ax-hit-p">{p.stock > 0 ? brl(p.price) : 'Esgotado'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!!nq && results.length > 0 && <button type="button" className="ax-all" onClick={() => submit()} tabIndex={open ? 0 : -1}>Ver todos os resultados para “{q.trim()}” →</button>}

          {!!nq && results.length === 0 && (
            <div className="ax-empty">
              <p><b>Nenhum perfume encontrado para “{q.trim()}”.</b></p>
              <p className="muted">Confira a escrita ou explore por categoria e família olfativa.</p>
              <div className="ax-chips">{FAMILIES.map(f => <Link key={f} to={`/catalogo?tag=${f}`} onClick={onClose} tabIndex={open ? 0 : -1}>{cap(f)}</Link>)}<Link to="/catalogo" onClick={onClose} tabIndex={open ? 0 : -1}>Ver todo o catálogo</Link></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

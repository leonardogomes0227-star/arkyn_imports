import { useEffect, useState, type FormEvent } from 'react'
import { key, url } from '../lib/env'

interface Review { id: number; name: string; rating: number; comment: string; created_at: string }
const Stars = ({ n }: { n: number }) => <span className="stars" aria-label={`${n} de 5 estrelas`}>{'★★★★★'.slice(0, Math.round(n))}<i>{'★★★★★'.slice(Math.round(n))}</i></span>

/** Avaliações aprovadas do produto. Só aparece quando o banco de avaliações existe (supabase/avaliacoes.sql). */
export default function Reviews({ productId, onStats }: { productId: string; onStats?: (count: number, avg: number) => void }) {
  const [list, setList] = useState<Review[] | null>(null)
  const [form, setForm] = useState(false)
  const [f, setF] = useState({ name: '', orderId: '', phone: '', rating: 5, comment: '' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setList(null)
    if (!url || !key) return
    fetch(`${url}/rest/v1/reviews?product_id=eq.${encodeURIComponent(productId)}&approved=eq.true&select=id,name,rating,comment,created_at&order=created_at.desc&limit=30`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      .then(r => (r.ok ? r.json() : null)).then((d: Review[] | null) => {
        if (!Array.isArray(d)) return
        setList(d); onStats?.(d.length, d.length ? d.reduce((s, x) => s + x.rating, 0) / d.length : 0)
      }).catch(() => null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  if (!list) return null
  const avg = list.length ? list.reduce((s, x) => s + x.rating, 0) / list.length : 0

  async function send(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      const d = await (await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, productId }) })).json()
      if (d.ok) { setMsg('Obrigado! Sua avaliação aparece depois de aprovada pela loja.'); setForm(false) } else setMsg(d.error || 'Não foi possível enviar.')
    } catch { setMsg('Não foi possível enviar agora.') }
    setBusy(false)
  }

  return (
    <section className="reviews" aria-label="Avaliações de clientes">
      <div className="ax-sec-head pdp-rel"><div><h2>Avaliações de clientes</h2></div></div>
      {list.length > 0 ? <p className="rv-avg"><Stars n={avg} /> <b>{avg.toFixed(1).replace('.', ',')}</b> · {list.length} {list.length === 1 ? 'avaliação' : 'avaliações'}</p> : <p className="muted">Ainda não há avaliações. Comprou? Conte o que achou.</p>}
      <ul className="rv-list">
        {list.map(r => <li key={r.id}><Stars n={r.rating} /> <b>{r.name}</b> <small>Compra verificada · {new Date(r.created_at).toLocaleDateString('pt-BR')}</small>{r.comment && <p>{r.comment}</p>}</li>)}
      </ul>
      {msg && <p className="muted" role="status">{msg}</p>}
      {!form ? <button type="button" className="btn ghost" onClick={() => setForm(true)}>Avaliar este perfume</button> : (
        <form className="rv-form ck-card" onSubmit={send}>
          <div className="rv-pick" role="radiogroup" aria-label="Nota">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} role="radio" aria-checked={f.rating === n} className={n <= f.rating ? 'on' : ''} onClick={() => setF({ ...f, rating: n })}>★</button>)}</div>
          <label className="ck-f">Seu nome<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} maxLength={60} /></label>
          <label className="ck-f">Comentário<textarea rows={3} value={f.comment} onChange={e => setF({ ...f, comment: e.target.value })} maxLength={600} /></label>
          <label className="ck-f">Número do pedido<input value={f.orderId} inputMode="numeric" onChange={e => setF({ ...f, orderId: e.target.value })} /></label>
          <label className="ck-f">Telefone da compra<input value={f.phone} inputMode="tel" onChange={e => setF({ ...f, phone: e.target.value })} /></label>
          <p className="ck-hint">Só quem comprou pode avaliar. Conferimos o pedido.</p>
          <button className={busy ? 'btn is-busy' : 'btn'} disabled={busy}>Enviar avaliação</button>
        </form>
      )}
    </section>
  )
}

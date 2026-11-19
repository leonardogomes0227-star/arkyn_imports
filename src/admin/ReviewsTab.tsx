import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAllProducts } from './shared'

interface R { id: number; product_id: string; name: string; rating: number; comment: string; approved: boolean; created_at: string }

export default function ReviewsTab() {
  const [rows, setRows] = useState<R[] | null>(null)
  const [err, setErr] = useState('')
  const { items: products } = useAllProducts()
  const load = () => supabase!.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data, error }) => { if (error) setErr('Ainda não ativado: rode o arquivo supabase/avaliacoes.sql no Supabase.'); else setRows(data as R[]) })
  useEffect(() => { load() }, [])
  const name = (id: string) => { const p = products.find(x => x.id === id); return p ? `${p.brand} ${p.name}` : id }
  const approve = async (r: R, ok: boolean) => { await supabase!.from('reviews').update({ approved: ok }).eq('id', r.id); load() }
  const del = async (r: R) => { await supabase!.from('reviews').delete().eq('id', r.id); load() }
  if (err) return <p className="muted">{err}</p>
  if (!rows) return <p className="muted">Carregando…</p>
  return (
    <>
      <h3>Avaliações</h3>
      <p className="muted">Só quem comprou consegue enviar. Aprove para aparecer na página do produto.</p>
      {!rows.length && <p className="muted">Nenhuma avaliação ainda.</p>}
      {rows.map(r => (
        <div className="adm-card" key={r.id}>
          <div className="adm-row" style={{ marginBottom: 4 }}><b>{'★'.repeat(r.rating)} {r.name} · {name(r.product_id)}</b><span className="muted">{new Date(r.created_at).toLocaleDateString('pt-BR')} · {r.approved ? 'publicada' : 'aguardando'}</span></div>
          {r.comment && <p>{r.comment}</p>}
          <div className="adm-row" style={{ gap: 6, justifyContent: 'flex-start', marginBottom: 0 }}>
            <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => approve(r, !r.approved)}>{r.approved ? 'DESPUBLICAR' : 'APROVAR'}</button>
            <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => del(r)}>EXCLUIR</button>
          </div>
        </div>
      ))}
    </>
  )
}

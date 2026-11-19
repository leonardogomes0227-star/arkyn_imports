import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../lib/store'
import { useAllProducts, waLink } from './shared'

interface Lead { phone: string; name: string | null; items: { id: string; qty: number }[]; total: number; contacted: boolean; updated_at: string }

// Quem informou o telefone no checkout mas não finalizou. Só aparece depois de rodar supabase/leads.sql.
export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [err, setErr] = useState('')
  const { items: products } = useAllProducts()
  const load = () => supabase!.from('leads').select('*').order('updated_at', { ascending: false }).then(({ data, error }) => { if (error) setErr('Ainda não ativado: rode o arquivo supabase/leads.sql no Supabase.'); else setLeads(data as Lead[]) })
  useEffect(() => { load() }, [])
  const name = (id: string) => { const p = products.find(x => x.id === id); return p ? `${p.brand} ${p.name}` : id }
  async function mark(l: Lead) { await supabase!.from('leads').update({ contacted: true }).eq('phone', l.phone); load() }
  async function del(l: Lead) { await supabase!.from('leads').delete().eq('phone', l.phone); load() }
  if (err) return <p className="muted">{err}</p>
  if (!leads) return <p className="muted">Carregando…</p>
  return (
    <>
      <h3>Carrinhos não finalizados</h3>
      <p className="muted">Clientes que preencheram o telefone e não pagaram. Chame no WhatsApp para ajudar a fechar.</p>
      {!leads.length && <p className="muted">Nenhum carrinho parado agora.</p>}
      {leads.map(l => (
        <div className="adm-card" key={l.phone}>
          <div className="adm-row" style={{ marginBottom: 4 }}>
            <b>{l.name || 'Sem nome'} · {l.phone}</b>
            <span className="muted">{new Date(l.updated_at).toLocaleString('pt-BR')} · <b>{brl(Number(l.total))}</b>{l.contacted ? ' · já chamado' : ''}</span>
          </div>
          <ul>{l.items.map(i => <li key={i.id}>{i.qty}x {name(i.id)}</li>)}</ul>
          <div className="adm-row" style={{ gap: 6, justifyContent: 'flex-start', marginBottom: 0 }}>
            <a className="btn ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => mark(l)} target="_blank" rel="noreferrer"
              href={waLink(l.phone, `Olá${l.name ? ' ' + l.name.split(' ')[0] : ''}! Vi que você deixou ${l.items.length > 1 ? 'alguns perfumes' : name(l.items[0]?.id)} na sacola da Arkyn Imports. Posso te ajudar a finalizar?`)}>CHAMAR NO WHATSAPP</a>
            <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => del(l)}>REMOVER</button>
          </div>
        </div>
      ))}
    </>
  )
}

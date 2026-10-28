import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../lib/store'
import type { Coupon } from './shared'

const EMPTY: Coupon = { code: '', type: 'percent', value: 10, min_total: 0, active: true, max_uses: null, uses: 0, expires_at: null }

export default function CouponsTab() {
  const [items, setItems] = useState<Coupon[]>([])
  const [edit, setEdit] = useState<Coupon | null>(null)
  const [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase!.from('coupons').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Rode a migração supabase/painel-completo.sql para ativar cupons. (' + error.message + ')')
    setItems((data as Coupon[]) ?? [])
  }, [])
  useEffect(() => { load() }, [load])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!edit) return
    const row = { ...edit, code: edit.code.trim().toUpperCase(), expires_at: edit.expires_at ? new Date(edit.expires_at).toISOString() : null }
    const { error } = await supabase!.from('coupons').upsert(row)
    if (error) return setMsg(error.message)
    setEdit(null); setMsg(''); load()
  }
  async function toggle(c: Coupon) { await supabase!.from('coupons').update({ active: !c.active }).eq('code', c.code); load() }
  async function remove(c: Coupon) { if (confirm(`Excluir o cupom ${c.code}?`)) { await supabase!.from('coupons').delete().eq('code', c.code); load() } }

  if (edit) return (
    <form className="adm-form" onSubmit={save}>
      <h3>Cupom</h3>
      <label>Código (ex.: PRIMEIRA10)<input value={edit.code} onChange={e => setEdit({ ...edit, code: e.target.value })} required /></label>
      <div className="adm-grid">
        <label>Tipo<select value={edit.type} onChange={e => setEdit({ ...edit, type: e.target.value as Coupon['type'] })}><option value="percent">Porcentagem (%)</option><option value="fixed">Valor fixo (R$)</option></select></label>
        <label>Valor<input type="number" min="0" step="0.01" value={edit.value} onChange={e => setEdit({ ...edit, value: Number(e.target.value) })} required /></label>
        <label>Pedido mínimo (R$)<input type="number" min="0" step="0.01" value={edit.min_total} onChange={e => setEdit({ ...edit, min_total: Number(e.target.value) })} /></label>
        <label>Limite de usos<input type="number" min="0" placeholder="sem limite" value={edit.max_uses ?? ''} onChange={e => setEdit({ ...edit, max_uses: e.target.value ? Number(e.target.value) : null })} /></label>
      </div>
      <label>Validade<input type="date" value={edit.expires_at ? edit.expires_at.slice(0, 10) : ''} onChange={e => setEdit({ ...edit, expires_at: e.target.value || null })} /></label>
      <label className="chk"><input type="checkbox" checked={edit.active} onChange={e => setEdit({ ...edit, active: e.target.checked })} /> Ativo</label>
      {msg && <p className="err">{msg}</p>}
      <div className="adm-row"><button className="btn">SALVAR</button><button type="button" className="btn ghost" onClick={() => { setEdit(null); setMsg('') }}>CANCELAR</button></div>
    </form>
  )
  return (
    <>
      <div className="adm-row"><button className="btn" onClick={() => setEdit({ ...EMPTY })}>+ NOVO CUPOM</button></div>
      {msg && <p className="err">{msg}</p>}
      {!items.length && !msg && <p className="muted">Nenhum cupom criado.</p>}
      <div className="adm-table">
        {items.map(c => (
          <div className="adm-line" key={c.code}>
            <div className="grow"><b>{c.code}</b> <span className={`pill ${c.active ? 's-paid' : 's-canceled'}`}>{c.active ? 'ativo' : 'inativo'}</span>
              <div className="muted">{c.type === 'percent' ? `${c.value}%` : brl(c.value)}{c.min_total ? ` · mín. ${brl(c.min_total)}` : ''} · {c.uses}{c.max_uses ? `/${c.max_uses}` : ''} uso(s){c.expires_at ? ` · até ${new Date(c.expires_at).toLocaleDateString('pt-BR')}` : ''}</div></div>
            <button className="link" onClick={() => setEdit({ ...c })}>Editar</button>
            <button className="link" onClick={() => toggle(c)}>{c.active ? 'Desativar' : 'Ativar'}</button>
            <button className="link" onClick={() => remove(c)}>Excluir</button>
          </div>
        ))}
      </div>
    </>
  )
}

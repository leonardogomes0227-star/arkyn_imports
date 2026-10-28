import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { key, supabase, url } from '../lib/supabase'
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from '../lib/seed'
import { brl } from '../lib/store'
import type { Category, Gender, Product, Settings } from '../lib/types'

interface Order { id: number; customer_name: string; phone: string; delivery: string; items: { id: string; qty: number }[]; total: number; status: string; created_at: string }
const STATUS: [string, string][] = [['pending', 'Aguardando pagamento'], ['paid', 'Pago'], ['shipped', 'Enviado/Entregue'], ['canceled', 'Cancelado']]
const EMPTY: Product = { id: '', name: '', brand: '', price: 0, stock: 0, category: 'masculino', gender: 'masculino', family: '', notes: [], tags: [], image: '' }
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const list = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!supabase) return setReady(true)
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) return <div className="adm-wrap"><div className="adm-box"><h2>Painel Arkyn</h2><p className="muted">Falta: <b>{[!url && 'VITE_SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)', !key && 'VITE_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)'].filter(Boolean).join(' e ')}</b> (a Vercel só aplica depois de um Redeploy).</p><p className="muted">Configure <b>VITE_SUPABASE_URL</b> e <b>VITE_SUPABASE_ANON_KEY</b> na Vercel e rode <code>supabase/schema.sql</code> para ativar o painel.</p><Link to="/" className="btn">Voltar à loja</Link></div></div>
  if (!ready) return null
  return session ? <Panel onLogout={() => supabase!.auth.signOut()} /> : <Login />
}

function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase!.auth.signInWithPassword({ email, password: pass })
    if (error) setErr('E-mail ou senha incorretos.')
  }
  return (
    <div className="adm-wrap">
      <form className="adm-box" onSubmit={submit}>
        <h2>Painel Arkyn</h2>
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} required />
        {err && <p className="err">{err}</p>}
        <button className="btn">ENTRAR</button>
      </form>
    </div>
  )
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'orders' | 'products' | 'settings'>('orders')
  return (
    <div className="adm">
      <header className="adm-head">
        <b>ARKYN · Painel</b>
        <nav>
          {([['orders', 'Pedidos'], ['products', 'Produtos'], ['settings', 'Configurações']] as const).map(([k, l]) => (
            <button key={k} className={tab === k ? 'chip on' : 'chip'} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>
        <span><Link to="/">Ver loja</Link> · <button className="link" onClick={onLogout}>Sair</button></span>
      </header>
      <div className="adm-body">
        {tab === 'orders' && <Orders />}
        {tab === 'products' && <Products />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const load = useCallback(async () => {
    const [o, p] = await Promise.all([supabase!.from('orders').select('*').order('created_at', { ascending: false }), supabase!.from('products').select('id,brand,name')])
    setOrders((o.data as Order[]) ?? [])
    setNames(Object.fromEntries((p.data ?? []).map(x => [x.id, `${x.brand} ${x.name}`])))
  }, [])
  useEffect(() => { load() }, [load])
  async function setStatus(id: number, status: string) {
    await supabase!.from('orders').update({ status }).eq('id', id)
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
  }
  const total = orders.filter(o => o.status === 'paid' || o.status === 'shipped').reduce((s, o) => s + Number(o.total), 0)
  return (
    <>
      <div className="adm-stats">
        <div><small>Pedidos</small><b>{orders.length}</b></div>
        <div><small>Aguardando pagamento</small><b>{orders.filter(o => o.status === 'pending').length}</b></div>
        <div><small>Faturamento (pagos)</small><b>{brl(total)}</b></div>
      </div>
      {!orders.length && <p className="muted">Nenhum pedido ainda.</p>}
      {orders.map(o => (
        <div className="adm-card" key={o.id}>
          <div className="adm-row">
            <b>#{o.id} · {o.customer_name}</b>
            <span className="muted">{new Date(o.created_at).toLocaleString('pt-BR')}</span>
          </div>
          <p><a href={`https://wa.me/55${o.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{o.phone}</a> · {o.delivery === 'pickup' ? 'Retirada' : `Entrega em ${o.delivery}`}</p>
          <ul>{o.items.map(i => <li key={i.id}>{i.qty}x {names[i.id] ?? i.id}</li>)}</ul>
          <div className="adm-row">
            <b>{brl(Number(o.total))}</b>
            <select value={o.status} onChange={e => setStatus(o.id, e.target.value)}>{STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </div>
        </div>
      ))}
    </>
  )
}

function Products() {
  const [items, setItems] = useState<Product[]>([])
  const [edit, setEdit] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data } = await supabase!.from('products').select('*').order('brand')
    setItems((data as Product[]) ?? [])
  }, [])
  useEffect(() => { load() }, [load])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!edit) return
    const row = { ...edit, id: isNew ? slug(`${edit.brand} ${edit.name}`) : edit.id }
    const { error } = await supabase!.from('products').upsert(row)
    if (error) return setMsg(error.message)
    setEdit(null); setMsg(''); load()
  }
  async function remove(id: string) {
    if (!confirm('Excluir este produto?')) return
    await supabase!.from('products').delete().eq('id', id)
    load()
  }
  async function upload(file: File) {
    const name = `${Date.now()}-${slug(file.name.replace(/\.[^.]+$/, ''))}.${file.name.split('.').pop()}`
    const { error } = await supabase!.storage.from('produtos').upload(name, file)
    if (error) return setMsg(error.message)
    setEdit(x => x && { ...x, image: supabase!.storage.from('produtos').getPublicUrl(name).data.publicUrl })
  }
  async function importSeed() {
    if (!confirm(`Importar ${SEED_PRODUCTS.length} produtos de exemplo? Produtos com o mesmo código serão sobrescritos.`)) return
    const { error } = await supabase!.from('products').upsert(SEED_PRODUCTS)
    setMsg(error ? error.message : 'Produtos importados.'); load()
  }
  async function quick(p: Product, patch: Partial<Product>) {
    await supabase!.from('products').update(patch).eq('id', p.id)
    setItems(xs => xs.map(x => x.id === p.id ? { ...x, ...patch } : x))
  }

  if (edit) return (
    <form className="adm-form" onSubmit={save}>
      <h3>{isNew ? 'Novo produto' : 'Editar produto'}</h3>
      <label>Marca<input value={edit.brand} onChange={e => setEdit({ ...edit, brand: e.target.value })} required /></label>
      <label>Nome<input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} required /></label>
      <div className="adm-grid">
        <label>Preço (R$)<input type="number" step="0.01" min="0" value={edit.price} onChange={e => setEdit({ ...edit, price: Number(e.target.value) })} required /></label>
        <label>Estoque<input type="number" min="0" value={edit.stock} onChange={e => setEdit({ ...edit, stock: Number(e.target.value) })} required /></label>
        <label>Categoria<select value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value as Category })}><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="splash">Splash/Miniatura</option><option value="skincare">Skincare</option></select></label>
        <label>Gênero<select value={edit.gender} onChange={e => setEdit({ ...edit, gender: e.target.value as Gender })}><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="unissex">Unissex</option></select></label>
      </div>
      <label>Família olfativa<input value={edit.family ?? ''} onChange={e => setEdit({ ...edit, family: e.target.value })} /></label>
      <label>Notas (separadas por vírgula)<input value={(edit.notes ?? []).join(', ')} onChange={e => setEdit({ ...edit, notes: list(e.target.value) })} /></label>
      <label>Perfil para o quiz (doce, amadeirado, fresco, floral, especiado, intenso, dia, noite)<input value={(edit.tags ?? []).join(', ')} onChange={e => setEdit({ ...edit, tags: list(e.target.value) })} /></label>
      <label>Foto<input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>
      {edit.image && <img className="adm-thumb big" src={edit.image} alt="" />}
      {msg && <p className="err">{msg}</p>}
      <div className="adm-row"><button className="btn">SALVAR</button><button type="button" className="btn ghost" onClick={() => { setEdit(null); setMsg('') }}>CANCELAR</button></div>
    </form>
  )

  return (
    <>
      <div className="adm-row">
        <button className="btn" onClick={() => { setEdit({ ...EMPTY }); setIsNew(true) }}>+ NOVO PRODUTO</button>
        {!items.length && <button className="btn ghost" onClick={importSeed}>IMPORTAR PRODUTOS DE EXEMPLO</button>}
      </div>
      {msg && <p className="muted">{msg}</p>}
      <div className="adm-table">
        {items.map(p => (
          <div className="adm-line" key={p.id}>
            {p.image ? <img className="adm-thumb" src={p.image} alt="" /> : <div className="adm-thumb" />}
            <div className="grow"><small>{p.brand}</small><div>{p.name}</div></div>
            <label>R$<input type="number" step="0.01" defaultValue={p.price} onBlur={e => Number(e.target.value) !== p.price && quick(p, { price: Number(e.target.value) })} /></label>
            <label>Estoque<input type="number" min="0" defaultValue={p.stock} onBlur={e => Number(e.target.value) !== p.stock && quick(p, { stock: Number(e.target.value) })} /></label>
            <button className="link" onClick={() => { setEdit(p); setIsNew(false) }}>Editar</button>
            <button className="link" onClick={() => remove(p.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </>
  )
}

function SettingsTab() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS)
  const [msg, setMsg] = useState('')
  useEffect(() => { supabase!.from('settings').select('value').eq('id', 1).maybeSingle().then(({ data }) => data?.value && setS({ ...DEFAULT_SETTINGS, ...(data.value as Settings) })) }, [])
  async function save(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase!.from('settings').upsert({ id: 1, value: s })
    setMsg(error ? error.message : 'Configurações salvas.')
  }
  return (
    <form className="adm-form" onSubmit={save}>
      <h3>Configurações da loja</h3>
      <label>WhatsApp (com DDI e DDD)<input value={s.whatsapp} onChange={e => setS({ ...s, whatsapp: e.target.value })} /></label>
      <label>Endereço de retirada<input value={s.pickupAddress} onChange={e => setS({ ...s, pickupAddress: e.target.value })} /></label>
      <label>Frete grátis a partir de R$ (0 = desativado)<input type="number" min="0" step="0.01" value={s.freeShippingFrom} onChange={e => setS({ ...s, freeShippingFrom: Number(e.target.value) })} /></label>
      <label>Parcelas máximas no cartão (1 = sem parcelamento)<input type="number" min="1" max="12" value={s.installments} onChange={e => setS({ ...s, installments: Number(e.target.value) || 1 })} /></label>
      <h4>Entrega por cidade</h4>
      {s.shipping.map((x, i) => (
        <div className="adm-row" key={i}>
          <input placeholder="Cidade" value={x.city} onChange={e => setS({ ...s, shipping: s.shipping.map((y, j) => j === i ? { ...y, city: e.target.value } : y) })} />
          <input type="number" min="0" step="0.01" placeholder="Valor" value={x.price} onChange={e => setS({ ...s, shipping: s.shipping.map((y, j) => j === i ? { ...y, price: Number(e.target.value) } : y) })} />
          <button type="button" className="link" onClick={() => setS({ ...s, shipping: s.shipping.filter((_, j) => j !== i) })}>Remover</button>
        </div>
      ))}
      <button type="button" className="btn ghost" onClick={() => setS({ ...s, shipping: [...s.shipping, { city: '', price: 0 }] })}>+ ADICIONAR CIDADE</button>
      {msg && <p className="muted">{msg}</p>}
      <button className="btn">SALVAR</button>
    </form>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { key, supabase, url } from '../lib/supabase'
import Dashboard from '../admin/Dashboard'
import OrdersTab from '../admin/OrdersTab'
import ProductsTab from '../admin/ProductsTab'
import CustomersTab from '../admin/CustomersTab'
import CouponsTab from '../admin/CouponsTab'
import SettingsTab from '../admin/SettingsTab'

const REQUIRE_LOGIN = (import.meta.env as Record<string, string | undefined>).VITE_ADMIN_LOGIN === 'true'
// protected = dados de clientes/cupons: sempre exigem login
const TABS: { id: string; label: string; protected?: boolean }[] = [
  { id: 'dash', label: 'Dashboard', protected: true }, { id: 'orders', label: 'Pedidos', protected: true },
  { id: 'products', label: 'Produtos' }, { id: 'stock', label: 'Estoque' },
  { id: 'customers', label: 'Clientes', protected: true }, { id: 'coupons', label: 'Cupons', protected: true },
  { id: 'settings', label: 'Configurações' },
]

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!supabase) return setReady(true)
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) return <div className="adm-wrap"><div className="adm-box"><h2>Painel Arkyn</h2><p className="muted">Falta: <b>{[!url && 'VITE_SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)', !key && 'VITE_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)'].filter(Boolean).join(' e ')}</b> (a Vercel só aplica depois de um Redeploy).</p><Link to="/" className="btn">Voltar à loja</Link></div></div>
  if (!ready) return null
  if (REQUIRE_LOGIN && !session) return <Login />
  return <Panel session={session} onLogout={() => supabase!.auth.signOut()} />
}

function Login({ inline = false }: { inline?: boolean }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase!.auth.signInWithPassword({ email, password: pass })
    if (error) setErr('E-mail ou senha incorretos.')
  }
  return (
    <div className={inline ? '' : 'adm-wrap'}>
      <form className="adm-box" onSubmit={submit}>
        <h2>{inline ? 'Entre para ver esta área' : 'Painel Arkyn'}</h2>
        {inline && <p className="muted">Pedidos, clientes e cupons têm dados sensíveis, por isso exigem login.</p>}
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} required />
        {err && <p className="err">{err}</p>}
        <button className="btn">ENTRAR</button>
      </form>
    </div>
  )
}

function Panel({ session, onLogout }: { session: Session | null; onLogout: () => void }) {
  const [tab, setTab] = useState(session ? 'dash' : 'products')
  const cur = TABS.find(t => t.id === tab)!
  const body = () => {
    if (cur.protected && !session) return <Login inline />
    switch (tab) {
      case 'dash': return <Dashboard go={setTab} />
      case 'orders': return <OrdersTab />
      case 'products': return <ProductsTab />
      case 'stock': return <ProductsTab stockMode />
      case 'customers': return <CustomersTab />
      case 'coupons': return <CouponsTab />
      default: return <SettingsTab />
    }
  }
  return (
    <div className="adm">
      <header className="adm-head">
        <b>ARKYN · Painel</b>
        <span><Link to="/">Ver loja</Link>{session && <> · <button className="link" onClick={onLogout}>Sair</button></>}</span>
      </header>
      <nav className="adm-tabs">
        {TABS.map(t => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}{t.protected && !session ? ' 🔒' : ''}</button>)}
      </nav>
      {!session && <div className="adm-warn">Modo sem senha: quem tiver o link /admin consegue editar produtos e configurações. Ative o login antes de divulgar o site.</div>}
      <div className="adm-body" key={tab}>{body()}</div>
    </div>
  )
}

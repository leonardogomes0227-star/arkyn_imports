import { useState, type FormEvent } from 'react'

/** Lista local, até a loja ligar um provedor de e-mail. O endereço fica só neste navegador. */
const KEY = 'arkyn-news'

export default function Newsletter({ variant = 'band' }: { variant?: 'band' | 'compact' }) {
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErr('Informe um e-mail válido.'); return }
    try {
      const prev = JSON.parse(localStorage.getItem(KEY) || '[]')
      const list = Array.isArray(prev) ? prev.filter((x): x is string => typeof x === 'string') : []
      localStorage.setItem(KEY, JSON.stringify([...new Set([...list, email.trim().toLowerCase()])]))
    } catch { /* ignore */ }
    setErr(''); setOk(true)
  }

  if (variant === 'compact') {
    return (
      <form className="ak-news ak-news--compact" onSubmit={submit}>
        <h4>Novidades</h4>
        {ok ? <p className="ak-news-ok">E-mail anotado. Você recebe os lançamentos primeiro.</p> : (
          <>
            <p>Lançamentos e condições no Pix, sem spam.</p>
            <div>
              <input type="email" inputMode="email" autoComplete="email" placeholder="Seu e-mail" aria-label="E-mail para novidades" value={email} onChange={e => setEmail(e.target.value)} />
              <button type="submit" className="btn">OK</button>
            </div>
            {err && <span className="ak-news-err" role="alert">{err}</span>}
          </>
        )}
      </form>
    )
  }

  return (
    <section className="ak-news">
      <div>
        <p className="ax-eyebrow">Lista da casa</p>
        <h2>Entre para saber dos lançamentos antes.</h2>
        <p>Avisamos frasco novo, reposição e o desconto no Pix. Dá para sair quando quiser.</p>
      </div>
      {ok ? <p className="ak-news-ok">Pronto. Este e-mail está na lista de novidades da Arkyn.</p> : (
        <form onSubmit={submit}>
          <input type="email" inputMode="email" autoComplete="email" placeholder="Seu melhor e-mail" aria-label="E-mail para novidades" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" className="btn gold">Quero receber</button>
          {err && <span className="ak-news-err" role="alert">{err}</span>}
        </form>
      )}
    </section>
  )
}

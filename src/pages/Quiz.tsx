import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

type Opt = [string, string]
interface Q { title: string; multi?: boolean; opts: Opt[] }
const QUESTIONS: Q[] = [
  { title: 'Pra quem é?', opts: [['masculino', 'Pra mim (masculino)'], ['feminino', 'Pra mim (feminino)'], ['any', 'Tanto faz'], ['present', 'Presente']] },
  { title: 'Quando vai usar?', opts: [['dia', 'Dia a dia e trabalho'], ['noite', 'Encontro e noite'], ['fresco', 'Calor e praia'], ['intenso', 'Ocasião especial']] },
  { title: 'Que cheiro te atrai?', opts: [['doce', 'Doce e cremoso (baunilha)'], ['fresco', 'Fresco e limpo'], ['especiado', 'Quente e apimentado'], ['amadeirado', 'Amadeirado e marcante'], ['floral', 'Flores']] },
  { title: 'Qual intensidade?', opts: [['suave', 'Discreto'], ['intenso', 'Marcante'], ['intenso2', 'Quero que perguntem qual é meu perfume']] },
  { title: 'O que você NÃO curte?', multi: true, opts: [['nodoce', 'Muito doce'], ['noforte', 'Muito forte']] },
  { title: 'Qual seu orçamento?', opts: [['250', 'Até R$ 250'], ['350', 'Até R$ 350'], ['0', 'Sem limite']] },
]

export default function Quiz() {
  const { products, settings } = useStore()
  const [answers, setAnswers] = useState<string[][]>([])
  const [pick, setPick] = useState<string[]>([])
  const step = answers.length
  const done = step >= QUESTIONS.length
  const q = QUESTIONS[step]

  const next = (v: string[]) => { setAnswers([...answers, v]); setPick([]) }

  let results: { p: Product; why: string[] }[] = []
  if (done) {
    const [who, when, smell, power, avoid, budget] = answers.map(a => a[0] ? a : [])
    const dislikes = avoid
    const max = Number(budget[0])
    const eligible = (relax: boolean) => products
      .filter(p => (p.category === 'masculino' || p.category === 'feminino') && p.stock > 0)
      .filter(p => ['any', 'present'].includes(who[0]) || p.gender === who[0])
      .filter(p => relax || !max || p.price <= max)
      .filter(p => !(dislikes.includes('nodoce') && p.tags?.includes('doce')) && !(dislikes.includes('noforte') && p.tags?.includes('intenso')))
    let pool = eligible(false)
    if (pool.length < 3) pool = eligible(true)
    results = pool.map(p => {
      const t = p.tags ?? []
      const why: string[] = []
      let score = 0
      if (t.includes(smell[0])) { score += 3; why.push(smell[0]) }
      if (t.includes(when[0])) { score += 2; why.push(when[0] === 'fresco' ? 'fresco (calor)' : when[0]) }
      if ((power[0] === 'suave') === !t.includes('intenso')) { score += 2; why.push(power[0] === 'suave' ? 'discreto' : 'marcante') }
      if (p.image) score += 0.5
      return { p, why, score }
    }).sort((a, b) => b.score - a.score).slice(0, 3)
  }

  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Fiz o quiz da Arkyn e me indicaram:\n${results.map(r => `• ${r.p.brand} ${r.p.name} (${brl(r.p.price)})`).join('\n')}\nPode me ajudar a escolher?`)}`

  return (
    <section className="section quiz">
      <h2>Qual é o seu cheiro?</h2>
      {!done ? (
        <>
          <p className="muted">Pergunta {step + 1} de {QUESTIONS.length}</p>
          <h3 className="q">{q.title}</h3>
          <div className="opts">
            {q.opts.map(([v, l]) => q.multi
              ? <button key={v} className={pick.includes(v) ? 'opt sel' : 'opt'} onClick={() => setPick(pick.includes(v) ? pick.filter(x => x !== v) : [...pick, v])}>{l}</button>
              : <button key={v} className="opt" onClick={() => next([v === 'intenso2' ? 'intenso' : v])}>{l}</button>)}
          </div>
          {q.multi && <button className="btn" onClick={() => next(pick)}>{pick.length ? 'CONTINUAR' : 'NENHUM, CONTINUAR'}</button>}
          {step > 0 && <p><button className="link" onClick={() => setAnswers(answers.slice(0, -1))}>← Voltar</button></p>}
        </>
      ) : (
        <>
          <h3 className="q">Nossas indicações para você</h3>
          {!results.length && <p className="muted">Não encontramos uma combinação exata. Fale com a gente no WhatsApp que ajudamos!</p>}
          <div className="grid">{results.map(r => (
            <div key={r.p.id}><ProductCard p={r.p} />{!!r.why.length && <p className="why">Combina porque: {r.why.join(', ')}</p>}</div>
          ))}</div>
          <p style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn" href={wa} target="_blank" rel="noreferrer">RECEBER NO WHATSAPP</a>
            <button className="btn ghost" onClick={() => setAnswers([])}>REFAZER O QUIZ</button>
            <Link to="/catalogo" className="btn ghost">VER CATÁLOGO</Link>
          </p>
        </>
      )}
    </section>
  )
}

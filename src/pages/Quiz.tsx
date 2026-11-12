import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { usePageMeta } from '../lib/seo'
import { brl, useStore } from '../lib/store'
import type { Product } from '../lib/types'

type Opt = [string, string]
interface Q { title: string; multi?: boolean; opts: Opt[] }
const QUESTIONS: Q[] = [
  { title: 'Para quem é o perfume?', opts: [['masculino', 'Para mim, masculino'], ['feminino', 'Para mim, feminino'], ['any', 'Tanto faz'], ['present', 'É um presente']] },
  { title: 'Quando você vai usar?', opts: [['dia', 'No dia a dia'], ['noite', 'À noite e em encontro'], ['fresco', 'No calor'], ['intenso', 'Em uma ocasião especial']] },
  { title: 'Que cheiro você prefere?', opts: [['doce', 'Doce, tipo baunilha'], ['fresco', 'Fresco e limpo'], ['especiado', 'Especiado'], ['amadeirado', 'Amadeirado'], ['floral', 'Floral']] },
  { title: 'Qual a intensidade?', opts: [['suave', 'Mais discreto'], ['intenso', 'Marcante'], ['intenso2', 'Bem forte']] },
  { title: 'Tem algo que você não gosta?', multi: true, opts: [['nodoce', 'Muito doce'], ['noforte', 'Muito forte']] },
  { title: 'Até quanto quer gastar?', opts: [['250', 'Até R$ 250'], ['350', 'Até R$ 350'], ['0', 'Sem limite']] },
]

export default function Quiz() {
  usePageMeta({ title: 'Me ajuda a escolher | Arkyn Imports', description: 'Responda algumas perguntas e veja perfumes do catálogo da Arkyn que combinam com você.' })
  const { products, settings } = useStore()
  const [sp] = useSearchParams()
  const start = sp.get('p')
  const [answers, setAnswers] = useState<string[][]>(start && ['masculino', 'feminino', 'any', 'present'].includes(start) ? [[start]] : [])
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
      <h1>Me ajuda a escolher</h1>
      {!done ? (
        <>
          <p className="muted">Pergunta {step + 1} de {QUESTIONS.length}</p>
          <h3 className="q">{q.title}</h3>
          <div className="opts">
            {q.opts.map(([v, l]) => q.multi
              ? <button key={v} className={pick.includes(v) ? 'opt sel' : 'opt'} onClick={() => setPick(pick.includes(v) ? pick.filter(x => x !== v) : [...pick, v])}>{l}</button>
              : <button key={v} className="opt" onClick={() => next([v === 'intenso2' ? 'intenso' : v])}>{l}</button>)}
          </div>
          {q.multi && <button className="btn" onClick={() => next(pick)}>{pick.length ? 'Continuar' : 'Nenhum destes'}</button>}
          {step > 0 && <p><button className="link" onClick={() => setAnswers(answers.slice(0, -1))}>← Voltar</button></p>}
        </>
      ) : (
        <>
          <h3 className="q">Sugestões para você</h3>
          {!results.length && <p className="muted">Não achamos uma combinação exata. Chama no WhatsApp que a gente ajuda.</p>}
          <div className="grid">{results.map(r => (
            <div key={r.p.id}><ProductCard p={r.p} />{!!r.why.length && <p className="why">Combina com: {r.why.join(', ')}</p>}</div>
          ))}</div>
          <p style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn" href={wa} target="_blank" rel="noreferrer">Receber no WhatsApp</a>
            <button className="btn ghost" onClick={() => setAnswers([])}>Refazer</button>
            <Link to="/catalogo" className="btn ghost">Ver perfumes</Link>
          </p>
        </>
      )}
    </section>
  )
}

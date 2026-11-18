import { Link, useLocation } from 'react-router-dom'
import SizedImg from './SizedImg'
import { clearCompare, MAX_COMPARE, toggleCompare, useCompare } from '../lib/compare'
import { cutoutFor } from '../lib/cutouts'
import { useStore } from '../lib/store'

/** Barra fixa embaixo: mostra os perfumes escolhidos e leva para a comparação. */
export default function CompareBar() {
  const ids = useCompare()
  const { pathname } = useLocation()
  const { products } = useStore()
  const list = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products
  if (!list.length || pathname === '/comparar') return null
  return (
    <div className="cmpbar" role="region" aria-label="Comparar perfumes">
      <ul>
        {list.map(p => {
          const src = cutoutFor(p) ?? p.image
          return <li key={p.id}><button type="button" onClick={() => toggleCompare(p.id)} aria-label={`Remover ${p.name} da comparação`}>{src ? <SizedImg src={src} size={160} width={48} height={48} alt="" /> : null}<i aria-hidden="true">×</i></button></li>
        })}
        {Array.from({ length: MAX_COMPARE - list.length }, (_, i) => <li key={`e${i}`} className="empty" aria-hidden="true">+</li>)}
      </ul>
      <span className="cmpbar-n">{list.length < 2 ? 'Escolha mais um para comparar' : `${list.length} de ${MAX_COMPARE} escolhidos`}</span>
      <button type="button" className="link" onClick={clearCompare}>Limpar</button>
      {list.length >= 2 ? <Link to="/comparar" className="hx-btn">Comparar</Link> : <span className="hx-btn is-off" aria-disabled="true">Comparar</span>}
    </div>
  )
}

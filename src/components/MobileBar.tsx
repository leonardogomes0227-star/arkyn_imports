import { NavLink } from 'react-router-dom'
import { IconBag, IconHeart, IconSearch } from './Icons'
import { useStore } from '../lib/store'

/** Barra de baixo no celular, como em aplicativo: tudo a um toque do polegar. */
export default function MobileBar({ onSearch }: { onSearch: () => void }) {
  const { count, favs, setOpen } = useStore()
  return (
    <nav className="mbar" aria-label="Atalhos">
      <NavLink to="/" end><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg><span>Início</span></NavLink>
      <button type="button" onClick={onSearch}><IconSearch size={22} /><span>Buscar</span></button>
      <NavLink to="/quiz" className="mbar-quiz"><i aria-hidden="true"><img src="/intro/aviao.webp" alt="" /></i><span>Consultoria</span></NavLink>
      <NavLink to="/favoritos"><IconHeart size={22} /><span>Favoritos</span>{favs.length > 0 && <em>{favs.length}</em>}</NavLink>
      <button type="button" onClick={() => setOpen(true)}><IconBag size={22} /><span>Sacola</span>{count > 0 && <em key={count}>{count}</em>}</button>
    </nav>
  )
}

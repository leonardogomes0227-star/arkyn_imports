import { Link } from 'react-router-dom'
import { CAT_LABEL, useStore, waLink } from '../lib/store'
import { IChat, IShield } from './Icons'

const phone = (n: string) => (/^55\d{2}9?\d{8}$/.test(n) ? `(${n.slice(2, 4)}) ${n.slice(4, n.length - 4)}-${n.slice(-4)}` : n)

export default function Footer() {
  const { settings } = useStore()
  const wa = waLink(settings.whatsapp)
  return (
    <footer className="nv-foot">
      <div className="nv-foot-news">
        <div><b>Receba lançamentos e ofertas</b><span>Entre na lista de transmissão da Arkyn no WhatsApp.</span></div>
        <a className="nv-btn nv-btn-lime" href={waLink(settings.whatsapp, 'Olá! Quero entrar na lista de lançamentos e ofertas da Arkyn.')} target="_blank" rel="noreferrer"><IChat width={18} height={18} /> Quero receber</a>
      </div>
      <div className="nv-foot-in">
        <div className="nv-foot-brand">
          <img src="/brand/logo-xs.webp" alt="Arkyn Imports" width="360" height="212" />
          <p>Perfumes árabes e importados originais. Loja em Coxim – MS, com envio para todo o Brasil.</p>
          <div className="nv-social"><a href="https://instagram.com/arkyn_imports" target="_blank" rel="noreferrer">Instagram</a><a href={wa} target="_blank" rel="noreferrer">WhatsApp</a></div>
        </div>
        <nav><b>Loja</b>{Object.entries(CAT_LABEL).map(([k, l]) => <Link key={k} to={`/perfumes?cat=${k}`}>{l}</Link>)}<Link to="/marcas">Marcas</Link><Link to="/quiz">Descubra seu perfume</Link></nav>
        <nav><b>Ajuda</b><Link to="/ajuda/entrega">Envio e entrega</Link><Link to="/ajuda/trocas">Trocas e devoluções</Link><Link to="/ajuda/pedido">Acompanhar pedido</Link><Link to="/ajuda/privacidade">Privacidade</Link></nav>
        <div className="nv-foot-col"><b>Atendimento</b><a href={wa} target="_blank" rel="noreferrer">{phone(settings.whatsapp)}</a><span>Segunda a sábado</span><span>Retirada na loja em Coxim – MS</span></div>
      </div>
      <div className="nv-foot-pay">
        <div><b>Formas de pagamento</b><span className="nv-pays">{['Pix', 'Visa', 'Mastercard', 'Elo', 'Hipercard', 'Mercado Pago'].map(x => <i key={x}>{x}</i>)}</span></div>
        <div><b>Segurança</b><span className="nv-safe"><IShield width={18} height={18} /> Compra protegida pelo Mercado Pago</span></div>
      </div>
      <p className="nv-copy">© {new Date().getFullYear()} Arkyn Imports · Coxim – MS{settings.cnpj ? ` · CNPJ ${settings.cnpj}` : ''}</p>
    </footer>
  )
}

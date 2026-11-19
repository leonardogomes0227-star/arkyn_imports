import { useStore } from '../lib/store'
import { Link } from 'react-router-dom'

export function faqItems(installments: number, freeFrom: number): { q: string; a: string }[] {
  return [
    { q: 'Quais são as formas de pagamento?', a: `Pix e cartão de crédito${installments > 1 ? `, em até ${installments}x` : ''}, pelo Mercado Pago. O pagamento é feito em ambiente seguro deles.` },
    { q: 'Vocês enviam para todo o Brasil?', a: `Sim. Informe o seu CEP no carrinho ou na página do produto e veja o valor e o prazo do frete.${freeFrom > 0 ? ` Frete grátis em compras acima de R$ ${freeFrom.toFixed(2).replace('.', ',')}.` : ''}` },
    { q: 'Posso retirar na loja?', a: 'Sim, em Coxim – MS, sem custo de frete. O endereço de retirada aparece na finalização da compra.' },
    { q: 'Como funciona a troca ou devolução?', a: 'Você pode desistir em até 7 dias corridos depois de receber, com o produto lacrado e sem uso. Se chegar com defeito ou diferente do pedido, é só avisar pelo WhatsApp.' },
    { q: 'Como acompanho meu pedido?', a: 'Na página Acompanhar pedido, com o número do pedido e o seu telefone. O código de rastreio também é enviado pelo WhatsApp quando o pedido sai.' },
    { q: 'Não sei qual perfume escolher. E agora?', a: 'Faça o quiz “Qual é o seu cheiro?” ou chame no WhatsApp: indicamos pelo estilo e pelas notas que você gosta.' },
  ]
}

export default function Faq() {
  const { settings } = useStore()
  const items = faqItems(settings.installments, settings.freeShippingFrom)
  return (
    <section className="faq lt" aria-labelledby="faq-t"><div className="faq-in">
      <div className="hm-head"><div><p className="hm-eyebrow">Dúvidas</p><h2 id="faq-t">Perguntas frequentes</h2></div></div>
      <div className="faq-list">
        {items.map(x => <details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}
      </div>
      <p className="faq-more">Ainda com dúvida? <Link to="/politica/trocas">Trocas e devoluções</Link> · <Link to="/politica/envio">Envio e entrega</Link> · <Link to="/pedido">Acompanhar pedido</Link></p>
    </div></section>
  )
}

import { Link, useParams } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { useStore } from '../lib/store'
import NotFound from './NotFound'

type Doc = { title: string; lead: string; blocks: [string, string][] }

const DOCS: Record<string, Doc> = {
  trocas: {
    title: 'Trocas e devoluções',
    lead: 'Compra tranquila: você pode desistir ou pedir troca seguindo as regras abaixo.',
    blocks: [
      ['Arrependimento (7 dias)', 'Em compras feitas pelo site, você pode desistir em até 7 dias corridos após receber o pedido (art. 49 do Código de Defesa do Consumidor). O produto deve estar lacrado, sem uso e na embalagem original. Fale com a gente pelo WhatsApp e informamos como devolver. O valor pago é devolvido.'],
      ['Produto com defeito ou errado', 'Se o produto chegou com defeito, avariado ou diferente do pedido, avise pelo WhatsApp o quanto antes, com fotos. Fazemos a troca ou devolvemos o valor.'],
      ['Como pedir', 'Chame no WhatsApp informando o número do pedido e o motivo. Respondemos com o passo a passo.'],
    ],
  },
  envio: {
    title: 'Envio e entrega',
    lead: 'Entregamos em Coxim e enviamos para todo o Brasil.',
    blocks: [
      ['Coxim - MS', 'Você escolhe entre retirada na loja (grátis) e entrega em casa. O endereço de retirada aparece na finalização da compra.'],
      ['Outras cidades e estados', 'Informe o CEP no carrinho ou na finalização e veja as opções de frete com prazo. O prazo conta em dias úteis a partir da postagem do pedido.'],
      ['Rastreio', 'Depois do envio, o código de rastreio aparece na página Acompanhar pedido e também é enviado pelo WhatsApp.'],
      ['Endereço', 'Confira rua, número e CEP antes de pagar. Endereço incorreto pode atrasar ou impedir a entrega.'],
    ],
  },
  privacidade: {
    title: 'Privacidade e dados',
    lead: 'Como tratamos os seus dados, de acordo com a LGPD.',
    blocks: [
      ['Dados que pedimos', 'Nome, telefone e endereço de entrega, só o necessário para processar o pedido, entregar e falar com você sobre ele.'],
      ['Pagamento', 'O pagamento é feito no ambiente do Mercado Pago. Não guardamos dados de cartão.'],
      ['Contato', 'Usamos o seu telefone para falar do pedido e, se você deixou o carrinho sem finalizar, para ajudar a concluir a compra. Você pode pedir para não receber contato a qualquer momento.'],
      ['Medição do site', 'Quando ativados, usamos Google Analytics e Meta Pixel para entender o uso do site e melhorar a loja.'],
      ['Seus direitos', 'Você pode pedir acesso, correção ou exclusão dos seus dados pelo WhatsApp da loja.'],
    ],
  },
}

export const POLICY_LINKS: [string, string][] = [['Trocas e devoluções', '/politica/trocas'], ['Envio e entrega', '/politica/envio'], ['Privacidade', '/politica/privacidade'], ['Acompanhar pedido', '/pedido']]

export default function Policy() {
  const { slug = '' } = useParams()
  const { settings } = useStore()
  const d = DOCS[slug]
  usePageMeta({ title: `${d?.title ?? 'Política'} | Arkyn Imports`, description: d?.lead ?? '', noindex: !d })
  if (!d) return <NotFound />
  const wa = `https://wa.me/${settings.whatsapp}`
  return (
    <section className="section policy">
      <nav className="crumbs" aria-label="Você está em"><Link to="/">Início</Link> / <span aria-current="page">{d.title}</span></nav>
      <h1 className="ck-title">{d.title}</h1>
      <p className="muted">{d.lead}</p>
      {d.blocks.map(([h, t]) => <div key={h} className="pol-block"><h2>{h}</h2><p>{t}</p></div>)}
      <p><a className="btn" href={wa} target="_blank" rel="noreferrer">Falar no WhatsApp</a></p>
    </section>
  )
}

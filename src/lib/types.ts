export type Gender = 'masculino' | 'feminino' | 'unissex'
export type Category = 'masculino' | 'feminino' | 'splash' | 'skincare'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  stock: number
  category: Category
  gender: Gender
  family?: string
  notes?: string[]
  tags?: string[] // perfil usado no quiz: doce, amadeirado, fresco, floral, especiado, intenso, dia, noite
  image?: string
  images?: string[] // fotos extras (galeria e troca no hover), quando o cadastro tiver
  active?: boolean // false = oculto na loja
  featured?: boolean
  old_price?: number | null // preço antigo (mostra riscado + % off)
  description?: string | null
  cost?: number | null // custo de compra (só painel)
}

export interface Settings {
  whatsapp: string
  pickupAddress: string
  freeShippingFrom: number
  announcement?: string
  heroTitle?: string
  installments: number // parcelas máximas no cartão (1 = sem parcelamento)
  shipping: { city: string; price: number }[]
  // Envio para fora da cidade (Correios/transportadora)
  originCep?: string // CEP de onde sai o pedido
  freeShippingOutsideFrom?: number // 0 = sem frete grátis para fora
  shipHandlingFee?: number // embalagem/manuseio somado ao frete (R$)
  itemWeightG?: number // peso médio de cada item embalado (g)
  shipRegions?: ShipRegion[] // tabela usada quando a consulta automática não está disponível
}

export interface ShipRegion { key: string; label: string; price: number; days: number }

export interface ShipOption { id: string; label: string; price: number; days: number; estimated?: boolean }
export interface ShipAddress { cep: string; street: string; number: string; complement: string; district: string; city: string; uf: string }
export interface ShipQuote {
  ok: boolean
  error?: string
  local?: string // CEP pertence a uma cidade com entrega local: nome da cidade
  address?: Partial<ShipAddress>
  options?: ShipOption[]
  estimated?: boolean // true = valores da tabela, não de consulta em tempo real
}

export interface CartItem { id: string; qty: number }

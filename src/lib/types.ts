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
}

export interface CartItem { id: string; qty: number }

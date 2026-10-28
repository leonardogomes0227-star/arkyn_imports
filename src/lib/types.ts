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
}

export interface Settings {
  whatsapp: string
  pickupAddress: string
  freeShippingFrom: number
  shipping: { city: string; price: number }[]
}

export interface CartItem { id: string; qty: number }

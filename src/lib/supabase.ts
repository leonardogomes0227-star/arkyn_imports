import { createClient } from '@supabase/supabase-js'

// Aceita as variáveis criadas pela integração Supabase da Vercel (NEXT_PUBLIC_*) ou as VITE_*
const env = import.meta.env as Record<string, string | undefined>
export const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
export const key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null

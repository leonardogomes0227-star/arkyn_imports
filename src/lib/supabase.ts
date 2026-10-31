import { createClient } from '@supabase/supabase-js'
import { key, url } from './env'

export { key, url }
export const supabase = url && key ? createClient(url, key) : null

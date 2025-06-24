import { createClient } from '@supabase/supabase-js'

export interface Show {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  price_range?: string
  ticket_url?: string
  image_url?: string
  theater_id?: string
  theater?: {
    name: string
    address: string
    latitude: number
    longitude: number
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 
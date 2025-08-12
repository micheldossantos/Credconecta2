import { createClient } from '@supabase/supabase-js'

// Fallbacks para evitar erros em desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface DatabaseUser {
  id: string
  full_name: string
  cpf: string
  password: string
  is_blocked: boolean
  monthly_payment_status: 'paid' | 'pending' | 'overdue'
  created_at: string
  last_payment?: string
}

export interface DatabaseLoan {
  id: string
  full_name: string
  cpf: string
  phone: string
  loan_date: string
  loan_amount: number
  total_installments: number
  paid_installments: number
  remaining_installments: number
  daily_penalty: number
  photo?: string
  is_settled: boolean
  created_at: string
  updated_at: string
  created_by: string
}

// Função para verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key'
}
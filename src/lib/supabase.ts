import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          vault_key_hash: string
          settings: Json
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          vault_key_hash: string
          settings?: Json
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          vault_key_hash?: string
          settings?: Json
        }
      }
      passwords: {
        Row: {
          id: string
          user_id: string
          title: string
          username: string
          encrypted_password: string
          website: string | null
          notes: string | null
          category: string
          favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          username: string
          encrypted_password: string
          website?: string | null
          notes?: string | null
          category?: string
          favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          username?: string
          encrypted_password?: string
          website?: string | null
          notes?: string | null
          category?: string
          favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          details: Json
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          details?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type User = Database['public']['Tables']['users']['Row']
export type Password = Database['public']['Tables']['passwords']['Row']
export type AdminLog = Database['public']['Tables']['admin_logs']['Row']

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          price: number
          condition: 'A+' | 'A' | 'B'
          dimensions: string
          category: string
          stock: number
          shipping_cost: number
          pickup_location: string | null
          images: string[]
          video_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price: number
          condition: 'A+' | 'A' | 'B'
          dimensions: string
          category: string
          stock: number
          shipping_cost: number
          pickup_location?: string | null
          images: string[]
          video_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price?: number
          condition?: 'A+' | 'A' | 'B'
          dimensions?: string
          category?: string
          stock?: number
          shipping_cost?: number
          pickup_location?: string | null
          images?: string[]
          video_url?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          total_price: number
          shipping_address: Json
          payment_method: string
          payment_status: 'pending' | 'confirmed' | 'rejected'
          payment_proof_url: string | null
          transaction_reference: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          total_price: number
          shipping_address: Json
          payment_method: string
          payment_status?: 'pending' | 'confirmed' | 'rejected'
          payment_proof_url?: string | null
          transaction_reference?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          total_price?: number
          shipping_address?: Json
          payment_method?: string
          payment_status?: 'pending' | 'confirmed' | 'rejected'
          payment_proof_url?: string | null
          transaction_reference?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          notes?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
          product_title: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
          product_title: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_purchase?: number
          product_title?: string
        }
      }
    }
  }
}

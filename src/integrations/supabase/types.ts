export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          image_url: string | null
          meta_description: string | null
          published: boolean
          published_at: string | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_description?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_description?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          last_submission_at: string
          submission_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: unknown
          last_submission_at?: string
          submission_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          last_submission_at?: string
          submission_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      fraud_detection: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          order_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_factors: Json | null
          risk_score: number
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          order_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_factors?: Json | null
          risk_score?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          order_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_factors?: Json | null
          risk_score?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_detection_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_redemptions: {
        Row: {
          created_at: string
          gift_id: string
          id: string
          points_used: number
          shipping_address: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gift_id: string
          id?: string
          points_used: number
          shipping_address?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gift_id?: string
          id?: string
          points_used?: number
          shipping_address?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_redemptions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "loyalty_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_logs: {
        Row: {
          change_type: string
          created_at: string | null
          id: string
          new_stock: number
          performed_by: string | null
          previous_stock: number
          product_id: string | null
          quantity_change: number
          reason: string | null
        }
        Insert: {
          change_type: string
          created_at?: string | null
          id?: string
          new_stock: number
          performed_by?: string | null
          previous_stock: number
          product_id?: string | null
          quantity_change: number
          reason?: string | null
        }
        Update: {
          change_type?: string
          created_at?: string | null
          id?: string
          new_stock?: number
          performed_by?: string | null
          previous_stock?: number
          product_id?: string | null
          quantity_change?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          download_count: number | null
          due_date: string | null
          expires_at: string | null
          id: string
          invoice_date: string
          invoice_number: string
          order_id: string
          pdf_url: string | null
          status: string
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number | null
          due_date?: string | null
          expires_at?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          order_id: string
          pdf_url?: string | null
          status?: string
          subtotal_amount: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number | null
          due_date?: string | null
          expires_at?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          order_id?: string
          pdf_url?: string | null
          status?: string
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          city: string | null
          created_at: string
          email: string
          follow_up_date: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          email: string
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          city?: string | null
          created_at?: string
          email?: string
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_count: number
          blocked_until: string | null
          created_at: string
          email: string | null
          id: string
          ip_address: unknown
          is_blocked: boolean
          last_attempt_at: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address: unknown
          is_blocked?: boolean
          last_attempt_at?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          is_blocked?: boolean
          last_attempt_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_gifts: {
        Row: {
          auto_update_stock: boolean | null
          can_edit: boolean | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_required: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          auto_update_stock?: boolean | null
          can_edit?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_required: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          auto_update_stock?: boolean | null
          can_edit?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_required?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          current_balance: number | null
          id: string
          points_earned: number | null
          points_redeemed: number | null
          tier_level: string | null
          total_lifetime_points: number | null
          tvanamm_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number | null
          id?: string
          points_earned?: number | null
          points_redeemed?: number | null
          tier_level?: string | null
          total_lifetime_points?: number | null
          tvanamm_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number | null
          id?: string
          points_earned?: number | null
          points_redeemed?: number | null
          tier_level?: string | null
          total_lifetime_points?: number | null
          tvanamm_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          tvanamm_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          tvanamm_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          tvanamm_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          gst_rate: number | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          gst_rate?: number | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          gst_rate?: number | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          delivered_at: string | null
          delivery_date: string | null
          delivery_fee: number | null
          delivery_fee_added_by: string | null
          driver_contact: string | null
          driver_name: string | null
          estimated_delivery: string | null
          final_amount: number
          franchise_id: string | null
          id: string
          notes: string | null
          order_number: string
          packed_at: string | null
          packed_by: string | null
          packing_completed_at: string | null
          packing_notes: string | null
          packing_started_at: string | null
          packing_started_by: string | null
          payment_id: string | null
          payment_method: string | null
          payment_reminder_sent_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_location: string | null
          shipped_at: string | null
          shipped_by: string | null
          shipping_address: Json
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          tracking_info: Json | null
          transport_company: string | null
          updated_at: string
          user_id: string
          vehicle_number: string | null
        }
        Insert: {
          billing_address?: Json | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_date?: string | null
          delivery_fee?: number | null
          delivery_fee_added_by?: string | null
          driver_contact?: string | null
          driver_name?: string | null
          estimated_delivery?: string | null
          final_amount: number
          franchise_id?: string | null
          id?: string
          notes?: string | null
          order_number: string
          packed_at?: string | null
          packed_by?: string | null
          packing_completed_at?: string | null
          packing_notes?: string | null
          packing_started_at?: string | null
          packing_started_by?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_reminder_sent_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_location?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address: Json
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          tracking_info?: Json | null
          transport_company?: string | null
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
        }
        Update: {
          billing_address?: Json | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_date?: string | null
          delivery_fee?: number | null
          delivery_fee_added_by?: string | null
          driver_contact?: string | null
          driver_name?: string | null
          estimated_delivery?: string | null
          final_amount?: number
          franchise_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          packed_at?: string | null
          packed_by?: string | null
          packing_completed_at?: string | null
          packing_notes?: string | null
          packing_started_at?: string | null
          packing_started_by?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_reminder_sent_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_location?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address?: Json
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          tracking_info?: Json | null
          transport_company?: string | null
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_user_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      packing_items: {
        Row: {
          created_at: string | null
          id: string
          is_packed: boolean | null
          notes: string | null
          order_id: string
          packed_at: string | null
          packed_by: string | null
          packed_quantity: number | null
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_packed?: boolean | null
          notes?: string | null
          order_id: string
          packed_at?: string | null
          packed_by?: string | null
          packed_quantity?: number | null
          product_id: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_packed?: boolean | null
          notes?: string | null
          order_id?: string
          packed_at?: string | null
          packed_by?: string | null
          packed_quantity?: number | null
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packing_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          franchise_id: string | null
          id: string
          notes: Json | null
          order_id: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          security_flags: Json | null
          status: string
          updated_at: string
          user_id: string
          verification_ip: string | null
          verification_user_agent: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          franchise_id?: string | null
          id?: string
          notes?: Json | null
          order_id: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          security_flags?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          verification_ip?: string | null
          verification_user_agent?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          franchise_id?: string | null
          id?: string
          notes?: Json | null
          order_id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          security_flags?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_ip?: string | null
          verification_user_agent?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          gst_rate: number | null
          id: string
          images: Json | null
          is_active: boolean | null
          minimum_stock: number | null
          name: string
          price: number
          sku: string | null
          specifications: Json | null
          stock_quantity: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          gst_rate?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          minimum_stock?: number | null
          name: string
          price: number
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          gst_rate?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          minimum_stock?: number | null
          name?: string
          price?: number
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          assigned_at: string | null
          assigned_by: string | null
          avatar_url: string | null
          created_at: string
          dashboard_access_enabled: boolean | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          profile_completed: boolean | null
          profile_completion_status: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          store_location: string | null
          store_phone: string | null
          tvanamm_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          assigned_at?: string | null
          assigned_by?: string | null
          avatar_url?: string | null
          created_at?: string
          dashboard_access_enabled?: boolean | null
          email: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          profile_completed?: boolean | null
          profile_completion_status?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          store_location?: string | null
          store_phone?: string | null
          tvanamm_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          assigned_at?: string | null
          assigned_by?: string | null
          avatar_url?: string | null
          created_at?: string
          dashboard_access_enabled?: boolean | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          profile_completed?: boolean | null
          profile_completion_status?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          store_location?: string | null
          store_phone?: string | null
          tvanamm_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_statistics: {
        Row: {
          created_at: string
          display_label: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          stat_key: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_label: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          stat_key: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_label?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          stat_key?: string
          stat_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_location: string
          customer_name: string
          id: string
          is_featured: boolean | null
          order_id: string | null
          rating: number
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_location: string
          customer_name: string
          id?: string
          is_featured?: boolean | null
          order_id?: string | null
          rating: number
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_location?: string
          customer_name?: string
          id?: string
          is_featured?: boolean | null
          order_id?: string | null
          rating?: number
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      voucher_redemptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          order_id: string | null
          points_used: number
          status: string | null
          tvanamm_id: string | null
          updated_at: string
          user_id: string
          voucher_type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_used: number
          status?: string | null
          tvanamm_id?: string | null
          updated_at?: string
          user_id: string
          voucher_type?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_used?: number
          status?: string | null
          tvanamm_id?: string | null
          updated_at?: string
          user_id?: string
          voucher_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      payment_security_summary: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string | null
          failure_reason: string | null
          final_amount: number | null
          full_name: string | null
          has_security_failure: boolean | null
          has_verification_ip: boolean | null
          id: string | null
          order_id: string | null
          order_number: string | null
          payment_method: string | null
          security_flags: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_ip: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_loyalty_points_manual: {
        Args: {
          p_tvanamm_id: string
          p_points: number
          p_description: string
          p_admin_user_id: string
        }
        Returns: Json
      }
      assign_user_details: {
        Args: {
          p_user_id: string
          p_role: string
          p_tvanamm_id?: string
          p_store_location?: string
          p_store_phone?: string
          p_admin_user_id?: string
        }
        Returns: Json
      }
      can_user_place_order: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_form_rate_limit: {
        Args: { p_ip_address: unknown }
        Returns: Json
      }
      check_rate_limit: {
        Args: { p_ip_address: unknown; p_email?: string }
        Returns: Json
      }
      check_recent_order: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      cleanup_duplicate_orders: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
          kept_orders: string[]
        }[]
      }
      detect_payment_fraud: {
        Args: {
          p_user_id: string
          p_order_id: string
          p_amount: number
          p_ip_address: string
        }
        Returns: number
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_pdf_with_proper_joins: {
        Args: { invoice_id_param: string }
        Returns: Json
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tvanamm_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_invoice_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_invoices: number
          paid_invoices: number
          pending_invoices: number
          total_invoice_amount: number
        }[]
      }
      get_admin_owner_user_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_franchise_loyalty_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_franchise_users: number
          active_loyalty_users: number
          total_points_issued: number
          total_points_redeemed: number
        }[]
      }
      get_security_metrics: {
        Args: { days_back?: number }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      handle_loyalty_redemption: {
        Args: {
          p_user_id: string
          p_points_to_redeem: number
          p_order_id: string
          p_gift_id?: string
        }
        Returns: Json
      }
      has_pending_unpaid_orders: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_admin_or_owner: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      reset_login_attempts: {
        Args: { p_ip_address: unknown }
        Returns: undefined
      }
      use_delivery_voucher: {
        Args: { p_user_id: string; p_order_id: string; p_points_used: number }
        Returns: Json
      }
    }
    Enums: {
      franchise_status: "pending" | "approved" | "active" | "suspended"
      notification_type:
        | "system"
        | "order"
        | "franchise"
        | "loyalty"
        | "payment"
      order_status:
        | "pending"
        | "confirmed"
        | "packed"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "payment_completed"
        | "packing"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "owner" | "admin" | "franchise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      franchise_status: ["pending", "approved", "active", "suspended"],
      notification_type: ["system", "order", "franchise", "loyalty", "payment"],
      order_status: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "payment_completed",
        "packing",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["owner", "admin", "franchise"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acquirer_configs: {
        Row: {
          brand_label: string
          created_at: string | null
          display_name: string
          gateway: string
          id: string
          updated_at: string | null
        }
        Insert: {
          brand_label: string
          created_at?: string | null
          display_name: string
          gateway: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          brand_label?: string
          created_at?: string | null
          display_name?: string
          gateway?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      acquirer_fees: {
        Row: {
          created_at: string
          fixed_cents: number
          gateway: string
          label: string
          percent_bps: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fixed_cents?: number
          gateway: string
          label: string
          percent_bps?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fixed_cents?: number
          gateway?: string
          label?: string
          percent_bps?: number
          updated_at?: string
        }
        Relationships: []
      }
      acquirer_routing: {
        Row: {
          order_ids: string[]
          owner_id: string
          updated_at: string
        }
        Insert: {
          order_ids?: string[]
          owner_id: string
          updated_at?: string
        }
        Update: {
          order_ids?: string[]
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          environment: string
          id: string
          key_hash: string
          key_prefix: string
          key_secret: string | null
          last_used_at: string | null
          name: string
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          key_hash: string
          key_prefix: string
          key_secret?: string | null
          last_used_at?: string | null
          name: string
          owner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          key_secret?: string | null
          last_used_at?: string | null
          name?: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      checkout_domains: {
        Row: {
          cf_error: string | null
          cf_hostname_id: string | null
          cf_last_synced_at: string | null
          cf_ownership_verification: Json | null
          cf_ssl_status: string | null
          cf_status: string | null
          cf_validation_errors: string[] | null
          created_at: string
          host: string
          id: string
          is_default: boolean
          last_checked_at: string | null
          status: string
          updated_at: string
          user_id: string
          verify_token: string
        }
        Insert: {
          cf_error?: string | null
          cf_hostname_id?: string | null
          cf_last_synced_at?: string | null
          cf_ownership_verification?: Json | null
          cf_ssl_status?: string | null
          cf_status?: string | null
          cf_validation_errors?: string[] | null
          created_at?: string
          host: string
          id?: string
          is_default?: boolean
          last_checked_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verify_token: string
        }
        Update: {
          cf_error?: string | null
          cf_hostname_id?: string | null
          cf_last_synced_at?: string | null
          cf_ownership_verification?: Json | null
          cf_ssl_status?: string | null
          cf_status?: string | null
          cf_validation_errors?: string[] | null
          created_at?: string
          host?: string
          id?: string
          is_default?: boolean
          last_checked_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verify_token?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          phone: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          category: string
          config: Json
          connected: boolean
          created_at: string
          id: string
          label: string | null
          owner_id: string
          provider: string
          updated_at: string
        }
        Insert: {
          category: string
          config?: Json
          connected?: boolean
          created_at?: string
          id?: string
          label?: string | null
          owner_id: string
          provider: string
          updated_at?: string
        }
        Update: {
          category?: string
          config?: Json
          connected?: boolean
          created_at?: string
          id?: string
          label?: string | null
          owner_id?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          chargeback: boolean
          hide_amount: boolean
          hide_product: boolean
          sale_approved: boolean
          sale_pending: boolean
          sale_refused: boolean
          subscription_canceled: boolean
          subscription_new: boolean
          suffix: string
          updated_at: string
          user_id: string
          withdrawal_approved: boolean
        }
        Insert: {
          chargeback?: boolean
          hide_amount?: boolean
          hide_product?: boolean
          sale_approved?: boolean
          sale_pending?: boolean
          sale_refused?: boolean
          subscription_canceled?: boolean
          subscription_new?: boolean
          suffix?: string
          updated_at?: string
          user_id: string
          withdrawal_approved?: boolean
        }
        Update: {
          chargeback?: boolean
          hide_amount?: boolean
          hide_product?: boolean
          sale_approved?: boolean
          sale_pending?: boolean
          sale_refused?: boolean
          subscription_canceled?: boolean
          subscription_new?: boolean
          suffix?: string
          updated_at?: string
          user_id?: string
          withdrawal_approved?: boolean
        }
        Relationships: []
      }
      product_order_bumps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_order_bumps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bump_description: string | null
          bump_enabled: boolean
          bump_name: string | null
          bump_price_cents: number | null
          checkout_button_text: string | null
          checkout_code: string | null
          checkout_color: string | null
          checkout_config: Json
          checkout_headline: string | null
          checkout_security_badge: string | null
          checkout_slug: string | null
          created_at: string
          currency: string
          delivery_file_path: string | null
          delivery_instructions: string | null
          delivery_type: Database["public"]["Enums"]["digital_delivery_type"]
          delivery_url: string | null
          description: string | null
          id: string
          image_url: string | null
          kind: Database["public"]["Enums"]["product_kind"]
          name: string
          owner_id: string
          price_cents: number
          refund_policy: string | null
          require_document: boolean
          require_phone: boolean
          status: Database["public"]["Enums"]["product_status"]
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
          upsell_description: string | null
          upsell_enabled: boolean
          upsell_name: string | null
          upsell_price_cents: number | null
        }
        Insert: {
          bump_description?: string | null
          bump_enabled?: boolean
          bump_name?: string | null
          bump_price_cents?: number | null
          checkout_button_text?: string | null
          checkout_code?: string | null
          checkout_color?: string | null
          checkout_config?: Json
          checkout_headline?: string | null
          checkout_security_badge?: string | null
          checkout_slug?: string | null
          created_at?: string
          currency?: string
          delivery_file_path?: string | null
          delivery_instructions?: string | null
          delivery_type?: Database["public"]["Enums"]["digital_delivery_type"]
          delivery_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          kind?: Database["public"]["Enums"]["product_kind"]
          name: string
          owner_id: string
          price_cents?: number
          refund_policy?: string | null
          require_document?: boolean
          require_phone?: boolean
          status?: Database["public"]["Enums"]["product_status"]
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          upsell_description?: string | null
          upsell_enabled?: boolean
          upsell_name?: string | null
          upsell_price_cents?: number | null
        }
        Update: {
          bump_description?: string | null
          bump_enabled?: boolean
          bump_name?: string | null
          bump_price_cents?: number | null
          checkout_button_text?: string | null
          checkout_code?: string | null
          checkout_color?: string | null
          checkout_config?: Json
          checkout_headline?: string | null
          checkout_security_badge?: string | null
          checkout_slug?: string | null
          created_at?: string
          currency?: string
          delivery_file_path?: string | null
          delivery_instructions?: string | null
          delivery_type?: Database["public"]["Enums"]["digital_delivery_type"]
          delivery_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          kind?: Database["public"]["Enums"]["product_kind"]
          name?: string
          owner_id?: string
          price_cents?: number
          refund_policy?: string | null
          require_document?: boolean
          require_phone?: boolean
          status?: Database["public"]["Enums"]["product_status"]
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          upsell_description?: string | null
          upsell_enabled?: boolean
          upsell_name?: string | null
          upsell_price_cents?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          company: string | null
          complement: string | null
          created_at: string
          document: string | null
          fee_fixed_cents: number | null
          fee_variable_bps: number | null
          fee_withdrawal_cents: number | null
          full_name: string | null
          id: string
          kyc_address_proof_url: string | null
          kyc_notes: string | null
          kyc_reviewed_at: string | null
          kyc_rg_back_url: string | null
          kyc_rg_url: string | null
          kyc_selfie_url: string | null
          kyc_social_contract_url: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at: string | null
          legal_name: string | null
          neighborhood: string | null
          person_type: string | null
          phone: string | null
          ranking_name: string | null
          ranking_opt_in: boolean
          state: string | null
          street: string | null
          street_number: string | null
          trade_name: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          fee_fixed_cents?: number | null
          fee_variable_bps?: number | null
          fee_withdrawal_cents?: number | null
          full_name?: string | null
          id: string
          kyc_address_proof_url?: string | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_rg_back_url?: string | null
          kyc_rg_url?: string | null
          kyc_selfie_url?: string | null
          kyc_social_contract_url?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at?: string | null
          legal_name?: string | null
          neighborhood?: string | null
          person_type?: string | null
          phone?: string | null
          ranking_name?: string | null
          ranking_opt_in?: boolean
          state?: string | null
          street?: string | null
          street_number?: string | null
          trade_name?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          fee_fixed_cents?: number | null
          fee_variable_bps?: number | null
          fee_withdrawal_cents?: number | null
          full_name?: string | null
          id?: string
          kyc_address_proof_url?: string | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_rg_back_url?: string | null
          kyc_rg_url?: string | null
          kyc_selfie_url?: string | null
          kyc_social_contract_url?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at?: string | null
          legal_name?: string | null
          neighborhood?: string | null
          person_type?: string | null
          phone?: string | null
          ranking_name?: string | null
          ranking_opt_in?: boolean
          state?: string | null
          street?: string | null
          street_number?: string | null
          trade_name?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          acquirer_cost_cents: number
          amount_cents: number
          created_at: string
          currency: string
          customer_id: string | null
          customer_ip: string | null
          customer_name: string
          fbclid: string | null
          fee_fixed_cents: number
          fee_variable_cents: number
          gateway: string | null
          gateway_payment_id: string | null
          gclid: string | null
          id: string
          installments: number
          method: Database["public"]["Enums"]["sale_method"]
          net_cents: number
          owner_id: string
          product_id: string | null
          product_name: string
          sck: string | null
          shipping_city: string | null
          shipping_complement: string | null
          shipping_country: string | null
          shipping_neighborhood: string | null
          shipping_number: string | null
          shipping_state: string | null
          shipping_street: string | null
          shipping_zip: string | null
          src: string | null
          status: Database["public"]["Enums"]["sale_status"]
          ttclid: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          xcod: string | null
        }
        Insert: {
          acquirer_cost_cents?: number
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_ip?: string | null
          customer_name: string
          fbclid?: string | null
          fee_fixed_cents?: number
          fee_variable_cents?: number
          gateway?: string | null
          gateway_payment_id?: string | null
          gclid?: string | null
          id?: string
          installments?: number
          method?: Database["public"]["Enums"]["sale_method"]
          net_cents?: number
          owner_id: string
          product_id?: string | null
          product_name: string
          sck?: string | null
          shipping_city?: string | null
          shipping_complement?: string | null
          shipping_country?: string | null
          shipping_neighborhood?: string | null
          shipping_number?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          shipping_zip?: string | null
          src?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          ttclid?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          xcod?: string | null
        }
        Update: {
          acquirer_cost_cents?: number
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_ip?: string | null
          customer_name?: string
          fbclid?: string | null
          fee_fixed_cents?: number
          fee_variable_cents?: number
          gateway?: string | null
          gateway_payment_id?: string | null
          gclid?: string | null
          id?: string
          installments?: number
          method?: Database["public"]["Enums"]["sale_method"]
          net_cents?: number
          owner_id?: string
          product_id?: string | null
          product_name?: string
          sck?: string | null
          shipping_city?: string | null
          shipping_complement?: string | null
          shipping_country?: string | null
          shipping_neighborhood?: string | null
          shipping_number?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          shipping_zip?: string | null
          src?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          ttclid?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          xcod?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      split_recipients: {
        Row: {
          active: boolean
          created_at: string
          default_percent: number
          email: string | null
          id: string
          name: string
          owner_id: string
          pix_key: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_percent?: number
          email?: string | null
          id?: string
          name: string
          owner_id: string
          pix_key?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_percent?: number
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          pix_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      split_rules: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          percent: number
          product_id: string
          recipient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          percent: number
          product_id: string
          recipient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          percent?: number
          product_id?: string
          recipient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_rules_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "split_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number
          canceled_at: string | null
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          interval: string
          next_charge_at: string | null
          owner_id: string
          product_id: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          interval?: string
          next_charge_at?: string | null
          owner_id: string
          product_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          interval?: string
          next_charge_at?: string | null
          owner_id?: string
          product_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          owner_id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message: string
          owner_id: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          owner_id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_at: string
          member_user_id: string | null
          name: string | null
          owner_id: string
          role: Database["public"]["Enums"]["team_role"]
          status: Database["public"]["Enums"]["team_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          member_user_id?: string | null
          name?: string | null
          owner_id: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["team_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_at?: string
          member_user_id?: string | null
          name?: string | null
          owner_id?: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["team_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      utmify_credential_products: {
        Row: {
          created_at: string
          credential_id: string
          merchant_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          credential_id: string
          merchant_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string
          merchant_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utmify_credential_products_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "utmify_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utmify_credential_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      utmify_credentials: {
        Row: {
          api_token: string
          created_at: string
          id: string
          last_error: string | null
          last_sync_at: string | null
          merchant_id: string
          name: string | null
          sync_count: number
          updated_at: string
        }
        Insert: {
          api_token: string
          created_at?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          merchant_id: string
          name?: string | null
          sync_count?: number
          updated_at?: string
        }
        Update: {
          api_token?: string
          created_at?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          merchant_id?: string
          name?: string | null
          sync_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      utmify_integrations: {
        Row: {
          api_token: string | null
          created_at: string
          dashboard_id: string | null
          enabled: boolean
          id: string
          last_error: string | null
          last_sync_at: string | null
          merchant_id: string
          sync_count: number
          updated_at: string
        }
        Insert: {
          api_token?: string | null
          created_at?: string
          dashboard_id?: string | null
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          merchant_id: string
          sync_count?: number
          updated_at?: string
        }
        Update: {
          api_token?: string | null
          created_at?: string
          dashboard_id?: string | null
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          merchant_id?: string
          sync_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      utmify_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          event: string
          http_status: number | null
          id: string
          merchant_id: string
          request: Json | null
          response: Json | null
          sale_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          event: string
          http_status?: number | null
          id?: string
          merchant_id: string
          request?: Json | null
          response?: Json | null
          sale_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          event?: string
          http_status?: number | null
          id?: string
          merchant_id?: string
          request?: Json | null
          response?: Json | null
          sale_id?: string | null
          status?: string
        }
        Relationships: []
      }
      utmify_queue: {
        Row: {
          attempts: number
          created_at: string
          event: string
          id: string
          last_error: string | null
          merchant_id: string
          next_retry_at: string
          sale_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          event: string
          id?: string
          last_error?: string | null
          merchant_id: string
          next_retry_at?: string
          sale_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          event?: string
          id?: string
          last_error?: string | null
          merchant_id?: string
          next_retry_at?: string
          sale_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          last_delivery_at: string | null
          last_status_code: number | null
          owner_id: string
          secret: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          last_delivery_at?: string | null
          last_status_code?: number | null
          owner_id: string
          secret: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          last_delivery_at?: string | null
          last_status_code?: number | null
          owner_id?: string
          secret?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          fee_cents: number
          id: string
          method: string
          net_cents: number
          notes: string | null
          owner_id: string
          pix_key: string | null
          pix_key_type: string | null
          processed_at: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          fee_cents?: number
          id?: string
          method?: string
          net_cents?: number
          notes?: string | null
          owner_id: string
          pix_key?: string | null
          pix_key_type?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          fee_cents?: number
          id?: string
          method?: string
          net_cents?: number
          notes?: string | null
          owner_id?: string
          pix_key?: string | null
          pix_key_type?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_public_sale:
        | {
            Args: {
              p_customer_document: string
              p_customer_email: string
              p_customer_name: string
              p_customer_phone: string
              p_installments?: number
              p_method: Database["public"]["Enums"]["sale_method"]
              p_product_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_customer_document: string
              p_customer_email: string
              p_customer_name: string
              p_customer_phone: string
              p_include_bump?: boolean
              p_installments?: number
              p_method: Database["public"]["Enums"]["sale_method"]
              p_product_id: string
            }
            Returns: string
          }
      generate_checkout_code: { Args: { p_length?: number }; Returns: string }
      get_seller_ranking: {
        Args: { p_period?: string }
        Returns: {
          display_name: string
          owner_id: string
          sales_count: number
          total_cents: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      issue_api_key: {
        Args: { _env?: string; _name?: string; _owner: string }
        Returns: string
      }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "merchant" | "support" | "viewer"
      digital_delivery_type: "none" | "file" | "link"
      kyc_status: "pending" | "submitted" | "approved" | "rejected"
      product_kind: "digital" | "physical" | "saas"
      product_status: "active" | "draft" | "archived"
      product_type: "one_time" | "subscription"
      sale_method: "pix" | "card" | "boleto"
      sale_status: "paid" | "pending" | "refused" | "refunded" | "chargeback"
      team_role: "owner" | "admin" | "financeiro" | "suporte" | "leitor"
      team_status: "invited" | "active" | "inactive"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status: "open" | "pending" | "resolved" | "closed"
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
      app_role: ["admin", "merchant", "support", "viewer"],
      digital_delivery_type: ["none", "file", "link"],
      kyc_status: ["pending", "submitted", "approved", "rejected"],
      product_kind: ["digital", "physical", "saas"],
      product_status: ["active", "draft", "archived"],
      product_type: ["one_time", "subscription"],
      sale_method: ["pix", "card", "boleto"],
      sale_status: ["paid", "pending", "refused", "refunded", "chargeback"],
      team_role: ["owner", "admin", "financeiro", "suporte", "leitor"],
      team_status: ["invited", "active", "inactive"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "pending", "resolved", "closed"],
    },
  },
} as const

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_holder: {
        Row: {
          created_at: string
          data: Json
          deleted_at: string | null
          email: string | null
          external_id: string
          id: string
          metadata: Json | null
          provider_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          deleted_at?: string | null
          email?: string | null
          external_id: string
          id: string
          metadata?: Json | null
          provider_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          deleted_at?: string | null
          email?: string | null
          external_id?: string
          id?: string
          metadata?: Json | null
          provider_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      api_key: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          last_used_at: string | null
          redacted: string
          revoked_at: string | null
          revoked_by: string | null
          salt: string
          title: string
          token: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id: string
          last_used_at?: string | null
          redacted: string
          revoked_at?: string | null
          revoked_by?: string | null
          salt: string
          title: string
          token: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          last_used_at?: string | null
          redacted?: string
          revoked_at?: string | null
          revoked_by?: string | null
          salt?: string
          title?: string
          token?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      application_method_buy_rules: {
        Row: {
          application_method_id: string
          promotion_rule_id: string
        }
        Insert: {
          application_method_id: string
          promotion_rule_id: string
        }
        Update: {
          application_method_id?: string
          promotion_rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_method_buy_rules_application_method_id_foreign"
            columns: ["application_method_id"]
            isOneToOne: false
            referencedRelation: "promotion_application_method"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_method_buy_rules_promotion_rule_id_foreign"
            columns: ["promotion_rule_id"]
            isOneToOne: false
            referencedRelation: "promotion_rule"
            referencedColumns: ["id"]
          },
        ]
      }
      application_method_target_rules: {
        Row: {
          application_method_id: string
          promotion_rule_id: string
        }
        Insert: {
          application_method_id: string
          promotion_rule_id: string
        }
        Update: {
          application_method_id?: string
          promotion_rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_method_target_rules_application_method_id_foreign"
            columns: ["application_method_id"]
            isOneToOne: false
            referencedRelation: "promotion_application_method"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_method_target_rules_promotion_rule_id_foreign"
            columns: ["promotion_rule_id"]
            isOneToOne: false
            referencedRelation: "promotion_rule"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_identity: {
        Row: {
          app_metadata: Json | null
          created_at: string
          deleted_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          app_metadata?: Json | null
          created_at?: string
          deleted_at?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          app_metadata?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      capture: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          payment_id: string
          raw_amount: Json
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          payment_id: string
          raw_amount: Json
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string
          raw_amount?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capture_payment_id_foreign"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment"
            referencedColumns: ["id"]
          },
        ]
      }
      cart: {
        Row: {
          billing_address_id: string | null
          completed_at: string | null
          created_at: string
          currency_code: string
          customer_id: string | null
          deleted_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          region_id: string | null
          sales_channel_id: string | null
          shipping_address_id: string | null
          updated_at: string
        }
        Insert: {
          billing_address_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency_code: string
          customer_id?: string | null
          deleted_at?: string | null
          email?: string | null
          id: string
          metadata?: Json | null
          region_id?: string | null
          sales_channel_id?: string | null
          shipping_address_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_address_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency_code?: string
          customer_id?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          region_id?: string | null
          sales_channel_id?: string | null
          shipping_address_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_billing_address_id_foreign"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "cart_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_shipping_address_id_foreign"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "cart_address"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_address: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          company: string | null
          country_code: string | null
          created_at: string
          customer_id: string | null
          deleted_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_line_item: {
        Row: {
          cart_id: string
          compare_at_unit_price: number | null
          created_at: string
          deleted_at: string | null
          id: string
          is_custom_price: boolean
          is_discountable: boolean
          is_giftcard: boolean
          is_tax_inclusive: boolean
          metadata: Json | null
          product_collection: string | null
          product_description: string | null
          product_handle: string | null
          product_id: string | null
          product_subtitle: string | null
          product_title: string | null
          product_type: string | null
          product_type_id: string | null
          quantity: number
          raw_compare_at_unit_price: Json | null
          raw_unit_price: Json
          requires_shipping: boolean
          subtitle: string | null
          thumbnail: string | null
          title: string
          unit_price: number
          updated_at: string
          variant_barcode: string | null
          variant_id: string | null
          variant_option_values: Json | null
          variant_sku: string | null
          variant_title: string | null
        }
        Insert: {
          cart_id: string
          compare_at_unit_price?: number | null
          created_at?: string
          deleted_at?: string | null
          id: string
          is_custom_price?: boolean
          is_discountable?: boolean
          is_giftcard?: boolean
          is_tax_inclusive?: boolean
          metadata?: Json | null
          product_collection?: string | null
          product_description?: string | null
          product_handle?: string | null
          product_id?: string | null
          product_subtitle?: string | null
          product_title?: string | null
          product_type?: string | null
          product_type_id?: string | null
          quantity: number
          raw_compare_at_unit_price?: Json | null
          raw_unit_price: Json
          requires_shipping?: boolean
          subtitle?: string | null
          thumbnail?: string | null
          title: string
          unit_price: number
          updated_at?: string
          variant_barcode?: string | null
          variant_id?: string | null
          variant_option_values?: Json | null
          variant_sku?: string | null
          variant_title?: string | null
        }
        Update: {
          cart_id?: string
          compare_at_unit_price?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_custom_price?: boolean
          is_discountable?: boolean
          is_giftcard?: boolean
          is_tax_inclusive?: boolean
          metadata?: Json | null
          product_collection?: string | null
          product_description?: string | null
          product_handle?: string | null
          product_id?: string | null
          product_subtitle?: string | null
          product_title?: string | null
          product_type?: string | null
          product_type_id?: string | null
          quantity?: number
          raw_compare_at_unit_price?: Json | null
          raw_unit_price?: Json
          requires_shipping?: boolean
          subtitle?: string | null
          thumbnail?: string | null
          title?: string
          unit_price?: number
          updated_at?: string
          variant_barcode?: string | null
          variant_id?: string | null
          variant_option_values?: Json | null
          variant_sku?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_line_item_cart_id_foreign"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_line_item_adjustment: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_tax_inclusive: boolean
          item_id: string | null
          metadata: Json | null
          promotion_id: string | null
          provider_id: string | null
          raw_amount: Json
          updated_at: string
        }
        Insert: {
          amount: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          is_tax_inclusive?: boolean
          item_id?: string | null
          metadata?: Json | null
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount: Json
          updated_at?: string
        }
        Update: {
          amount?: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_tax_inclusive?: boolean
          item_id?: string | null
          metadata?: Json | null
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_line_item_adjustment_item_id_foreign"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cart_line_item"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_line_item_tax_line: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          item_id: string | null
          metadata: Json | null
          provider_id: string | null
          rate: number
          tax_rate_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          item_id?: string | null
          metadata?: Json | null
          provider_id?: string | null
          rate: number
          tax_rate_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          item_id?: string | null
          metadata?: Json | null
          provider_id?: string | null
          rate?: number
          tax_rate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_line_item_tax_line_item_id_foreign"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cart_line_item"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_payment_collection: {
        Row: {
          cart_id: string
          created_at: string
          deleted_at: string | null
          id: string
          payment_collection_id: string
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          payment_collection_id: string
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          payment_collection_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_promotion: {
        Row: {
          cart_id: string
          created_at: string
          deleted_at: string | null
          id: string
          promotion_id: string
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          promotion_id: string
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          promotion_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_shipping_method: {
        Row: {
          amount: number
          cart_id: string
          created_at: string
          data: Json | null
          deleted_at: string | null
          description: Json | null
          id: string
          is_tax_inclusive: boolean
          metadata: Json | null
          name: string
          raw_amount: Json
          shipping_option_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cart_id: string
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          description?: Json | null
          id: string
          is_tax_inclusive?: boolean
          metadata?: Json | null
          name: string
          raw_amount: Json
          shipping_option_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cart_id?: string
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          description?: Json | null
          id?: string
          is_tax_inclusive?: boolean
          metadata?: Json | null
          name?: string
          raw_amount?: Json
          shipping_option_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_shipping_method_cart_id_foreign"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_shipping_method_adjustment: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          promotion_id: string | null
          provider_id: string | null
          raw_amount: Json
          shipping_method_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          metadata?: Json | null
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount: Json
          shipping_method_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount?: Json
          shipping_method_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_shipping_method_adjustment_shipping_method_id_foreign"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "cart_shipping_method"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_shipping_method_tax_line: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          provider_id: string | null
          rate: number
          shipping_method_id: string | null
          tax_rate_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          metadata?: Json | null
          provider_id?: string | null
          rate: number
          shipping_method_id?: string | null
          tax_rate_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          rate?: number
          shipping_method_id?: string | null
          tax_rate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_shipping_method_tax_line_shipping_method_id_foreign"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "cart_shipping_method"
            referencedColumns: ["id"]
          },
        ]
      }
      config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          actioned_at: string | null
          actioned_by: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          actioned_at?: string | null
          actioned_by?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          actioned_at?: string | null
          actioned_by?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_line: {
        Row: {
          amount: number
          cart_id: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          raw_amount: Json
          reference: string | null
          reference_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cart_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          raw_amount: Json
          reference?: string | null
          reference_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cart_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          raw_amount?: Json
          reference?: string | null
          reference_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_line_cart_id_foreign"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
        ]
      }
      currency: {
        Row: {
          code: string
          created_at: string
          decimal_digits: number
          deleted_at: string | null
          name: string
          raw_rounding: Json
          rounding: number
          symbol: string
          symbol_native: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimal_digits?: number
          deleted_at?: string | null
          name: string
          raw_rounding: Json
          rounding?: number
          symbol: string
          symbol_native: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimal_digits?: number
          deleted_at?: string | null
          name?: string
          raw_rounding?: Json
          rounding?: number
          symbol?: string
          symbol_native?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer: {
        Row: {
          company_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          first_name: string | null
          has_account: boolean
          id: string
          last_name: string | null
          metadata: Json | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          has_account?: boolean
          id: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          has_account?: boolean
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_account_holder: {
        Row: {
          account_holder_id: string
          created_at: string
          customer_id: string
          deleted_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          account_holder_id: string
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          account_holder_id?: string
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_address: {
        Row: {
          address_1: string | null
          address_2: string | null
          address_name: string | null
          city: string | null
          company: string | null
          country_code: string | null
          created_at: string
          customer_id: string
          deleted_at: string | null
          first_name: string | null
          id: string
          is_default_billing: boolean
          is_default_shipping: boolean
          last_name: string | null
          metadata: Json | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          address_name?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          first_name?: string | null
          id: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          address_name?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          first_name?: string | null
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_address_customer_id_foreign"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_group: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_group_customer: {
        Row: {
          created_at: string
          created_by: string | null
          customer_group_id: string
          customer_id: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_group_id: string
          customer_id: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_group_id?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_group_customer_customer_group_id_foreign"
            columns: ["customer_group_id"]
            isOneToOne: false
            referencedRelation: "customer_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_group_customer_customer_id_foreign"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_pricing_plans: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          is_active: boolean
          pricing_plan_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          pricing_plan_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          pricing_plan_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_pricing_plans_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_products: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_applications: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          contact_person: string
          created_at: string
          email: string
          farm_address: string
          farm_bio: string | null
          farm_coordinates: Json | null
          farm_location: Json | null
          farm_name: string
          id: string
          phone: string
          products: string[] | null
          user_id: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          contact_person: string
          created_at?: string
          email: string
          farm_address: string
          farm_bio?: string | null
          farm_coordinates?: Json | null
          farm_location?: Json | null
          farm_name: string
          id?: string
          phone: string
          products?: string[] | null
          user_id: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          farm_address?: string
          farm_bio?: string | null
          farm_coordinates?: Json | null
          farm_location?: Json | null
          farm_name?: string
          id?: string
          phone?: string
          products?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmer_applications_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          address: string
          bio: string | null
          contact_person: string
          created_at: string
          email: string
          farmer_id: string
          id: string
          location: Json | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          bio?: string | null
          contact_person: string
          created_at?: string
          email: string
          farmer_id: string
          id?: string
          location?: Json | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          bio?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          farmer_id?: string
          id?: string
          location?: Json | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fulfillment: {
        Row: {
          canceled_at: string | null
          created_at: string
          created_by: string | null
          data: Json | null
          deleted_at: string | null
          delivered_at: string | null
          delivery_address_id: string | null
          id: string
          location_id: string
          marked_shipped_by: string | null
          metadata: Json | null
          packed_at: string | null
          provider_id: string | null
          requires_shipping: boolean
          shipped_at: string | null
          shipping_option_id: string | null
          updated_at: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json | null
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_address_id?: string | null
          id: string
          location_id: string
          marked_shipped_by?: string | null
          metadata?: Json | null
          packed_at?: string | null
          provider_id?: string | null
          requires_shipping?: boolean
          shipped_at?: string | null
          shipping_option_id?: string | null
          updated_at?: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json | null
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_address_id?: string | null
          id?: string
          location_id?: string
          marked_shipped_by?: string | null
          metadata?: Json | null
          packed_at?: string | null
          provider_id?: string | null
          requires_shipping?: boolean
          shipped_at?: string | null
          shipping_option_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_delivery_address_id_foreign"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "fulfillment_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fulfillment_provider_id_foreign"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "fulfillment_provider"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fulfillment_shipping_option_id_foreign"
            columns: ["shipping_option_id"]
            isOneToOne: false
            referencedRelation: "shipping_option"
            referencedColumns: ["id"]
          },
        ]
      }
      fulfillment_address: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          company: string | null
          country_code: string | null
          created_at: string
          deleted_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fulfillment_item: {
        Row: {
          barcode: string
          created_at: string
          deleted_at: string | null
          fulfillment_id: string
          id: string
          inventory_item_id: string | null
          line_item_id: string | null
          quantity: number
          raw_quantity: Json
          sku: string
          title: string
          updated_at: string
        }
        Insert: {
          barcode: string
          created_at?: string
          deleted_at?: string | null
          fulfillment_id: string
          id: string
          inventory_item_id?: string | null
          line_item_id?: string | null
          quantity: number
          raw_quantity: Json
          sku: string
          title: string
          updated_at?: string
        }
        Update: {
          barcode?: string
          created_at?: string
          deleted_at?: string | null
          fulfillment_id?: string
          id?: string
          inventory_item_id?: string | null
          line_item_id?: string | null
          quantity?: number
          raw_quantity?: Json
          sku?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_item_fulfillment_id_foreign"
            columns: ["fulfillment_id"]
            isOneToOne: false
            referencedRelation: "fulfillment"
            referencedColumns: ["id"]
          },
        ]
      }
      fulfillment_label: {
        Row: {
          created_at: string
          deleted_at: string | null
          fulfillment_id: string
          id: string
          label_url: string
          tracking_number: string
          tracking_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_id: string
          id: string
          label_url: string
          tracking_number: string
          tracking_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_id?: string
          id?: string
          label_url?: string
          tracking_number?: string
          tracking_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_label_fulfillment_id_foreign"
            columns: ["fulfillment_id"]
            isOneToOne: false
            referencedRelation: "fulfillment"
            referencedColumns: ["id"]
          },
        ]
      }
      fulfillment_provider: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      fulfillment_set: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      geo_zone: {
        Row: {
          city: string | null
          country_code: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          postal_expression: Json | null
          province_code: string | null
          service_zone_id: string
          type: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          country_code: string
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          postal_expression?: Json | null
          province_code?: string | null
          service_zone_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          country_code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          postal_expression?: Json | null
          province_code?: string | null
          service_zone_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_zone_service_zone_id_foreign"
            columns: ["service_zone_id"]
            isOneToOne: false
            referencedRelation: "service_zone"
            referencedColumns: ["id"]
          },
        ]
      }
      image: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          product_id: string
          rank: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          product_id: string
          rank?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          rank?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_item: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          height: number | null
          hs_code: string | null
          id: string
          length: number | null
          material: string | null
          metadata: Json | null
          mid_code: string | null
          origin_country: string | null
          requires_shipping: boolean
          sku: string | null
          thumbnail: string | null
          title: string | null
          updated_at: string
          weight: number | null
          width: number | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          height?: number | null
          hs_code?: string | null
          id: string
          length?: number | null
          material?: string | null
          metadata?: Json | null
          mid_code?: string | null
          origin_country?: string | null
          requires_shipping?: boolean
          sku?: string | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string
          weight?: number | null
          width?: number | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          height?: number | null
          hs_code?: string | null
          id?: string
          length?: number | null
          material?: string | null
          metadata?: Json | null
          mid_code?: string | null
          origin_country?: string | null
          requires_shipping?: boolean
          sku?: string | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string
          weight?: number | null
          width?: number | null
        }
        Relationships: []
      }
      inventory_level: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          incoming_quantity: number
          inventory_item_id: string
          location_id: string
          metadata: Json | null
          raw_incoming_quantity: Json | null
          raw_reserved_quantity: Json | null
          raw_stocked_quantity: Json | null
          reserved_quantity: number
          stocked_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          incoming_quantity?: number
          inventory_item_id: string
          location_id: string
          metadata?: Json | null
          raw_incoming_quantity?: Json | null
          raw_reserved_quantity?: Json | null
          raw_stocked_quantity?: Json | null
          reserved_quantity?: number
          stocked_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          incoming_quantity?: number
          inventory_item_id?: string
          location_id?: string
          metadata?: Json | null
          raw_incoming_quantity?: Json | null
          raw_reserved_quantity?: Json | null
          raw_stocked_quantity?: Json | null
          reserved_quantity?: number
          stocked_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_level_inventory_item_id_foreign"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_item"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_tracking: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          last_updated_by: string | null
          location: string | null
          low_stock_threshold: number | null
          notes: string | null
          quantity_available: number
          quantity_reserved: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          last_updated_by?: string | null
          location?: string | null
          low_stock_threshold?: number | null
          notes?: string | null
          quantity_available?: number
          quantity_reserved?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          last_updated_by?: string | null
          location?: string | null
          low_stock_threshold?: number | null
          notes?: string | null
          quantity_available?: number
          quantity_reserved?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_tracking_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tracking_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      invite: {
        Row: {
          accepted: boolean
          created_at: string
          deleted_at: string | null
          email: string
          expires_at: string
          id: string
          metadata: Json | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted?: boolean
          created_at?: string
          deleted_at?: string | null
          email: string
          expires_at: string
          id: string
          metadata?: Json | null
          token: string
          updated_at?: string
        }
        Update: {
          accepted?: boolean
          created_at?: string
          deleted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      link_module_migrations: {
        Row: {
          created_at: string | null
          id: number
          link_descriptor: Json
          table_name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          link_descriptor?: Json
          table_name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          link_descriptor?: Json
          table_name?: string
        }
        Relationships: []
      }
      location_fulfillment_provider: {
        Row: {
          created_at: string
          deleted_at: string | null
          fulfillment_provider_id: string
          id: string
          stock_location_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_provider_id: string
          id: string
          stock_location_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_provider_id?: string
          id?: string
          stock_location_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_fulfillment_set: {
        Row: {
          created_at: string
          deleted_at: string | null
          fulfillment_set_id: string
          id: string
          stock_location_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_set_id: string
          id: string
          stock_location_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_set_id?: string
          id?: string
          stock_location_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mikro_orm_migrations: {
        Row: {
          executed_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          executed_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          executed_at?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      notification: {
        Row: {
          channel: string
          created_at: string
          data: Json | null
          deleted_at: string | null
          external_id: string | null
          id: string
          idempotency_key: string | null
          original_notification_id: string | null
          provider_id: string | null
          receiver_id: string | null
          resource_id: string | null
          resource_type: string | null
          status: string
          template: string
          to: string
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          external_id?: string | null
          id: string
          idempotency_key?: string | null
          original_notification_id?: string | null
          provider_id?: string | null
          receiver_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          template: string
          to: string
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          idempotency_key?: string | null
          original_notification_id?: string | null
          provider_id?: string | null
          receiver_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          template?: string
          to?: string
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_provider_id_foreign"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "notification_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_provider: {
        Row: {
          channels: string[]
          created_at: string
          deleted_at: string | null
          handle: string
          id: string
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          deleted_at?: string | null
          handle: string
          id: string
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          deleted_at?: string | null
          handle?: string
          id?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order: {
        Row: {
          billing_address_id: string | null
          canceled_at: string | null
          created_at: string
          currency_code: string
          customer_id: string | null
          deleted_at: string | null
          display_id: number | null
          email: string | null
          id: string
          is_draft_order: boolean
          metadata: Json | null
          no_notification: boolean | null
          region_id: string | null
          sales_channel_id: string | null
          shipping_address_id: string | null
          status: Database["public"]["Enums"]["order_status_enum"]
          updated_at: string
          version: number
        }
        Insert: {
          billing_address_id?: string | null
          canceled_at?: string | null
          created_at?: string
          currency_code: string
          customer_id?: string | null
          deleted_at?: string | null
          display_id?: number | null
          email?: string | null
          id: string
          is_draft_order?: boolean
          metadata?: Json | null
          no_notification?: boolean | null
          region_id?: string | null
          sales_channel_id?: string | null
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status_enum"]
          updated_at?: string
          version?: number
        }
        Update: {
          billing_address_id?: string | null
          canceled_at?: string | null
          created_at?: string
          currency_code?: string
          customer_id?: string | null
          deleted_at?: string | null
          display_id?: number | null
          email?: string | null
          id?: string
          is_draft_order?: boolean
          metadata?: Json | null
          no_notification?: boolean | null
          region_id?: string | null
          sales_channel_id?: string | null
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status_enum"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_billing_address_id_foreign"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "order_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_shipping_address_id_foreign"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "order_address"
            referencedColumns: ["id"]
          },
        ]
      }
      order_address: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          company: string | null
          country_code: string | null
          created_at: string
          customer_id: string | null
          deleted_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          customer_id?: string | null
          deleted_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_cart: {
        Row: {
          cart_id: string
          created_at: string
          deleted_at: string | null
          id: string
          order_id: string
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          order_id: string
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_change: {
        Row: {
          canceled_at: string | null
          canceled_by: string | null
          change_type: string | null
          claim_id: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          declined_at: string | null
          declined_by: string | null
          declined_reason: string | null
          deleted_at: string | null
          description: string | null
          exchange_id: string | null
          id: string
          internal_note: string | null
          metadata: Json | null
          order_id: string
          requested_at: string | null
          requested_by: string | null
          return_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          canceled_at?: string | null
          canceled_by?: string | null
          change_type?: string | null
          claim_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          declined_at?: string | null
          declined_by?: string | null
          declined_reason?: string | null
          deleted_at?: string | null
          description?: string | null
          exchange_id?: string | null
          id: string
          internal_note?: string | null
          metadata?: Json | null
          order_id: string
          requested_at?: string | null
          requested_by?: string | null
          return_id?: string | null
          status?: string
          updated_at?: string
          version: number
        }
        Update: {
          canceled_at?: string | null
          canceled_by?: string | null
          change_type?: string | null
          claim_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          declined_at?: string | null
          declined_by?: string | null
          declined_reason?: string | null
          deleted_at?: string | null
          description?: string | null
          exchange_id?: string | null
          id?: string
          internal_note?: string | null
          metadata?: Json | null
          order_id?: string
          requested_at?: string | null
          requested_by?: string | null
          return_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_change_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      order_change_action: {
        Row: {
          action: string
          amount: number | null
          applied: boolean
          claim_id: string | null
          created_at: string
          deleted_at: string | null
          details: Json | null
          exchange_id: string | null
          id: string
          internal_note: string | null
          order_change_id: string | null
          order_id: string | null
          ordering: number
          raw_amount: Json | null
          reference: string | null
          reference_id: string | null
          return_id: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          action: string
          amount?: number | null
          applied?: boolean
          claim_id?: string | null
          created_at?: string
          deleted_at?: string | null
          details?: Json | null
          exchange_id?: string | null
          id: string
          internal_note?: string | null
          order_change_id?: string | null
          order_id?: string | null
          ordering?: number
          raw_amount?: Json | null
          reference?: string | null
          reference_id?: string | null
          return_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          action?: string
          amount?: number | null
          applied?: boolean
          claim_id?: string | null
          created_at?: string
          deleted_at?: string | null
          details?: Json | null
          exchange_id?: string | null
          id?: string
          internal_note?: string | null
          order_change_id?: string | null
          order_id?: string | null
          ordering?: number
          raw_amount?: Json | null
          reference?: string | null
          reference_id?: string | null
          return_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_change_action_order_change_id_foreign"
            columns: ["order_change_id"]
            isOneToOne: false
            referencedRelation: "order_change"
            referencedColumns: ["id"]
          },
        ]
      }
      order_claim: {
        Row: {
          canceled_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          display_id: number
          id: string
          metadata: Json | null
          no_notification: boolean | null
          order_id: string
          order_version: number
          raw_refund_amount: Json | null
          refund_amount: number | null
          return_id: string | null
          type: Database["public"]["Enums"]["order_claim_type_enum"]
          updated_at: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_id?: number
          id: string
          metadata?: Json | null
          no_notification?: boolean | null
          order_id: string
          order_version: number
          raw_refund_amount?: Json | null
          refund_amount?: number | null
          return_id?: string | null
          type: Database["public"]["Enums"]["order_claim_type_enum"]
          updated_at?: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_id?: number
          id?: string
          metadata?: Json | null
          no_notification?: boolean | null
          order_id?: string
          order_version?: number
          raw_refund_amount?: Json | null
          refund_amount?: number | null
          return_id?: string | null
          type?: Database["public"]["Enums"]["order_claim_type_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      order_claim_item: {
        Row: {
          claim_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_additional_item: boolean
          item_id: string
          metadata: Json | null
          note: string | null
          quantity: number
          raw_quantity: Json
          reason: Database["public"]["Enums"]["claim_reason_enum"] | null
          updated_at: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          is_additional_item?: boolean
          item_id: string
          metadata?: Json | null
          note?: string | null
          quantity: number
          raw_quantity: Json
          reason?: Database["public"]["Enums"]["claim_reason_enum"] | null
          updated_at?: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_additional_item?: boolean
          item_id?: string
          metadata?: Json | null
          note?: string | null
          quantity?: number
          raw_quantity?: Json
          reason?: Database["public"]["Enums"]["claim_reason_enum"] | null
          updated_at?: string
        }
        Relationships: []
      }
      order_claim_item_image: {
        Row: {
          claim_item_id: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          updated_at: string
          url: string
        }
        Insert: {
          claim_item_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          updated_at?: string
          url: string
        }
        Update: {
          claim_item_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      order_credit_line: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          order_id: string
          raw_amount: Json
          reference: string | null
          reference_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          order_id: string
          raw_amount: Json
          reference?: string | null
          reference_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          raw_amount?: Json
          reference?: string | null
          reference_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_credit_line_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      order_exchange: {
        Row: {
          allow_backorder: boolean
          canceled_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          difference_due: number | null
          display_id: number
          id: string
          metadata: Json | null
          no_notification: boolean | null
          order_id: string
          order_version: number
          raw_difference_due: Json | null
          return_id: string | null
          updated_at: string
        }
        Insert: {
          allow_backorder?: boolean
          canceled_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difference_due?: number | null
          display_id?: number
          id: string
          metadata?: Json | null
          no_notification?: boolean | null
          order_id: string
          order_version: number
          raw_difference_due?: Json | null
          return_id?: string | null
          updated_at?: string
        }
        Update: {
          allow_backorder?: boolean
          canceled_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difference_due?: number | null
          display_id?: number
          id?: string
          metadata?: Json | null
          no_notification?: boolean | null
          order_id?: string
          order_version?: number
          raw_difference_due?: Json | null
          return_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_exchange_item: {
        Row: {
          created_at: string
          deleted_at: string | null
          exchange_id: string
          id: string
          item_id: string
          metadata: Json | null
          note: string | null
          quantity: number
          raw_quantity: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          exchange_id: string
          id: string
          item_id: string
          metadata?: Json | null
          note?: string | null
          quantity: number
          raw_quantity: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          exchange_id?: string
          id?: string
          item_id?: string
          metadata?: Json | null
          note?: string | null
          quantity?: number
          raw_quantity?: Json
          updated_at?: string
        }
        Relationships: []
      }
      order_fulfillment: {
        Row: {
          created_at: string
          deleted_at: string | null
          fulfillment_id: string
          id: string
          order_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_id: string
          id: string
          order_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_id?: string
          id?: string
          order_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_item: {
        Row: {
          compare_at_unit_price: number | null
          created_at: string
          deleted_at: string | null
          delivered_quantity: number
          fulfilled_quantity: number
          id: string
          item_id: string
          metadata: Json | null
          order_id: string
          quantity: number
          raw_compare_at_unit_price: Json | null
          raw_delivered_quantity: Json
          raw_fulfilled_quantity: Json
          raw_quantity: Json
          raw_return_dismissed_quantity: Json
          raw_return_received_quantity: Json
          raw_return_requested_quantity: Json
          raw_shipped_quantity: Json
          raw_unit_price: Json | null
          raw_written_off_quantity: Json
          return_dismissed_quantity: number
          return_received_quantity: number
          return_requested_quantity: number
          shipped_quantity: number
          unit_price: number | null
          updated_at: string
          version: number
          written_off_quantity: number
        }
        Insert: {
          compare_at_unit_price?: number | null
          created_at?: string
          deleted_at?: string | null
          delivered_quantity?: number
          fulfilled_quantity: number
          id: string
          item_id: string
          metadata?: Json | null
          order_id: string
          quantity: number
          raw_compare_at_unit_price?: Json | null
          raw_delivered_quantity: Json
          raw_fulfilled_quantity: Json
          raw_quantity: Json
          raw_return_dismissed_quantity: Json
          raw_return_received_quantity: Json
          raw_return_requested_quantity: Json
          raw_shipped_quantity: Json
          raw_unit_price?: Json | null
          raw_written_off_quantity: Json
          return_dismissed_quantity: number
          return_received_quantity: number
          return_requested_quantity: number
          shipped_quantity: number
          unit_price?: number | null
          updated_at?: string
          version: number
          written_off_quantity: number
        }
        Update: {
          compare_at_unit_price?: number | null
          created_at?: string
          deleted_at?: string | null
          delivered_quantity?: number
          fulfilled_quantity?: number
          id?: string
          item_id?: string
          metadata?: Json | null
          order_id?: string
          quantity?: number
          raw_compare_at_unit_price?: Json | null
          raw_delivered_quantity?: Json
          raw_fulfilled_quantity?: Json
          raw_quantity?: Json
          raw_return_dismissed_quantity?: Json
          raw_return_received_quantity?: Json
          raw_return_requested_quantity?: Json
          raw_shipped_quantity?: Json
          raw_unit_price?: Json | null
          raw_written_off_quantity?: Json
          return_dismissed_quantity?: number
          return_received_quantity?: number
          return_requested_quantity?: number
          shipped_quantity?: number
          unit_price?: number | null
          updated_at?: string
          version?: number
          written_off_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_item_id_foreign"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "order_line_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_item: {
        Row: {
          compare_at_unit_price: number | null
          created_at: string
          deleted_at: string | null
          id: string
          is_custom_price: boolean
          is_discountable: boolean
          is_giftcard: boolean
          is_tax_inclusive: boolean
          metadata: Json | null
          product_collection: string | null
          product_description: string | null
          product_handle: string | null
          product_id: string | null
          product_subtitle: string | null
          product_title: string | null
          product_type: string | null
          product_type_id: string | null
          raw_compare_at_unit_price: Json | null
          raw_unit_price: Json
          requires_shipping: boolean
          subtitle: string | null
          thumbnail: string | null
          title: string
          totals_id: string | null
          unit_price: number
          updated_at: string
          variant_barcode: string | null
          variant_id: string | null
          variant_option_values: Json | null
          variant_sku: string | null
          variant_title: string | null
        }
        Insert: {
          compare_at_unit_price?: number | null
          created_at?: string
          deleted_at?: string | null
          id: string
          is_custom_price?: boolean
          is_discountable?: boolean
          is_giftcard?: boolean
          is_tax_inclusive?: boolean
          metadata?: Json | null
          product_collection?: string | null
          product_description?: string | null
          product_handle?: string | null
          product_id?: string | null
          product_subtitle?: string | null
          product_title?: string | null
          product_type?: string | null
          product_type_id?: string | null
          raw_compare_at_unit_price?: Json | null
          raw_unit_price: Json
          requires_shipping?: boolean
          subtitle?: string | null
          thumbnail?: string | null
          title: string
          totals_id?: string | null
          unit_price: number
          updated_at?: string
          variant_barcode?: string | null
          variant_id?: string | null
          variant_option_values?: Json | null
          variant_sku?: string | null
          variant_title?: string | null
        }
        Update: {
          compare_at_unit_price?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_custom_price?: boolean
          is_discountable?: boolean
          is_giftcard?: boolean
          is_tax_inclusive?: boolean
          metadata?: Json | null
          product_collection?: string | null
          product_description?: string | null
          product_handle?: string | null
          product_id?: string | null
          product_subtitle?: string | null
          product_title?: string | null
          product_type?: string | null
          product_type_id?: string | null
          raw_compare_at_unit_price?: Json | null
          raw_unit_price?: Json
          requires_shipping?: boolean
          subtitle?: string | null
          thumbnail?: string | null
          title?: string
          totals_id?: string | null
          unit_price?: number
          updated_at?: string
          variant_barcode?: string | null
          variant_id?: string | null
          variant_option_values?: Json | null
          variant_sku?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_line_item_totals_id_foreign"
            columns: ["totals_id"]
            isOneToOne: false
            referencedRelation: "order_item"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_item_adjustment: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_tax_inclusive: boolean
          item_id: string
          promotion_id: string | null
          provider_id: string | null
          raw_amount: Json
          updated_at: string
        }
        Insert: {
          amount: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          is_tax_inclusive?: boolean
          item_id: string
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount: Json
          updated_at?: string
        }
        Update: {
          amount?: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_tax_inclusive?: boolean
          item_id?: string
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_line_item_adjustment_item_id_foreign"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "order_line_item"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_item_tax_line: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          item_id: string
          provider_id: string | null
          rate: number
          raw_rate: Json
          tax_rate_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          item_id: string
          provider_id?: string | null
          rate: number
          raw_rate: Json
          tax_rate_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          item_id?: string
          provider_id?: string | null
          rate?: number
          raw_rate?: Json
          tax_rate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_line_item_tax_line_item_id_foreign"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "order_line_item"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payment_collection: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          order_id: string
          payment_collection_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          order_id: string
          payment_collection_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_id?: string
          payment_collection_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_promotion: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          order_id: string
          promotion_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          order_id: string
          promotion_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_id?: string
          promotion_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_shipping: {
        Row: {
          claim_id: string | null
          created_at: string
          deleted_at: string | null
          exchange_id: string | null
          id: string
          order_id: string
          return_id: string | null
          shipping_method_id: string
          updated_at: string
          version: number
        }
        Insert: {
          claim_id?: string | null
          created_at?: string
          deleted_at?: string | null
          exchange_id?: string | null
          id: string
          order_id: string
          return_id?: string | null
          shipping_method_id: string
          updated_at?: string
          version: number
        }
        Update: {
          claim_id?: string | null
          created_at?: string
          deleted_at?: string | null
          exchange_id?: string | null
          id?: string
          order_id?: string
          return_id?: string | null
          shipping_method_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_shipping_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      order_shipping_method: {
        Row: {
          amount: number
          created_at: string
          data: Json | null
          deleted_at: string | null
          description: Json | null
          id: string
          is_custom_amount: boolean
          is_tax_inclusive: boolean
          metadata: Json | null
          name: string
          raw_amount: Json
          shipping_option_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          description?: Json | null
          id: string
          is_custom_amount?: boolean
          is_tax_inclusive?: boolean
          metadata?: Json | null
          name: string
          raw_amount: Json
          shipping_option_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          description?: Json | null
          id?: string
          is_custom_amount?: boolean
          is_tax_inclusive?: boolean
          metadata?: Json | null
          name?: string
          raw_amount?: Json
          shipping_option_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_shipping_method_adjustment: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          promotion_id: string | null
          provider_id: string | null
          raw_amount: Json
          shipping_method_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount: Json
          shipping_method_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          promotion_id?: string | null
          provider_id?: string | null
          raw_amount?: Json
          shipping_method_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipping_method_adjustment_shipping_method_id_foreign"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "order_shipping_method"
            referencedColumns: ["id"]
          },
        ]
      }
      order_shipping_method_tax_line: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          provider_id: string | null
          rate: number
          raw_rate: Json
          shipping_method_id: string
          tax_rate_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          provider_id?: string | null
          rate: number
          raw_rate: Json
          shipping_method_id: string
          tax_rate_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          provider_id?: string | null
          rate?: number
          raw_rate?: Json
          shipping_method_id?: string
          tax_rate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipping_method_tax_line_shipping_method_id_foreign"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "order_shipping_method"
            referencedColumns: ["id"]
          },
        ]
      }
      order_summary: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          order_id: string
          totals: Json | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          order_id: string
          totals?: Json | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_id?: string
          totals?: Json | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_summary_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      order_transaction: {
        Row: {
          amount: number
          claim_id: string | null
          created_at: string
          currency_code: string
          deleted_at: string | null
          exchange_id: string | null
          id: string
          order_id: string
          raw_amount: Json
          reference: string | null
          reference_id: string | null
          return_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          amount: number
          claim_id?: string | null
          created_at?: string
          currency_code: string
          deleted_at?: string | null
          exchange_id?: string | null
          id: string
          order_id: string
          raw_amount: Json
          reference?: string | null
          reference_id?: string | null
          return_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          amount?: number
          claim_id?: string | null
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          exchange_id?: string | null
          id?: string
          order_id?: string
          raw_amount?: Json
          reference?: string | null
          reference_id?: string | null
          return_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_transaction_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number
          canceled_at: string | null
          captured_at: string | null
          created_at: string
          currency_code: string
          data: Json | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          payment_collection_id: string
          payment_session_id: string
          provider_id: string
          raw_amount: Json
          updated_at: string
        }
        Insert: {
          amount: number
          canceled_at?: string | null
          captured_at?: string | null
          created_at?: string
          currency_code: string
          data?: Json | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          payment_collection_id: string
          payment_session_id: string
          provider_id: string
          raw_amount: Json
          updated_at?: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          captured_at?: string | null
          created_at?: string
          currency_code?: string
          data?: Json | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          payment_collection_id?: string
          payment_session_id?: string
          provider_id?: string
          raw_amount?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_payment_collection_id_foreign"
            columns: ["payment_collection_id"]
            isOneToOne: false
            referencedRelation: "payment_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_collection: {
        Row: {
          amount: number
          authorized_amount: number | null
          captured_amount: number | null
          completed_at: string | null
          created_at: string
          currency_code: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          raw_amount: Json
          raw_authorized_amount: Json | null
          raw_captured_amount: Json | null
          raw_refunded_amount: Json | null
          refunded_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          authorized_amount?: number | null
          captured_amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency_code: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          raw_amount: Json
          raw_authorized_amount?: Json | null
          raw_captured_amount?: Json | null
          raw_refunded_amount?: Json | null
          refunded_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          authorized_amount?: number | null
          captured_amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          raw_amount?: Json
          raw_authorized_amount?: Json | null
          raw_captured_amount?: Json | null
          raw_refunded_amount?: Json | null
          refunded_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_collection_payment_providers: {
        Row: {
          payment_collection_id: string
          payment_provider_id: string
        }
        Insert: {
          payment_collection_id: string
          payment_provider_id: string
        }
        Update: {
          payment_collection_id?: string
          payment_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_collection_payment_providers_payment_col_aa276_foreign"
            columns: ["payment_collection_id"]
            isOneToOne: false
            referencedRelation: "payment_collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_collection_payment_providers_payment_pro_2d555_foreign"
            columns: ["payment_provider_id"]
            isOneToOne: false
            referencedRelation: "payment_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_provider: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      payment_session: {
        Row: {
          amount: number
          authorized_at: string | null
          context: Json | null
          created_at: string
          currency_code: string
          data: Json
          deleted_at: string | null
          id: string
          metadata: Json | null
          payment_collection_id: string
          provider_id: string
          raw_amount: Json
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          authorized_at?: string | null
          context?: Json | null
          created_at?: string
          currency_code: string
          data?: Json
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          payment_collection_id: string
          provider_id: string
          raw_amount: Json
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          authorized_at?: string | null
          context?: Json | null
          created_at?: string
          currency_code?: string
          data?: Json
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          payment_collection_id?: string
          provider_id?: string
          raw_amount?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_session_payment_collection_id_foreign"
            columns: ["payment_collection_id"]
            isOneToOne: false
            referencedRelation: "payment_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      price: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          deleted_at: string | null
          id: string
          max_quantity: number | null
          min_quantity: number | null
          price_list_id: string | null
          price_set_id: string
          raw_amount: Json
          rules_count: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code: string
          deleted_at?: string | null
          id: string
          max_quantity?: number | null
          min_quantity?: number | null
          price_list_id?: string | null
          price_set_id: string
          raw_amount: Json
          rules_count?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          id?: string
          max_quantity?: number | null
          min_quantity?: number | null
          price_list_id?: string | null
          price_set_id?: string
          raw_amount?: Json
          rules_count?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_price_list_id_foreign"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_price_set_id_foreign"
            columns: ["price_set_id"]
            isOneToOne: false
            referencedRelation: "price_set"
            referencedColumns: ["id"]
          },
        ]
      }
      price_list: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          ends_at: string | null
          id: string
          rules_count: number | null
          starts_at: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          ends_at?: string | null
          id: string
          rules_count?: number | null
          starts_at?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          ends_at?: string | null
          id?: string
          rules_count?: number | null
          starts_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_list_rule: {
        Row: {
          attribute: string
          created_at: string
          deleted_at: string | null
          id: string
          price_list_id: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          id: string
          price_list_id: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          price_list_id?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "price_list_rule_price_list_id_foreign"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_list"
            referencedColumns: ["id"]
          },
        ]
      }
      price_preference: {
        Row: {
          attribute: string
          created_at: string
          deleted_at: string | null
          id: string
          is_tax_inclusive: boolean
          updated_at: string
          value: string | null
        }
        Insert: {
          attribute: string
          created_at?: string
          deleted_at?: string | null
          id: string
          is_tax_inclusive?: boolean
          updated_at?: string
          value?: string | null
        }
        Update: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_tax_inclusive?: boolean
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      price_rule: {
        Row: {
          attribute: string
          created_at: string
          deleted_at: string | null
          id: string
          operator: string
          price_id: string
          priority: number
          updated_at: string
          value: string
        }
        Insert: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          id: string
          operator?: string
          price_id: string
          priority?: number
          updated_at?: string
          value: string
        }
        Update: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          operator?: string
          price_id?: string
          priority?: number
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_rule_price_id_foreign"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "price"
            referencedColumns: ["id"]
          },
        ]
      }
      price_set: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          access_to_advanced_branding_options: boolean
          access_to_bulk_promotional_tools: boolean
          access_to_white_label_option: boolean
          allowed_to_business_in_multiple_location: boolean
          allowed_to_customizable_loyalty_programs: boolean
          allowed_to_get_marketing_campaign_credits: boolean
          allowed_to_run_event_management_and_ticketing: boolean
          billing_cycle: string
          can_accept_pre_order: boolean
          can_access_customer_contact_list: boolean
          can_access_to_advanced_analytics: boolean
          can_create_branded_stall_page: boolean
          can_create_custom_coupon: boolean
          can_create_multiple_stand: boolean
          can_eligible_for_priority_map_placement: boolean
          can_have_dedicated_account_manager: boolean
          can_receive_loyalty_rewards: boolean
          can_run_custom_promosion: boolean
          can_sale_wholesale_and_bulk: boolean
          can_see_sales_reports: boolean
          can_shopper_subscription: boolean
          created_at: string
          id: string
          is_active: boolean
          max_number_of_product: number
          name: string
          price: string
          transaction_fee: number
          updated_at: string
        }
        Insert: {
          access_to_advanced_branding_options?: boolean
          access_to_bulk_promotional_tools?: boolean
          access_to_white_label_option?: boolean
          allowed_to_business_in_multiple_location?: boolean
          allowed_to_customizable_loyalty_programs?: boolean
          allowed_to_get_marketing_campaign_credits?: boolean
          allowed_to_run_event_management_and_ticketing?: boolean
          billing_cycle: string
          can_accept_pre_order?: boolean
          can_access_customer_contact_list?: boolean
          can_access_to_advanced_analytics?: boolean
          can_create_branded_stall_page?: boolean
          can_create_custom_coupon?: boolean
          can_create_multiple_stand?: boolean
          can_eligible_for_priority_map_placement?: boolean
          can_have_dedicated_account_manager?: boolean
          can_receive_loyalty_rewards?: boolean
          can_run_custom_promosion?: boolean
          can_sale_wholesale_and_bulk?: boolean
          can_see_sales_reports?: boolean
          can_shopper_subscription?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          max_number_of_product?: number
          name: string
          price: string
          transaction_fee?: number
          updated_at?: string
        }
        Update: {
          access_to_advanced_branding_options?: boolean
          access_to_bulk_promotional_tools?: boolean
          access_to_white_label_option?: boolean
          allowed_to_business_in_multiple_location?: boolean
          allowed_to_customizable_loyalty_programs?: boolean
          allowed_to_get_marketing_campaign_credits?: boolean
          allowed_to_run_event_management_and_ticketing?: boolean
          billing_cycle?: string
          can_accept_pre_order?: boolean
          can_access_customer_contact_list?: boolean
          can_access_to_advanced_analytics?: boolean
          can_create_branded_stall_page?: boolean
          can_create_custom_coupon?: boolean
          can_create_multiple_stand?: boolean
          can_eligible_for_priority_map_placement?: boolean
          can_have_dedicated_account_manager?: boolean
          can_receive_loyalty_rewards?: boolean
          can_run_custom_promosion?: boolean
          can_sale_wholesale_and_bulk?: boolean
          can_see_sales_reports?: boolean
          can_shopper_subscription?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          max_number_of_product?: number
          name?: string
          price?: string
          transaction_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          collection_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          discountable: boolean
          external_id: string | null
          handle: string
          height: string | null
          hs_code: string | null
          id: string
          is_giftcard: boolean
          length: string | null
          material: string | null
          metadata: Json | null
          mid_code: string | null
          origin_country: string | null
          status: string
          subtitle: string | null
          thumbnail: string | null
          title: string
          type_id: string | null
          updated_at: string
          weight: string | null
          width: string | null
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          discountable?: boolean
          external_id?: string | null
          handle: string
          height?: string | null
          hs_code?: string | null
          id: string
          is_giftcard?: boolean
          length?: string | null
          material?: string | null
          metadata?: Json | null
          mid_code?: string | null
          origin_country?: string | null
          status?: string
          subtitle?: string | null
          thumbnail?: string | null
          title: string
          type_id?: string | null
          updated_at?: string
          weight?: string | null
          width?: string | null
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          discountable?: boolean
          external_id?: string | null
          handle?: string
          height?: string | null
          hs_code?: string | null
          id?: string
          is_giftcard?: boolean
          length?: string | null
          material?: string | null
          metadata?: Json | null
          mid_code?: string | null
          origin_country?: string | null
          status?: string
          subtitle?: string | null
          thumbnail?: string | null
          title?: string
          type_id?: string | null
          updated_at?: string
          weight?: string | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_collection_id_foreign"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "product_collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_type_id_foreign"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "product_type"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          farm_id: string | null
          handle: string
          id: string
          is_active: boolean
          is_internal: boolean
          metadata: Json | null
          mpath: string
          name: string
          parent_category_id: string | null
          rank: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          farm_id?: string | null
          handle: string
          id: string
          is_active?: boolean
          is_internal?: boolean
          metadata?: Json | null
          mpath: string
          name: string
          parent_category_id?: string | null
          rank?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          farm_id?: string | null
          handle?: string
          id?: string
          is_active?: boolean
          is_internal?: boolean
          metadata?: Json | null
          mpath?: string
          name?: string
          parent_category_id?: string | null
          rank?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_parent_category_id_foreign"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category_product: {
        Row: {
          product_category_id: string
          product_id: string
        }
        Insert: {
          product_category_id: string
          product_id: string
        }
        Update: {
          product_category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_product_product_category_id_foreign"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_product_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collection: {
        Row: {
          created_at: string
          deleted_at: string | null
          handle: string
          id: string
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          handle: string
          id: string
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          handle?: string
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          position: number | null
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          position?: number | null
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          position?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          product_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          product_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_value: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          option_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          option_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          option_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_value_option_id_foreign"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_option"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales_channel: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          product_id: string
          sales_channel_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          product_id: string
          sales_channel_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          product_id?: string
          sales_channel_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_shipping_profile: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          product_id: string
          shipping_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          product_id: string
          shipping_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          product_id?: string
          shipping_profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_tag: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      product_tags: {
        Row: {
          product_id: string
          product_tag_id: string
        }
        Insert: {
          product_id: string
          product_tag_id: string
        }
        Update: {
          product_id?: string
          product_tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_product_tag_id_foreign"
            columns: ["product_tag_id"]
            isOneToOne: false
            referencedRelation: "product_tag"
            referencedColumns: ["id"]
          },
        ]
      }
      product_type: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      product_variant: {
        Row: {
          allow_backorder: boolean
          barcode: string | null
          created_at: string
          deleted_at: string | null
          ean: string | null
          height: number | null
          hs_code: string | null
          id: string
          length: number | null
          manage_inventory: boolean
          material: string | null
          metadata: Json | null
          mid_code: string | null
          origin_country: string | null
          product_id: string | null
          sku: string | null
          title: string
          upc: string | null
          updated_at: string
          variant_rank: number | null
          weight: number | null
          width: number | null
        }
        Insert: {
          allow_backorder?: boolean
          barcode?: string | null
          created_at?: string
          deleted_at?: string | null
          ean?: string | null
          height?: number | null
          hs_code?: string | null
          id: string
          length?: number | null
          manage_inventory?: boolean
          material?: string | null
          metadata?: Json | null
          mid_code?: string | null
          origin_country?: string | null
          product_id?: string | null
          sku?: string | null
          title: string
          upc?: string | null
          updated_at?: string
          variant_rank?: number | null
          weight?: number | null
          width?: number | null
        }
        Update: {
          allow_backorder?: boolean
          barcode?: string | null
          created_at?: string
          deleted_at?: string | null
          ean?: string | null
          height?: number | null
          hs_code?: string | null
          id?: string
          length?: number | null
          manage_inventory?: boolean
          material?: string | null
          metadata?: Json | null
          mid_code?: string | null
          origin_country?: string | null
          product_id?: string | null
          sku?: string | null
          title?: string
          upc?: string | null
          updated_at?: string
          variant_rank?: number | null
          weight?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_inventory_item: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          inventory_item_id: string
          required_quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          inventory_item_id: string
          required_quantity?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          inventory_item_id?: string
          required_quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: []
      }
      product_variant_option: {
        Row: {
          option_value_id: string
          variant_id: string
        }
        Insert: {
          option_value_id: string
          variant_id: string
        }
        Update: {
          option_value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_option_option_value_id_foreign"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "product_option_value"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_option_variant_id_foreign"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variant"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_price_set: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          price_set_id: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          price_set_id: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          price_set_id?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          allow_backorders: boolean
          compare_at_price: number | null
          created_at: string
          id: string
          inventory_quantity: number
          options: Json | null
          price: number
          product_id: string
          sku: string | null
          title: string
          track_inventory: boolean
          updated_at: string
          weight: number | null
        }
        Insert: {
          allow_backorders?: boolean
          compare_at_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number
          options?: Json | null
          price: number
          product_id: string
          sku?: string | null
          title: string
          track_inventory?: boolean
          updated_at?: string
          weight?: number | null
        }
        Update: {
          allow_backorders?: boolean
          compare_at_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number
          options?: Json | null
          price?: number
          product_id?: string
          sku?: string | null
          title?: string
          track_inventory?: boolean
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          password_expired: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          temp_password: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          password_expired?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          temp_password?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          password_expired?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          temp_password?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion: {
        Row: {
          campaign_id: string | null
          code: string
          created_at: string
          deleted_at: string | null
          id: string
          is_automatic: boolean
          is_tax_inclusive: boolean
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          code: string
          created_at?: string
          deleted_at?: string | null
          id: string
          is_automatic?: boolean
          is_tax_inclusive?: boolean
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_automatic?: boolean
          is_tax_inclusive?: boolean
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_campaign_id_foreign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaign"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_application_method: {
        Row: {
          allocation: string | null
          apply_to_quantity: number | null
          buy_rules_min_quantity: number | null
          created_at: string
          currency_code: string | null
          deleted_at: string | null
          id: string
          max_quantity: number | null
          promotion_id: string
          raw_value: Json | null
          target_type: string
          type: string
          updated_at: string
          value: number | null
        }
        Insert: {
          allocation?: string | null
          apply_to_quantity?: number | null
          buy_rules_min_quantity?: number | null
          created_at?: string
          currency_code?: string | null
          deleted_at?: string | null
          id: string
          max_quantity?: number | null
          promotion_id: string
          raw_value?: Json | null
          target_type: string
          type: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          allocation?: string | null
          apply_to_quantity?: number | null
          buy_rules_min_quantity?: number | null
          created_at?: string
          currency_code?: string | null
          deleted_at?: string | null
          id?: string
          max_quantity?: number | null
          promotion_id?: string
          raw_value?: Json | null
          target_type?: string
          type?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_application_method_promotion_id_foreign"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotion"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_campaign: {
        Row: {
          campaign_identifier: string
          created_at: string
          deleted_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          name: string
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          campaign_identifier: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          id: string
          name: string
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          campaign_identifier?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_campaign_budget: {
        Row: {
          campaign_id: string
          created_at: string
          currency_code: string | null
          deleted_at: string | null
          id: string
          limit: number | null
          raw_limit: Json | null
          raw_used: Json
          type: string
          updated_at: string
          used: number
        }
        Insert: {
          campaign_id: string
          created_at?: string
          currency_code?: string | null
          deleted_at?: string | null
          id: string
          limit?: number | null
          raw_limit?: Json | null
          raw_used: Json
          type: string
          updated_at?: string
          used?: number
        }
        Update: {
          campaign_id?: string
          created_at?: string
          currency_code?: string | null
          deleted_at?: string | null
          id?: string
          limit?: number | null
          raw_limit?: Json | null
          raw_used?: Json
          type?: string
          updated_at?: string
          used?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_campaign_budget_campaign_id_foreign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaign"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_promotion_rule: {
        Row: {
          promotion_id: string
          promotion_rule_id: string
        }
        Insert: {
          promotion_id: string
          promotion_rule_id: string
        }
        Update: {
          promotion_id?: string
          promotion_rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_promotion_rule_promotion_id_foreign"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_promotion_rule_promotion_rule_id_foreign"
            columns: ["promotion_rule_id"]
            isOneToOne: false
            referencedRelation: "promotion_rule"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_rule: {
        Row: {
          attribute: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          operator: string
          updated_at: string
        }
        Insert: {
          attribute: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          operator: string
          updated_at?: string
        }
        Update: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          operator?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotion_rule_value: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          promotion_rule_id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          promotion_rule_id: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          promotion_rule_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_rule_value_promotion_rule_id_foreign"
            columns: ["promotion_rule_id"]
            isOneToOne: false
            referencedRelation: "promotion_rule"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_identity: {
        Row: {
          auth_identity_id: string
          created_at: string
          deleted_at: string | null
          entity_id: string
          id: string
          provider: string
          provider_metadata: Json | null
          updated_at: string
          user_metadata: Json | null
        }
        Insert: {
          auth_identity_id: string
          created_at?: string
          deleted_at?: string | null
          entity_id: string
          id: string
          provider: string
          provider_metadata?: Json | null
          updated_at?: string
          user_metadata?: Json | null
        }
        Update: {
          auth_identity_id?: string
          created_at?: string
          deleted_at?: string | null
          entity_id?: string
          id?: string
          provider?: string
          provider_metadata?: Json | null
          updated_at?: string
          user_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_identity_auth_identity_id_foreign"
            columns: ["auth_identity_id"]
            isOneToOne: false
            referencedRelation: "auth_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      publishable_api_key_sales_channel: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          publishable_key_id: string
          sales_channel_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          publishable_key_id: string
          sales_channel_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          publishable_key_id?: string
          sales_channel_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      refund: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          note: string | null
          payment_id: string
          raw_amount: Json
          refund_reason_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          note?: string | null
          payment_id: string
          raw_amount: Json
          refund_reason_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          note?: string | null
          payment_id?: string
          raw_amount?: Json
          refund_reason_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_payment_id_foreign"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_reason: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          label: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          label: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          label?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      region: {
        Row: {
          automatic_taxes: boolean
          created_at: string
          currency_code: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          automatic_taxes?: boolean
          created_at?: string
          currency_code: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          automatic_taxes?: boolean
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      region_country: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string
          iso_2: string
          iso_3: string
          metadata: Json | null
          name: string
          num_code: string
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name: string
          iso_2: string
          iso_3: string
          metadata?: Json | null
          name: string
          num_code: string
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          iso_2?: string
          iso_3?: string
          metadata?: Json | null
          name?: string
          num_code?: string
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "region_country_region_id_foreign"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      region_payment_provider: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          payment_provider_id: string
          region_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          payment_provider_id: string
          region_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          payment_provider_id?: string
          region_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservation_item: {
        Row: {
          allow_backorder: boolean | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          external_id: string | null
          id: string
          inventory_item_id: string
          line_item_id: string | null
          location_id: string
          metadata: Json | null
          quantity: number
          raw_quantity: Json | null
          updated_at: string
        }
        Insert: {
          allow_backorder?: boolean | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          external_id?: string | null
          id: string
          inventory_item_id: string
          line_item_id?: string | null
          location_id: string
          metadata?: Json | null
          quantity: number
          raw_quantity?: Json | null
          updated_at?: string
        }
        Update: {
          allow_backorder?: boolean | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          inventory_item_id?: string
          line_item_id?: string | null
          location_id?: string
          metadata?: Json | null
          quantity?: number
          raw_quantity?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_item_inventory_item_id_foreign"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_item"
            referencedColumns: ["id"]
          },
        ]
      }
      return: {
        Row: {
          canceled_at: string | null
          claim_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          display_id: number
          exchange_id: string | null
          id: string
          location_id: string | null
          metadata: Json | null
          no_notification: boolean | null
          order_id: string
          order_version: number
          raw_refund_amount: Json | null
          received_at: string | null
          refund_amount: number | null
          requested_at: string | null
          status: Database["public"]["Enums"]["return_status_enum"]
          updated_at: string
        }
        Insert: {
          canceled_at?: string | null
          claim_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_id?: number
          exchange_id?: string | null
          id: string
          location_id?: string | null
          metadata?: Json | null
          no_notification?: boolean | null
          order_id: string
          order_version: number
          raw_refund_amount?: Json | null
          received_at?: string | null
          refund_amount?: number | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["return_status_enum"]
          updated_at?: string
        }
        Update: {
          canceled_at?: string | null
          claim_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          display_id?: number
          exchange_id?: string | null
          id?: string
          location_id?: string | null
          metadata?: Json | null
          no_notification?: boolean | null
          order_id?: string
          order_version?: number
          raw_refund_amount?: Json | null
          received_at?: string | null
          refund_amount?: number | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["return_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      return_fulfillment: {
        Row: {
          created_at: string
          deleted_at: string | null
          fulfillment_id: string
          id: string
          return_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_id: string
          id: string
          return_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_id?: string
          id?: string
          return_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      return_item: {
        Row: {
          created_at: string
          damaged_quantity: number
          deleted_at: string | null
          id: string
          item_id: string
          metadata: Json | null
          note: string | null
          quantity: number
          raw_damaged_quantity: Json
          raw_quantity: Json
          raw_received_quantity: Json
          reason_id: string | null
          received_quantity: number
          return_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          damaged_quantity?: number
          deleted_at?: string | null
          id: string
          item_id: string
          metadata?: Json | null
          note?: string | null
          quantity: number
          raw_damaged_quantity: Json
          raw_quantity: Json
          raw_received_quantity: Json
          reason_id?: string | null
          received_quantity?: number
          return_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          damaged_quantity?: number
          deleted_at?: string | null
          id?: string
          item_id?: string
          metadata?: Json | null
          note?: string | null
          quantity?: number
          raw_damaged_quantity?: Json
          raw_quantity?: Json
          raw_received_quantity?: Json
          reason_id?: string | null
          received_quantity?: number
          return_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      return_reason: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          label: string
          metadata: Json | null
          parent_return_reason_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          label: string
          metadata?: Json | null
          parent_return_reason_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          label?: string
          metadata?: Json | null
          parent_return_reason_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_reason_parent_return_reason_id_foreign"
            columns: ["parent_return_reason_id"]
            isOneToOne: false
            referencedRelation: "return_reason"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channel: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_disabled: boolean
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          is_disabled?: boolean
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_disabled?: boolean
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_channel_stock_location: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          sales_channel_id: string
          stock_location_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          sales_channel_id: string
          stock_location_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          sales_channel_id?: string
          stock_location_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      script_migrations: {
        Row: {
          created_at: string | null
          finished_at: string | null
          id: number
          script_name: string
        }
        Insert: {
          created_at?: string | null
          finished_at?: string | null
          id?: number
          script_name: string
        }
        Update: {
          created_at?: string | null
          finished_at?: string | null
          id?: number
          script_name?: string
        }
        Relationships: []
      }
      service_zone: {
        Row: {
          created_at: string
          deleted_at: string | null
          fulfillment_set_id: string
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_set_id: string
          id: string
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fulfillment_set_id?: string
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_zone_fulfillment_set_id_foreign"
            columns: ["fulfillment_set_id"]
            isOneToOne: false
            referencedRelation: "fulfillment_set"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_option: {
        Row: {
          created_at: string
          data: Json | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          price_type: string
          provider_id: string | null
          service_zone_id: string
          shipping_option_type_id: string
          shipping_profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name: string
          price_type?: string
          provider_id?: string | null
          service_zone_id: string
          shipping_option_type_id: string
          shipping_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price_type?: string
          provider_id?: string | null
          service_zone_id?: string
          shipping_option_type_id?: string
          shipping_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_option_provider_id_foreign"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "fulfillment_provider"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_option_service_zone_id_foreign"
            columns: ["service_zone_id"]
            isOneToOne: false
            referencedRelation: "service_zone"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_option_shipping_option_type_id_foreign"
            columns: ["shipping_option_type_id"]
            isOneToOne: false
            referencedRelation: "shipping_option_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_option_shipping_profile_id_foreign"
            columns: ["shipping_profile_id"]
            isOneToOne: false
            referencedRelation: "shipping_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_option_price_set: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          price_set_id: string
          shipping_option_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          price_set_id: string
          shipping_option_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          price_set_id?: string
          shipping_option_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_option_rule: {
        Row: {
          attribute: string
          created_at: string
          deleted_at: string | null
          id: string
          operator: string
          shipping_option_id: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          attribute: string
          created_at?: string
          deleted_at?: string | null
          id: string
          operator: string
          shipping_option_id: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          attribute?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          operator?: string
          shipping_option_id?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_option_rule_shipping_option_id_foreign"
            columns: ["shipping_option_id"]
            isOneToOne: false
            referencedRelation: "shipping_option"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_option_type: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipping_profile: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_location: {
        Row: {
          address_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_location_address_id_foreign"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "stock_location_address"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_location_address: {
        Row: {
          address_1: string
          address_2: string | null
          city: string | null
          company: string | null
          country_code: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          phone: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          address_1: string
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code: string
          created_at?: string
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          address_1?: string
          address_2?: string | null
          city?: string | null
          company?: string | null
          country_code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store: {
        Row: {
          created_at: string
          default_location_id: string | null
          default_region_id: string | null
          default_sales_channel_id: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_location_id?: string | null
          default_region_id?: string | null
          default_sales_channel_id?: string | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_location_id?: string | null
          default_region_id?: string | null
          default_sales_channel_id?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_currency: {
        Row: {
          created_at: string
          currency_code: string
          deleted_at: string | null
          id: string
          is_default: boolean
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          deleted_at?: string | null
          id: string
          is_default?: boolean
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_currency_store_id_foreign"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_provider: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tax_rate: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_combinable: boolean
          is_default: boolean
          metadata: Json | null
          name: string
          rate: number | null
          tax_region_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id: string
          is_combinable?: boolean
          is_default?: boolean
          metadata?: Json | null
          name: string
          rate?: number | null
          tax_region_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_combinable?: boolean
          is_default?: boolean
          metadata?: Json | null
          name?: string
          rate?: number | null
          tax_region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_tax_rate_tax_region_id"
            columns: ["tax_region_id"]
            isOneToOne: false
            referencedRelation: "tax_region"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rate_rule: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          reference: string
          reference_id: string
          tax_rate_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          reference: string
          reference_id: string
          tax_rate_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          reference?: string
          reference_id?: string
          tax_rate_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_tax_rate_rule_tax_rate_id"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rate"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_region: {
        Row: {
          country_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          parent_id: string | null
          provider_id: string | null
          province_code: string | null
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id: string
          metadata?: Json | null
          parent_id?: string | null
          provider_id?: string | null
          province_code?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          provider_id?: string | null
          province_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "FK_tax_region_parent_id"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tax_region"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FK_tax_region_provider_id"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tax_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_preference: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          key: string
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          key: string
          updated_at?: string
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      vendor: {
        Row: {
          created_at: string
          deleted_at: string | null
          handle: string
          id: string
          logo: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          handle: string
          id: string
          logo?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          handle?: string
          id?: string
          logo?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendor_admin: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_admin_vendor_id_foreign"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor"
            referencedColumns: ["id"]
          },
        ]
      }
      view_configuration: {
        Row: {
          configuration: Json
          created_at: string
          deleted_at: string | null
          entity: string
          id: string
          is_system_default: boolean
          name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          configuration: Json
          created_at?: string
          deleted_at?: string | null
          entity: string
          id: string
          is_system_default?: boolean
          name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string
          deleted_at?: string | null
          entity?: string
          id?: string
          is_system_default?: boolean
          name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workflow_execution: {
        Row: {
          context: Json | null
          created_at: string
          deleted_at: string | null
          execution: Json | null
          id: string
          retention_time: number | null
          run_id: string
          state: string
          transaction_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          deleted_at?: string | null
          execution?: Json | null
          id?: string
          retention_time?: number | null
          run_id?: string
          state: string
          transaction_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          deleted_at?: string | null
          execution?: Json | null
          id?: string
          retention_time?: number | null
          run_id?: string
          state?: string
          transaction_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_farmer_application: {
        Args: { application_id: string; approved_by_admin: string }
        Returns: boolean
      }
      create_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_farmer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_details?: Json
          action_type: string
          target_user_id?: string
        }
        Returns: undefined
      }
      user_owns_product: {
        Args: { product_id: string }
        Returns: boolean
      }
      user_owns_product_via_variant: {
        Args: { variant_product_id: string }
        Returns: boolean
      }
    }
    Enums: {
      claim_reason_enum:
        | "missing_item"
        | "wrong_item"
        | "production_failure"
        | "other"
      order_claim_type_enum: "refund" | "replace"
      order_status_enum:
        | "pending"
        | "completed"
        | "draft"
        | "archived"
        | "canceled"
        | "requires_action"
      product_unit: "kg" | "pound" | "litre" | "piece" | "other"
      return_status_enum:
        | "open"
        | "requested"
        | "received"
        | "partially_received"
        | "canceled"
      stock_mode: "count" | "always_available"
      user_role: "shopper" | "farmer" | "admin" | "customer"
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
      claim_reason_enum: [
        "missing_item",
        "wrong_item",
        "production_failure",
        "other",
      ],
      order_claim_type_enum: ["refund", "replace"],
      order_status_enum: [
        "pending",
        "completed",
        "draft",
        "archived",
        "canceled",
        "requires_action",
      ],
      product_unit: ["kg", "pound", "litre", "piece", "other"],
      return_status_enum: [
        "open",
        "requested",
        "received",
        "partially_received",
        "canceled",
      ],
      stock_mode: ["count", "always_available"],
      user_role: ["shopper", "farmer", "admin", "customer"],
    },
  },
} as const

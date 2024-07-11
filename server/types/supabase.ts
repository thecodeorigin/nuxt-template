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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          slug: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_posts_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database['public']['Enums']['pricing_plan_interval'] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database['public']['Enums']['pricing_type'] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database['public']['Enums']['pricing_type'] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database['public']['Enums']['pricing_type'] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'stripe_prices_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'stripe_products'
            referencedColumns: ['id']
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          marketing_features: Json[] | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          marketing_features?: Json[] | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          marketing_features?: Json[] | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database['public']['Enums']['subscription_status'] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database['public']['Enums']['subscription_status'] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database['public']['Enums']['subscription_status'] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stripe_subscriptions_price_id_fkey'
            columns: ['price_id']
            isOneToOne: false
            referencedRelation: 'stripe_prices'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stripe_subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: ['id']
          },
        ]
      }
      sys_faqs: {
        Row: {
          icon: string | null
          id: string
          questions: Json[]
          subtitle: string | null
          title: string | null
        }
        Insert: {
          icon?: string | null
          id?: string
          questions?: Json[]
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          icon?: string | null
          id?: string
          questions?: Json[]
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      sys_notifications: {
        Row: {
          action: Json | null
          created_at: string
          id: number
          message: string | null
          read_at: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          action?: Json | null
          created_at?: string
          id?: number
          message?: string | null
          read_at?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          action?: Json | null
          created_at?: string
          id?: number
          message?: string | null
          read_at?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sys_notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: ['id']
          },
        ]
      }
      sys_permissions: {
        Row: {
          action: Database['public']['Enums']['permission_action']
          id: string
          role_id: string | null
          subject: Database['public']['Enums']['permission_subject']
        }
        Insert: {
          action?: Database['public']['Enums']['permission_action']
          id?: string
          role_id?: string | null
          subject: Database['public']['Enums']['permission_subject']
        }
        Update: {
          action?: Database['public']['Enums']['permission_action']
          id?: string
          role_id?: string | null
          subject?: Database['public']['Enums']['permission_subject']
        }
        Relationships: [
          {
            foreignKeyName: 'public_sys_permissions_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'sys_roles'
            referencedColumns: ['id']
          },
        ]
      }
      sys_roles: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      sys_shortcuts: {
        Row: {
          id: string
          item: string | null
          user_id: string
        }
        Insert: {
          id?: string
          item?: string | null
          user_id: string
        }
        Update: {
          id?: string
          item?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sys_shortcuts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: ['id']
          },
        ]
      }
      sys_users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          payment_method: Json | null
          phone: string | null
          role_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
          phone?: string | null
          role_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
          phone?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_sys_users_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'sys_roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sys_users_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      permission_action: 'create' | 'read' | 'update' | 'delete' | 'manage'
      permission_subject: 'all' | 'Post' | 'Category' | 'User'
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year'
      pricing_type: 'one_time' | 'recurring'
      subscription_status:
        | 'trialing'
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'unpaid'
        | 'paused'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
  Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
  PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
    PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type Json = string | number | boolean | null | {
  [key: string]: any
} | {
  [key: string]: any
}[]
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          parent_id: string | null
          slug: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          parent_id?: string | null
          slug: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_categories_parent_id_fkey'
            columns: [
              'parent_id',
            ]
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: [
              'id',
            ]
          },
          {
            foreignKeyName: 'public_categories_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_posts_category_id_fkey'
            columns: [
              'category_id',
            ]
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: [
              'id',
            ]
          },
          {
            foreignKeyName: 'public_posts_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      projects: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_projects_category_id_fkey'
            columns: [
              'category_id',
            ]
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: [
              'id',
            ]
          },
          {
            foreignKeyName: 'public_projects_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      sys_faq_categories: {
        Row: {
          icon: string | null
          id: number
          subtitle: string | null
          title: string | null
        }
        Insert: {
          icon?: string | null
          id?: number
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          icon?: string | null
          id?: number
          subtitle?: string | null
          title?: string | null
        }
        Relationships: [
        ]
      }
      sys_faqs: {
        Row: {
          answer: string | null
          category_id: number | null
          id: string
          question: string | null
        }
        Insert: {
          answer?: string | null
          category_id?: number | null
          id?: string
          question?: string | null
        }
        Update: {
          answer?: string | null
          category_id?: number | null
          id?: string
          question?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_sys_faqs_category_id_fkey'
            columns: [
              'category_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_faq_categories'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      sys_landing_page: {
        Row: {
          banner_button: string
          banner_image: string | null
          banner_title: string
          banner_title_desc: string
          contact_us_card_content: string
          contact_us_card_heading: string
          contact_us_card_image: string | null
          contact_us_card_title: string
          contact_us_title: string
          contact_us_title_desc: string | null
          created_at: string
          customer_review_data: Json | null
          customer_review_title: string
          customer_review_title_desc: string | null
          faq_data: Json | null
          faq_title: string
          faq_title_desc: string
          feature_data: Json | null
          feature_title: string
          feature_title_desc: string | null
          hero_main_img_dark: string | null
          hero_main_img_light: string | null
          hero_sub_img_dark: string | null
          hero_sub_img_light: string | null
          hero_title: string
          hero_title_button: Json
          hero_title_desc: string
          id: string
          our_team_data: Json | null
          our_team_desc: string
          our_team_title: string
          pricing_data: Json | null
          pricing_title: string
          pricing_title_desc: string
          product_stats: Json | null
        }
        Insert: {
          banner_button: string
          banner_image?: string | null
          banner_title: string
          banner_title_desc: string
          contact_us_card_content: string
          contact_us_card_heading: string
          contact_us_card_image?: string | null
          contact_us_card_title: string
          contact_us_title: string
          contact_us_title_desc?: string | null
          created_at?: string
          customer_review_data?: Json | null
          customer_review_title: string
          customer_review_title_desc?: string | null
          faq_data?: Json | null
          faq_title: string
          faq_title_desc: string
          feature_data?: Json | null
          feature_title: string
          feature_title_desc?: string | null
          hero_main_img_dark?: string | null
          hero_main_img_light?: string | null
          hero_sub_img_dark?: string | null
          hero_sub_img_light?: string | null
          hero_title: string
          hero_title_button: Json
          hero_title_desc: string
          id?: string
          our_team_data?: Json | null
          our_team_desc: string
          our_team_title: string
          pricing_data?: Json | null
          pricing_title: string
          pricing_title_desc: string
          product_stats?: Json | null
        }
        Update: {
          banner_button?: string
          banner_image?: string | null
          banner_title?: string
          banner_title_desc?: string
          contact_us_card_content?: string
          contact_us_card_heading?: string
          contact_us_card_image?: string | null
          contact_us_card_title?: string
          contact_us_title?: string
          contact_us_title_desc?: string | null
          created_at?: string
          customer_review_data?: Json | null
          customer_review_title?: string
          customer_review_title_desc?: string | null
          faq_data?: Json | null
          faq_title?: string
          faq_title_desc?: string
          feature_data?: Json | null
          feature_title?: string
          feature_title_desc?: string | null
          hero_main_img_dark?: string | null
          hero_main_img_light?: string | null
          hero_sub_img_dark?: string | null
          hero_sub_img_light?: string | null
          hero_title?: string
          hero_title_button?: Json
          hero_title_desc?: string
          id?: string
          our_team_data?: Json | null
          our_team_desc?: string
          our_team_title?: string
          pricing_data?: Json | null
          pricing_title?: string
          pricing_title_desc?: string
          product_stats?: Json | null
        }
        Relationships: [
        ]
      }
      sys_notifications: {
        Row: {
          action: Json | null
          created_at: string
          id: string
          message: string | null
          read_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          action?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_sys_notifications_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
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
            columns: [
              'role_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_roles'
            referencedColumns: [
              'id',
            ]
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
        Relationships: [
        ]
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
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      sys_users: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          organization: string | null
          phone: string | null
          postcode: string | null
          role_id: string | null
          status: Database['public']['Enums']['user_status'] | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          organization?: string | null
          phone?: string | null
          postcode?: string | null
          role_id?: string | null
          status?: Database['public']['Enums']['user_status'] | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          organization?: string | null
          phone?: string | null
          postcode?: string | null
          role_id?: string | null
          status?: Database['public']['Enums']['user_status'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_sys_users_role_id_fkey'
            columns: [
              'role_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_roles'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      user_devices: {
        Row: {
          created_at: string
          id: number
          token_device: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          token_device?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          token_device?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_user_devices_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          created_at: string
          cvv: number
          expires_at: string
          id: string
          number: string
          placeholder: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cvv: number
          expires_at: string
          id?: string
          number: string
          placeholder: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          cvv?: number
          expires_at?: string
          id?: string
          number?: string
          placeholder?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'public_user_payment_methods_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
      user_shortcuts: {
        Row: {
          id: string
          route: string
          user_id: string | null
        }
        Insert: {
          id?: string
          route: string
          user_id?: string | null
        }
        Update: {
          id?: string
          route?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_user_shortcuts_user_id_fkey'
            columns: [
              'user_id',
            ]
            isOneToOne: false
            referencedRelation: 'sys_users'
            referencedColumns: [
              'id',
            ]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never;
    }
    Functions: {
      [_ in never]: never;
    }
    Enums: {
      permission_action: 'create' | 'read' | 'update' | 'delete' | 'manage'
      permission_subject: 'all' | 'Post' | 'Category' | 'User'
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year'
      pricing_type: 'one_time' | 'recurring'
      subscription_status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused'
      user_status: 'active' | 'deactivated' | 'pending'
    }
    CompositeTypes: {
      [_ in never]: never;
    }
  }
}
type PublicSchema = Database[Extract<keyof Database, 'public'>]
export type Tables<PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | {
  schema: keyof Database
}, TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  } ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views']) : never = never> = PublicTableNameOrOptions extends {
    schema: keyof Database
  } ? (Database[PublicTableNameOrOptions['schema']]['Tables'] & Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
        Row: infer R
      } ? R : never : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      } ? R : never : never
export type TablesInsert<PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | {
  schema: keyof Database
}, TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never> = PublicTableNameOrOptions extends {
    schema: keyof Database
  } ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    } ? I : never : PublicTableNameOrOptions extends keyof PublicSchema['Tables'] ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    } ? I : never : never
export type TablesUpdate<PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | {
  schema: keyof Database
}, TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables'] : never = never> = PublicTableNameOrOptions extends {
    schema: keyof Database
  } ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    } ? U : never : PublicTableNameOrOptions extends keyof PublicSchema['Tables'] ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    } ? U : never : never
export type Enums<PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | {
  schema: keyof Database
}, EnumName extends PublicEnumNameOrOptions extends {
    schema: keyof Database
  } ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums'] : never = never> = PublicEnumNameOrOptions extends {
    schema: keyof Database
  } ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName] : PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] ? PublicSchema['Enums'][PublicEnumNameOrOptions] : never

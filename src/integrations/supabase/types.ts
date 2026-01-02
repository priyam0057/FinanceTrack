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
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          end_date: string
          id: string
          period: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          period: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          period?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          date_time: string
          id: string
          latitude: number | null
          longitude: number | null
          note: string | null
          payment_method: string | null
          place_name: string | null
          receipt_url: string | null
          subcategory: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string
          date_time?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          payment_method?: string | null
          place_name?: string | null
          receipt_url?: string | null
          subcategory?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          date_time?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          note?: string | null
          payment_method?: string | null
          place_name?: string | null
          receipt_url?: string | null
          subcategory?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string
          id: string
          language: string
          start_of_week: number | null
          timezone: string
          updated_at: string
          email_recipient: string | null
          daily_report_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          language?: string
          start_of_week?: number | null
          timezone?: string
          updated_at?: string
          email_recipient?: string | null
          daily_report_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          language?: string
          start_of_week?: number | null
          timezone?: string
          updated_at?: string
          email_recipient?: string | null
          daily_report_enabled?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          type: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          type: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          name: string
          cost: number
          priority: string
          note: string | null
          saved: number
          purchased: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          cost: number
          priority: string
          note?: string | null
          saved?: number
          purchased?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          cost?: number
          priority?: string
          note?: string | null
          saved?: number
          purchased?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_diagrams: {
        Row: {
          id: string
          project_id: string
          diagram_type: string
          name: string
          nodes: Json
          edges: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          diagram_type: string
          name?: string
          nodes?: Json
          edges?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          diagram_type?: string
          name?: string
          nodes?: Json
          edges?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      env_config: {
        Row: {
          id: string
          project_id: string
          name: string
          development: string | null
          staging: string | null
          production: string | null
          is_secret: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          development?: string | null
          staging?: string | null
          production?: string | null
          is_secret?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          development?: string | null
          staging?: string | null
          production?: string | null
          is_secret?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: string
        }
        Returns: boolean
      }
      update_updated_at_column: {
        Args: {
          [_ in never]: never
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database }
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? never // This branch is problematic and not needed for typical usage
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database }
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? never // This branch is problematic and not needed for typical usage
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database }
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? never // This branch is problematic and not needed for typical usage
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database }
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? never // This branch is problematic and not needed for typical usage
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

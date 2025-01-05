export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calculator_submissions: {
        Row: {
          calculation_data: Json
          company: string
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          calculation_data: Json
          company: string
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          calculation_data?: Json
          company?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      categorized_posts: {
        Row: {
          category: Database["public"]["Enums"]["post_category"]
          created_at: string | null
          id: string
          post_metrics_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["post_category"]
          created_at?: string | null
          id?: string
          post_metrics_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["post_category"]
          created_at?: string | null
          id?: string
          post_metrics_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorized_posts_post_metrics_id_fkey"
            columns: ["post_metrics_id"]
            isOneToOne: false
            referencedRelation: "post_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      finnhub_webhooks: {
        Row: {
          id: string
          payload: Json
          processed: boolean | null
          received_at: string | null
        }
        Insert: {
          id?: string
          payload: Json
          processed?: boolean | null
          received_at?: string | null
        }
        Update: {
          id?: string
          payload?: Json
          processed?: boolean | null
          received_at?: string | null
        }
        Relationships: []
      }
      post_metrics: {
        Row: {
          comments: number | null
          created_at: string | null
          id: string
          impressions: number | null
          likes: number | null
          platform: string
          post_content: string
          reshares: number | null
          shared_at: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: number | null
          created_at?: string | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform: string
          post_content: string
          reshares?: number | null
          shared_at?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: number | null
          created_at?: string | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform?: string
          post_content?: string
          reshares?: number | null
          shared_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          recording_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          recording_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recording_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          platform: string
          posted: boolean | null
          scheduled_for: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          platform: string
          posted?: boolean | null
          scheduled_for: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          platform?: string
          posted?: boolean | null
          scheduled_for?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      user_social_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_scheduled_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_secret: {
        Args: {
          name: string
        }
        Returns: string
      }
      refresh_top_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      post_category: "business" | "culture" | "politics"
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
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
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
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
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
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
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
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

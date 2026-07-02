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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string
          created_at: string
          id: string
          message: string | null
          preferred_date: string | null
          preferred_time: string | null
          seller_id: string
          status: string
          vehicle_id: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          seller_id: string
          status?: string
          vehicle_id: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          seller_id?: string
          status?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          id: string
          vehicle_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          id?: string
          vehicle_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_messages: {
        Row: {
          admin_id: string
          body: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          admin_id: string
          body: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          admin_id?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      car_alerts: {
        Row: {
          active: boolean
          brand: string | null
          created_at: string
          id: string
          model: string | null
          price_max: number | null
          user_id: string
          wilaya: string | null
          year_max: number | null
          year_min: number | null
        }
        Insert: {
          active?: boolean
          brand?: string | null
          created_at?: string
          id?: string
          model?: string | null
          price_max?: number | null
          user_id: string
          wilaya?: string | null
          year_max?: number | null
          year_min?: number | null
        }
        Update: {
          active?: boolean
          brand?: string | null
          created_at?: string
          id?: string
          model?: string | null
          price_max?: number | null
          user_id?: string
          wilaya?: string | null
          year_max?: number | null
          year_min?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          vehicle_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          vehicle_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          reviewed_at: string | null
          screenshot_url: string
          status: Database["public"]["Enums"]["payment_status"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          id?: string
          reviewed_at?: string | null
          screenshot_url: string
          status?: Database["public"]["Enums"]["payment_status"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          id?: string
          reviewed_at?: string | null
          screenshot_url?: string
          status?: Database["public"]["Enums"]["payment_status"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_subscriptions: {
        Row: {
          amount: number
          id: string
          plan: Database["public"]["Enums"]["sub_plan"]
          receipt_url: string
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["sub_status"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          plan: Database["public"]["Enums"]["sub_plan"]
          receipt_url: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          plan?: Database["public"]["Enums"]["sub_plan"]
          receipt_url?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          daily_post_count: number
          dob: string
          fake_reports_count: number
          first_name: string
          id: string
          is_banned: boolean
          is_showroom: boolean
          last_fake_report_at: string | null
          last_name: string
          last_post_reset_date: string
          last_seen_at: string | null
          phone: string
          place_of_birth: string
          plan_type: string
          showroom_description: string | null
          showroom_logo: string | null
          showroom_name: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_until: string | null
          trial_started_at: string
        }
        Insert: {
          created_at?: string
          daily_post_count?: number
          dob: string
          fake_reports_count?: number
          first_name: string
          id: string
          is_banned?: boolean
          is_showroom?: boolean
          last_fake_report_at?: string | null
          last_name: string
          last_post_reset_date?: string
          last_seen_at?: string | null
          phone: string
          place_of_birth: string
          plan_type?: string
          showroom_description?: string | null
          showroom_logo?: string | null
          showroom_name?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_until?: string | null
          trial_started_at?: string
        }
        Update: {
          created_at?: string
          daily_post_count?: number
          dob?: string
          fake_reports_count?: number
          first_name?: string
          id?: string
          is_banned?: boolean
          is_showroom?: boolean
          last_fake_report_at?: string | null
          last_name?: string
          last_post_reset_date?: string
          last_seen_at?: string | null
          phone?: string
          place_of_birth?: string
          plan_type?: string
          showroom_description?: string | null
          showroom_logo?: string | null
          showroom_name?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_until?: string | null
          trial_started_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          days_granted: number
          id: string
          is_active: boolean
          max_uses: number | null
          plan_type: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          days_granted?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          plan_type?: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          days_granted?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          plan_type?: string
          uses_count?: number
        }
        Relationships: []
      }
      showroom_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          showroom_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          showroom_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          showroom_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          author_id: string
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          likes_count: number
          vehicle_id: string | null
          video_url: string
          views_count: number
        }
        Insert: {
          author_id: string
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          likes_count?: number
          vehicle_id?: string | null
          video_url: string
          views_count?: number
        }
        Update: {
          author_id?: string
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          likes_count?: number
          vehicle_id?: string | null
          video_url?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          closed_at: string | null
          created_at: string
          id: string
          message: string
          resolved_at: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          message: string
          resolved_at?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          message?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_reports_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          auction_ends_at: string | null
          brand: string
          created_at: string
          current_highest_bid: number | null
          current_highest_bidder: string | null
          description: string | null
          documents_status: string | null
          engine_type: string | null
          featured_until: string | null
          fixed_price: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id: string
          is_featured: boolean
          is_vip: boolean
          mileage: number
          model: string
          paint_condition: string | null
          phone: string
          photos: string[]
          price_type: Database["public"]["Enums"]["price_type"]
          seller_id: string
          sold_at: string | null
          starting_price: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          transaction_types: string[] | null
          transmission: Database["public"]["Enums"]["transmission_type"]
          video_url: string | null
          wilaya: string
          year: number
        }
        Insert: {
          auction_ends_at?: string | null
          brand: string
          created_at?: string
          current_highest_bid?: number | null
          current_highest_bidder?: string | null
          description?: string | null
          documents_status?: string | null
          engine_type?: string | null
          featured_until?: string | null
          fixed_price?: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id?: string
          is_featured?: boolean
          is_vip?: boolean
          mileage: number
          model: string
          paint_condition?: string | null
          phone: string
          photos?: string[]
          price_type: Database["public"]["Enums"]["price_type"]
          seller_id: string
          sold_at?: string | null
          starting_price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          transaction_types?: string[] | null
          transmission: Database["public"]["Enums"]["transmission_type"]
          video_url?: string | null
          wilaya: string
          year: number
        }
        Update: {
          auction_ends_at?: string | null
          brand?: string
          created_at?: string
          current_highest_bid?: number | null
          current_highest_bidder?: string | null
          description?: string | null
          documents_status?: string | null
          engine_type?: string | null
          featured_until?: string | null
          fixed_price?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          is_featured?: boolean
          is_vip?: boolean
          mileage?: number
          model?: string
          paint_condition?: string | null
          phone?: string
          photos?: string[]
          price_type?: Database["public"]["Enums"]["price_type"]
          seller_id?: string
          sold_at?: string | null
          starting_price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          transaction_types?: string[] | null
          transmission?: Database["public"]["Enums"]["transmission_type"]
          video_url?: string | null
          wilaya?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reset_user_password: {
        Args: { new_password: string; user_id: string }
        Returns: Json
      }
      apply_promo_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      can_post_vehicle: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_post_count: { Args: { p_user_id: string }; Returns: undefined }
      reset_daily_post_counter: { Args: never; Returns: undefined }
      setup_admin_user: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      fuel_type: "Diesel" | "Essence" | "GPL" | "Hybrid" | "Electrique"
      payment_status: "pending" | "approved" | "rejected"
      price_type: "fixed" | "auction"
      sub_plan: "monthly" | "yearly"
      sub_status: "pending" | "approved" | "rejected"
      subscription_status: "trial" | "active" | "locked"
      transmission_type: "Manuelle" | "Automatique"
      vehicle_status:
        | "active"
        | "closed"
        | "sold"
        | "pending"
        | "rejected"
        | "archived"
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
      app_role: ["admin", "user"],
      fuel_type: ["Diesel", "Essence", "GPL", "Hybrid", "Electrique"],
      payment_status: ["pending", "approved", "rejected"],
      price_type: ["fixed", "auction"],
      sub_plan: ["monthly", "yearly"],
      sub_status: ["pending", "approved", "rejected"],
      subscription_status: ["trial", "active", "locked"],
      transmission_type: ["Manuelle", "Automatique"],
      vehicle_status: [
        "active",
        "closed",
        "sold",
        "pending",
        "rejected",
        "archived",
      ],
    },
  },
} as const

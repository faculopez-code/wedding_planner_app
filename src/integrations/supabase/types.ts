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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          actual_cost: number | null
          category_id: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          name: string
          notes: string | null
          paid: boolean | null
          updated_at: string
          wedding_id: string
        }
        Insert: {
          actual_cost?: number | null
          category_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          name: string
          notes?: string | null
          paid?: boolean | null
          updated_at?: string
          wedding_id: string
        }
        Update: {
          actual_cost?: number | null
          category_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          name?: string
          notes?: string | null
          paid?: boolean | null
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          budget_allocated: number | null
          budget_spent: number | null
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          wedding_id: string
        }
        Insert: {
          budget_allocated?: number | null
          budget_spent?: number | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          wedding_id: string
        }
        Update: {
          budget_allocated?: number | null
          budget_spent?: number | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          dietary_preferences: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          plus_one: boolean | null
          plus_one_name: string | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"] | null
          table_assignment: string | null
          updated_at: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          dietary_preferences?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          plus_one_name?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"] | null
          table_assignment?: string | null
          updated_at?: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          dietary_preferences?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          plus_one_name?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"] | null
          table_assignment?: string | null
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      pinterest_boards: {
        Row: {
          cover_image_url: string | null
          created_at: string
          embed_url: string | null
          id: string
          name: string
          pinterest_board_id: string | null
          url: string
          wedding_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          embed_url?: string | null
          id?: string
          name: string
          pinterest_board_id?: string | null
          url: string
          wedding_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          embed_url?: string | null
          id?: string
          name?: string
          pinterest_board_id?: string | null
          url?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinterest_boards_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      pinterest_pins: {
        Row: {
          board_id: string | null
          created_at: string
          description: string | null
          embed_url: string | null
          id: string
          image_url: string
          link_original: string | null
          pinterest_pin_id: string | null
          thumbnail_url: string | null
          wedding_id: string
        }
        Insert: {
          board_id?: string | null
          created_at?: string
          description?: string | null
          embed_url?: string | null
          id?: string
          image_url: string
          link_original?: string | null
          pinterest_pin_id?: string | null
          thumbnail_url?: string | null
          wedding_id: string
        }
        Update: {
          board_id?: string | null
          created_at?: string
          description?: string | null
          embed_url?: string | null
          id?: string
          image_url?: string
          link_original?: string | null
          pinterest_pin_id?: string | null
          thumbnail_url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinterest_pins_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "pinterest_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinterest_pins_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          phase: Database["public"]["Enums"]["wedding_phase"] | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["wedding_phase"] | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["wedding_phase"] | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          notes: string | null
          start_time: string
          title: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          start_time: string
          title: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category_id: string | null
          contact_name: string | null
          contract_signed: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
          wedding_id: string
        }
        Insert: {
          category_id?: string | null
          contact_name?: string | null
          contract_signed?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
          wedding_id: string
        }
        Update: {
          category_id?: string | null
          contact_name?: string | null
          contract_signed?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          created_at: string
          current_phase: Database["public"]["Enums"]["wedding_phase"] | null
          id: string
          owner_id: string
          partner_name_1: string
          partner_name_2: string
          total_budget: number | null
          updated_at: string
          venue_name: string | null
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          current_phase?: Database["public"]["Enums"]["wedding_phase"] | null
          id?: string
          owner_id: string
          partner_name_1: string
          partner_name_2: string
          total_budget?: number | null
          updated_at?: string
          venue_name?: string | null
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          current_phase?: Database["public"]["Enums"]["wedding_phase"] | null
          id?: string
          owner_id?: string
          partner_name_1?: string
          partner_name_2?: string
          total_budget?: number | null
          updated_at?: string
          venue_name?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      rsvp_status: "pending" | "attending" | "not_attending" | "maybe"
      task_priority: "low" | "medium" | "high"
      task_status: "pending" | "in_progress" | "completed"
      wedding_phase:
        | "proposal_engagement"
        | "pre_wedding"
        | "wedding_day"
        | "post_wedding"
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
      rsvp_status: ["pending", "attending", "not_attending", "maybe"],
      task_priority: ["low", "medium", "high"],
      task_status: ["pending", "in_progress", "completed"],
      wedding_phase: [
        "proposal_engagement",
        "pre_wedding",
        "wedding_day",
        "post_wedding",
      ],
    },
  },
} as const

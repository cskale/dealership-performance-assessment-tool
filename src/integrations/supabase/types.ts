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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assessment_notes: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          notes: string
          organization_id: string | null
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          notes: string
          organization_id?: string | null
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          notes?: string
          organization_id?: string | null
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_notes_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          dealership_id: string
          id: string
          organization_id: string | null
          overall_score: number | null
          scores: Json
          session_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          dealership_id: string
          id?: string
          organization_id?: string | null
          overall_score?: number | null
          scores?: Json
          session_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          dealership_id?: string
          id?: string
          organization_id?: string | null
          overall_score?: number | null
          scores?: Json
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmarks: {
        Row: {
          average_score: number
          brand: string
          country: string
          id: string
          last_updated: string
          metric_name: string
          percentile_25: number | null
          percentile_75: number | null
          sample_size: number
          segment: string
        }
        Insert: {
          average_score: number
          brand: string
          country: string
          id?: string
          last_updated?: string
          metric_name: string
          percentile_25?: number | null
          percentile_75?: number | null
          sample_size?: number
          segment: string
        }
        Update: {
          average_score?: number
          brand?: string
          country?: string
          id?: string
          last_updated?: string
          metric_name?: string
          percentile_25?: number | null
          percentile_75?: number | null
          sample_size?: number
          segment?: string
        }
        Relationships: []
      }
      dealership_contacts: {
        Row: {
          contact_email: string | null
          created_at: string
          dealership_id: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          dealership_id: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          dealership_id?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_contacts_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: true
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          brand: string
          country: string
          created_at: string
          id: string
          location: string
          name: string
          organization_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          brand: string
          country: string
          created_at?: string
          id?: string
          location: string
          name: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          brand?: string
          country?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      improvement_actions: {
        Row: {
          action_description: string
          action_title: string
          assessment_id: string
          created_at: string
          department: string
          estimated_effort: string | null
          expected_impact: string | null
          id: string
          organization_id: string | null
          priority: string
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_title: string
          assessment_id: string
          created_at?: string
          department: string
          estimated_effort?: string | null
          expected_impact?: string | null
          id?: string
          organization_id?: string | null
          priority: string
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_title?: string
          assessment_id?: string
          created_at?: string
          department?: string
          estimated_effort?: string | null
          expected_impact?: string | null
          id?: string
          organization_id?: string | null
          priority?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "improvement_actions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "improvement_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          organization_id: string
          role: Database["public"]["Enums"]["membership_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          role?: Database["public"]["Enums"]["membership_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_organization_id: string | null
          consent_analytics: boolean | null
          consent_marketing: boolean | null
          created_at: string
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          gdpr_consented_at: string | null
          id: string
          last_sign_in_at: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_organization_id?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          gdpr_consented_at?: string | null
          id?: string
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_organization_id?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          gdpr_consented_at?: string | null
          id?: string
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_organization_id_fkey"
            columns: ["active_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          first_seen: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_seen: string
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          device_info?: Json | null
          first_seen?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_seen?: string
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          device_info?: Json | null
          first_seen?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_seen?: string
          session_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: { Args: { _user_id: string }; Returns: boolean }
      export_user_data: { Args: { _user_id: string }; Returns: Json }
    }
    Enums: {
      membership_role: "owner" | "admin" | "manager" | "analyst" | "viewer"
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
      membership_role: ["owner", "admin", "manager", "analyst", "viewer"],
    },
  },
} as const

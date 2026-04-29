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
      _migration_guards: {
        Row: {
          applied_at: string
          name: string
        }
        Insert: {
          applied_at?: string
          name: string
        }
        Update: {
          applied_at?: string
          name?: string
        }
        Relationships: []
      }
      access_assignments: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          organization_id: string | null
          outlet_id: string | null
          profile_id: string
          project_id: string | null
          role: Database["public"]["Enums"]["access_role"]
          scope_type: Database["public"]["Enums"]["scope_type"]
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          outlet_id?: string | null
          profile_id: string
          project_id?: string | null
          role: Database["public"]["Enums"]["access_role"]
          scope_type: Database["public"]["Enums"]["scope_type"]
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          outlet_id?: string | null
          profile_id?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["access_role"]
          scope_type?: Database["public"]["Enums"]["scope_type"]
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "access_assignments_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      access_audit_log: {
        Row: {
          actor_profile_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          reason: string | null
          target_profile_id: string | null
        }
        Insert: {
          actor_profile_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          reason?: string | null
          target_profile_id?: string | null
        }
        Update: {
          actor_profile_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          reason?: string | null
          target_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_log_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_audit_log_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      action_audit_log: {
        Row: {
          action_id: string
          changed_at: string
          changed_by: string
          field_name: string
          id: string
          new_value: string
          old_value: string | null
          organization_id: string
        }
        Insert: {
          action_id: string
          changed_at?: string
          changed_by: string
          field_name: string
          id?: string
          new_value: string
          old_value?: string | null
          organization_id: string
        }
        Update: {
          action_id?: string
          changed_at?: string
          changed_by?: string
          field_name?: string
          id?: string
          new_value?: string
          old_value?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_audit_log_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "improvement_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      action_generation_log: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      actions: {
        Row: {
          created_at: string
          created_by: string
          dealer_id: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          dealer_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          dealer_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_audit: {
        Row: {
          assessment_id: string
          change_source: string
          changed_at: string
          changed_by: string
          from_value: number | null
          id: string
          ip_address: unknown
          notes: string | null
          organization_id: string
          question_id: string
          session_id: string | null
          to_value: number
        }
        Insert: {
          assessment_id: string
          change_source?: string
          changed_at?: string
          changed_by: string
          from_value?: number | null
          id?: string
          ip_address?: unknown
          notes?: string | null
          organization_id: string
          question_id: string
          session_id?: string | null
          to_value: number
        }
        Update: {
          assessment_id?: string
          change_source?: string
          changed_at?: string
          changed_by?: string
          from_value?: number | null
          id?: string
          ip_address?: unknown
          notes?: string | null
          organization_id?: string
          question_id?: string
          session_id?: string | null
          to_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "answer_audit_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_audit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
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
          {
            foreignKeyName: "assessment_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      assessments: {
        Row: {
          answers: Json
          assessment_cycle: number
          completed_at: string | null
          created_at: string
          dealership_id: string
          id: string
          organization_id: string | null
          overall_score: number | null
          questionnaire_version: string
          scores: Json
          session_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          assessment_cycle?: number
          completed_at?: string | null
          created_at?: string
          dealership_id: string
          id?: string
          organization_id?: string | null
          overall_score?: number | null
          questionnaire_version?: string
          scores?: Json
          session_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          assessment_cycle?: number
          completed_at?: string | null
          created_at?: string
          dealership_id?: string
          id?: string
          organization_id?: string | null
          overall_score?: number | null
          questionnaire_version?: string
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
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      benchmark_snapshots: {
        Row: {
          business_model: string
          confidence_tier: string
          created_at: string
          id: string
          mean_score: number | null
          metric_name: string
          module_code: string
          network_structure: string
          p25_score: number | null
          p50_score: number | null
          p75_score: number | null
          positioning: string
          sample_count: number
          snapshot_date: string
          source_notes: string | null
          source_type: string
          std_dev: number | null
          updated_at: string
          volume_band: string
        }
        Insert: {
          business_model: string
          confidence_tier?: string
          created_at?: string
          id?: string
          mean_score?: number | null
          metric_name: string
          module_code: string
          network_structure: string
          p25_score?: number | null
          p50_score?: number | null
          p75_score?: number | null
          positioning: string
          sample_count?: number
          snapshot_date?: string
          source_notes?: string | null
          source_type?: string
          std_dev?: number | null
          updated_at?: string
          volume_band: string
        }
        Update: {
          business_model?: string
          confidence_tier?: string
          created_at?: string
          id?: string
          mean_score?: number | null
          metric_name?: string
          module_code?: string
          network_structure?: string
          p25_score?: number | null
          p50_score?: number | null
          p75_score?: number | null
          positioning?: string
          sample_count?: number
          snapshot_date?: string
          source_notes?: string | null
          source_type?: string
          std_dev?: number | null
          updated_at?: string
          volume_band?: string
        }
        Relationships: []
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
      coach_dealership_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          coach_user_id: string
          dealership_id: string
          id: string
          is_active: boolean
          revoked_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          coach_user_id: string
          dealership_id: string
          id?: string
          is_active?: boolean
          revoked_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          coach_user_id?: string
          dealership_id?: string
          id?: string
          is_active?: boolean
          revoked_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_dealership_assignments_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_contexts: {
        Row: {
          annual_unit_sales: number
          avg_gross_profit_per_unit: number | null
          avg_monthly_leads: number | null
          brand_represented: string
          brand_tier: string
          created_at: string | null
          id: string
          market_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_unit_sales: number
          avg_gross_profit_per_unit?: number | null
          avg_monthly_leads?: number | null
          brand_represented: string
          brand_tier: string
          created_at?: string | null
          id?: string
          market_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_unit_sales?: number
          avg_gross_profit_per_unit?: number | null
          avg_monthly_leads?: number | null
          brand_represented?: string
          brand_tier?: string
          created_at?: string | null
          id?: string
          market_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dealer_network_memberships: {
        Row: {
          created_at: string
          dealership_id: string | null
          enrolled_at: string | null
          expires_at: string | null
          id: string
          include_in_network_benchmark: boolean
          is_active: boolean
          network_id: string
          organization_id: string
          programme_tier: string | null
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealership_id?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          include_in_network_benchmark?: boolean
          is_active?: boolean
          network_id: string
          organization_id: string
          programme_tier?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealership_id?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          include_in_network_benchmark?: boolean
          is_active?: boolean
          network_id?: string
          organization_id?: string
          programme_tier?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_network_memberships_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_network_memberships_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "oem_networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_network_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_network_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "dealer_network_memberships_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "network_regions"
            referencedColumns: ["id"]
          },
        ]
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
      dealership_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          dealership_id: string
          expires_at: string
          id: string
          invite_type: string
          invited_by: string
          invited_email: string
          membership_role: Database["public"]["Enums"]["membership_role"]
          organization_id: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          dealership_id: string
          expires_at?: string
          id?: string
          invite_type?: string
          invited_by: string
          invited_email: string
          membership_role: Database["public"]["Enums"]["membership_role"]
          organization_id: string
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          dealership_id?: string
          expires_at?: string
          id?: string
          invite_type?: string
          invited_by?: string
          invited_email?: string
          membership_role?: Database["public"]["Enums"]["membership_role"]
          organization_id?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_invites_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealership_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealership_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
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
          organization_id: string
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
          organization_id: string
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
          organization_id?: string
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
          {
            foreignKeyName: "dealerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      improvement_actions: {
        Row: {
          action_context: string | null
          action_description: string
          action_title: string
          assessment_id: string
          business_impact: string | null
          created_at: string
          department: string
          effort_score: number | null
          estimated_effort: string | null
          expected_benefit: string | null
          expected_impact: string | null
          id: string
          impact_score: number | null
          kpis_linked_to: string[] | null
          likely_consequences: Json | null
          likely_drivers: Json | null
          linked_kpis: Json | null
          organization_id: string
          priority: string
          recommendation: string | null
          responsible_person: string | null
          status: string | null
          support_required_from: string[] | null
          target_completion_date: string | null
          updated_at: string | null
          urgency_score: number | null
          user_id: string | null
        }
        Insert: {
          action_context?: string | null
          action_description: string
          action_title: string
          assessment_id: string
          business_impact?: string | null
          created_at?: string
          department: string
          effort_score?: number | null
          estimated_effort?: string | null
          expected_benefit?: string | null
          expected_impact?: string | null
          id?: string
          impact_score?: number | null
          kpis_linked_to?: string[] | null
          likely_consequences?: Json | null
          likely_drivers?: Json | null
          linked_kpis?: Json | null
          organization_id: string
          priority: string
          recommendation?: string | null
          responsible_person?: string | null
          status?: string | null
          support_required_from?: string[] | null
          target_completion_date?: string | null
          updated_at?: string | null
          urgency_score?: number | null
          user_id?: string | null
        }
        Update: {
          action_context?: string | null
          action_description?: string
          action_title?: string
          assessment_id?: string
          business_impact?: string | null
          created_at?: string
          department?: string
          effort_score?: number | null
          estimated_effort?: string | null
          expected_benefit?: string | null
          expected_impact?: string | null
          id?: string
          impact_score?: number | null
          kpis_linked_to?: string[] | null
          likely_consequences?: Json | null
          likely_drivers?: Json | null
          linked_kpis?: Json | null
          organization_id?: string
          priority?: string
          recommendation?: string | null
          responsible_person?: string | null
          status?: string | null
          support_required_from?: string[] | null
          target_completion_date?: string | null
          updated_at?: string | null
          urgency_score?: number | null
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
          {
            foreignKeyName: "improvement_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
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
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      network_regions: {
        Row: {
          country: string
          created_at: string
          id: string
          name: string
          network_id: string
          region_code: string | null
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          name: string
          network_id: string
          region_code?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          name?: string
          network_id?: string
          region_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_regions_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "oem_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_networks: {
        Row: {
          country_scope: string[]
          created_at: string
          id: string
          name: string
          oem_brand: string
          owner_org_id: string | null
          programme_code: string | null
          settings: Json
          status: string
          updated_at: string
        }
        Insert: {
          country_scope?: string[]
          created_at?: string
          id?: string
          name: string
          oem_brand: string
          owner_org_id?: string | null
          programme_code?: string | null
          settings?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          country_scope?: string[]
          created_at?: string
          id?: string
          name?: string
          oem_brand?: string
          owner_org_id?: string | null
          programme_code?: string | null
          settings?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oem_networks_owner_org_id_fkey"
            columns: ["owner_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oem_networks_owner_org_id_fkey"
            columns: ["owner_org_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_mode: Database["public"]["Enums"]["enum_brand_mode"] | null
          business_model:
            | Database["public"]["Enums"]["enum_business_model"]
            | null
          city: string | null
          country: string | null
          created_at: string
          default_language:
            | Database["public"]["Enums"]["enum_default_language"]
            | null
          group_name: string | null
          id: string
          logo_url: string | null
          name: string
          network_structure:
            | Database["public"]["Enums"]["enum_network_structure"]
            | null
          oem_authorization:
            | Database["public"]["Enums"]["enum_oem_authorization"]
            | null
          oem_brands: string[] | null
          operational_focus: string[] | null
          organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          positioning: Database["public"]["Enums"]["enum_positioning"] | null
          product_segments: string[] | null
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          brand_mode?: Database["public"]["Enums"]["enum_brand_mode"] | null
          business_model?:
            | Database["public"]["Enums"]["enum_business_model"]
            | null
          city?: string | null
          country?: string | null
          created_at?: string
          default_language?:
            | Database["public"]["Enums"]["enum_default_language"]
            | null
          group_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          network_structure?:
            | Database["public"]["Enums"]["enum_network_structure"]
            | null
          oem_authorization?:
            | Database["public"]["Enums"]["enum_oem_authorization"]
            | null
          oem_brands?: string[] | null
          operational_focus?: string[] | null
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          positioning?: Database["public"]["Enums"]["enum_positioning"] | null
          product_segments?: string[] | null
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          brand_mode?: Database["public"]["Enums"]["enum_brand_mode"] | null
          business_model?:
            | Database["public"]["Enums"]["enum_business_model"]
            | null
          city?: string | null
          country?: string | null
          created_at?: string
          default_language?:
            | Database["public"]["Enums"]["enum_default_language"]
            | null
          group_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          network_structure?:
            | Database["public"]["Enums"]["enum_network_structure"]
            | null
          oem_authorization?:
            | Database["public"]["Enums"]["enum_oem_authorization"]
            | null
          oem_brands?: string[] | null
          operational_focus?: string[] | null
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          positioning?: Database["public"]["Enums"]["enum_positioning"] | null
          product_segments?: string[] | null
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_dealership_id: string | null
          active_organization_id: string | null
          actor_type: Database["public"]["Enums"]["actor_type"] | null
          avatar_url: string | null
          bio: string | null
          consent_analytics: boolean | null
          consent_marketing: boolean | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          gdpr_consented_at: string | null
          id: string
          job_title: string | null
          last_sign_in_at: string | null
          preferred_language: string | null
          role: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_dealership_id?: string | null
          active_organization_id?: string | null
          actor_type?: Database["public"]["Enums"]["actor_type"] | null
          avatar_url?: string | null
          bio?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          gdpr_consented_at?: string | null
          id?: string
          job_title?: string | null
          last_sign_in_at?: string | null
          preferred_language?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_dealership_id?: string | null
          active_organization_id?: string | null
          actor_type?: Database["public"]["Enums"]["actor_type"] | null
          avatar_url?: string | null
          bio?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          gdpr_consented_at?: string | null
          id?: string
          job_title?: string | null
          last_sign_in_at?: string | null
          preferred_language?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_dealership_id_fkey"
            columns: ["active_dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_active_organization_id_fkey"
            columns: ["active_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_active_organization_id_fkey"
            columns: ["active_organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      project_outlets: {
        Row: {
          created_at: string
          outlet_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          outlet_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          outlet_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_outlets_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_outlets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_type: string
          sponsor_organization_id: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_type?: string
          sponsor_organization_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_type?: string
          sponsor_organization_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_sponsor_organization_id_fkey"
            columns: ["sponsor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_sponsor_organization_id_fkey"
            columns: ["sponsor_organization_id"]
            isOneToOne: false
            referencedRelation: "peer_segmentation_keys"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration: string | null
          id: string
          is_featured: boolean | null
          related_kpis: string[] | null
          resource_type: string
          thumbnail_url: string | null
          title: string
          topics: string[]
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          is_featured?: boolean | null
          related_kpis?: string[] | null
          resource_type: string
          thumbnail_url?: string | null
          title: string
          topics?: string[]
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          is_featured?: boolean | null
          related_kpis?: string[] | null
          resource_type?: string
          thumbnail_url?: string | null
          title?: string
          topics?: string[]
          url?: string
        }
        Relationships: []
      }
      user_saved_resources: {
        Row: {
          id: string
          resource_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          resource_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          resource_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
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
      peer_segmentation_keys: {
        Row: {
          annual_unit_sales: number | null
          brand_tier: string | null
          business_model: string | null
          network_structure: string | null
          organization_id: string | null
          organization_name: string | null
          peer_segment_key: string | null
          positioning: string | null
          volume_band: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_dealership_invite: { Args: { p_token: string }; Returns: Json }
      can_access_project: { Args: { _project_id: string }; Returns: boolean }
      can_read_dealership: {
        Args: { p_dealership_id: string }
        Returns: boolean
      }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      delete_user_account: { Args: { _user_id: string }; Returns: boolean }
      export_user_data: { Args: { _user_id: string }; Returns: Json }
      get_dealership_details: { Args: { p_ids: string[] }; Returns: Json }
      has_org_access: {
        Args: {
          _min_role?: Database["public"]["Enums"]["access_role"]
          _org_id: string
        }
        Returns: boolean
      }
      has_outlet_access: {
        Args: {
          _min_role?: Database["public"]["Enums"]["access_role"]
          _outlet_id: string
        }
        Returns: boolean
      }
      is_admin_in_dealer_org: {
        Args: { p_dealership_id: string }
        Returns: boolean
      }
      is_assigned_coach: { Args: { p_dealership_id: string }; Returns: boolean }
      is_member_of_dealer_org: {
        Args: { p_dealership_id: string }
        Returns: boolean
      }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_admin_or_owner: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_privileged_in_dealer_org: {
        Args: { p_dealership_id: string }
        Returns: boolean
      }
      lookup_dealer_by_email: { Args: { p_email: string }; Returns: Json }
      update_action_if_unchanged:
        | {
            Args: {
              p_description: string
              p_expected_updated_at: string
              p_id: string
              p_priority: string
              p_responsible_person: string
              p_status: string
              p_target_completion_date: string
              p_title: string
              p_updated_at: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_description: string
              p_expected_updated_at: string
              p_id: string
              p_priority: string
              p_responsible_person: string
              p_status: string
              p_target_completion_date: string
              p_title: string
              p_updated_at: string
            }
            Returns: Json
          }
    }
    Enums: {
      access_role: "owner" | "admin" | "member" | "viewer"
      actor_type: "dealer" | "coach" | "oem" | "internal"
      enum_brand_mode: "single_brand" | "multi_brand"
      enum_business_model: "sales_only" | "service_only" | "2s" | "3s" | "4s"
      enum_default_language: "en" | "de" | "fr" | "es" | "it"
      enum_network_structure: "single_outlet" | "multi_outlet_group"
      enum_oem_authorization: "authorized" | "independent"
      enum_positioning: "mass_market" | "premium" | "luxury" | "super_luxury"
      membership_role: "owner" | "admin" | "member" | "viewer"
      organization_type:
        | "independent_dealer"
        | "dealer_group"
        | "oem"
        | "internal"
      scope_type: "organization" | "project" | "outlet"
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
      access_role: ["owner", "admin", "member", "viewer"],
      actor_type: ["dealer", "coach", "oem", "internal"],
      enum_brand_mode: ["single_brand", "multi_brand"],
      enum_business_model: ["sales_only", "service_only", "2s", "3s", "4s"],
      enum_default_language: ["en", "de", "fr", "es", "it"],
      enum_network_structure: ["single_outlet", "multi_outlet_group"],
      enum_oem_authorization: ["authorized", "independent"],
      enum_positioning: ["mass_market", "premium", "luxury", "super_luxury"],
      membership_role: ["owner", "admin", "member", "viewer"],
      organization_type: [
        "independent_dealer",
        "dealer_group",
        "oem",
        "internal",
      ],
      scope_type: ["organization", "project", "outlet"],
    },
  },
} as const

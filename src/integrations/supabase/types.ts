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
      facilitators: {
        Row: {
          created_at: string
          email: string
          facilitator_id: string
          id: string
          name: string
          pin: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          facilitator_id: string
          id?: string
          name: string
          pin?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          facilitator_id?: string
          id?: string
          name?: string
          pin?: string
          updated_at?: string
        }
        Relationships: []
      }
      participant_id_counter: {
        Row: {
          id: number
          next_id: number
        }
        Insert: {
          id?: number
          next_id?: number
        }
        Update: {
          id?: number
          next_id?: number
        }
        Relationships: []
      }
      participants: {
        Row: {
          age_band: string | null
          created_at: string
          created_at_location: string
          created_by_facilitator: string
          demand_profile: string | null
          education_level: string | null
          gender: string | null
          id: string
          last_session_date: string | null
          name: string
          occupation_type: string | null
          participant_id: string
          seniority_level: string | null
          session_count: number
          updated_at: string
        }
        Insert: {
          age_band?: string | null
          created_at?: string
          created_at_location?: string
          created_by_facilitator?: string
          demand_profile?: string | null
          education_level?: string | null
          gender?: string | null
          id?: string
          last_session_date?: string | null
          name?: string
          occupation_type?: string | null
          participant_id: string
          seniority_level?: string | null
          session_count?: number
          updated_at?: string
        }
        Update: {
          age_band?: string | null
          created_at?: string
          created_at_location?: string
          created_by_facilitator?: string
          demand_profile?: string | null
          education_level?: string | null
          gender?: string | null
          id?: string
          last_session_date?: string | null
          name?: string
          occupation_type?: string | null
          participant_id?: string
          seniority_level?: string | null
          session_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      pillar_scores: {
        Row: {
          created_at: string
          id: string
          lockin_degradation_index: number | null
          lockin_raw: number | null
          participant_id: string
          recall_fluency: number | null
          recall_raw: number | null
          session_number: number
          sharpness_raw: number | null
          sharpness_rt_switch_cost_ms: number | null
          sharpness_simon_effect_ms: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lockin_degradation_index?: number | null
          lockin_raw?: number | null
          participant_id: string
          recall_fluency?: number | null
          recall_raw?: number | null
          session_number?: number
          sharpness_raw?: number | null
          sharpness_rt_switch_cost_ms?: number | null
          sharpness_simon_effect_ms?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lockin_degradation_index?: number | null
          lockin_raw?: number | null
          participant_id?: string
          recall_fluency?: number | null
          recall_raw?: number | null
          session_number?: number
          sharpness_raw?: number | null
          sharpness_rt_switch_cost_ms?: number | null
          sharpness_simon_effect_ms?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pillar_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["participant_id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          facilitator_id: string
          form_id: string
          id: string
          location: string
          lockin_done: boolean
          lockin_test_data: Json | null
          participant_id: string
          practice: boolean
          recall_done: boolean
          recall_test_data: Json | null
          session_duration_seconds: number | null
          session_id: string
          session_number: number
          sharpness_done: boolean
          sharpness_test_data: Json | null
          timestamp_end: string | null
          timestamp_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          facilitator_id?: string
          form_id?: string
          id?: string
          location?: string
          lockin_done?: boolean
          lockin_test_data?: Json | null
          participant_id: string
          practice?: boolean
          recall_done?: boolean
          recall_test_data?: Json | null
          session_duration_seconds?: number | null
          session_id: string
          session_number?: number
          sharpness_done?: boolean
          sharpness_test_data?: Json | null
          timestamp_end?: string | null
          timestamp_start?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          facilitator_id?: string
          form_id?: string
          id?: string
          location?: string
          lockin_done?: boolean
          lockin_test_data?: Json | null
          participant_id?: string
          practice?: boolean
          recall_done?: boolean
          recall_test_data?: Json | null
          session_duration_seconds?: number | null
          session_id?: string
          session_number?: number
          sharpness_done?: boolean
          sharpness_test_data?: Json | null
          timestamp_end?: string | null
          timestamp_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["participant_id"]
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
      [_ in never]: never
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
    Enums: {},
  },
} as const

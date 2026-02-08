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
      business_memberships: {
        Row: {
          business_id: string
          can_view_reports: boolean | null
          created_at: string
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          business_id: string
          can_view_reports?: boolean | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          business_id?: string
          can_view_reports?: boolean | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_memberships_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: Database["public"]["Enums"]["business_type"]
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: Database["public"]["Enums"]["business_type"]
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: Database["public"]["Enums"]["business_type"]
        }
        Relationships: []
      }
      delegated_tasks: {
        Row: {
          acknowledged_at: string | null
          assigned_by_id: string | null
          assigned_to_id: string
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          source_id: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["action_status"]
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_by_id?: string | null
          assigned_to_id: string
          completed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_by_id?: string | null
          assigned_to_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Relationships: []
      }
      focus_item_responses: {
        Row: {
          content: string
          created_at: string
          focus_item_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          focus_item_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          focus_item_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_item_responses_focus_item_id_fkey"
            columns: ["focus_item_id"]
            isOneToOne: false
            referencedRelation: "focus_items"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_items: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          set_by_user_id: string | null
          target_user_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          set_by_user_id?: string | null
          target_user_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          set_by_user_id?: string | null
          target_user_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          business_ids: string[] | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          business_ids?: string[] | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at?: string | null
        }
        Update: {
          business_ids?: string[] | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      key_deals: {
        Row: {
          business_id: string | null
          client_name: string
          closed_at: string | null
          created_at: string
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          client_name: string
          closed_at?: string | null
          created_at?: string
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          stage: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          client_name?: string
          closed_at?: string | null
          created_at?: string
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_deals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_items: {
        Row: {
          carry_forward_count: number | null
          context_notes: string | null
          created_at: string
          display_order: number | null
          id: string
          is_addressed: boolean | null
          meeting_date: string | null
          outcome: string | null
          outcome_recorded_at: string | null
          updated_at: string
          work_item_id: string | null
        }
        Insert: {
          carry_forward_count?: number | null
          context_notes?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_addressed?: boolean | null
          meeting_date?: string | null
          outcome?: string | null
          outcome_recorded_at?: string | null
          updated_at?: string
          work_item_id?: string | null
        }
        Update: {
          carry_forward_count?: number | null
          context_notes?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_addressed?: boolean | null
          meeting_date?: string | null
          outcome?: string | null
          outcome_recorded_at?: string | null
          updated_at?: string
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_items_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      note_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          note_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          note_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          note_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_replies_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          acknowledged_at: string | null
          author_id: string | null
          content: string
          created_at: string
          id: string
          is_acknowledged: boolean | null
          target_user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          target_user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          target_user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pipeline_snapshots: {
        Row: {
          active_quotes: number | null
          closed_this_week: number | null
          closed_value: number | null
          created_at: string
          id: string
          quotes_sent_this_week: number | null
          submission_id: string
          total_pipeline_value: number | null
        }
        Insert: {
          active_quotes?: number | null
          closed_this_week?: number | null
          closed_value?: number | null
          created_at?: string
          id?: string
          quotes_sent_this_week?: number | null
          submission_id: string
          total_pipeline_value?: number | null
        }
        Update: {
          active_quotes?: number | null
          closed_this_week?: number | null
          closed_value?: number | null
          created_at?: string
          id?: string
          quotes_sent_this_week?: number | null
          submission_id?: string
          total_pipeline_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_snapshots_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_actions: {
        Row: {
          completed_at: string | null
          content: string
          created_at: string
          due_date: string | null
          from_user_id: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          seen_at: string | null
          status: Database["public"]["Enums"]["action_status"]
          to_user_id: string
          updated_at: string
          via_user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content: string
          created_at?: string
          due_date?: string | null
          from_user_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          seen_at?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          to_user_id: string
          updated_at?: string
          via_user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content?: string
          created_at?: string
          due_date?: string | null
          from_user_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          seen_at?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          to_user_id?: string
          updated_at?: string
          via_user_id?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by_id: string | null
          description: string | null
          due_date: string
          id: string
          is_completed: boolean | null
          last_fired_at: string | null
          recurrence_rule: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          title: string
          user_id: string
          work_item_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean | null
          last_fired_at?: string | null
          recurrence_rule?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          title: string
          user_id: string
          work_item_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean | null
          last_fired_at?: string | null
          recurrence_rule?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          title?: string
          user_id?: string
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_entries: {
        Row: {
          category: Database["public"]["Enums"]["item_category"]
          content: string
          created_at: string
          id: string
          submission_id: string
          work_item_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["item_category"]
          content: string
          created_at?: string
          id?: string
          submission_id: string
          work_item_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["item_category"]
          content?: string
          created_at?: string
          id?: string
          submission_id?: string
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_entries_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_entries_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_submission_week: string | null
          longest_streak: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_submission_week?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_submission_week?: string | null
          longest_streak?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          is_draft: boolean | null
          submitted_at: string | null
          updated_at: string
          user_id: string
          week_ending: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          is_draft?: boolean | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          week_ending: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          is_draft?: boolean | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          week_ending?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      win_loss_log: {
        Row: {
          business_id: string | null
          client_name: string
          closed_at: string
          created_at: string
          deal_value: number | null
          id: string
          is_win: boolean
          margin_percent: number | null
          reason: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          client_name: string
          closed_at: string
          created_at?: string
          deal_value?: number | null
          id?: string
          is_win: boolean
          margin_percent?: number | null
          reason?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          client_name?: string
          closed_at?: string
          created_at?: string
          deal_value?: number | null
          id?: string
          is_win?: boolean
          margin_percent?: number | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "win_loss_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      work_item_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_google_drive_link: boolean | null
          mime_type: string | null
          uploaded_by: string | null
          work_item_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_google_drive_link?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
          work_item_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_google_drive_link?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_item_attachments_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_item_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string | null
          work_item_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
          work_item_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_item_comments_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_item_tags: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          work_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          work_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_tags_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_items: {
        Row: {
          blocked_reason: string | null
          business_id: string | null
          category: Database["public"]["Enums"]["item_category"]
          created_at: string
          description: string | null
          due_date: string | null
          escalated_at: string | null
          id: string
          is_escalated: boolean | null
          is_flagged_for_meeting: boolean | null
          is_sensitive: boolean | null
          owner_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["item_status"]
          title: string
          updated_at: string
        }
        Insert: {
          blocked_reason?: string | null
          business_id?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          description?: string | null
          due_date?: string | null
          escalated_at?: string | null
          id?: string
          is_escalated?: boolean | null
          is_flagged_for_meeting?: boolean | null
          is_sensitive?: boolean | null
          owner_id: string
          priority?: Database["public"]["Enums"]["priority_level"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          title: string
          updated_at?: string
        }
        Update: {
          blocked_reason?: string | null
          business_id?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          description?: string | null
          due_date?: string | null
          escalated_at?: string | null
          id?: string
          is_escalated?: boolean | null
          is_flagged_for_meeting?: boolean | null
          is_sensitive?: boolean | null
          owner_id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_business: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      get_business_slug: {
        Args: { _business_id: string }
        Returns: Database["public"]["Enums"]["business_type"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_member: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      is_ea: { Args: never; Returns: boolean }
      is_gm: { Args: never; Returns: boolean }
      is_principal: { Args: never; Returns: boolean }
      is_principal_or_ea: { Args: never; Returns: boolean }
    }
    Enums: {
      action_status: "new" | "seen" | "in_progress" | "done"
      app_role: "principal" | "ea" | "gm" | "manager" | "sales"
      business_type: "ultralift" | "westberg" | "spt" | "se_digital"
      item_category: "win" | "pain_point" | "discussion" | "critical_path"
      item_status: "open" | "in_progress" | "blocked" | "resolved"
      priority_level: "low" | "medium" | "high" | "critical"
      reminder_type: "one_off" | "recurring"
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
      action_status: ["new", "seen", "in_progress", "done"],
      app_role: ["principal", "ea", "gm", "manager", "sales"],
      business_type: ["ultralift", "westberg", "spt", "se_digital"],
      item_category: ["win", "pain_point", "discussion", "critical_path"],
      item_status: ["open", "in_progress", "blocked", "resolved"],
      priority_level: ["low", "medium", "high", "critical"],
      reminder_type: ["one_off", "recurring"],
    },
  },
} as const

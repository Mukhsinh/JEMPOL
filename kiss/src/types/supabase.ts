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
      admins: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          role: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          role?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          role?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      ai_escalation_logs: {
        Row: {
          confidence_score: number | null
          error_message: string | null
          executed_at: string | null
          execution_status: string | null
          from_role: string | null
          from_user_id: string | null
          id: string
          rule_id: string | null
          ticket_id: string | null
          ticket_type: string | null
          to_role: string | null
          to_user_id: string | null
          triggered_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          from_role?: string | null
          from_user_id?: string | null
          id?: string
          rule_id?: string | null
          ticket_id?: string | null
          ticket_type?: string | null
          to_role?: string | null
          to_user_id?: string | null
          triggered_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          from_role?: string | null
          from_user_id?: string | null
          id?: string
          rule_id?: string | null
          ticket_id?: string | null
          ticket_type?: string | null
          to_role?: string | null
          to_user_id?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_escalation_logs_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_escalation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "ai_escalation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_escalation_logs_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_escalation_rules: {
        Row: {
          categories: Json | null
          confidence_threshold: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          escalation_time_hours: number | null
          execution_count: number | null
          from_role: string
          id: string
          is_active: boolean | null
          name: string
          priority_levels: Json | null
          sentiment_threshold: number | null
          service_types: Json | null
          skip_levels: boolean | null
          sla_breach_escalation: boolean | null
          success_count: number | null
          to_role: string
          updated_at: string | null
          urgency_threshold: number | null
        }
        Insert: {
          categories?: Json | null
          confidence_threshold?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          escalation_time_hours?: number | null
          execution_count?: number | null
          from_role: string
          id?: string
          is_active?: boolean | null
          name: string
          priority_levels?: Json | null
          sentiment_threshold?: number | null
          service_types?: Json | null
          skip_levels?: boolean | null
          sla_breach_escalation?: boolean | null
          success_count?: number | null
          to_role: string
          updated_at?: string | null
          urgency_threshold?: number | null
        }
        Update: {
          categories?: Json | null
          confidence_threshold?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          escalation_time_hours?: number | null
          execution_count?: number | null
          from_role?: string
          id?: string
          is_active?: boolean | null
          name?: string
          priority_levels?: Json | null
          sentiment_threshold?: number | null
          service_types?: Json | null
          skip_levels?: boolean | null
          sla_breach_escalation?: boolean | null
          success_count?: number | null
          to_role?: string
          updated_at?: string | null
          urgency_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_escalation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          input_data: Json | null
          model_version: string | null
          operation: string
          output_data: Json | null
          processing_time_ms: number | null
          ticket_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          model_version?: string | null
          operation: string
          output_data?: Json | null
          processing_time_ms?: number | null
          ticket_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          model_version?: string | null
          operation?: string
          output_data?: Json | null
          processing_time_ms?: number | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_trust_settings: {
        Row: {
          auto_classification_enabled: boolean | null
          auto_routing_enabled: boolean | null
          confidence_threshold: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manual_review_required: boolean | null
          setting_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auto_classification_enabled?: boolean | null
          auto_routing_enabled?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manual_review_required?: boolean | null
          setting_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auto_classification_enabled?: boolean | null
          auto_routing_enabled?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manual_review_required?: boolean | null
          setting_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_trust_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_logs: {
        Row: {
          error_message: string | null
          executed_actions: Json
          executed_at: string | null
          execution_status: string | null
          id: string
          rule_id: string | null
          ticket_id: string | null
        }
        Insert: {
          error_message?: string | null
          executed_actions: Json
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          rule_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          error_message?: string | null
          executed_actions?: Json
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          rule_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "escalation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json
          updated_at: string | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions: Json
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      external_tickets: {
        Row: {
          ai_classification: Json | null
          category: string | null
          confidence_score: number | null
          created_at: string | null
          description: string
          first_response_at: string | null
          id: string
          ip_address: unknown
          priority: string | null
          qr_code_id: string | null
          reporter_address: string | null
          reporter_email: string | null
          reporter_identity_type: string | null
          reporter_name: string | null
          reporter_phone: string | null
          resolved_at: string | null
          sentiment_score: number | null
          service_type: string
          sla_deadline: string | null
          source: string | null
          status: string | null
          ticket_number: string
          title: string
          unit_id: string
          updated_at: string | null
          urgency_level: number | null
          user_agent: string | null
        }
        Insert: {
          ai_classification?: Json | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          ip_address?: unknown
          priority?: string | null
          qr_code_id?: string | null
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_identity_type?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          sentiment_score?: number | null
          service_type: string
          sla_deadline?: string | null
          source?: string | null
          status?: string | null
          ticket_number: string
          title: string
          unit_id: string
          updated_at?: string | null
          urgency_level?: number | null
          user_agent?: string | null
        }
        Update: {
          ai_classification?: Json | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          ip_address?: unknown
          priority?: string | null
          qr_code_id?: string | null
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_identity_type?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          sentiment_score?: number | null
          service_type?: string
          sla_deadline?: string | null
          source?: string | null
          status?: string | null
          ticket_number?: string
          title?: string
          unit_id?: string
          updated_at?: string | null
          urgency_level?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_tickets_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channels: Json | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sent_at: string | null
          ticket_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          channels?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sent_at?: string | null
          ticket_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          channels?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sent_at?: string | null
          ticket_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_types: {
        Row: {
          code: string
          created_at: string | null
          default_sla_hours: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority_level: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_sla_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority_level?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_sla_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pengaturan_notifikasi: {
        Row: {
          dibuat_pada: string | null
          diperbarui_pada: string | null
          email_notif: boolean | null
          eskalasi: boolean | null
          id: string
          pengguna_id: string
          respon_baru: boolean | null
          sla_warning: boolean | null
          tiket_masuk: boolean | null
          tiket_selesai: boolean | null
          wa_notif: boolean | null
          web_push_notif: boolean | null
        }
        Insert: {
          dibuat_pada?: string | null
          diperbarui_pada?: string | null
          email_notif?: boolean | null
          eskalasi?: boolean | null
          id?: string
          pengguna_id: string
          respon_baru?: boolean | null
          sla_warning?: boolean | null
          tiket_masuk?: boolean | null
          tiket_selesai?: boolean | null
          wa_notif?: boolean | null
          web_push_notif?: boolean | null
        }
        Update: {
          dibuat_pada?: string | null
          diperbarui_pada?: string | null
          email_notif?: boolean | null
          eskalasi?: boolean | null
          id?: string
          pengguna_id?: string
          respon_baru?: boolean | null
          sla_warning?: boolean | null
          tiket_masuk?: boolean | null
          tiket_selesai?: boolean | null
          wa_notif?: boolean | null
          web_push_notif?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pengaturan_notifikasi_pengguna_id_fkey"
            columns: ["pengguna_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_analytics: {
        Row: {
          created_at: string | null
          id: string
          qr_code_id: string
          scan_count: number | null
          scan_date: string
          ticket_count: number | null
          unique_visitors: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          qr_code_id: string
          scan_count?: number | null
          scan_date: string
          ticket_count?: number | null
          unique_visitors?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          qr_code_id?: string
          scan_count?: number | null
          scan_date?: string
          ticket_count?: number | null
          unique_visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_analytics_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          token: string
          unit_id: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          token: string
          unit_id: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          token?: string
          unit_id?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      response_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "response_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      satisfaction_surveys: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          overall_score: number | null
          response_time_score: number | null
          solution_quality_score: number | null
          staff_courtesy_score: number | null
          submitted_at: string | null
          ticket_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          response_time_score?: number | null
          solution_quality_score?: number | null
          staff_courtesy_score?: number | null
          submitted_at?: string | null
          ticket_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          response_time_score?: number | null
          solution_quality_score?: number | null
          staff_courtesy_score?: number | null
          submitted_at?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          code: string
          created_at: string | null
          default_sla_hours: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_attachment: boolean | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_sla_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_attachment?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_sla_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_attachment?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sla_settings: {
        Row: {
          business_hours_only: boolean | null
          created_at: string | null
          escalation_time_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          patient_type_id: string | null
          priority_level: string | null
          resolution_time_hours: number
          response_time_hours: number
          service_category_id: string | null
          unit_type_id: string | null
          updated_at: string | null
        }
        Insert: {
          business_hours_only?: boolean | null
          created_at?: string | null
          escalation_time_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          patient_type_id?: string | null
          priority_level?: string | null
          resolution_time_hours?: number
          response_time_hours?: number
          service_category_id?: string | null
          unit_type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          business_hours_only?: boolean | null
          created_at?: string | null
          escalation_time_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          patient_type_id?: string | null
          priority_level?: string | null
          resolution_time_hours?: number
          response_time_hours?: number
          service_category_id?: string | null
          unit_type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_settings_patient_type_id_fkey"
            columns: ["patient_type_id"]
            isOneToOne: false
            referencedRelation: "patient_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_settings_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_settings_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          ticket_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          ticket_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          ticket_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_classifications: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: number | null
          name: string
          parent_classification_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name: string
          parent_classification_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name?: string
          parent_classification_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_classifications_parent_classification_id_fkey"
            columns: ["parent_classification_id"]
            isOneToOne: false
            referencedRelation: "ticket_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_escalations: {
        Row: {
          created_at: string | null
          escalated_at: string | null
          escalation_type: string | null
          from_role: string
          from_user_id: string | null
          id: string
          reason: string
          ticket_id: string
          to_role: string
          to_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          escalated_at?: string | null
          escalation_type?: string | null
          from_role: string
          from_user_id?: string | null
          id?: string
          reason: string
          ticket_id: string
          to_role: string
          to_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          escalated_at?: string | null
          escalation_type?: string | null
          from_role?: string
          from_user_id?: string | null
          id?: string
          reason?: string
          ticket_id?: string
          to_role?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_escalations_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_escalations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_escalations_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_responses: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          responder_id: string
          response_type: string | null
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          responder_id: string
          response_type?: string | null
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          responder_id?: string
          response_type?: string | null
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_statuses: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_final: boolean | null
          name: string
          status_type: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_final?: boolean | null
          name: string
          status_type?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_final?: boolean | null
          name?: string
          status_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          default_priority: string | null
          default_sla_hours: number | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          default_priority?: string | null
          default_sla_hours?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          default_priority?: string | null
          default_sla_hours?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          ai_classification: Json | null
          assigned_to: string | null
          category_id: string | null
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          description: string
          first_response_at: string | null
          id: string
          ip_address: unknown
          is_anonymous: boolean | null
          priority: string | null
          qr_code_id: string | null
          resolved_at: string | null
          sentiment_score: number | null
          sla_deadline: string | null
          source: string | null
          status: string | null
          submitter_address: string | null
          submitter_email: string | null
          submitter_name: string | null
          submitter_phone: string | null
          ticket_number: string
          title: string
          type: string
          unit_id: string
          updated_at: string | null
          urgency_level: number | null
          user_agent: string | null
        }
        Insert: {
          ai_classification?: Json | null
          assigned_to?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          ip_address?: unknown
          is_anonymous?: boolean | null
          priority?: string | null
          qr_code_id?: string | null
          resolved_at?: string | null
          sentiment_score?: number | null
          sla_deadline?: string | null
          source?: string | null
          status?: string | null
          submitter_address?: string | null
          submitter_email?: string | null
          submitter_name?: string | null
          submitter_phone?: string | null
          ticket_number: string
          title: string
          type: string
          unit_id: string
          updated_at?: string | null
          urgency_level?: number | null
          user_agent?: string | null
        }
        Update: {
          ai_classification?: Json | null
          assigned_to?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          ip_address?: unknown
          is_anonymous?: boolean | null
          priority?: string | null
          qr_code_id?: string | null
          resolved_at?: string | null
          sentiment_score?: number | null
          sla_deadline?: string | null
          source?: string | null
          status?: string | null
          submitter_address?: string | null
          submitter_email?: string | null
          submitter_name?: string | null
          submitter_phone?: string | null
          ticket_number?: string
          title?: string
          type?: string
          unit_id?: string
          updated_at?: string | null
          urgency_level?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_unit_id: string | null
          sla_hours: number | null
          unit_type_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_unit_id?: string | null
          sla_hours?: number | null
          unit_type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_unit_id?: string | null
          sla_hours?: number | null
          unit_type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_parent_unit_id_fkey"
            columns: ["parent_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          admin_id: string | null
          created_at: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          role_id: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role: string
          role_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          role_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      send_notification: {
        Args: {
          p_channels?: Json
          p_message: string
          p_ticket_id: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
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
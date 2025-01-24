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
      items: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          item_code: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          item_code: string
          price?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          item_code?: string
          price?: number
        }
        Relationships: []
      }
      order_requests: {
        Row: {
          created_at: string
          customer_name: string
          id: number
          invoice: string | null
          items: Json
          repair_facility_name: string | null
          ro_number: string
          service_writer: string | null
          timestamp: string
          vehicle_info: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: never
          invoice?: string | null
          items: Json
          repair_facility_name?: string | null
          ro_number: string
          service_writer?: string | null
          timestamp?: string
          vehicle_info?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: never
          invoice?: string | null
          items?: Json
          repair_facility_name?: string | null
          ro_number?: string
          service_writer?: string | null
          timestamp?: string
          vehicle_info?: string | null
        }
        Relationships: []
      }
      report_headers: {
        Row: {
          carrier_name: string | null
          company_name: string | null
          created_at: string | null
          created_datetime: string | null
          date_range_type: string | null
          end_date: string | null
          id: number
          locations: string | null
          report_name: string | null
          start_date: string | null
          total_loss_flag: boolean | null
          vehicle_done_type: string | null
        }
        Insert: {
          carrier_name?: string | null
          company_name?: string | null
          created_at?: string | null
          created_datetime?: string | null
          date_range_type?: string | null
          end_date?: string | null
          id?: number
          locations?: string | null
          report_name?: string | null
          start_date?: string | null
          total_loss_flag?: boolean | null
          vehicle_done_type?: string | null
        }
        Update: {
          carrier_name?: string | null
          company_name?: string | null
          created_at?: string | null
          created_datetime?: string | null
          date_range_type?: string | null
          end_date?: string | null
          id?: number
          locations?: string | null
          report_name?: string | null
          start_date?: string | null
          total_loss_flag?: boolean | null
          vehicle_done_type?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          adjustment_amount: number | null
          carrier_name: string | null
          created_at: string | null
          customer_custom_field_name_1: string | null
          customer_custom_field_name_2: string | null
          franchise_id: string | null
          id: number
          insurance_agent_name: string | null
          is_total_loss: boolean | null
          labor_amount: number | null
          master_carrier_name: string | null
          material_amount: number | null
          other_amount: number | null
          owner_name: string | null
          owner_postal_code: string | null
          part_amount: number | null
          posted_date: string | null
          primary_poi: string | null
          primary_referral_name: string | null
          primary_referral_note: string | null
          repair_completed_datetime: string | null
          repair_facility_name: string | null
          repair_facility_number: string | null
          repair_order_number: string | null
          repair_plan_name: string | null
          report_header_id: number | null
          row_index: number | null
          service_writer_display_name: string | null
          subtotal_amount: number | null
          tax_amount: number | null
          total_amount: number | null
          vehicle_make_name: string | null
          vehicle_out_datetime: string | null
          vehicle_year_make_model: string | null
          workfile_id: string | null
        }
        Insert: {
          adjustment_amount?: number | null
          carrier_name?: string | null
          created_at?: string | null
          customer_custom_field_name_1?: string | null
          customer_custom_field_name_2?: string | null
          franchise_id?: string | null
          id?: number
          insurance_agent_name?: string | null
          is_total_loss?: boolean | null
          labor_amount?: number | null
          master_carrier_name?: string | null
          material_amount?: number | null
          other_amount?: number | null
          owner_name?: string | null
          owner_postal_code?: string | null
          part_amount?: number | null
          posted_date?: string | null
          primary_poi?: string | null
          primary_referral_name?: string | null
          primary_referral_note?: string | null
          repair_completed_datetime?: string | null
          repair_facility_name?: string | null
          repair_facility_number?: string | null
          repair_order_number?: string | null
          repair_plan_name?: string | null
          report_header_id?: number | null
          row_index?: number | null
          service_writer_display_name?: string | null
          subtotal_amount?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          vehicle_make_name?: string | null
          vehicle_out_datetime?: string | null
          vehicle_year_make_model?: string | null
          workfile_id?: string | null
        }
        Update: {
          adjustment_amount?: number | null
          carrier_name?: string | null
          created_at?: string | null
          customer_custom_field_name_1?: string | null
          customer_custom_field_name_2?: string | null
          franchise_id?: string | null
          id?: number
          insurance_agent_name?: string | null
          is_total_loss?: boolean | null
          labor_amount?: number | null
          master_carrier_name?: string | null
          material_amount?: number | null
          other_amount?: number | null
          owner_name?: string | null
          owner_postal_code?: string | null
          part_amount?: number | null
          posted_date?: string | null
          primary_poi?: string | null
          primary_referral_name?: string | null
          primary_referral_note?: string | null
          repair_completed_datetime?: string | null
          repair_facility_name?: string | null
          repair_facility_number?: string | null
          repair_order_number?: string | null
          repair_plan_name?: string | null
          report_header_id?: number | null
          row_index?: number | null
          service_writer_display_name?: string | null
          subtotal_amount?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          vehicle_make_name?: string | null
          vehicle_out_datetime?: string | null
          vehicle_year_make_model?: string | null
          workfile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_report_header_id_fkey"
            columns: ["report_header_id"]
            isOneToOne: false
            referencedRelation: "report_headers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: {
          ro: string
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

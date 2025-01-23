export interface HeaderData {
  company_name: string;
  report_name: string;
  created_datetime: string;
  locations: string;
  date_range_type: string;
  start_date: string;
  end_date: string;
  total_loss_flag: boolean;
  carrier_name: string;
  vehicle_done_type: string;
}

export interface SaleData {
  report_header_id: number;
  row_index: number;
  workfile_id: string;
  repair_facility_name: string;
  repair_facility_number: string;
  franchise_id: string;
  vehicle_out_datetime: string;
  owner_name: string;
  repair_order_number: string;
  vehicle_year_make_model: string;
  vehicle_make_name: string;
  service_writer_display_name: string;
  carrier_name: string;
  master_carrier_name: string;
  is_total_loss: boolean;
  primary_referral_name: string;
  primary_poi: string;
  owner_postal_code: string;
  repair_plan_name: string;
  part_amount: number;
  labor_amount: number;
  material_amount: number;
  other_amount: number;
  adjustment_amount: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  insurance_agent_name: string;
  posted_date: string;
  repair_completed_datetime: string;
  customer_custom_field_name_1: string;
  customer_custom_field_name_2: string;
  primary_referral_note: string;
}
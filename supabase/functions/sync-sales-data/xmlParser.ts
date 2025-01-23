import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38-alpha/deno-dom-wasm.ts';
import { HeaderData, SaleData } from './types.ts';

export function parseXMLContent(fileContent: string): { headerData: HeaderData; salesData: SaleData[] } {
  console.log('Attempting to parse XML content');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fileContent, 'text/xml');

  if (!xmlDoc) {
    throw new Error('Failed to parse XML document');
  }

  console.log('Successfully parsed XML document');

  // Extract header information
  const header = xmlDoc.querySelector('header');
  const headerData: HeaderData = {
    company_name: header?.querySelector('companyName')?.textContent || '',
    report_name: header?.querySelector('reportName')?.textContent || '',
    created_datetime: header?.querySelector('createdDateTime')?.textContent || '',
    locations: header?.querySelector('geographyReportViewParameter valueName')?.textContent || '',
    date_range_type: header?.querySelector('dateRangeWithTomorrowType')?.textContent || '',
    start_date: header?.querySelector('startDate')?.textContent || '',
    end_date: header?.querySelector('endDate')?.textContent || '',
    total_loss_flag: header?.querySelector('totalLossReportViewParameter flag')?.textContent === 'true',
    carrier_name: header?.querySelector('carrierReportViewParameter carrierName')?.textContent || '',
    vehicle_done_type: header?.querySelector('vehicleDoneTypeReportViewParameter vehicleDoneType')?.textContent || '',
  };

  // Process sales data
  const sales = xmlDoc.querySelectorAll('sale');
  const salesData: SaleData[] = Array.from(sales).map(sale => ({
    report_header_id: 0, // This will be set after header insertion
    row_index: parseInt(sale.querySelector('row_index')?.textContent || '0'),
    workfile_id: sale.querySelector('workfile_id')?.textContent || '',
    repair_facility_name: sale.querySelector('repair_facility_name')?.textContent || '',
    repair_facility_number: sale.querySelector('repair_facility_number')?.textContent || '',
    franchise_id: sale.querySelector('franchise_id')?.textContent || '',
    vehicle_out_datetime: sale.querySelector('vehicle_out_datetime')?.textContent || '',
    owner_name: sale.querySelector('owner_name')?.textContent || '',
    repair_order_number: sale.querySelector('repair_order_number')?.textContent || '',
    vehicle_year_make_model: sale.querySelector('vehicle_year_make_model')?.textContent || '',
    vehicle_make_name: sale.querySelector('vehicle_make_name')?.textContent || '',
    service_writer_display_name: sale.querySelector('service_writer_display_name')?.textContent || '',
    carrier_name: sale.querySelector('carrier_name')?.textContent || '',
    master_carrier_name: sale.querySelector('master_carrier_name')?.textContent || '',
    is_total_loss: sale.querySelector('is_total_loss')?.textContent === 'true',
    primary_referral_name: sale.querySelector('primary_referral_name')?.textContent || '',
    primary_poi: sale.querySelector('primary_poi')?.textContent || '',
    owner_postal_code: sale.querySelector('owner_postal_code')?.textContent || '',
    repair_plan_name: sale.querySelector('repair_plan_name')?.textContent || '',
    part_amount: parseFloat(sale.querySelector('part_amount')?.textContent || '0'),
    labor_amount: parseFloat(sale.querySelector('labor_amount')?.textContent || '0'),
    material_amount: parseFloat(sale.querySelector('material_amount')?.textContent || '0'),
    other_amount: parseFloat(sale.querySelector('other_amount')?.textContent || '0'),
    adjustment_amount: parseFloat(sale.querySelector('adjustment_amount')?.textContent || '0'),
    subtotal_amount: parseFloat(sale.querySelector('subtotal_amount')?.textContent || '0'),
    tax_amount: parseFloat(sale.querySelector('tax_amount')?.textContent || '0'),
    total_amount: parseFloat(sale.querySelector('total_amount')?.textContent || '0'),
    insurance_agent_name: sale.querySelector('insurance_agent_name')?.textContent || '',
    posted_date: sale.querySelector('posted_date')?.textContent || '',
    repair_completed_datetime: sale.querySelector('repair_completed_datetime')?.textContent || '',
    customer_custom_field_name_1: sale.querySelector('customer_custom_field_name_1')?.textContent || '',
    customer_custom_field_name_2: sale.querySelector('customer_custom_field_name_2')?.textContent || '',
    primary_referral_note: sale.querySelector('primary_referral_note')?.textContent || '',
  }));

  return { headerData, salesData };
}
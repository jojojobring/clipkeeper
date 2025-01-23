import { XMLParser } from 'npm:fast-xml-parser@4.3.2';
import { HeaderData, SaleData } from './types.ts';

export function parseXMLContent(fileContent: string): { headerData: HeaderData; salesData: SaleData[] } {
  console.log('Attempting to parse XML content');
  console.log('Raw XML content:', fileContent.substring(0, 1000) + '...'); // Log first 1000 chars
  
  if (!fileContent || fileContent.trim() === '') {
    console.error('Empty or invalid file content received');
    throw new Error('Empty or invalid file content received');
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    trimValues: true,
    allowBooleanAttributes: true,
    parseTagValue: true
  });

  try {
    const result = parser.parse(fileContent);
    console.log('Parsed XML structure:', JSON.stringify(result, null, 2));

    // Try to find the report element at different levels
    let reportElement = result.report;
    if (!reportElement && result.root && result.root.report) {
      reportElement = result.root.report;
    }
    if (!reportElement && result.data && result.data.report) {
      reportElement = result.data.report;
    }

    if (!reportElement) {
      console.error('Could not find report element. Available keys:', Object.keys(result));
      throw new Error('Invalid XML structure: missing report element. Available root elements: ' + Object.keys(result).join(', '));
    }

    // Extract header information with better error handling
    const header = reportElement.header || {};
    console.log('Extracted header:', JSON.stringify(header, null, 2));
    
    const headerData: HeaderData = {
      company_name: header.companyName || '',
      report_name: header.reportName || '',
      created_datetime: header.createdDateTime || '',
      locations: header.geographyReportViewParameter?.valueName || '',
      date_range_type: header.dateRangeWithTomorrowType || '',
      start_date: header.startDate || '',
      end_date: header.endDate || '',
      total_loss_flag: header.totalLossReportViewParameter?.flag === 'true',
      carrier_name: header.carrierReportViewParameter?.carrierName || '',
      vehicle_done_type: header.vehicleDoneTypeReportViewParameter?.vehicleDoneType || '',
    };

    // Process sales data with better error handling
    let salesData: SaleData[] = [];
    if (reportElement.sale) {
      const salesArray = Array.isArray(reportElement.sale) ? reportElement.sale : [reportElement.sale];
      console.log('Number of sales records found:', salesArray.length);
      
      salesData = salesArray.map((sale: any, index: number) => {
        console.log(`Processing sale record ${index + 1}:`, JSON.stringify(sale, null, 2));
        return {
          report_header_id: 0,
          row_index: parseInt(sale.row_index || '0'),
          workfile_id: sale.workfile_id || '',
          repair_facility_name: sale.repair_facility_name || '',
          repair_facility_number: sale.repair_facility_number || '',
          franchise_id: sale.franchise_id || '',
          vehicle_out_datetime: sale.vehicle_out_datetime || '',
          owner_name: sale.owner_name || '',
          repair_order_number: sale.repair_order_number || '',
          vehicle_year_make_model: sale.vehicle_year_make_model || '',
          vehicle_make_name: sale.vehicle_make_name || '',
          service_writer_display_name: sale.service_writer_display_name || '',
          carrier_name: sale.carrier_name || '',
          master_carrier_name: sale.master_carrier_name || '',
          is_total_loss: sale.is_total_loss === 'true',
          primary_referral_name: sale.primary_referral_name || '',
          primary_poi: sale.primary_poi || '',
          owner_postal_code: sale.owner_postal_code || '',
          repair_plan_name: sale.repair_plan_name || '',
          part_amount: parseFloat(sale.part_amount || '0'),
          labor_amount: parseFloat(sale.labor_amount || '0'),
          material_amount: parseFloat(sale.material_amount || '0'),
          other_amount: parseFloat(sale.other_amount || '0'),
          adjustment_amount: parseFloat(sale.adjustment_amount || '0'),
          subtotal_amount: parseFloat(sale.subtotal_amount || '0'),
          tax_amount: parseFloat(sale.tax_amount || '0'),
          total_amount: parseFloat(sale.total_amount || '0'),
          insurance_agent_name: sale.insurance_agent_name || '',
          posted_date: sale.posted_date || '',
          repair_completed_datetime: sale.repair_completed_datetime || '',
          customer_custom_field_name_1: sale.customer_custom_field_name_1 || '',
          customer_custom_field_name_2: sale.customer_custom_field_name_2 || '',
          primary_referral_note: sale.primary_referral_note || '',
        };
      });
    } else {
      console.warn('No sales data found in the report');
    }

    return { headerData, salesData };
  } catch (error) {
    console.error('Error parsing XML:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }
}
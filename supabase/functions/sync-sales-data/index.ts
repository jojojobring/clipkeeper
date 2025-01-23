import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // SharePoint authentication details
    const clientId = Deno.env.get('SHAREPOINT_APP_ID')!
    const clientSecret = Deno.env.get('SHAREPOINT_CLIENT_SECRET')!
    const tenantId = 'carecollisionllc.onmicrosoft.com'
    
    console.log('Starting SharePoint authentication...')

    // Get an access token using modern OAuth endpoint
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const scope = 'https://graph.microsoft.com/.default'
    
    const tokenBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope
    })

    console.log('Token request details:', {
      url: tokenUrl,
      tenant: tenantId,
      scope: scope,
      client_id: clientId.substring(0, 8) + '...' // Log partial client ID for debugging
    })

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token response error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        headers: Object.fromEntries(tokenResponse.headers),
        error: errorText
      })
      throw new Error(`Failed to get access token: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    console.log('Successfully obtained access token')

    // Use Microsoft Graph API to access SharePoint file
    const siteUrl = 'carecollisionllc.sharepoint.com'
    const filePath = '/Documents/General/Reports/Data/Daily Export - Sales Forecast_Report.xml'
    const apiUrl = `https://graph.microsoft.com/v1.0/sites/${siteUrl}/drive/root:${encodeURIComponent(filePath)}:/content`
    
    console.log('Attempting to fetch file from:', apiUrl)
    
    const fileResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/xml',
      },
    })

    if (!fileResponse.ok) {
      console.error('File response error:', {
        status: fileResponse.status,
        statusText: fileResponse.statusText,
        headers: Object.fromEntries(fileResponse.headers)
      })
      const errorBody = await fileResponse.text()
      console.error('File response error body:', errorBody)
      throw new Error(`Failed to fetch XML file: ${errorBody}`)
    }

    const xmlContent = await fileResponse.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

    if (!xmlDoc) {
      throw new Error('Failed to parse XML document')
    }

    // Extract header information
    const header = xmlDoc.querySelector('header')
    const headerData = {
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
    }

    // Insert header record
    const { data: headerRecord, error: headerError } = await supabase
      .from('report_headers')
      .insert([headerData])
      .select()
      .single()

    if (headerError) {
      throw headerError
    }

    // Process sales data
    const sales = xmlDoc.querySelectorAll('sale')
    const salesData = Array.from(sales).map(sale => ({
      report_header_id: headerRecord.id,
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
    }))

    // Insert sales records
    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesData)

    if (salesError) {
      throw salesError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data synchronized successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
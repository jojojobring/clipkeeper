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
    
    console.log('Starting SharePoint authentication with details:', {
      clientId: clientId.substring(0, 8) + '...',
      tenantId,
    })

    // Get an access token using modern OAuth endpoint
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const scope = 'https://graph.microsoft.com/.default'
    
    const tokenBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope
    })

    console.log('Making token request to:', tokenUrl)

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
        error: errorText
      })
      throw new Error(`Failed to get access token: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Successfully obtained access token')

    // Get the site details
    const siteDomain = 'carecollisionllc.sharepoint.com'
    console.log('Attempting to get site details for domain:', siteDomain)

    // Try different site paths
    const sitePaths = [
      '/sites/General',
      '/General',
      '/',
      ''
    ]

    let siteData = null
    let siteResponse = null

    for (const path of sitePaths) {
      console.log(`Trying site path: ${path}`)
      const url = path ? 
        `https://graph.microsoft.com/v1.0/sites/${siteDomain}:${path}` :
        `https://graph.microsoft.com/v1.0/sites/${siteDomain}`

      console.log('Making request to:', url)

      siteResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (siteResponse.ok) {
        siteData = await siteResponse.json()
        console.log('Successfully found site with path:', path)
        console.log('Site details:', {
          id: siteData.id,
          name: siteData.displayName,
          webUrl: siteData.webUrl
        })
        break
      } else {
        const errorBody = await siteResponse.text()
        console.log(`Failed to get site with path ${path}:`, errorBody)
      }
    }

    if (!siteData) {
      throw new Error('Could not find SharePoint site with any of the attempted paths')
    }

    // Now try to get the file
    const filePaths = [
      '/Reports/Data/Daily Export - Sales Forecast_Report.xml',
      '/Data/Daily Export - Sales Forecast_Report.xml',
      '/Daily Export - Sales Forecast_Report.xml'
    ]

    let fileContent = null
    let fileResponse = null

    for (const path of filePaths) {
      console.log(`Trying file path: ${path}`)
      const url = `https://graph.microsoft.com/v1.0/sites/${siteData.id}/drive/root:${encodeURIComponent(path)}:/content`
      
      console.log('Making request to:', url)
      
      fileResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/xml',
        },
      })

      if (fileResponse.ok) {
        fileContent = await fileResponse.text()
        console.log('Successfully found file with path:', path)
        break
      } else {
        const errorBody = await fileResponse.text()
        console.log(`Failed to get file with path ${path}:`, errorBody)
      }
    }

    if (!fileContent) {
      throw new Error('Could not find XML file with any of the attempted paths')
    }

    // Parse and process the XML content
    console.log('Attempting to parse XML content')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(fileContent, 'text/xml')

    if (!xmlDoc) {
      throw new Error('Failed to parse XML document')
    }

    console.log('Successfully parsed XML document')

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

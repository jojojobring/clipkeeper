import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { getSharePointAccessToken } from './sharePointAuth.ts';
import { parseXMLContent } from './xmlParser.ts';
import { insertData } from './dbOperations.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SharePoint authentication details
    const clientId = Deno.env.get('SHAREPOINT_APP_ID');
    const clientSecret = Deno.env.get('SHAREPOINT_CLIENT_SECRET');
    const tenantId = 'carecollisionllc.onmicrosoft.com';
    
    console.log('Starting SharePoint authentication');
    console.log('Client ID available:', !!clientId);
    console.log('Client Secret available:', !!clientSecret);

    if (!clientId || !clientSecret) {
      throw new Error('Missing SharePoint credentials');
    }

    // Get SharePoint access token
    const accessToken = await getSharePointAccessToken(clientId, clientSecret, tenantId);
    console.log('Successfully obtained SharePoint access token');

    // Get the file using the specific Site ID and Drive ID
    const siteId = '49b73754-9981-45de-9b97-b3a35ddb8215';
    
    // First, get the default document library drive ID
    console.log('Fetching drive ID for the site');
    const driveResponse = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!driveResponse.ok) {
      const driveError = await driveResponse.text();
      console.error('Drive response error:', {
        status: driveResponse.status,
        statusText: driveResponse.statusText,
        error: driveError
      });
      throw new Error(`Failed to get drive ID: ${driveError}`);
    }

    const driveData = await driveResponse.json();
    const driveId = driveData.id;
    console.log('Retrieved drive ID:', driveId);

    // Now get the file using the drive ID
    const rawFilePath = '/General/Reports/Data/Daily Export - Sales Forecast_Report.xml';
    const encodedFilePath = encodeURIComponent(rawFilePath);
    const fileUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:${encodedFilePath}:/content`;
    
    console.log('Requesting file from:', fileUrl);

    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/xml',
      },
    });

    if (!fileResponse.ok) {
      const errorBody = await fileResponse.text();
      console.error('File response error:', {
        status: fileResponse.status,
        statusText: fileResponse.statusText,
        error: errorBody
      });
      throw new Error(`Failed to get file: ${errorBody}`);
    }

    const fileContent = await fileResponse.text();
    console.log('Successfully retrieved file content. Content length:', fileContent.length);
    console.log('First 100 characters of file:', fileContent.substring(0, 100));

    // Parse XML content and extract data
    const { headerData, salesData } = parseXMLContent(fileContent);
    console.log('Successfully parsed XML content');
    console.log('Number of sales records:', salesData.length);

    // Insert data into database
    await insertData(supabase, headerData, salesData);

    return new Response(
      JSON.stringify({ success: true, message: 'Data synchronized successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: {
          name: error.name,
          stack: error.stack,
          cause: error.cause
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
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
    console.log('Starting sync-sales-data function execution');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized successfully');

    // SharePoint authentication details
    const clientId = Deno.env.get('SHAREPOINT_APP_ID');
    const clientSecret = Deno.env.get('SHAREPOINT_CLIENT_SECRET');
    const tenantId = 'carecollisionllc.onmicrosoft.com';
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing required SharePoint environment variables');
    }

    console.log('Starting SharePoint authentication process');
    const accessToken = await getSharePointAccessToken(clientId, clientSecret, tenantId);
    console.log('Successfully obtained SharePoint access token');

    // Get the file using the specific Site ID
    const siteId = '49b73754-9981-45de-9b97-b3a35ddb8215';
    
    console.log('Fetching drive ID for site:', siteId);
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
    console.log('Successfully retrieved drive ID:', driveId);

    const rawFilePath = '/General/Reports/Data/Daily Export - Sales Forecast_Report.xml';
    const encodedFilePath = encodeURIComponent(rawFilePath);
    const fileUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:${encodedFilePath}:/content`;
    
    console.log('Requesting file from SharePoint:', fileUrl);
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
      throw new Error(`Failed to get file from SharePoint: ${errorBody}`);
    }

    const fileContent = await fileResponse.text();
    
    if (!fileContent || fileContent.trim() === '') {
      throw new Error('Retrieved empty file content from SharePoint');
    }

    console.log('Successfully retrieved file content');
    console.log('File content length:', fileContent.length);
    console.log('First 500 characters:', fileContent.substring(0, 500));

    console.log('Starting XML parsing process');
    const { headerData, salesData } = parseXMLContent(fileContent);
    console.log('Successfully parsed XML content');
    console.log('Header data:', headerData);
    console.log('Number of sales records:', salesData.length);

    console.log('Starting database insertion');
    await insertData(supabase, headerData, salesData);
    console.log('Successfully completed database insertion');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data synchronized successfully',
        stats: {
          salesRecords: salesData.length
        }
      }),
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
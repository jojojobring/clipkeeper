
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const clientId = Deno.env.get('SHAREPOINT_APP_ID');
    const clientSecret = Deno.env.get('SHAREPOINT_CLIENT_SECRET');
    const tenantId = 'carecollisionllc.onmicrosoft.com';
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing required SharePoint environment variables');
    }

    const accessToken = await getSharePointAccessToken(clientId, clientSecret, tenantId);
    const siteId = '49b73754-9981-45de-9b97-b3a35ddb8215';
    
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
      throw new Error(`Failed to get drive ID: ${driveError}`);
    }

    const driveData = await driveResponse.json();
    const driveId = driveData.id;

    const rawFilePath = '/General/Reports/Data/Daily Export - Sales Forecast_Report.xml';
    const encodedFilePath = encodeURIComponent(rawFilePath);
    const fileUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:${encodedFilePath}:/content`;
    
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/xml',
      },
    });

    if (!fileResponse.ok) {
      const errorBody = await fileResponse.text();
      throw new Error(`Failed to get file from SharePoint: ${errorBody}`);
    }

    const fileContent = await fileResponse.text();
    
    if (!fileContent || fileContent.trim() === '') {
      throw new Error('Retrieved empty file content from SharePoint');
    }

    const { headerData, salesData } = parseXMLContent(fileContent);
    await insertData(supabase, headerData, salesData);

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
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
